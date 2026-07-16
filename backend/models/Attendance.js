const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  date: {
    type: String, // ISO date string (YYYY-MM-DD)
    required: true,
  },
  timeIn: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present',
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
