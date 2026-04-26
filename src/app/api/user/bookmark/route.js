import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { storyId } = await req.json();
    await connectDB();

    const user = await User.findById(session.user.id);
    const isBookmarked = user.bookmarks.includes(storyId);

    if (isBookmarked) {
      user.bookmarks.pull(storyId); 
    } else {
      user.bookmarks.push(storyId);
    }

    await user.save();
    return NextResponse.json({ message: "Success", isBookmarked: !isBookmarked });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get("storyId");
  const session = await getServerSession(authOptions);
  
  await connectDB();
  const user = await User.findById(session.user.id);
  const exists = user.bookmarks.includes(storyId);
  return NextResponse.json({ isBookmarked: exists });
}