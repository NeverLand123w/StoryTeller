import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Story from "@/models/Story";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id: creatorId } = await params;
    await connectDB();
    const session = await getServerSession(authOptions);

    // 1. Get Creator Details
    const creator = await User.findById(creatorId).select("-password -resetToken -resetCode");
    if (!creator) return NextResponse.json({ message: "Creator Not Found" }, { status: 404 });

    // 2. Calculate Followers (Count how many users have this creatorId in their followedWriters array)
    const followersCount = await User.countDocuments({ followedWriters: creatorId });

    // 3. Get all published stories by this creator
    const stories = await Story.find({ author: creatorId })
      .select("-content -pdfData") // Never send raw ciphertexts here!
      .sort({ createdAt: -1 });

    // 4. Check if the currently logged-in reader is following this creator
    let isFollowing = false;
    if (session) {
      const currentUser = await User.findById(session.user.id);
      isFollowing = currentUser?.followedWriters?.includes(creatorId) || false;
    }

    return NextResponse.json({
      creator: {
        id: creator._id,
        name: creator.name,
        role: creator.role,
        followersCount
      },
      stories,
      isFollowing
    });

  } catch (error) {
    console.error("CREATOR API ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}