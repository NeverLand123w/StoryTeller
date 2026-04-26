import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    // Fetch only stories where the author ID matches the logged-in user
    const myStories = await Story.find({ author: session.user.id })
      .select("-content -pdfData") // Don't fetch heavy encrypted data here
      .sort({ createdAt: -1 });

    return NextResponse.json(myStories);
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}