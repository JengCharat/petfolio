const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  deptNo: { type: String, required: true },
});

module.exports = mongoose.model('Student', studentSchema);
