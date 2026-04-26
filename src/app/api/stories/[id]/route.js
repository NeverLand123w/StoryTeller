// src/app/api/stories/[id]/route.js
import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = await params; // Make sure [id] matches folder name
    await connectDB();
    
    const story = await Story.findById(id).select("-content -pdfData");
    if (!story) return NextResponse.json({ message: "Not Found" }, { status: 404 });
    
    return NextResponse.json(story);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}