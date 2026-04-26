import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();
    await connectDB();

    const user = await User.findOne({
      email,
      resetCode: otp,
      resetCodeExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    return NextResponse.json({ message: "Identity Recovery Complete." });
  } catch (error) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}