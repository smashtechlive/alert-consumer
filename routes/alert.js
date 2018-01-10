const express = require('express');
const router = express.Router();
let alertController = require('../controllers/alertController.js');

// Routes

// hello world
router.get('/hello', function (req, res, next) {
  res.json('Hello World');
});
// TODO is this is a get or post?

// get the speed for a given route
router.post('/alert', alertController.skinnyFitWebCPUAlert);

module.exports = router;
