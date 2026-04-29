// app/api/auth/send-2fa/route.js
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();
    
    // 1. Verify User exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 2. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Generate Code and Save
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.twoFactorCode = otpCode;
    user.twoFactorCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // 4. Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"StoryTeller Support" <support@StoryTeller.com>',
      to: email,
      subject: "Your Login Authentication Code",
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: sans-serif; text-align: center;">
          <h1 style="color: #fff; font-family: 'Playfair Display', serif;">StoryTeller</h1>
          <p style="color: #666; text-transform: uppercase; letter-spacing: 2px;">Login Authentication</p>
          <div style="background: #111; padding: 20px; border: 1px solid #333; margin: 20px 0;">
            <h2 style="font-size: 32px; letter-spacing: 10px;">${otpCode}</h2>
          </div>
          <p>This code expires in 10 minutes. If you did not request this, secure your account immediately.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Code sent successfully!" });
  } catch (error) {
    console.error("2FA Send Error:", error);
    return NextResponse.json({ error: "Failed to send 2FA email." }, { status: 500 });
  }
}