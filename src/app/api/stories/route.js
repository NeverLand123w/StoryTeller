import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { NextResponse } from "next/server";
import Fuse from "fuse.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    await connectDB();

    // 1. Fetch all public stories (Without the heavy data)
    let stories = await Story.find({ visibility: "public" })
      .select("-content -pdfData") 
      .sort({ views: -1 });

    // 2. If no query, return the default public stories sorted by views
    if (!query) {
      return NextResponse.json(stories);
    }

    // 3. 🚀 Fuzzy Search Engine via Fuse.js
    const fuse = new Fuse(stories, {
      keys: [
        { name: "title", weight: 2 }, // Title matches are prioritized over description
        { name: "genre", weight: 1.5 },
        { name: "description", weight: 1 },
      ],
      threshold: 0.5, // Defines typo-tolerance. 0 is exact match, 1 is loose match.
      ignoreLocation: true,
    });

    // Run the search and extract the items from the fuse format
    const searchResults = fuse.search(query).map(result => result.item);

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Search Index Failure" },
      { status: 500 },
    );
  }
}