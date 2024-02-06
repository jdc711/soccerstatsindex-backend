const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  name: String,
  "image-url": String,
  "is-club": Boolean,
  _league_ids: Array
});

module.exports = mongoose.model('Club', ClubSchema, 'club');