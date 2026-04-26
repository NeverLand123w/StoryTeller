"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Heart,
  UserPlus,
  Check,
  Edit3,
  AlertTriangle,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function BookDetailsPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [chapters, setChapters] = useState([]);
  console.log("DEBUG: Looking for chapters with ID:", id);
  console.log("DEBUG: Found Chapters:", chapters); // Does this print anything in your VS Terminal?
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000,
    );
  };

  const handleRead = () => {
    if (chapters.length > 0) {
      router.push(`/read/${data._id}?ch=${chapters._id}`);
    } else {
      showToast("No chapters published yet.", "warning");
    }
  };

  useEffect(() => {
    fetch(`/api/stories/${id}/details`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData.story);
        setChapters(resData.chapters || []);
        // 🟢 Changed from isLiked to isBookmarked
        setIsFollowing(resData.isFollowing || false);
        setIsBookmarked(!!resData.isBookmarked);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const toggleBookmark = async () => {
    if (!session)
      return showToast("Please sign in to save to library.", "warning");

    const nextState = !isBookmarked;
    try {
      setIsBookmarked(nextState); // Optimistic UI update

      const res = await fetch("/api/user/bookmark", {
        method: "POST",
        body: JSON.stringify({ storyId: id }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();

      showToast(
        nextState ? "Added to Library" : "Removed from Library",
        "success",
      );
    } catch (err) {
      setIsBookmarked(!nextState); // Revert on error
      showToast("Failed to update bookmark.", "warning");
    }
  };

  const toggleFollow = async () => {
    if (!session) return showToast("Please sign in to follow.", "warning");
    if (session.user.id === data.author)
      return showToast("You cannot follow yourself.", "warning");

    const newFollowState = !isFollowing;
    try {
      setIsFollowing(newFollowState);
      const res = await fetch(`/api/user/follow`, {
        method: "POST",
        body: JSON.stringify({ writerId: data.author }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      showToast(
        newFollowState ? "Following Author" : "Unfollowed Author",
        "success",
      );
    } catch (err) {
      setIsFollowing(!newFollowState);
      showToast("Something went wrong. Try again.", "warning");
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading story...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle size={32} className="text-zinc-600" />
          <span className="text-sm font-medium">Story not found.</span>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const isAuthor = session?.user?.id === data.author;

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white relative pb-20">
      {/* Toast Notification */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out transform ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 rounded-lg border border-zinc-800 shadow-xl bg-zinc-900 text-sm font-medium text-white flex items-center gap-2">
          {toast.message}
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-28 px-6 flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Sidebar (Cover & Actions) */}
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
          <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
            {data.thumbnail ? (
              <img
                src={data.thumbnail}
                className="w-full h-full object-cover"
                alt={`${data.title} cover`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <BookOpen size={48} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRead}
              className="w-full bg-white text-zinc-950 py-3 rounded-lg font-semibold text-sm hover:bg-zinc-200 transition-colors"
            >
              Start Reading
            </button>
            <button
              onClick={toggleBookmark}
              className={`w-full py-4 border rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isBookmarked
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              }`}
            >
              {/* 🟢 FIXED: Use the Icon component here, NOT another button */}
              <Bookmark
                size={18}
                className={isBookmarked ? "fill-amber-500" : ""}
              />
              {isBookmarked ? "In Library" : "Add to Library"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-10">
          {/* Header Info */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight mb-6">
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-400 border-y border-zinc-900 py-4">
              <Link
                href={`/creator/${data.author}`}
                className="text-zinc-200 hover:text-white transition-colors"
              >
                {data.authorName}
              </Link>
              <span className="text-zinc-700">•</span>
              <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md text-xs">
                {data.genre}
              </span>
              <span className="text-zinc-700">•</span>
              <span>{formattedDate}</span>

              <div className="ml-auto flex items-center gap-3">
                {isAuthor ? (
                  <Link
                    href={`/studio/edit/${id}`}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs"
                  >
                    <Edit3 size={14} /> Edit Story
                  </Link>
                ) : (
                  <button
                    onClick={toggleFollow}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                      isFollowing
                        ? "bg-zinc-800 border-zinc-700 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={14} /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} /> Follow Author
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">
              Synopsis
            </h3>
            <p className="text-zinc-400 text-base leading-relaxed whitespace-pre-wrap">
              {data.description || "No synopsis available for this story."}
            </p>
          </div>

          {/* CHAPTER LIST */}
          <div className="pt-6 border-t border-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-100 mb-6">
              Chapters
            </h3>

            {chapters.length > 0 ? (
              <div className="grid gap-3">
                {chapters.map((ch, i) => (
                  <Link href={`/read/${id}?ch=${ch._id}`} key={ch._id}>
                    <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-lg border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group">
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors line-clamp-1">
                        <span className="text-zinc-500 mr-3">{i + 1}.</span>
                        {ch.title}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 border border-zinc-800 border-dashed rounded-xl text-center bg-zinc-900/30 flex flex-col items-center justify-center">
                <BookOpen size={32} className="text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-500">
                  No chapters have been published yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
