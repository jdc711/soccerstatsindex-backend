const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  _current_club_id: mongoose.Types.ObjectId,
  name: String,
  age: Number,
  nationality: String,
  positions: String,
  "shirt-number": Number,
  "club-history": Array,
  "_club_ids": Array,
  "image-url": String
});

module.exports = mongoose.model('Player', PlayerSchema, 'player');