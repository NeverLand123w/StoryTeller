"use client";
import React, { useEffect, useState } from "react";
import {
  Bookmark,
  Clock,
  Zap,
  BookOpen,
  User,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (status === "authenticated") {
      fetch("/api/user/profile")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile data");
          return res.json();
        })
        .then((data) => {
          setUserData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Dashboard Fetch Error:", err);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white pb-20">
      <div className="mx-auto px-6 pt-24 max-w-6xl">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-zinc-900 pb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-1">
              Dashboard
            </h1>
            <p className="text-zinc-400 text-sm">
              Welcome back. Here is an overview of your reading and publishing
              activity.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/studio/manage" className="flex-1 md:flex-none">
              <button className="w-full px-5 py-2.5 bg-zinc-900 text-zinc-300 text-sm font-medium rounded-lg border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors">
                Manage Stories
              </button>
            </Link>
            <Link href="/studio" className="flex-1 md:flex-none">
              <button className="w-full px-5 py-2.5 bg-white text-zinc-950 text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors">
                Creator Studio
              </button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMNS (HISTORY & BOOKMARKS) --- */}
          <div className="lg:col-span-8 space-y-12">
            

            {/* RECENT HISTORY
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">
                  Jump Back In
                </h3>
                <button className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                  View All
                </button>
              </div>

              {userData?.history?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userData.history.map((item, i) => (
                    <Link
                      href={`/read/${item.storyId}`}
                      key={i}
                      className="group bg-zinc-900/40 p-5 rounded-xl border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all block"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                            {item.title || "Untitled Story"}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-1">
                            Chapter {i + 1} • Read recently
                          </p>
                        </div>
                        <BookOpen
                          size={18}
                          className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 ml-4"
                        />
                      </div>
                      <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-zinc-400 h-full rounded-full"
                          style={{ width: `${80 - i * 20}%` }}
                        ></div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-zinc-800 bg-zinc-900/20 rounded-xl text-center flex flex-col items-center">
                  <Clock size={24} className="text-zinc-600 mb-3" />
                  <p className="text-sm text-zinc-500 font-medium">
                    No recent reading activity.
                  </p>
                </div>
              )}
            </section>
            */}

            {/* SAVED STORIES */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">
                  Saved Library
                </h3>
              </div>

              {userData?.bookmarks?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {userData.bookmarks.map((story) => (
                    <div key={story._id} className="group flex flex-col gap-3">
                      <Link href={`/book/${story._id}`}>
                        <div className="aspect-[3/4] bg-zinc-900 relative overflow-hidden rounded-xl border border-zinc-800 transition-all duration-300 group-hover:border-zinc-600">
                          {story.thumbnail ? (
                            <img
                              src={story.thumbnail}
                              alt={story.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 text-zinc-600">
                              <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                          )}

                          {/* Hover Bookmark Icon */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-zinc-950/80 p-1.5 rounded-md backdrop-blur-sm border border-zinc-800">
                              <Bookmark
                                size={16}
                                className="text-zinc-300 fill-zinc-300"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex flex-col">
                        <Link href={`/book/${story._id}`}>
                          <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                            {story.title}
                          </h4>
                        </Link>
                        <Link href={`/creator/${story.author}`}>
                          <p className="text-xs text-zinc-500 mt-0.5 hover:text-zinc-300 transition-colors line-clamp-1">
                            {story.authorName}
                          </p>
                        </Link>
                        <span className="inline-block px-2 py-0.5 mt-2 bg-zinc-900 text-[10px] text-zinc-400 font-medium rounded border border-zinc-800 w-fit">
                          {story.genre || "Collection"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center border border-dashed border-zinc-800 bg-zinc-900/20 rounded-xl text-zinc-500">
                  <Bookmark size={32} className="mb-3 text-zinc-600" />
                  <span className="text-sm font-medium">
                    Your library is empty.
                  </span>
                </div>
              )}
            </section>
          </div>

          {/* --- RIGHT SIDEBAR --- */}
          <aside className="lg:col-span-4 space-y-8">

            <section className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                Followers
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Total Followers</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {userData?.followersCount || 0}
                  </span>
                </div>
              </div>
            </section>
            {/* FOLLOWING CREATORS */}
            <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-zinc-300">
                  Following
                </h3>
                <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 font-medium">
                  {userData?.followedWriters?.length || 0}
                </span>
              </div>

              <div className="space-y-1">
                {userData?.followedWriters?.length > 0 ? (
                  userData.followedWriters.map((writer) => (
                    <Link
                      href={`/creator/${writer._id}`}
                      key={writer._id}
                      className="flex items-center justify-between group cursor-pointer hover:bg-zinc-800/50 p-2 -mx-2 transition-all rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-medium text-sm group-hover:bg-zinc-700 transition-colors">
                            {writer.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                            {writer.name}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">Author</p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                      />
                    </Link>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <User size={20} className="mx-auto text-zinc-600 mb-2" />
                    <span className="text-sm font-medium text-zinc-500">
                      Not following anyone yet.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* LIBRARY STATS */}
            <section className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                Library Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Saved Stories</span>
                  <span className="text-sm font-medium text-zinc-200">
                    {userData?.bookmarks?.length || 0}
                  </span>
                </div>

                {/*
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Account Type</span>
                  <span className="text-sm font-medium text-zinc-200">
                    Reader
                  </span>
                </div> 
                */}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
