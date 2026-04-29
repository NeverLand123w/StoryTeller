// your auth config file (often app/api/auth/[...nextauth]/route.js)
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { email, password, otp } = credentials;
        try {
          await connectDB();
          const user = await User.findOne({ email });

          if (!user) throw new Error("Invalid credentials");

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) throw new Error("Invalid credentials");

          // 🚨 --- NEW 2FA OTP LOGIC HERE --- 🚨
          if (user.twoFactorCode !== otp) {
            throw new Error("Invalid or incorrect code.");
          }

          if (user.twoFactorCodeExpiry < new Date()) {
            throw new Error("This code has expired. Please log in again.");
          }

          // If the OTP is correct and hasn't expired, delete it from the DB
          user.twoFactorCode = undefined;
          user.twoFactorCodeExpiry = undefined;
          await user.save();

          return user; // Logs the user in
        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };