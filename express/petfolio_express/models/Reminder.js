const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet', // อ้างอิงถึง Pet model
    required: true
  },
  details: String,
  userId: {
    type: String,
    required: true
  },
  completed: {           // <-- เพิ่ม Completed เพื่อให้สถานะเปลี่ยนได้
    type: Boolean,
    default: false
  }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;