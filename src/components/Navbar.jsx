"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Loader2,
  Calendar,
  Tv,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchContainerRef = useRef(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setSuggestions([]);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update this useEffect block inside your Navbar component
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        // 🟢 POINT TO YOUR STORIES API
        fetch(`/api/stories?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => res.json())
          .then((data) => {
            // Assume your story API returns an array, mapping it to fit your suggestion UI
            setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
            setIsSearching(false);
          })
          .catch(() => {
            setSuggestions([]);
            setIsSearching(false);
          });
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSuggestions([]);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
          isScrolled
            ? "h-16 bg-black/80 backdrop-blur-md border-white/5"
            : "h-24 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="group relative z-50">
            <h1 className="text-2xl font-black font-playfair-display tracking-tighter text-white">
              Story<span className="text-red-600">Teller</span>
            </h1>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <NavLink href="/" label="Home" />
          </div>

          <div className="flex items-center gap-4">
            <div ref={searchContainerRef} className="relative hidden md:block">
              <form
                onSubmit={handleSearch}
                className={`flex items-center bg-[#1a1a1a] border border-white/10 rounded-2xl transition-all duration-300 relative z-50 ${
                  isSearchOpen
                    ? "w-72 px-4 shadow-xl border-white/20"
                    : "w-10 px-0 border-transparent bg-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen)
                      setTimeout(
                        () =>
                          document.getElementById("desktop-search")?.focus(),
                        100,
                      );
                  }}
                  className="w-10 h-10 flex items-center justify-center shrink-0 text-white/70 hover:text-white transition-colors"
                >
                  <Search size={18} />
                </button>

                <input
                  id="desktop-search"
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent border-none outline-none text-xs text-white placeholder:text-white/30 w-full h-10 ${
                    !isSearchOpen && "pointer-events-none opacity-0"
                  }`}
                />

                {isSearching && isSearchOpen && (
                  <Loader2
                    size={14}
                    className="text-red-500 animate-spin absolute right-4"
                  />
                )}
              </form>

              <AnimatePresence>
                {isSearchOpen && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-3 w-80 bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                  >
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 py-2">
                        Best Matches
                      </p>
                      <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {suggestions.map((item) => (
                          <Link
                            key={item._id} // MongoDB uses _id
                            href={`/book/${item._id}`} // Redirect to Book Details Page
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                            onClick={() => setIsSearchOpen(false)}
                          >
                            <div className="w-10 h-14 shrink-0 rounded bg-[#222] overflow-hidden relative">
                              <img
                                src={item.thumbnail || "/placeholder.jpg"}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-medium">
                                <span className="flex items-center gap-1 uppercase tracking-widest text-[8px]">
                                  {item.genre}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              className="md:hidden text-white"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
            ) : session ? (
              <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
                <Link href="/dashboard">
                  <div className="text-right hidden xl:block">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Member
                    </p>
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                      {session.user.name}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => signOut()}
                    className="hidden xl:flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-red-500 transition-colors text-white/50"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white z-50 relative p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-[#0a0a0a] z-50 flex flex-col px-6 pt-4 pb-4 border-b border-white/10 md:hidden shadow-2xl"
          >
            <form
              onSubmit={handleSearch}
              className="w-full flex items-center gap-4 mb-4"
            >
              <Search size={20} className="text-white/50" />
              <input
                autoFocus
                type="text"
                placeholder="Search anime..."
                className="flex-1 bg-transparent text-white outline-none text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" onClick={() => setIsSearchOpen(false)}>
                <X size={20} className="text-white" />
              </button>
            </form>

            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar border-t border-white/5 pt-2">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/anime/${item.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg active:bg-white/10"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-14 rounded object-cover bg-[#222]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.releaseDate} • {item.type}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#050505] z-40 pt-24 px-8 flex flex-col"
          >
            {session ? (
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {session.user.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-8 pb-8 border-b border-white/5">
                <Link
                  href="/login"
                  className="flex items-center justify-center w-full py-3 bg-white text-black font-bold rounded-lg uppercase tracking-wider text-sm"
                >
                  Sign In / Register
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <MobileNavLink href="/" label="Home" />
              {session && (
                <MobileNavLink
                  href="/dashboard"
                  label="Dashboard"
                  icon={<LayoutDashboard size={18} />}
                />
              )}
            </div>

            {session && (
              <div className="mt-auto pb-12">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 text-red-500 font-bold text-sm uppercase tracking-wider"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const NavLink = ({ href, label }) => (
  <Link
    href={href}
    className="relative text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors py-2 group"
  >
    {label}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full" />
  </Link>
);

const MobileNavLink = ({ href, label, icon }) => (
  <Link
    href={href}
    className="flex items-center justify-between text-xl font-bold text-white group"
  >
    <span className="flex items-center gap-3">
      {icon} {label}
    </span>
    <ChevronRight
      size={16}
      className="text-white/20 group-hover:text-red-500 transition-colors"
    />
  </Link>
);

export default Navbar;
