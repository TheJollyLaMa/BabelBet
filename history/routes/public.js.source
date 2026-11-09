const express = require('express');
// const db = require('../db');

var router = express.Router();
router.use('/', express.static('public'));
/* Open all public routes with a #! */
router.all('/', function (req, res, next) {
  res.sendFile('public/index.html', '/#!/');
});

module.exports = router;
