import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q"); // Search query parameter

    await connectDB();

    let filter = { visibility: "public" };
    

    // 🛡️ Search Implementation: Regex lookup for Title, Description, or Genre
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ];
    }

    // 🚀 Ranking Algorithm: Sort only by fields that exist in your schema!
    const stories = await Story.find(filter)
      .select("-content -pdfData") // Protect heavy data
      .sort({ views: -1 }); // 🟢 FIXED: Removed bookmarksCount
      

    return NextResponse.json(stories);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Search Index Failure" },
      { status: 500 },
    );
  }
}
