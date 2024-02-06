const express = require('express');
const router = express.Router();
const seasonController = require('../controllers/season-controller');

router.get('/all-seasons', seasonController.getAllSeasons);

module.exports = router;
