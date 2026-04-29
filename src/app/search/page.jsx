"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCreator } from "@/lib/useCreator";

// Available Genres based on your Schema
const GENRES = ["All", "Novel", "Manga", "Fiction", "Sci-Fi", "Comic"];
const ITEMS_PER_PAGE = 20;

// Reused StoryCard component
function StoryCard({ story }) {
  const creator = useCreator(story.author);

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
            {creator?.name || "Unknown Author"}
          </p>
        </Link>
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL so it survives reloads
  const query = searchParams.get("q") || "";
  const currentGenre = searchParams.get("genre") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [allStories, setAllStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all stories matching the search query
  useEffect(() => {
    setLoading(true);
    // Even if query is empty, we fetch all to allow pure genre browsing
    fetch(`/api/stories?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllStories(data);
        } else {
          setAllStories([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search failed:", err);
        setAllStories([]);
        setLoading(false);
      });
  }, [query]);

  // Update URL helper
  const updateUrlParams = (newGenre, newPage) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update Genre
    if (newGenre === "All") {
      params.delete("genre");
    } else {
      params.set("genre", newGenre);
    }

    // Update Page
    if (newPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", newPage.toString());
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // 1. Filter by Genre (Client-side)
  const filteredStories =
    currentGenre === "All"
      ? allStories
      : allStories.filter((story) => story.genre === currentGenre);

  // 2. Pagination Logic (Client-side)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStories.length / ITEMS_PER_PAGE),
  );
  // Ensure we don't end up on page 5 if filtering changes total pages to 2
  const validPage = Math.min(currentPage, totalPages);

  const displayedStories = filteredStories.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-7xl mx-auto pt-32 px-6 lg:px-8 pb-32 relative z-10">
      {/* Header & Title */}
      <div className="mb-8 border-b border-zinc-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            <Search className="text-zinc-500" size={32} />
            {query ? (
              <>
                Results for <span className="text-zinc-400">"{query}"</span>
              </>
            ) : (
              "Browse All Stories"
            )}
          </h1>
          <p className="text-zinc-500 mt-2">
            {loading
              ? "Searching our library..."
              : `Found ${filteredStories.length} ${filteredStories.length === 1 ? "story" : "stories"}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
          <Filter size={18} />
          <span>Genre:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full custom-scrollbar">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => updateUrlParams(genre, 1)} // Reset to page 1 on genre change
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                currentGenre === genre
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 animate-pulse rounded-xl" />
              <div className="h-4 bg-zinc-900 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-zinc-900 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : displayedStories.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {displayedStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4 border-t border-zinc-800/50 pt-8">
              <button
                onClick={() => updateUrlParams(currentGenre, validPage - 1)}
                disabled={validPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft size={18} /> Prev
              </button>

              <span className="text-zinc-400 text-sm font-medium">
                Page <span className="text-white">{validPage}</span> of{" "}
                <span className="text-white">{totalPages}</span>
              </span>

              <button
                onClick={() => updateUrlParams(currentGenre, validPage + 1)}
                disabled={validPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center">
          <AlertCircle size={48} className="mb-4 text-zinc-600" />
          <h3 className="text-xl font-semibold text-zinc-200">
            No results found
          </h3>
          <p className="text-zinc-500 mt-2 max-w-md">
            We couldn't find any stories matching your filters.
          </p>
          <button
            onClick={() => updateUrlParams("All", 1)}
            className="mt-6 px-6 py-2.5 bg-zinc-100 text-zinc-950 font-semibold rounded-lg hover:bg-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-800 border-t-zinc-200 animate-spin" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </div>
  );
}
