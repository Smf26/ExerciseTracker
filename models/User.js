"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const Exercise = require('./models/Exercise');

const userSchema = new Schema({
  _id: mongoose.Types.ObjectId,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  exercise: [{
    description: String,
    duration: Number,
    date: {
      type: Date,
      default: new Date()
    }
  }]
});

module.exports = mongoose.model('User', userSchema);