"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trash2,
  X,
  Rows,
  Square,
} from "lucide-react";

const PdfView = dynamic(() => import("@/components/PdfView"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-20 opacity-70 animate-pulse">
      <BookOpen size={28} className="mb-4 text-zinc-500" />
      <p className="text-sm font-medium text-zinc-500">Loading document...</p>
    </div>
  ),
});

// --- ADVANCED HIGHLIGHTING UTILITIES ---
function getXPathForNode(node, root) {
  const parts = [];
  let current = node;
  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) break;
    const siblings = Array.from(parent.childNodes);
    const index = siblings.indexOf(current);
    const tag =
      current.nodeType === Node.TEXT_NODE
        ? `text()[${index + 1}]`
        : `${current.nodeName.toLowerCase()}[${
            siblings
              .slice(0, index + 1)
              .filter((s) => s.nodeName === current.nodeName).length
          }]`;
    parts.unshift(tag);
    current = parent;
  }
  return parts.join("/");
}

function getNodeByXPath(xpath, root) {
  try {
    const result = document.evaluate(
      xpath,
      root,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null,
    );
    return result.singleNodeValue;
  } catch {
    return null;
  }
}

function getTextNodesInRange(range) {
  const result = [];
  const root = range.commonAncestorContainer;

  const walker = document.createTreeWalker(
    root.nodeType === Node.TEXT_NODE ? root.parentNode : root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (range.intersectsNode(node)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      },
    },
  );

  let node;
  while ((node = walker.nextNode())) {
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(node);

    const start = node === range.startContainer ? range.startOffset : 0;
    const end =
      node === range.endContainer ? range.endOffset : node.textContent.length;

    if (start < end) {
      result.push({ node, start, end });
    }
  }

  // Handle single text node selection fallback
  if (result.length === 0 && root.nodeType === Node.TEXT_NODE) {
    result.push({ node: root, start: range.startOffset, end: range.endOffset });
  }

  return result;
}

