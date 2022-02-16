var express = require('express');
var router = express.Router();
const Ajv = require('ajv');
const ajv = new Ajv();

const db = require('../db/conn');

/* GET game listing. */
router.get('/', async function (req, res, next) {
  const dbConnect = db.getDb();

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

router.post('/', async function (req, res, next) {
  const gameListingObject = req.body;
  const { inputIsValid, validationError } = validateGameListing(gameListingObject)

  if (inputIsValid) {
    const dbConnect = db.getDb();
    gameListing = adImagedURLToGameListing(gameListingObject);

    await dbConnect
      .collections('gameListings')
      .insertOne(gameListing, function (err, result) {
        if (err) {
          res.status(400).send("Error inserting matches!");
        } else {
          console.log(`Added a new match with id ${result.insertedId}`);
          res.status(204).send();
        }
      });
  } else {
    console.error(validationError);
    res.status(400).send(validationError);
  }
})

function validateGameListing(gameListingObject) {
  const schema = {
    type: 'object',
    properties: {
      category: { type: 'string' },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      description: { type: 'string' },
      imageUrl: { type: 'string' },
      type: { type: 'number' },
      tags: { type: 'array' },
      author: { type: 'string' },
      replayBundleUrlJson: { type: 'string' },
      duration: { type: 'number' },
      isDownloadable: { type: 'boolean' },
      isStreamable: { type: 'boolean' },
      version: { type: 'string' },
    },
    required: ['category', 'title', 'subtitle', 'description'],
  }

  const validate = ajv.compile(schema);
  const valid = validate(gameListingObject);

  return { inputIsValid: valid, validationError: validate.errors[0].message };
}

function adImagedURLToGameListing(gameListingInput) {
  gameListing = JSON.parse(JSON.stringify(gameListingInput));
  if (gameListing.imageUrl) {
    gameListing.images.url = [
      {
        "id": "1",
        "url": gameListing.imageUrl,
        "type": 1
      }
    ];
  }
  return gameListing;
}

module.exports = router;
