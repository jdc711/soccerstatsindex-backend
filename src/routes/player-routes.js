const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player-controller');

router.get('/player-profile', playerController.getPlayerProfile);
router.get('/player-stats', playerController.getPlayerStats);
router.get('/top-player-stats', playerController.getTopPerformersStats);
router.get('/all-players', playerController.getAllPlayers);
router.get('/search-players-by-name', playerController.searchByPlayerName);

module.exports = router;
