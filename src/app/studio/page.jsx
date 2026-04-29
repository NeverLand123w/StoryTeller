"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image as ImageIcon, X, CheckCircle2 } from "lucide-react";

export default function CreatorStudio() {
  const router = useRouter();

  // 🟢 ALL STATES INCLUDING SYNOPSIS & VISIBILITY
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [genre, setGenre] = useState("Novel");
  const [contentType, setContentType] = useState("text");
  const [thumbnail, setThumbnail] = useState("");
  const [manuscript, setManuscript] = useState("");
  const [status, setStatus] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [chapterNumber, setChapterNumber] = useState(1); // 🟢 ADD THIS

  const handleFile = (e, type) => {
    // 1. Safely grab the file from the event
    const file = e?.target?.files?.[0];

    // 2. Ensure it exists AND is a valid Blob/File object before reading
    if (!file || !(file instanceof Blob)) {
      return;
    }

    // 3. Proceed with FileReader
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "thumb") setThumbnail(reader.result);
      if (type === "pdf") setManuscript(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setStatus("Securing & Vaulting Document...");

    console.log("Submitting Payload:", {
      chapterNumber,
      contentType,
      hasManuscript: !!manuscript,
    });

    if (isNaN(chapterNumber)) {
      setStatus("Error: Invalid Chapter Number.");
      return;
    }

    // Payload mapped exactly to match your Model updates
    const payload = {
      title,
      description,
      genre,
      chapterNumber,
      contentType,
      thumbnail,
      visibility,
      content: contentType === "text" ? content : null,
      pdfData: contentType === "pdf" ? manuscript : null,
    };

    try {
      const res = await fetch("/api/stories/publish", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStatus("Manuscript Successfully Vaulted.");
        setTitle("");
        setDescription("");
        setContent("");
        setThumbnail("");
        setManuscript("");
        setTimeout(() => {
          setStatus("");
          router.push("/studio/manage"); // Redirects to Manage Nodes page
        }, 2000);
      } else {
        setStatus("Error: Authorization failed.");
      }
    } catch (error) {
      setStatus("Error: Network transmission failed.");
    }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white pt-24 px-6">
      <div className="mx-auto max-w-6xl pb-20">
        <header className="mb-12 border-b border-zinc-900 pb-8">
          <h1 className="text-4xl font-bold text-zinc-100 tracking-tight mb-2">
            Creator Studio
          </h1>
          <p className="text-zinc-500 text-sm">
            Publish a new chapter or upload a manuscript.
          </p>
        </header>

        <form
          onSubmit={handlePublish}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12"
        >
          {/* MAIN EDITOR COLUMN */}
          <div className="lg:col-span-8 space-y-8">
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
                  <button
                    type="button"
                    onClick={() => setThumbnail("")}
                    className="absolute top-4 right-4 bg-zinc-950/80 p-2 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-900 transition-all backdrop-blur-sm shadow-sm"
                    aria-label="Remove image"
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-3 p-8 w-full h-full justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ImageIcon size={32} strokeWidth={1.5} />
                  <span className="text-sm font-medium">Upload Cover Art</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e, "thumb")}
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
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Write a brief synopsis or description..."
                className="w-full bg-transparent text-zinc-400 text-base leading-relaxed outline-none resize-none h-24 placeholder:text-zinc-700"
              />
            </div>

            <div className="w-full h-px bg-zinc-900" />

            {/* MODE SWITCHER */}
            <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setContentType("text")}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                  contentType === "text"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Text Editor
              </button>
              <button
                type="button"
                onClick={() => setContentType("pdf")}
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
                  contentType === "pdf"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {/* MANUSCRIPT INPUT */}
            {contentType === "text" ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={contentType === "text"}
                placeholder="Start writing your chapter..."
                className="w-full h-[500px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-zinc-300 leading-relaxed outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600 resize-y"
              />
            ) : (
              <div className="h-[400px] bg-zinc-900/50 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center hover:bg-zinc-900 transition-colors">
                {manuscript ? (
                  <div className="flex flex-col items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={40} strokeWidth={1.5} />
                    <span className="text-sm font-medium">
                      PDF Attached Successfully
                    </span>
                    <button
                      type="button"
                      onClick={() => setManuscript("")}
                      className="text-xs text-zinc-500 hover:text-zinc-300 underline mt-2"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Upload size={32} className="mb-3" strokeWidth={1.5} />
                    <span className="text-sm font-medium">
                      Select PDF Manuscript
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFile(e, "pdf")}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR SETTINGS */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-6">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                Publish Settings
              </h3>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">
                  Chapter Number
                </label>
                <input
                  type="number"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 p-3 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-white text-zinc-950 font-semibold py-3 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Publish Story
                </button>
                {status && (
                  <p
                    className={`text-sm text-center mt-4 font-medium ${status.includes("Error") ? "text-rose-500" : "text-emerald-500"}`}
                  >
                    {status}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
