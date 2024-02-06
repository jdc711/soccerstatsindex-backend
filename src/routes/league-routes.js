const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/league-controller');

router.get('/league-profile', leagueController.getLeagueProfile);
router.get('/all-leagues', leagueController.getAllLeagues);


module.exports = router;
