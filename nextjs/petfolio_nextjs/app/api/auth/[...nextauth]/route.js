import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  // ...provider config...
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // ต้องเป็น false ถ้าใช้ http/localhost
      },
    },
  },
});