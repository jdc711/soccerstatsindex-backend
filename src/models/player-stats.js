const mongoose = require('mongoose');

const PlayerStatsSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  _player_id: mongoose.Types.ObjectId,
  _league_id: mongoose.Types.ObjectId,
  _club_id: mongoose.Types.ObjectId,
  name: String,
  club: String,
  season: String,
  league: String,
  appearances: Number,
  goals: Number,
  assists: Number,
  "yellow-cards": Number,
  "red-cards": Number,
  "man-of-the-matches": Number,
  "average-match-rating": Number,
});

module.exports = mongoose.model('PlayerStats', PlayerStatsSchema, 'player-stats');