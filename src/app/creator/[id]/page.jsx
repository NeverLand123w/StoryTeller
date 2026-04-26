"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Check,
  Users,
  BookOpen,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function CreatorChannel() {
  const { id } = useParams();
  const { data: session } = useSession();

  const [creator, setCreator] = useState(null);
  const [stories, setStories] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    fetch(`/api/creators/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not Found");
        return res.json();
      })
      .then((data) => {
        setCreator(data.creator);
        setStories(data.stories);
        setIsFollowing(data.isFollowing);
        setFollowers(data.creator.followersCount || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, session]);

  // FOLLOW TOGGLE 
  const toggleFollow = async () => {
    if (!session) return showToast("Please sign in to follow.");
    if (session.user.id === creator.id)
      return showToast("You cannot follow yourself.");

    try {
      setIsFollowing(!isFollowing);
      setFollowers((prev) => (isFollowing ? prev - 1 : prev + 1)); // Optimistic Update

      const res = await fetch(`/api/user/follow`, {
        method: "POST",
        body: JSON.stringify({ writerId: creator.id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();

      showToast(!isFollowing ? "Following Author" : "Unfollowed Author");
    } catch (err) {
      setIsFollowing(isFollowing);
      setFollowers((prev) => (isFollowing ? prev + 1 : prev - 1));
      showToast("Something went wrong. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle size={32} className="text-zinc-600" />
          <span className="text-sm font-medium">Author not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white relative pb-20">

      {/* NOTIFICATIONS */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out transform ${
          toast.show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 py-2.5 rounded-lg border border-zinc-800 shadow-xl bg-zinc-900 text-sm font-medium text-white flex items-center gap-2">
          {toast.message}
        </div>
      </div>

      {/* CHANNEL BANNER */}
      <div className="w-full pt-32 pb-16 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
              {creator.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-5 text-zinc-500 text-sm font-medium mt-2">
              <span className="flex items-center gap-1.5">
                <Users size={16} /> {followers.toLocaleString()} Followers
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={16} /> {stories.length} Stories
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {session?.user?.id === creator.id ? (
              <button className="px-6 py-2.5 bg-zinc-900 text-zinc-400 font-medium text-sm rounded-lg cursor-not-allowed border border-zinc-800">
                Your Profile
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                className={`px-6 py-2.5 text-sm font-semibold transition-all rounded-lg shadow-sm flex items-center gap-2
                  ${isFollowing 
                    ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                    : "bg-white text-zinc-950 hover:bg-zinc-200"
                  }`}
              >
                {isFollowing ? (
                  <>
                    <Check size={16} strokeWidth={2.5} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={16} strokeWidth={2} /> Follow Author
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MANUSCRIPTS GRID */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-12">
        <h3 className="text-xl font-bold text-zinc-100 mb-8">
          Published Works
        </h3>

        {stories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
            {stories.map((story) => (
              <Link
                href={`/book/${story._id}`}
                key={story._id}
                className="group flex flex-col gap-3"
              >
                <div className="aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden relative border border-zinc-800 transition-all duration-300 group-hover:border-zinc-600 group-hover:shadow-xl">
                  {story.thumbnail ? (
                    <img
                      src={story.thumbnail}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={`${story.title} cover`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-900 text-zinc-700">
                      <BookOpen size={32} strokeWidth={1.5} className="mb-2" />
                      <span className="text-xs font-medium">No Cover</span>
                    </div>
                  )}
                  
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex flex-col">
                  <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                    {story.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="inline-block px-2 py-0.5 bg-zinc-900 text-[10px] text-zinc-400 font-medium rounded border border-zinc-800">
                      {story.genre || "Uncategorized"}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                      <Eye size={14} /> {story.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 border border-zinc-800 border-dashed rounded-xl text-center bg-zinc-900/30 flex flex-col items-center justify-center">
            <BookOpen size={32} className="text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-zinc-500">
              No stories published yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}