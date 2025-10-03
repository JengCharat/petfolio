const connectDB = require("./db");
const port = process.env.PORT || 3002;

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const createError = require("http-errors");
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pets");
const healthRoutes = require("./routes/health");

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ CORS ให้ Next.js (3001) เรียกได้
app.use(
  cors({
    origin: "http://localhost:3001", // หรือ "*" ชั่วคราว
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ สำหรับ preflight OPTIONS
app.options("*", cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/health", healthRoutes);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// ✅ Catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// ✅ Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.listen(port, () => {
  console.log(`🚀 Express Server running at http://localhost:${port}`);
});

module.exports = app;