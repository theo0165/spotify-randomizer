const spotifyWebApi = require('spotify-web-api-node');

module.exports = new spotifyWebApi({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: "http://localhost/callback/"
})
