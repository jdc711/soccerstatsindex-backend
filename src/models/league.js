const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  name: String,
  location: String,
  "image-url": String,
  "is-club-competition": Boolean
});

module.exports = mongoose.model('League', LeagueSchema, 'league');