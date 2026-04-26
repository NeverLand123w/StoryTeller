import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import Chapter from "@/models/Chapter";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);

    // 1. Fetch the story
    const story = await Story.findById(id).select("-content -pdfData");
    if (!story)
      return NextResponse.json({ message: "Not Found" }, { status: 404 });

    // 2. Fetch Chapters
    const chapters = await Chapter.find({ storyId: id }).sort({
      chapterNumber: 1,
    });

    // 3. Increment Views
    await Story.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // 4. Confidentiality Enforcement
    if (story.visibility === "private") {
      if (!session || session.user.id !== story.author.toString()) {
        return NextResponse.json(
          { message: "Access Denied" },
          { status: 403 },
        );
      }
    }

    // 5. Calculate Social Interaction Status
    let isBookmarked = false; // Renamed from isLiked for clarity
    let isFollowing = false;

    if (session?.user?.id) {
      const currentUser = await User.findById(session.user.id);
      
      if (currentUser) {
        // 🟢 BOOKMARK LOGIC: Check if this story ID exists in user's bookmarks
        if (currentUser.bookmarks) {
          isBookmarked = currentUser.bookmarks.some(
            (bId) => bId.toString() === id
          );
        }

        // FOLLOWING LOGIC
        if (currentUser.followedWriters) {
          isFollowing = currentUser.followedWriters.some(
            (fId) => fId.toString() === story.author.toString()
          );
        }
      }
    }

    return NextResponse.json({
      story,
      chapters,
      isBookmarked, // 🟢 Return this boolean to the frontend
      isFollowing,
    });
  } catch (error) {
    console.error("💥 DETAILS API ERROR:", error);
    return NextResponse.json(
      { message: "Server Error", details: error.message },
      { status: 500 },
    );
  }
}