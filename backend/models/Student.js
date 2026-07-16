const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
  },
  qrCodeUrl: {
    type: String, // Data URL of the generated QR code
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
