import connectDB from "@/lib/mongodb";
import Chapter from "@/models/Chapter"; // 🟢 Ensure your Chapter model is imported
import { encryptText } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, content, contentType, pdfData, chapterNumber } = body;

        await connectDB();

        // 🛡️ ENCRYPT
        const securedData = encryptText(contentType === 'text' ? content : pdfData);

        // 🛡️ CREATE CHAPTER
        const newChapter = await Chapter.create({
            storyId: id,
            title,
            chapterNumber: parseInt(chapterNumber) || 1,
            contentType,
            [contentType === 'text' ? 'content' : 'pdfData']: securedData
        });
        
        return NextResponse.json(newChapter, { status: 201 });
    } catch (error) {
        console.error("CHAPTER POST ERROR:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}