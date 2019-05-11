const spotifyWebApi = require('spotify-web-api-node');

module.exports = new spotifyWebApi({
    clientId: "f3a8067294d24a3abb5c448d3bede841",
    clientSecret: "5d910367c1b94fe0af1ccfadd70b2423",
    redirectUri: "http://localhost/callback/"
})