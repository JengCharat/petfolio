const { getToken } = require("next-auth/jwt");
module.exports = async function auth(req, res, next) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    console.log("token from next-auth:", token); // เพิ่มบรรทัดนี้
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    req.user = { id: token.sub, email: token.email };
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};