export default function ReaderPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [fontSize, setFontSize] = useState(20);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [viewMode, setViewMode] = useState("single");

  const searchParams = useSearchParams();
  const chapterId = searchParams.get("ch");

  const [selectionMenu, setSelectionMenu] = useState({
    show: false,
    x: 0,
    y: 0,
  });
  const [hoveredMark, setHoveredMark] = useState({
    show: false,
    x: 0,
    y: 0,
    markId: null,
  });

  const contentRef = useRef(null);
  const highlightStoreRef = useRef({});

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "info" }),
      3000,
    );
  };

  const persistStore = () => {
    localStorage.setItem(
      `hl-store-${id}-${chapterId}`,
      JSON.stringify(highlightStoreRef.current),
    );
  };

  // --- HIGHLIGHTER ENGINE: ROBUST XPATH IMPLEMENTATION ---

  const attachMarkListener = (mark, markId) => {
    if (mark.dataset.listenerAttached) return;
    mark.dataset.listenerAttached = "1";

    mark.addEventListener("mouseenter", () => {
      const rect = mark.getBoundingClientRect();
      setHoveredMark({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        markId,
      });
    });

    mark.addEventListener("mouseleave", () => {
      setTimeout(() => {
        setHoveredMark((prev) =>
          prev.markId === markId
            ? { show: false, x: 0, y: 0, markId: null }
            : prev,
        );
      }, 120);
    });
  };

  const paintHighlight = (markId, color, segments) => {
    const root = contentRef.current;
    if (!root) return;

    // Reverse segments so mutating DOM at the end doesn't shift offsets of earlier nodes
    const reversedSegments = [...segments].reverse();

    reversedSegments.forEach((seg) => {
      const textNode = getNodeByXPath(seg.xpath, root);
      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

      const before = textNode.splitText(seg.start);
      before.splitText(seg.end - seg.start);
      const highlighted = before;

      const mark = document.createElement("mark");
      mark.dataset.markId = markId;
      mark.style.backgroundColor = color;
      mark.style.color = "#18181b"; // dark zinc for readability
      mark.className =
        "rounded-[2px] px-0.5 shadow-sm cursor-pointer transition-colors";

      highlighted.parentNode.insertBefore(mark, highlighted);
      mark.appendChild(highlighted);

      attachMarkListener(mark, markId);
    });
  };

  const restoreHighlights = () => {
    const raw = localStorage.getItem(`hl-store-${id}-${chapterId}`);
    if (!raw) return;
    try {
      const store = JSON.parse(raw);
      highlightStoreRef.current = store;
      Object.entries(store).forEach(([markId, { color, segments }]) => {
        paintHighlight(markId, color, segments);
      });
    } catch (e) {
      console.error("Failed to restore highlights:", e);
      localStorage.removeItem(`hl-store-${id}-${chapterId}`);
    }
  };

  const applyHighlight = (color) => {
    const root = contentRef.current;
    // 🟢 Safety guard: If the text container doesn't exist, abort.
    if (!root) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;

    const textNodes = getTextNodesInRange(range);
    if (textNodes.length === 0) return;

    const markId = `mark-${Date.now()}`;
    const segments = textNodes.map(({ node, start, end }) => ({
      xpath: getXPathForNode(node, root),
      start,
      end,
    }));

    // Save to memory and local storage
    highlightStoreRef.current[markId] = { color, segments };
    persistStore();

    // Paint to UI
    paintHighlight(markId, color, segments);

    selection.removeAllRanges();
    setSelectionMenu({ show: false, x: 0, y: 0 });
    showToast("Highlight saved.", "success");
  };

  const removeHighlight = (markId) => {
    const root = contentRef.current;
    if (!root) return;

    const marks = root.querySelectorAll(`mark[data-mark-id="${markId}"]`);
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize(); // Merge text nodes back together
    });

    delete highlightStoreRef.current[markId];
    persistStore();

    setHoveredMark({ show: false, x: 0, y: 0, markId: null });
    showToast("Highlight removed.", "success");
  };

  const clearHighlights = () => {
    const root = contentRef.current;
    if (!root) return;

    const marks = root.querySelectorAll("mark[data-mark-id]");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    });

    highlightStoreRef.current = {};
    persistStore();
    setSelectionMenu({ show: false, x: 0, y: 0 });
    showToast("All highlights cleared.", "success");
  };

  // --- DATA FETCHING & EVENT LISTENERS ---

  useEffect(() => {
    const fetchPath = chapterId
      ? `/api/chapters/${chapterId}`
      : `/api/stories/${id}/first-chapter`;

    fetch(fetchPath)
      .then((res) => res.json())
      .then((data) => {
        setStory(data);
        setLoading(false);
      })
      .catch(() => setError(true));
  }, [id, chapterId]);

  useEffect(() => {
    if (story?.type === "text" && contentRef.current) {
      restoreHighlights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, id, chapterId]);

  useEffect(() => {
    fetch(`/api/user/bookmark?storyId=${id}`)
      .then((res) => res.json())
      .then((bookmarkData) => setIsBookmarked(bookmarkData.isBookmarked))
      .catch(() => {});

    // DRM Protection
    const blockCopy = (e) => {
      e.preventDefault();
      showToast("Copying text is disabled for this story.", "warning");
    };
    document.addEventListener("contextmenu", blockCopy);
    document.addEventListener("copy", blockCopy);
    return () => {
      document.removeEventListener("contextmenu", blockCopy);
      document.removeEventListener("copy", blockCopy);
    };
  }, [id]);

  const handleSelection = () => {
    // 🟢 Disable the highlighting feature entirely if reading a PDF
    if (story?.type === "pdf") {
      setSelectionMenu({ show: false, x: 0, y: 0 });
      return;
    }

    const selection = window.getSelection();
    if (
      selection &&
      !selection.isCollapsed &&
      selection.toString().trim().length > 0
    ) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionMenu({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    } else {
      setSelectionMenu({ show: false, x: 0, y: 0 });
    }
  };

  const toggleBookmark = async () => {
    try {
      const res = await fetch("/api/user/bookmark", {
        method: "POST",
        body: JSON.stringify({ storyId: id }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const next = !isBookmarked;
        setIsBookmarked(next);
        showToast(
          next ? "Added to your library" : "Removed from your library",
          "success",
        );
      }
    } catch {
      showToast("Please sign in to save stories.", "warning");
    }
  };

  if (error) {
    return (
      <div className="bg-zinc-950 min-h-screen flex flex-col items-center justify-center text-zinc-400 gap-3">
        <AlertCircle size={32} className="text-zinc-600" />
        <span className="text-sm font-medium">
          Content is currently unavailable.
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex flex-col items-center justify-center text-zinc-500 gap-3">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading reader...</span>
      </div>
    );
  }

  return (
    <div
      onMouseUp={handleSelection}
      className="bg-zinc-950 min-h-screen text-zinc-200 relative selection:bg-amber-500/20 selection:text-white font-sans overflow-x-hidden"
    >
      {/* Toast Notification */}
      <div
        className={`fixed top-6 left-1/2 -translate-x-1/2 z- transition-all duration-300 ease-out transform ${
          toast.show
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 shadow-xl bg-zinc-900 text-sm font-medium text-white">
          {toast.message}
        </div>
      </div>

      {/* Text Selection Menu */}
      {selectionMenu.show && (
        <div
          className="fixed z- flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-full transition-all duration-150 z-999"
          style={{
            left: `${selectionMenu.x}px`,
            top: `${selectionMenu.y - 8}px`,
          }}
        >
          <span className="text-xs font-medium text-zinc-400 pr-2 border-r border-zinc-700">
            Highlight
          </span>
          <button
            onClick={() => applyHighlight("#fef08a")}
            className="w-5 h-5 rounded-full bg-[#fef08a] hover:scale-110 transition-transform shadow-inner border border-black/10"
            title="Yellow"
          />
          <button
            onClick={() => applyHighlight("#a7f3d0")}
            className="w-5 h-5 rounded-full bg-[#a7f3d0] hover:scale-110 transition-transform shadow-inner border border-black/10"
            title="Green"
          />
          <button
            onClick={() => applyHighlight("#fbcfe8")}
            className="w-5 h-5 rounded-full bg-[#fbcfe8] hover:scale-110 transition-transform shadow-inner border border-black/10"
            title="Pink"
          />
          {story?.type === "text" && (
            <>
              <div className="w-[1px] h-4 bg-zinc-700 ml-1" />
              <button
                onClick={clearHighlights}
                title="Clear all highlights"
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors rounded-md"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <div className="w-[1px] h-4 bg-zinc-700 ml-1" />
          <button
            onClick={() => setSelectionMenu({ show: false, x: 0, y: 0 })}
            className="p-1 text-zinc-400 hover:text-white transition-colors rounded-md"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hover Highlight Menu */}
      {hoveredMark.show && (
        <div
          className="fixed z- flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl transform -translate-x-1/2 -translate-y-full transition-all duration-150"
          style={{ left: `${hoveredMark.x}px`, top: `${hoveredMark.y - 8}px` }}
          onMouseEnter={() =>
            setHoveredMark((prev) => ({ ...prev, show: true }))
          }
          onMouseLeave={() =>
            setHoveredMark({ show: false, x: 0, y: 0, markId: null })
          }
        >
          <button
            onClick={() => removeHighlight(hoveredMark.markId)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-rose-400 transition-colors z-999"
          >
            <X size={14} /> Remove Highlight
          </button>
        </div>
      )}

      {/* Bottom Reader Toolbar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 backdrop-blur-md p-1.5 rounded-full shadow-2xl transition-all duration-300">
        {story?.type === "pdf" && (
          <>
            <div className="flex items-center px-4 gap-2 border-r border-zinc-800">
              <button
                onClick={() => setViewMode("single")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "single" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                title="Single Page"
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => setViewMode("scroll")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "scroll" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                title="Continuous Scroll"
              >
                <Rows size={16} />
              </button>
            </div>

            {viewMode === "single" && (
              <div className="flex items-center px-4 gap-4 border-r border-zinc-800">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-medium w-16 text-center text-zinc-300">
                  Pg {pageNumber}
                </span>
                <button
                  onClick={() =>
                    setPageNumber((p) => Math.min(numPages || 1, p + 1))
                  }
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        <div className="flex items-center px-4 gap-4 border-r border-zinc-800">
          <button
            onClick={() =>
              story?.type === "text"
                ? setFontSize((f) => Math.max(12, f - 2))
                : setScale((s) =>
                    Math.max(0.5, parseFloat((s - 0.1).toFixed(1))),
                  )
            }
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-xs font-medium w-10 text-center text-zinc-300">
            {story?.type === "text"
              ? `${fontSize}px`
              : `${Math.round(scale * 100)}%`}
          </span>
          <button
            onClick={() =>
              story?.type === "text"
                ? setFontSize((f) => Math.min(48, f + 2))
                : setScale((s) => parseFloat((s + 0.1).toFixed(1)))
            }
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? "text-rose-500 hover:bg-zinc-900"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Heart
              size={18}
              fill={isBookmarked ? "currentColor" : "none"}
              className={isBookmarked ? "scale-105 transition-transform" : ""}
            />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-24 pb-40 px-6 sm:px-12 relative z-10">
        <header className="mb-16 text-center space-y-6 w-full">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 tracking-tight text-center max-w-3xl mx-auto">
            {story?.title || "Untitled"}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-zinc-500 font-medium">
              By{" "}
              <span className="text-zinc-300">
                {story?.author || "Anonymous"}
              </span>
            </p>
          </div>
        </header>

        <div className="w-full flex justify-center">
          {story?.type === "pdf" ? (
            <PdfView
              pdfData={story.content}
              scale={scale}
              pageNumber={pageNumber}
              numPages={numPages}
              viewMode={viewMode}
              onLoaded={({ numPages }) => setNumPages(numPages)}
            />
          ) : (
            <div
              ref={contentRef}
              style={{ fontSize: `${fontSize}px` }}
              className="leading-relaxed font-serif text-zinc-300 max-w-2xl w-full px-2 cursor-text transition-[font-size] duration-300 ease-in-out"
              suppressHydrationWarning
            >
              {story?.content ||
                story?.textContent ||
                "This chapter is currently empty."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
