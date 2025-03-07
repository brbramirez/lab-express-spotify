require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });

spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
    res.render('home.hbs');
  });

app.get("/artist-search", (req,res) => {
    const artist = req.query.artist;
    spotifyApi
    .searchArtists(artist)
    // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
    .then(data => {
        console.log('The received data from the API: ', data.body);
        res.render('artist-search-results.hbs', { artist: data.body.artists.items });
      })
    .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/albums/:artistId', (req, res, next) => {
     const artistId = req.params.artistId;
     spotifyApi.getArtistAlbums(artistId).then(
         function(data) {
           console.log('Artist albums', data.body);
           res.render('albums.hbs', { albums: data.body.items });
         })
     .catch(err => console.log('The error while searching the albums occurred: ', err));
});

app.get('/tracks/:artistId', (req, res, next) => {
    const artistId = req.params.artistId;
    spotifyApi.getAlbumTracks(artistId, { limit : 5, offset : 1 })
    .then(function(data) {
      console.log(data.body);
      res.render('tracks.hbs', { tracks: data.body.items });
    }, function(err) {
      console.log('Something went wrong!', err);
    });
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));