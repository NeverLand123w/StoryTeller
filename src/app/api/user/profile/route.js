import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Story from "@/models/Story"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    
    
    const user = await User.findById(session.user.id)
      .populate("bookmarks") 
      .populate("followedWriters", "name")
      .select("-password");

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}