import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { preferences } = await req.json();
    await connectDB();
    
    await User.findByIdAndUpdate(session.user.id, { preferences });

    return NextResponse.json({ message: "Settings Saved" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}