var express = require('express');
var router = express.Router();

const db = require('../db/conn');
console.log(db.getDb());

/* GET game listing. */
router.get('/', async function (req, res, next) {
  const dbConnect = db.getDb();
  console.log(dbConnect);
  dbConnect
    .collection('gameListings')
    .find({})
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send('Error fetching listings.');
      } else {
        res.json(result);
      }
    })
});

router.post('/', function (req, res, next) {
  res.send('game successfully created');
})

module.exports = router;
