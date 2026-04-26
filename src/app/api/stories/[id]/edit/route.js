import connectDB from "@/lib/mongodb";
import Story from "@/models/Story";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { encryptText, decryptText } from "@/lib/encryption";

// GET: Pre-load the data into the editor (Decrypt it for the author!)
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const story = await Story.findById(id);

    // SECURITY CHECK: Ensure the person trying to edit actually owns the book!
    if (story.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Action Blocked: Ownership verification failed." },
        { status: 403 },
      );
    }

    // Decrypt content so the author can see and edit their text
    let decryptedContent = "";
    if (story.contentType === "text" && story.content) {
      decryptedContent = decryptText(story.content);
    }

    return NextResponse.json({
      title: story.title,
      genre: story.genre,
      contentType: story.contentType,
      thumbnail: story.thumbnail || "",
      description: story.description || "",
      content: decryptedContent, // Send plaintext to the editor
    });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

// PUT: Save the updated data securely
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // 🟢 1. EXPLICITLY CAPTURE VISIBILITY FROM PAYLOAD
    const { title, content, genre, thumbnail, description, visibility } =
      await req.json();

    await connectDB();
    const story = await Story.findById(id);

    if (story.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Action Blocked: Not Authorized" },
        { status: 403 },
      );
    }

    let securedContent = story.content;
    if (story.contentType === "text" && content) {
      securedContent = encryptText(content);
    }

    story.title = title || story.title;
    story.genre = genre || story.genre;
    story.description =
      description !== undefined ? description : story.description;

    // 🟢 2. EXPLICITLY OVERWRITE VISIBILITY INTO MONGODB
    story.visibility = visibility || story.visibility || "public";

    if (thumbnail !== undefined) story.thumbnail = thumbnail;
    if (story.contentType === "text") story.content = securedContent;

    await story.save();
    return NextResponse.json(
      { message: "Manuscript Overwritten" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();

    // Check Ownership prior to executing destructive commands!
    const story = await Story.findById(id);
    if (!story)
      return NextResponse.json({ message: "Node absent" }, { status: 404 });
    if (story.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Cyber Breach Blocked." },
        { status: 403 },
      );
    }

    await Story.findByIdAndDelete(id);
    return NextResponse.json({
      message: "Encrypted file incinerated successfully.",
    });
  } catch (error) {
    return NextResponse.json({ message: "Server Fail" }, { status: 500 });
  }
}
