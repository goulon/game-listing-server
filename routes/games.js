const express = require('express');
const router = express.Router();
const Ajv = require('ajv');
const ajv = new Ajv();
const mongo = require('mongodb');

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

router.get('/:id', async function (req, res, next) {
  const reqObjectId = req.params.id;

  if (validateGameListingId(reqObjectId)) {
    var o_id = new mongo.ObjectId(reqObjectId);
    const dbConnect = db.getDb();

    dbConnect
      .collection('gameListings')
      .findOne({ '_id': o_id })
      .then(result => {
        res.json(result);
      }).catch(err => {
        console.error(err);
        res.status(404).send('Game listing not found');
      });
  } else {
    res.status(400).send('Object id must be a string of 12 bytes or a string of 24 hex.');
  }

});

router.post('/', async function (req, res, next) {
  const gameListingObject = req.body;
  const { inputIsValid, validationError } = validateGameListing(gameListingObject)

  if (inputIsValid) {
    const dbConnect = db.getDb();
    gameListing = adImagedURLToGameListing(gameListingObject);

    await dbConnect
      .collection('gameListings')
      .insertOne(gameListing, function (err, result) {
        if (err) {
          res.status(400).send("Error inserting game listing!");
        } else {
          console.log(`Added a new game listing with id ${result.insertedId}`);
          let message = `Game listing created and available /games/${result.insertedId}`
          console.log(message)
          res.status(201).send(message);
        }
      });
  } else {
    console.error(validationError);
    res.status(400).send(validationError);
  }
})

router.delete('/:id', (req, res, next) => {
  const reqObjectId = req.params.id;

  if (validateGameListingId(reqObjectId)) {
    var o_id = new mongo.ObjectId(reqObjectId);
    const dbConnect = db.getDb();


    dbConnect
      .collection('gameListings')
      .deleteOne({ '_id': o_id })
      .then(result => {
        console.log(result)
        if (result.deletedCount) {
          res.status(202).send(`Deleted 1 game listing with ID ${reqObjectId}`);
        } else {
          res.status(400).send(`Game listing with ID ${reqObjectId} does not exist`);
        }
      }).catch(err => {
        console.error(err);
        res.status(400).send('Error deleting game listing with ID ${reqObjectId}');
      });
  } else {
    res.status(400).send('Object id must be a string of 12 bytes or a string of 24 hex.');
  }
});

function validateGameListingId(objectId) {
  return objectId.toString().length === 24;
}

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

  let errorMessage = null;
  if (validate.errors) {
    errorMessage = validate.errors[0].message;
  }
  return { inputIsValid: valid, validationError: errorMessage };
}

function adImagedURLToGameListing(gameListingInput) {
  const gameListing = JSON.parse(JSON.stringify(gameListingInput));
  const imageUrl = gameListing.imageUrl;
  if (imageUrl) {
    gameListing['images'] = [];
    gameListing.images.push({
      "id": "1",
      "url": imageUrl,
      "type": 1
    });
  }
  delete gameListing.imageUrl;
  return gameListing;
}

module.exports = router;
