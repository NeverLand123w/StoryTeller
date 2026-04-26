import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { encryptText } from "@/lib/encryption";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import Chapter from "@/models/Chapter";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      title,
      description,
      genre,
      contentType,
      thumbnail,
      visibility,
      content,
      pdfData,
    } = body;

    await connectDB();

    // 1. Create the STORY container (The Metadata)
    const newStory = await Story.create({
      author: session.user.id,
      authorName: session.user.name,
      title,
      description,
      genre,
      thumbnail,
      visibility,
      contentType,
    });

    // 2. 🟢 AUTO-CREATE CHAPTER 1 (This makes it show up immediately!)
    const securedData = encryptText(contentType === "text" ? content : pdfData);
    await Chapter.create({
      storyId: newStory._id, // LINKED!
      title: newStory.title,
      chapterNumber: 1,
      contentType,
      [contentType === "text" ? "content" : "pdfData"]: securedData,
    });

    return NextResponse.json(
      { message: "Manuscript Vaulted", id: newStory._id },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
