"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Play, Eye, ShieldCheck, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCreator } from "@/lib/useCreator";

// Extracted into its own component so useCreator hook is called legally per-card
function StoryCard({ story, topBook, searchTerm }) {
  const creator = useCreator(story.author);

  if (topBook && !searchTerm && story._id === topBook._id) return null;

  return (
    <div className="group flex flex-col gap-3">
      <Link href={`/book/${story._id}`}>
        <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden rounded-xl border border-zinc-800 transition-all duration-300 group-hover:border-zinc-600 group-hover:shadow-xl">
          {story.thumbnail ? (
            <img
              src={story.thumbnail}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-900/50">
              <BookOpen size={32} strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-md text-xs font-medium text-zinc-300 shadow-sm">
              {story.genre}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex flex-col">
        <Link href={`/book/${story._id}`}>
          <h4 className="font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
            {story.title}
          </h4>
        </Link>
        <Link href={`/creator/${story.author}`}>
          <p className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5 line-clamp-1">
            {creator?.name}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [stories, setStories] = useState([]);
  const [heroStory, setHeroStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const topBook = heroStory;
  const { data: session } = useSession();
  const heroCreator = useCreator(heroStory?.author);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`/api/stories?q=${searchTerm}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStories(data);
            if (!searchTerm && data.length > 0) {
              setHeroStory(data[0]);
            } else {
              setHeroStory(null);
            }
          } else {
            setStories([]);
            setHeroStory(null);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">

      {/* --- HERO SECTION --- */}
      {topBook && !searchTerm && (
        <div className="relative w-full min-h-[70vh] flex items-center border-b border-zinc-900 pt-16">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-[0.15]"
              style={{ backgroundImage: `url(${topBook.thumbnail || "/placeholder.jpg"})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent w-full md:w-3/4" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 max-w-2xl py-12">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-zinc-100 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                  <ShieldCheck size={16} className="text-emerald-500" /> Top Ranked
                </span>
                <span className="px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800/50 text-zinc-400">
                  {topBook.genre}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 text-zinc-400">
                  <Eye size={16} /> {topBook.views || 0}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                {topBook.title}
              </h1>

              <p className="text-zinc-400 text-sm">
                By{" "}
                <Link href={`/creator/${topBook.author}`}>
                  <span className="text-zinc-200 font-medium">
                    {heroCreator?.name ?? heroStory?.author}
                  </span>
                </Link>
              </p>

              <p className="text-zinc-400 text-base leading-relaxed max-w-lg line-clamp-3">
                {topBook.description || "No description available for this story."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link href={`/book/${topBook._id}`}>
                  <button className="flex items-center gap-2 bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-3 rounded-lg font-semibold transition-colors">
                    <Play size={18} fill="currentColor" /> View Details
                  </button>
                </Link>
              </div>
            </div>

            <div className="hidden md:block w-[280px] flex-shrink-0 relative group">
              <Link href={`/book/${topBook._id}`}>
                <div className="aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative transition-transform duration-300 group-hover:-translate-y-2">
                  {topBook.thumbnail ? (
                    <img
                      src={topBook.thumbnail}
                      className="w-full h-full object-cover"
                      alt={`${topBook.title} Cover`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                      <BookOpen size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- GRID SECTION --- */}
      <div className="max-w-7xl mx-auto pt-16 px-6 lg:px-8 pb-32 relative z-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                topBook={topBook}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center border border-zinc-800/50 bg-zinc-900/20 rounded-2xl">
            <AlertCircle size={40} className="mb-4 text-zinc-600" />
            <h3 className="text-lg font-semibold text-zinc-200">No stories found</h3>
            <p className="text-zinc-500 mt-1">
              Try adjusting your search to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
