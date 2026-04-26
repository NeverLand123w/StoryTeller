import connectDB from "@/lib/mongodb";
import Chapter from "@/models/Chapter";
import { decryptText } from "@/lib/encryption";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("ch"); // Get the chapter ID if passed

    await connectDB();

    let chapter;
    if (chapterId) {
      chapter = await Chapter.findById(chapterId);
    } else {
      // Default: Grab the first chapter (Chapter 1) of the story
      chapter = await Chapter.findOne({ storyId: id }).sort({
        chapterNumber: 1,
      });
    }

    if (!chapter)
      return NextResponse.json(
        { message: "Vault empty or sequence not found" },
        { status: 404 },
      );

    const rawData =
      chapter.contentType === "text" ? chapter.content : chapter.pdfData;
    const decryptedData = decryptText(rawData);

    return NextResponse.json({
      title: chapter.title,
      contentType: chapter.contentType,
      content: decryptedData,
      type: chapter.contentType,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Security failure during unlocking" },
      { status: 500 },
    );
  }
}
