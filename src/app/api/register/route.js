import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();

    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ message: "User already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "User Registered Securely" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error in Registration" }, { status: 500 });
  }
}