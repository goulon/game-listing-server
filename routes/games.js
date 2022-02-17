const express = require('express');
const router = express.Router();
const Ajv = require('ajv');
const ajv = new Ajv();
const mongo = require('mongodb');

const db = require('../db/conn');

/* GET game listing. */
router.get('/', function (req, res, next) {
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

/**
 * Route to read a new game listing
 */
router.get('/:id', function (req, res, next) {
  const reqObjectId = req.params.id;
  const error = validateGameListingId(reqObjectId);

  if (error) return res.status(400).send('Object id must be a string of 12 bytes or a string of 24 hex.');

  var o_id = new mongo.ObjectId(reqObjectId);
  const dbConnect = db.getDb();

  dbConnect
    .collection('gameListings')
    .findOne({ '_id': o_id })
    .then(result => {
      if (!result) {
        throw new Error('not found');
      }
      res.json(result);
    }).catch(err => {
      res.status(404).send(`Game listing not found:\n${err}`);
    });
});

/**
 * Route to create a new game listing
 */
router.post('/', function (req, res, next) {
  const gameListingObject = req.body;
  const error = validateGameListingObject(gameListingObject)

  if (error) return res.status(400).send(`No game listing created:\n${error}`);

  const dbConnect = db.getDb();
  gameListing = addImagedURLToGameListing(gameListingObject);

  dbConnect
    .collection('gameListings')
    .insertOne(gameListing)
    .then(result => {
      let message = `Game listing created and available /games/${result.insertedId}`
      res.status(201).send(message);
    }).catch(err => {
      res.status(400).send(`Error inserting game listing:\n${err}`);
    });
})

/**
 * Route to delete a new game listing
 */
router.delete('/:id', function (req, res, next) {
  const reqObjectId = req.params.id;
  const error = validateGameListingId(reqObjectId);

  if (error) return res.status(400).send(error);

  var o_id = new mongo.ObjectId(reqObjectId);
  const dbConnect = db.getDb();

  dbConnect
    .collection('gameListings')
    .deleteOne({ '_id': o_id })
    .then(result => {
      if (result.deletedCount) {
        res.status(202).send(`Deleted 1 game listing with ID ${reqObjectId}`);
      } else {
        res.status(400).send(`Game listing with ID ${reqObjectId} does not exist`);
      }
    }).catch(err => {
      res.status(400).send('Error deleting game listing with ID ${reqObjectId}:\n${err}');
    });
});

/**
 * Validate object ID format
 */
function validateGameListingId(objectId) {
  let errorMessage = null;
  if (objectId.toString().length !== 24) {
    errorMessage = 'Object id must be a string of 12 bytes or a string of 24 hex.'
  };
  return errorMessage;
}

/**
 * Validate game listing properties and required fields
 */
function validateGameListingObject(gameListingObject) {
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
  validate(gameListingObject);

  let errorMessage = null;
  if (validate.errors) {
    errorMessage = validate.errors[0].message;
  }
  return errorMessage;
}

function normalizeToBooleanValue(booleanString) {
  if (booleanString === 'true') return true;
  if (booleanString === 'false') return false;
}

function transformBooleanValues(gameListingInput) {
  let gameListing = JSON.parse(JSON.stringify(gameListingInput));

  const booleanProperties = ['isDownloadable', 'isStreamable'];
  for (const key of booleanProperties) {
    console.log(gameListing[key])
    if (typeof gameListing[key] === 'string') {
      gameListing[key] = normalizeToBooleanValue(gameListing[key]);
    }
  }
  return gameListing;
}

/**
 * Insert user imageUrl into the imageObject array and remove input field
 */
function addImagedURLToGameListing(gameListingInput) {
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
