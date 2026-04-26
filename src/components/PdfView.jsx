"use client";
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { BookOpen } from 'lucide-react';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export default function PdfView({ pdfData, scale, pageNumber, numPages, viewMode, onLoaded }) {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto group">
      
      <Document
        file={pdfData}
        onLoadSuccess={onLoaded}
        loading={
          <div className="flex flex-col items-center justify-center p-32 text-zinc-500 gap-4 w-[min(100%,600px)] aspect-[3/4] bg-white/[0.02] rounded-xl animate-pulse ring-1 ring-white/5">
            <BookOpen size={28} className="text-zinc-600 mb-2 opacity-50" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Processing Pages...</span>
          </div>
        }
        className="flex flex-col items-center gap-8 w-full"
      >
        {viewMode === 'scroll' && numPages ? (
          Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="relative bg-[#0a0a0c] p-2 md:p-6 rounded-2xl md:rounded-3xl border border-white/[0.04] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-white/[0.08]">
              <div className="overflow-hidden rounded-xl md:rounded-xl bg-zinc-950 [&>canvas]:filter [&>canvas]:invert-[.92] [&>canvas]:hue-rotate-180 [&>canvas]:contrast-[.95] [&>canvas]:rounded-xl">
                <Page 
                  pageNumber={index + 1} 
                  scale={scale} 
                  renderTextLayer={true} 
                  renderAnnotationLayer={false}
                  className="transition-all duration-300 ease-in-out selection:bg-white/30 selection:text-transparent"
                />
              </div>
              <div className="absolute inset-2 md:inset-6 rounded-xl md:rounded-xl pointer-events-none border border-white/5 z-10"></div>
            </div>
          ))
        ) : (
          <div className="relative bg-[#0a0a0c] p-2 md:p-6 rounded-2xl md:rounded-3xl border border-white/[0.04] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-white/[0.08]">
            <div className="overflow-hidden rounded-xl md:rounded-xl bg-zinc-950 [&>canvas]:filter [&>canvas]:invert-[.92] [&>canvas]:hue-rotate-180 [&>canvas]:contrast-[.95] [&>canvas]:rounded-xl">
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                renderTextLayer={true} 
                renderAnnotationLayer={false}
                className="transition-all duration-300 ease-in-out selection:bg-white/30 selection:text-transparent"
              />
            </div>
            <div className="absolute inset-2 md:inset-6 rounded-xl md:rounded-xl pointer-events-none border border-white/5 z-10"></div>
          </div>
        )}
      </Document>
    </div>
  );
}