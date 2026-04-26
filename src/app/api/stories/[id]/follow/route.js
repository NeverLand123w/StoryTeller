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
    
    if (!writerId) return NextResponse.json({ message: "Writer ID Missing" }, { status: 400 });
    
    // 🛡️ CYBERSECURITY: Block self-following
    if (session.user.id === writerId) {
        return NextResponse.json({ message: "Action Blocked: Self-Follow" }, { status: 403 });
    }

    await connectDB();
    
    // 1. Fetch the logged-in User's document
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // 2. Fallback safety check if array doesn't exist on older users
    if (!currentUser.followedWriters) {
        currentUser.followedWriters = [];
    }

    // 3. Toggle Logic
    const isFollowing = currentUser.followedWriters.includes(writerId);

    if (isFollowing) {
      currentUser.followedWriters.pull(writerId); // Remove follow
    } else {
      currentUser.followedWriters.push(writerId); // Add follow
    }

    await currentUser.save();
    return NextResponse.json({ success: true, isFollowing: !isFollowing });

  } catch (error) {
    console.error("FOLLOW API ERROR:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}