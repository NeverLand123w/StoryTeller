"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { BookOpen, Sparkles, Search, Play, Eye, ShieldCheck, AlertCircle } from "lucide-react";

export default function BrowsePage() {
  const [stories, setStories] = useState([]);
  const [heroStory, setHeroStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced Search & Data Fetch Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      fetch(`/api/stories?q=${searchTerm}`)
        .then((res) => res.json())
        .then((data) => {
          setStories(data);
          // If there is no search active, set the #1 Top Viewed book as the Hero
          if (!searchTerm && data.length > 0) {
            setHeroStory(data[0]); 
          } else {
            // Hide the hero if the user is actively searching
            setHeroStory(null);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e5e1e4] font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      <Navbar />

      {/* --- HERO SECTION (Shown only when not actively searching) --- */}
      {heroStory && !searchTerm && (
        <div className="relative w-full min-h-[85vh] flex items-center pt-24 border-b border-white/5">
          
          {/* Background Image Wrapper */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div 
               className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105"
               style={{ backgroundImage: `url(${heroStory.thumbnail || '/placeholder.jpg'})` }}
            />
            {/* Gradients for smooth blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent w-full md:w-[70%]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/40 to-[#09090b]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] h-full w-full"></div>
          </div>

          <div className="max-w-7xl mx-auto px-8 w-full relative z-10 flex flex-col md:flex-row gap-12 items-center">
             
             {/* Left: Metadata & Call to Actions */}
             <div className="flex-1 space-y-6 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400">
                   <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20"><ShieldCheck size={14}/> Top Ranked</span>
                   <span className="px-3 py-1 bg-white/5 border border-white/10">{heroStory.genre}</span>
                   <span className="flex items-center gap-1"><Eye size={14} className="text-amber-500"/> {heroStory.views || 0}</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-serif italic text-white leading-none tracking-tighter shadow-black drop-shadow-2xl">
                   {heroStory.title}
                </h1>
                
                <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                   Creator Node: <span className="text-zinc-200">{heroStory.authorName}</span>
                </p>

                <p className="text-zinc-300 text-sm leading-relaxed font-serif border-l-2 border-amber-500 pl-4 max-w-lg line-clamp-3">
                   {heroStory.description || "The creator has classified this document. Trigger the read protocol to bypass the security encryption block."}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-6">
                   <Link href={`/read/${heroStory._id}`}>
                      <button className="flex items-center gap-2 bg-amber-500 text-black px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white transition-all active:scale-95">
                        <Play size={14} fill="currentColor"/> Initiate Read
                      </button>
                   </Link>
                   <Link href={`/book/${heroStory._id}`}>
                      <button className="flex items-center gap-2 bg-white/5 text-white px-8 py-4 font-black uppercase tracking-[0.2em] text-[10px] border border-white/10 hover:bg-white/10 transition-all">
                        View Metadata
                      </button>
                   </Link>
                </div>
             </div>

             {/* Right: The Book Cover Image */}
             <div className="hidden md:block w-[300px] flex-shrink-0 relative group perspective-1000">
                <Link href={`/book/${heroStory._id}`}>
                   <div className="aspect-[3/4] bg-zinc-900 rounded border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative transition-transform duration-700 group-hover:rotate-y-[-5deg] group-hover:rotate-x-[5deg] group-hover:scale-105">
                     {heroStory.thumbnail ? (
                        <img src={heroStory.thumbnail} className="w-full h-full object-cover" alt="Cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900"><BookOpen size={48} className="text-zinc-700"/></div>
                     )}
                     {/* Glossy Reflection overlay */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </div>
                </Link>
             </div>

          </div>
        </div>
      )}

      {/* --- GRID & SEARCH SECTION --- */}
      <div className="max-w-7xl mx-auto pt-20 px-8 pb-32 relative z-10">
        
        <header className="mb-16 space-y-8 border-b border-zinc-800/50 pb-8">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Public Archive Nodes</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif text-zinc-100 italic leading-none tracking-tighter">
                  Discover <span className="text-zinc-600 font-sans not-italic font-bold">Collections</span>
                </h2>
              </div>

              {/* SEARCH BAR */}
              <div className="relative w-full md:w-96 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-amber-500 transition-colors" size={16} />
                 <input 
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="SEARCH MANUSCRIPTS..."
                   className="w-full bg-zinc-900/50 border border-zinc-800 py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
                 />
              </div>
            </div>
        </header>

        {/* --- GRID MAPPING --- */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-zinc-900/30 border border-white/5 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            
            {/* Filter out the Hero Story from the grid if we are not actively searching */}
            {stories.map((story) => {
              if (heroStory && !searchTerm && story._id === heroStory._id) return null; // Skip duplicate rendering of hero

              return (
                <div key={story._id} className="group block cursor-pointer">
                  <Link href={`/book/${story._id}`}>
                    <div className="aspect-[3/4] bg-[#0c0c0e] mb-6 relative overflow-hidden rounded-sm border border-white/[0.05] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-amber-500/30 shadow-2xl">
                      {story.thumbnail ? (
                        <img
                          src={story.thumbnail}
                          alt={story.title}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 group-hover:text-amber-500/20">
                          <BookOpen size={48} strokeWidth={1} />
                          <span className="text-[9px] mt-4 font-black uppercase tracking-[0.3em]">Cipher-Lock</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />
                      
                      <div className="absolute top-4 left-4">
                         <span className="px-3 py-1 bg-black/40 border border-white/5 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                           {story.genre}
                         </span>
                      </div>
                    </div>
                  </Link>

                  <div className="space-y-1">
                     <Link href={`/book/${story._id}`}>
                      <h4 className="font-serif text-xl text-zinc-100 italic group-hover:text-amber-500 transition-colors leading-snug line-clamp-1">
                        {story.title}
                      </h4>
                     </Link>
                     
                     <Link href={`/creator/${story.author}`}>
                      <p className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-[0.2em] font-black italic">
                        {story.authorName}
                      </p>
                     </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center border border-zinc-800/50 bg-zinc-900/10 rounded">
            <AlertCircle size={32} className="mx-auto mb-4 text-zinc-800"/>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">No signals found matching archive query.</p>
          </div>
        )}
      </div>
    </div>
  );
}