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
        "Are you sure you want to delete this story? This will also remove all its chapters and cannot be undone.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/stories/${storyId}/edit`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 🟢 Filter the deleted story out of the local state so it disappears instantly
        setStories((prev) => prev.filter((story) => story._id !== storyId));
        // Optional: show a success toast here if you have one
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
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 text-sm font-medium animate-pulse">
        Loading your stories...
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white pb-20">
      <div className="max-w-6xl mx-auto pt-24 px-6">
        <header className="mb-12 border-b border-zinc-900 pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">
              Manage Stories
            </h1>
          </div>
          <Link href="/studio">
            <button className="bg-white text-zinc-950 px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-zinc-200 transition-colors">
              + New Upload
            </button>
          </Link>
        </header>

        {stories.length > 0 ? (
          <div className="flex flex-col gap-5">
            {stories.map((story) => (
              <div
                key={story._id}
                className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-xl flex flex-col md:flex-row gap-6 items-center hover:bg-zinc-900/80 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-full md:w-28 aspect-[3/4] bg-zinc-950 flex-shrink-0 relative overflow-hidden rounded-lg border border-zinc-800/50">
                  {story.thumbnail ? (
                    <img
                      src={story.thumbnail}
                      className="w-full h-full object-cover"
                      alt={`${story.title} cover`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-600">
                      No Cover
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3 w-full text-center md:text-left">
                  <div className="inline-flex items-center px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-400 rounded-md">
                    {story.genre} <span className="mx-2 text-zinc-700">•</span>{" "}
                    {story.contentType === "text" ? "Text" : "PDF"}
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100">
                    {story.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 max-w-2xl leading-relaxed">
                    {story.description ||
                      "No description provided for this story."}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-center md:justify-start gap-5 pt-1 text-zinc-500">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Eye size={16} /> {story.views || 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Heart size={16} /> {story.likes?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                  <Link href={`/studio/edit/${story._id}`} className="w-full">
                    <button className="w-full px-5 py-2.5 bg-zinc-800 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                      <Edit3 size={16} /> Edit Story
                    </button>
                  </Link>
                  <Link href={`/book/${story._id}`} className="w-full">
                    <button className="w-full px-5 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-900 hover:text-white transition-colors">
                      <Database size={16} /> View Live
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteStory(story._id)}
                    className="ml-2 p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Story"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 space-y-4 bg-zinc-900/20">
            <AlertCircle size={40} className="text-zinc-600" />
            <div className="text-center">
              <h3 className="text-lg font-medium text-zinc-300 mb-1">
                No stories found
              </h3>
              <p className="text-sm">You haven't uploaded any stories yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
