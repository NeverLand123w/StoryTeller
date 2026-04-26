import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { writerId } = await req.json();
    
    // Guard Rails (Cybersecurity Data Sanitation)
    if (!writerId) return NextResponse.json({ message: "Missing Identifier" }, { status: 400 });
    
    if (session.user.id === writerId) {
        return NextResponse.json({ message: "Self-Targeting Protocol Blocked" }, { status: 403 });
    }

    await connectDB();
    
    const currentUser = await User.findById(session.user.id);
    
    // Check if the array exists, if not initialize it
    if (!currentUser.followedWriters) {
        currentUser.followedWriters = [];
    }
    
    const isFollowing = currentUser.followedWriters.includes(writerId);

    if (isFollowing) {
      currentUser.followedWriters.pull(writerId); // Unfollow
    } else {
      currentUser.followedWriters.push(writerId); // Follow
    }

    await currentUser.save();
    return NextResponse.json({ success: true, isFollowing: !isFollowing });

  } catch (error) {
    console.error("FOLLOW API ERROR:", error);
    return NextResponse.json({ message: "Server Error", details: error.message }, { status: 500 });
  }
}