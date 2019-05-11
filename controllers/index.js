const router = require('express').Router();

const Spotify = require('../helpers/Spotify');
const GenerateState = require('../helpers/GenerateState');

router.get('/', (req, res) => {
    var userId;
    var errors = []

    if(typeof Spotify.getAccessToken() === 'undefined' && typeof req.session.spofifyAccessToken != 'undefined'){
        Spotify.setAccessToken(req.session.spofifyAccessToken);
        req.session.loggedIn = true;
    }else if(typeof Spotify.getAccessToken() != 'undefined'){
        req.session.loggedIn = true;
    }else{
        req.session.loggedIn = false;
    }

    console.log("LOGGED IN : " + req.session.loggedIn)

    if(req.session.loggedIn === true){
        console.log("LOGGED IN");

        Spotify.getMe().then((data) => {
            userId = data.body.id;
            req.session.user = data.body;

        }, (err) => {
            console.log(err)
            req.session.loggedIn = false;
        })

        Spotify.getUserPlaylists(userId).then((data) => {
            console.log("SENDING DATA")
            res.render('index', {
                logged_in: req.session.loggedIn,
                userPlaylists: data.body.items,
                user: {
                    'name': req.session.user.displayName,
                    'id': req.session.user.id
                }
            })
        }, (err) => {
            console.log(err)
            errors.push("playlist_error");

            res.render('index', {
                logged_in: false,
                errors: errors
            });
        });
    }else {
        console.log("NOT LOGGED IN");

        res.render('index', {
            logged_in: false,
            errors: errors
        });
    }
})

router.post('/login', (req, res) => {
    const scopes = [
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private'
    ]

    const state = GenerateState(10);
    req.session.state = state;

    var authorizeURL = Spotify.createAuthorizeURL(scopes, state);

    res.redirect(authorizeURL);
})

router.get('/callback', (req, res) => {
    Spotify.authorizationCodeGrant(req.query.code).then(
        function(data) {
          Spotify.setAccessToken(data.body['access_token']);
          Spotify.setRefreshToken(data.body['refresh_token']);

          res.redirect('/')
        },
        function(err) {
          res.send("Something went wrong, please try again later!");

          setTimeout(() => {
            res.redirect('/');
          }, 3000)
        }
      );
})

module.exports = router;