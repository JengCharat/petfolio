const connectDB = require('./db');
const port = process.env.PORT || 3002;

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const createError = require('http-errors');
const cors = require("cors");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRoutes = require('./routes/auth');
const app = express();


// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Next.js frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// สำหรับ preflight OPTIONS requests
app.options('*', cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
/////////////////////////////////////////////
app.use('/api/auth', authRoutes);
/////////////////////////////////////////////
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

const Pet = require("./models/pet");

// API ดึงสัตว์ทั้งหมด
app.get("/pets", async (req, res) => {
  try {
    const pets = await Pet.find({});
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API เพิ่มสัตว์ใหม่
app.post("/pets", async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// แก้ไขสัตว์เลี้ยง
app.put("/pets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true } // new: คืนค่าอัปเดตแล้ว
    );

    if (!updatedPet) return res.status(404).json({ error: "Pet not found" });

    res.json(updatedPet); // ส่ง JSON กลับไป frontend
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}); 



 
app.use('/', indexRouter); 
app.use('/users', usersRouter);

// Catch 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`๐€ Server running at http://localhost:${port}`);
});

module.exports = app;


