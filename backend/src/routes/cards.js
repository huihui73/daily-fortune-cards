// backend/src/routes/cards.js

const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cardsController');

router.post('/today', cardsController.getTodayCards);

module.exports = router;
