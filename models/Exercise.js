"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  
    _id: mongoose.Types.ObjectId,
    description: String,
    duration: Number,
    date: {
      type: Date,
      default: new Date()
    },
    user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  
});

module.exports = mongoose.model('Exercise', exerciseSchema);