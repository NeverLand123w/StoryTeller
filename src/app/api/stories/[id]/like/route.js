import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    
    const story = await Story.findById(id);
    if (!story) return NextResponse.json({ message: "Not Found" }, { status: 404 });

    // Check if the array exists, if not initialize it (Fallback safeguard)
    if (!story.likes) {
       story.likes = [];
    }

    const isLiked = story.likes.includes(session.user.id);

    if (isLiked) {
      story.likes.pull(session.user.id); // Removes user ID from likes
    } else {
      story.likes.push(session.user.id); // Adds user ID to likes
    }

    await story.save();
    return NextResponse.json({ success: true, isLiked: !isLiked });

  } catch (error) {
    console.error("LIKE API ERROR:", error);
    return NextResponse.json({ message: "Server Error", details: error.message }, { status: 500 });
  }
}