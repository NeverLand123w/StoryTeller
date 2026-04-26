import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 });

    const { preferences, highlightAction, storyId, highlightData } = await req.json();
    await connectDB();
    const user = await User.findById(session.user.id);

    if (preferences) user.preferences = preferences;

    if (highlightAction === 'save' && storyId) {
        const idx = user.interactions.findIndex(i => i.storyId === storyId);
        if (idx > -1) user.interactions[idx].highlights = highlightData;
        else user.interactions.push({ storyId, highlights: highlightData });
    }

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Persistence Failure" }, { status: 500 });
  }
}