"use client";
import React, { useEffect, useState } from "react";
import { use , useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Image as ImageIcon,
  X,
  FileEdit,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Upload,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import Link from "next/link";

export default function EditStudio() {
  const { id } = useParams();
  const router = useRouter();

  // MAIN STORY STATE
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("Sci-Fi");
  const [thumbnail, setThumbnail] = useState("");
  const [contentType, setContentType] = useState("text");
  const [visibility, setVisibility] = useState("public");

  // CHAPTER STATE
  const [chapTitle, setChapTitle] = useState("");
  const [chapContent, setChapContent] = useState("");
  const [chapPdf, setChapPdf] = useState("");
  const [chapType, setChapType] = useState("text");
  const [chapterStatus, setChapterStatus] = useState("");
  const [existingChapters, setExistingChapters] = useState([]);

  // NEW: Track which chapter is currently being edited
  const [editingChapterId, setEditingChapterId] = useState(null);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/chapters/${chapterId}`, {
      method: "DELETE",
      // Adding headers ensures the server expects a clean request
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      window.location.reload();
    }
  };

  // FETCH EXISTING STORY & CHAPTER DATA
  useEffect(() => {
    // 🟢 Fetch from BOTH endpoints to guarantee we get the chapters
    // Added a timestamp cache-buster so Next.js doesn't give us stale data after a reload
    const timestamp = Date.now();

    Promise.all([
      fetch(`/api/stories/${id}/edit?t=${timestamp}`).then((res) => {
        if (!res.ok) throw new Error("Auth Failed");
        return res.json();
      }),
      fetch(`/api/stories/${id}/details?t=${timestamp}`).then((res) => {
        if (!res.ok) return { chapters: [] }; // Failsafe
        return res.json();
      }),
    ])
      .then(([editData, detailsData]) => {
        // 1. Populate main story data from the edit endpoint
        setTitle(editData.title || "");
        setDescription(editData.description || "");
        setGenre(editData.genre || "Sci-Fi");
        setThumbnail(editData.thumbnail || "");
        setContentType(editData.contentType || "text");
        setContent(editData.content || "");
        setVisibility(editData.visibility || "public");

        // 2. 🟢 Populate the chapters from the details endpoint where we KNOW they exist!
        setExistingChapters(detailsData.chapters || editData.chapters || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  // Handle thumbnail file selection and convert to base64
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  // 🟢 FIX: Handles both ADDING new chapters and UPDATING existing ones
  const handleSaveChapter = async () => {
    setChapterStatus(
      editingChapterId ? "Updating chapter..." : "Publishing chapter...",
    );

    if (chapType === "pdf" && !chapPdf) {
      setChapterStatus("Failed: No PDF file selected.");
      return;
    }
    if (chapType === "text" && !chapContent) {
      setChapterStatus("Failed: Chapter content is empty.");
      return;
    }

    const payload = {
      title: chapTitle || `Chapter ${existingChapters.length + 1}`,
      contentType: chapType,
      content: chapType === "text" ? chapContent : null,
      pdfData: chapType === "pdf" ? chapPdf : null,
    };

    try {
      // If editing, hit the chapter update route. If new, hit the creation route.
      const url = editingChapterId
        ? `/api/chapters/${editingChapterId}` // Adjust this path to match your backend PUT route
        : `/api/stories/${id}/chapter`;

      const method = editingChapterId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setChapterStatus(
          editingChapterId
            ? "Chapter updated successfully!"
            : "Chapter added successfully!",
        );
        window.location.reload();
      } else {
        const errData = await res.json();
        setChapterStatus(errData.message || "Failed to save chapter.");
      }
    } catch (err) {
      setChapterStatus("Network error. Please try again.");
    }
  };

  // 🟢 FIX: Load chapter data into the form when "Edit" is clicked
  const loadChapterForEditing = (chapter) => {
    setEditingChapterId(chapter._id);
    setChapTitle(chapter.title || "");
    setChapType(chapter.contentType || "text");
    setChapContent(chapter.content || "");
    setChapPdf(""); // We clear this so they don't accidentally re-upload an old base64 string
    setChapterStatus("");

    // Smooth scroll to the editor
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelChapterEdit = () => {
    setEditingChapterId(null);
    setChapTitle("");
    setChapContent("");
    setChapPdf("");
    setChapType("text");
    setChapterStatus("");
  };

  // UPDATE MAIN STORY DOCUMENT
  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus("Saving changes...");

    const payload = {
      title,
      description,
      genre,
      thumbnail,
      content,
      visibility,
    };

    const res = await fetch(`/api/stories/${id}/edit`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("Changes saved successfully.");
      setTimeout(() => router.push(`/book/${id}`), 2000);
    } else {
      setStatus("Error saving changes. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this entire story? This action cannot be undone.",
      )
    ) {
      setStatus("Deleting story...");
      const res = await fetch(`/api/stories/${id}/edit`, { method: "DELETE" });
      if (res.ok) {
        router.push("/studio/manage");
      } else {
        setStatus("Failed to delete story.");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen text-zinc-500 flex items-center justify-center text-sm font-medium animate-pulse">
        Loading editor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-950 min-h-screen text-rose-500 flex flex-col items-center justify-center text-sm font-medium">
        <AlertTriangle size={32} className="mb-4" />
        <p>You do not have permission to edit this story.</p>
        <Link
          href="/studio/manage"
          className="mt-4 text-zinc-400 hover:text-white underline"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 pt-24 px-6 font-sans selection:bg-zinc-800 selection:text-white">
      <div className="max-w-6xl mx-auto pb-20 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-zinc-900 pb-8">
          <div className="space-y-3">
            <Link href={`/book/${id}`}>
              <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors mb-2">
                <ArrowLeft size={16} /> Back to Story
              </button>
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
              Edit Story
            </h1>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg text-emerald-500 text-sm font-medium flex items-center gap-2 w-fit">
            <ShieldCheck size={16} /> Editor Mode Active
          </div>
        </header>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* EDITOR (Left) */}
          <div className="lg:col-span-8 space-y-10">
            {/* THUMBNAIL */}
            <div className="relative group w-full h-64 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col items-center justify-center transition-colors hover:border-zinc-700">
              {thumbnail ? (
                <>
                  <img
                    src={thumbnail}
                    alt="Cover"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <label className="relative z-10 cursor-pointer bg-white text-zinc-950 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-zinc-200 transition-colors opacity-0 group-hover:opacity-100 duration-200">
                    Change Cover
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="absolute top-4 right-4 bg-zinc-950/80 p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 duration-200"
                    aria-label="Remove image"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-3 w-full h-full justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ImageIcon size={32} strokeWidth={1.5} />
                  <span className="text-sm font-medium">Upload Cover Art</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              )}
            </div>

            {/* TITLE & DESCRIPTION */}
            <div className="space-y-5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Story Title"
                className="w-full bg-transparent text-4xl font-bold text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-zinc-600 transition-colors"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Synopsis
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Write a brief synopsis or description..."
                  className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-zinc-300 text-sm leading-relaxed outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>

            {/* MAIN CONTENT (If applicable) */}
            {contentType === "text" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Main Prologue / Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Edit your main story content here..."
                  className="w-full h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-zinc-300 leading-relaxed outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 resize-y"
                />
              </div>
            ) : (
              <div className="p-12 border border-dashed border-zinc-800 bg-zinc-900/30 rounded-xl flex flex-col items-center justify-center text-center text-zinc-500">
                <CheckCircle2
                  size={40}
                  className="mb-4 text-emerald-500"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                  PDF Document Attached
                </h3>
                <p className="text-sm max-w-sm">
                  The primary content for this story is a PDF file. Direct text
                  modification is disabled.
                </p>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* CHAPTER MANAGEMENT SECTION                           */}
            {/* ---------------------------------------------------- */}
            <div className="mt-16 pt-12 border-t border-zinc-900">
              <h2 className="text-2xl font-bold text-zinc-100 mb-8">
                Manage Chapters
              </h2>

              {/* EXISTING CHAPTERS GRID */}
              {existingChapters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {existingChapters.map((ch) => (
                    <div
                      key={ch._id}
                      className={`p-4 border rounded-lg transition-all ${
                        editingChapterId === ch._id
                          ? "bg-zinc-800 border-zinc-600 shadow-md"
                          : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-zinc-500">
                          Chapter{" "}
                          {ch.chapterNumber || existingChapters.indexOf(ch) + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => loadChapterForEditing(ch)}
                            className="text-zinc-400 hover:text-white p-1 bg-zinc-800 rounded-md transition-colors"
                            title="Edit Chapter"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChapter(ch._id)}
                            className="text-zinc-400 hover:text-rose-500 p-1 bg-zinc-800 rounded-md transition-colors"
                            title="Delete Chapter"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-200 truncate">
                        {ch.title}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 mb-10 bg-zinc-900/30 p-4 rounded-lg border border-dashed border-zinc-800">
                  No chapters added yet. Add one below.
                </p>
              )}

              {/* INJECT OR EDIT CHAPTER FORM */}
              <div
                className={`space-y-6 border rounded-xl p-8 transition-colors ${
                  editingChapterId
                    ? "bg-zinc-900 border-zinc-700 shadow-xl"
                    : "bg-zinc-900/40 border-zinc-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {editingChapterId ? "Editing Chapter" : "Add New Chapter"}
                  </h3>
                  {editingChapterId && (
                    <button
                      type="button"
                      onClick={cancelChapterEdit}
                      className="text-xs font-medium text-zinc-400 hover:text-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Chapter Title
                  </label>
                  <input
                    value={chapTitle}
                    onChange={(e) => setChapTitle(e.target.value)}
                    placeholder="e.g. The Awakening"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                  />
                </div>

                <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setChapType("text")}
                    className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                      chapType === "text"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Text Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapType("pdf")}
                    className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                      chapType === "pdf"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Upload PDF
                  </button>
                </div>

                {chapType === "text" ? (
                  <textarea
                    value={chapContent}
                    onChange={(e) => setChapContent(e.target.value)}
                    className="w-full min-h-[300px] bg-zinc-950 border border-zinc-800 rounded-lg p-5 text-zinc-300 outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all resize-y placeholder:text-zinc-700"
                    placeholder="Write chapter content..."
                  />
                ) : (
                  <div className="h-[300px] bg-zinc-950 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center hover:bg-zinc-900 transition-colors">
                    {chapPdf || editingChapterId ? (
                      <div className="flex flex-col items-center gap-3 text-emerald-500">
                        <CheckCircle2 size={40} strokeWidth={1.5} />
                        <span className="text-sm font-medium">
                          {chapPdf ? "New PDF Attached" : "Existing PDF Loaded"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setChapPdf("")}
                          className="text-xs text-zinc-500 hover:text-zinc-300 underline mt-2"
                        >
                          Replace File
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
                        <Upload size={32} className="mb-3" strokeWidth={1.5} />
                        <span className="text-sm font-medium">
                          Select PDF File
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => setChapPdf(reader.result);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveChapter}
                    className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-semibold rounded-lg text-sm transition-colors"
                  >
                    {editingChapterId
                      ? "Update Chapter"
                      : "Publish New Chapter"}
                  </button>
                  {chapterStatus && (
                    <span
                      className={`block mt-3 text-sm font-medium ${chapterStatus.includes("Failed") || chapterStatus.includes("error") ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {chapterStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* META SETTINGS (Right Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6 bg-zinc-900/40 p-6 border border-zinc-800 rounded-xl">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                Story Settings
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                >
                  <option value="Novel">Novel</option>
                  <option value="Manga">Manga</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Comic">Comic</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-zinc-400 block">
                  Visibility
                </label>
                <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      visibility === "public"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("private")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      visibility === "private"
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              <div className="pt-6 space-y-3 border-t border-zinc-800">
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <FileEdit size={18} /> Save Main Story Changes
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full bg-transparent hover:bg-rose-500/10 text-rose-500 border border-rose-500/50 hover:border-rose-500 font-medium py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={18} /> Delete Entire Story
                </button>
              </div>

              {status && (
                <p
                  className={`mt-4 text-center text-sm font-medium ${status.includes("Error") || status.includes("failed") ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {status}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
