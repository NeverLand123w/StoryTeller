import connectDB from "@/lib/mongodb";
import Chapter from "@/models/Chapter";
import { decryptText } from "@/lib/encryption";
import { NextResponse } from "next/server";
import Story from "@/models/Story";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    let chapter = await Chapter.findById(id);

    // If it's a StoryID instead of a ChapterID, fetch the first chapter
    if (!chapter) {
      chapter = await Chapter.findOne({ storyId: id }).sort({
        chapterNumber: 1,
      });
    }

    if (!chapter)
      return NextResponse.json({ message: "Vault Empty" }, { status: 404 });

    const decryptedData = decryptText(
      chapter.contentType === "text" ? chapter.content : chapter.pdfData,
    );

    return NextResponse.json({
      title: chapter.title,
      contentType: chapter.contentType,
      content: decryptedData, // Now the data actually exists!
      type: chapter.contentType,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // 1. Connect to the database
    // await connectDB();

    // 2. Get the chapter ID from the URL parameters
    const { id } = await params;

    // 3. Parse the incoming payload from your frontend
    const body = await request.json();

    // 4. Find the chapter and update it
    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      {
        title: body.title,
        contentType: body.contentType,
        content: body.content,
        pdfData: body.pdfData,
      },
      { new: true }, // Returns the updated document
    );

    if (!updatedChapter) {
      return NextResponse.json(
        { message: "Chapter not found in database." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Chapter updated successfully", chapter: updatedChapter },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT Chapter Error:", error);
    return NextResponse.json(
      { message: "Failed to update chapter." },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    console.log("Searching in Chapter collection for:", id);

    // Try to find and delete directly from the Chapter collection
    const deletedChapter = await Chapter.findByIdAndDelete(id);

    if (!deletedChapter) {
      console.log("❌ FAIL: ID not found in Chapter collection.");
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 },
      );
    }

    console.log("✅ SUCCESS: Chapter deleted from standalone collection.");
    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
