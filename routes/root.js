const express = require('express');
const path = require('path');

const router = express.Router();

router.get('^/$|/index(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
  // res.sendFile('views/index.html', { root: './' }); same as the upper one
});

module.exports = router;
