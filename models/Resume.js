const mongoose = require('mongoose');
const { Schema } = mongoose;

const resumeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
