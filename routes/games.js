var express = require('express');
var router = express.Router();

/* GET game listing. */
router.get('/', function (req, res, next) {
  res.send('respond with all game listings');
});

router.post('/', function (req, res, next) {
  res.send('game successfully created');
})

module.exports = router;
