
# Game Listing Server

This app runs over Express and Node.

It serves an API to create, read, and delete game listings.

Those game listings are persisted on MongoDB.

The Unity app displays the listings returned from the API.

Please make sure to install the corresponding Unity project available at:
https://github.com/goulon/game-listing-unity-app
## Installation

Install game-listing-server with npm

```bash
  cd game-listing-server
  npm install
  touch .env
```

You then need to add the following content to the .env file to connect to MongoDB.
```
ATLAS_URI="mongodb+srv://<user>:<password>@<clustername>.mongodb.net/unityStreamingDB?retryWrites=true&w=majority"
```

## Deployment

To deploy this project run

```bash
  docker build . -t <your-name>/game-listing-server
  docker run -p 80:3000 -d <your-name>/game-listing-server
```


## API Reference

#### Get all games listings

```http
  GET /games
```

#### Get a single game listing

```http
  GET /games/:id
```

#### Create a new game listing

```http
  POST /games
```

#### Delete a single game listing

```http
  DELETE /games/:id
```

## Sitemap

#### Access the game listing creation form

```http
  GET /
```
## Authors

- [@goulon](https://www.github.com/goulon)


