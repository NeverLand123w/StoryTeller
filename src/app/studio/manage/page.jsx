"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Edit3,
  Eye,
  Heart,
  Database,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function ManageBooks() {
  const { data: session, status } = useSession();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDeleteStory = async (storyId) => {
    if (
      !confirm(
        "Are you sure you want to delete this story? This will also remove all its chapters and cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`/api/stories/${storyId}/edit`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStories((prev) => prev.filter((story) => story._id !== storyId));
      } else {
        alert("Failed to delete the story. Please try again.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("A network error occurred.");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/studio/my-stories")
        .then((res) => res.json())
        .then((data) => {
          setStories(data);
          setLoading(false);
        });
    }
  }, [status]);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading your stories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white pb-20">
      <div className="max-w-5xl mx-auto pt-24 px-6">
        {/* Header Section */}
        <header className="mb-10 border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Manage Stories
            </h1>
          </div>
          <Link href="/studio">
            <button className="bg-white text-zinc-950 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-zinc-200 transition-colors">
              + New Upload
            </button>
          </Link>
        </header>

        {/* Stories List */}
        {stories.length > 0 ? (
          <div className="flex flex-col gap-6">
            {stories.map((story) => (
              <div
                key={story._id}
                className="group bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/80 p-5 sm:p-6 rounded-2xl flex flex-col md:flex-row gap-6 sm:gap-8 transition-all duration-300"
              >
                {/* Thumbnail (Slightly larger and sleeker) */}
                <div className="w-full sm:w-48 md:w-36 aspect-[2/3] bg-zinc-950 flex-shrink-0 relative overflow-hidden rounded-xl border border-zinc-800 shadow-sm mx-auto md:mx-0">
                  {story.thumbnail ? (
                    <img
                      src={story.thumbnail}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={`${story.title} cover`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-600">
                      No Cover
                    </div>
                  )}
                </div>

                {/* Details & Actions Container */}
                <div className="flex-1 flex flex-col h-full justify-between">
                  {/* Top: Badges and Title */}
                  <div className="space-y-4">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center px-3 py-1 mb-3 bg-zinc-950 border border-zinc-800/80 text-xs font-semibold tracking-wide text-zinc-400 rounded-full">
                        {story.genre} <span className="mx-2 text-zinc-700">•</span>{" "}
                        {story.contentType === "text" ? "Text" : "PDF"}
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                        {story.title}
                      </h3>
                    </div>

                    <p className="text-zinc-400 text-sm md:text-base line-clamp-3 leading-relaxed text-center md:text-left">
                      {story.description ||
                        "No description provided for this story."}
                    </p>
                  </div>

                  {/* Bottom Bar: Stats and Action Buttons */}
                  <div className="mt-6 pt-5 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-5">
                    
                    {/* Stats */}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 w-full sm:w-auto justify-center">
                      <Eye size={16} className="text-zinc-500" />
                      {story.views || 0} Views
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link
                        href={`/studio/edit/${story._id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                      >
                        <Edit3 size={16} className="text-zinc-400" />
                        Edit
                      </Link>

                      <Link
                        href={`/book/${story._id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                      >
                        <Database size={16} className="text-zinc-500" />
                        Live
                      </Link>

                      <button
                        onClick={() => handleDeleteStory(story._id)}
                        title="Delete Story"
                        className="p-2.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all duration-200 flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-24 border-2 border-dashed border-zinc-800/80 rounded-3xl flex flex-col items-center justify-center text-zinc-500 space-y-5 bg-zinc-900/10">
            <div className="h-16 w-16 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800/50">
              <AlertCircle size={32} className="text-zinc-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                No stories found
              </h3>
              <p className="text-sm text-zinc-400">
                You haven't uploaded any stories yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}