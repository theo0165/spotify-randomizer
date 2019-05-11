const router = require('express').Router();

const Spotify = require('../helpers/Spotify');
const GenerateState = require('../helpers/GenerateState');
const Shuffle = require('../helpers/ShuffleArray');

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

    if(req.session.loggedIn === true){
        Spotify.getMe().then((data) => {
            userId = data.body.id;
            req.session.user = data.body;

        }, (err) => {
            console.log(err)
            req.session.loggedIn = false;
        })

        Spotify.getUserPlaylists(userId).then((data) => {
            res.render('index', {
                logged_in: req.session.loggedIn,
                userPlaylists: data.body.items,
                user: {
                    'name': req.session.user.display_name,
                    'id': req.session.user.id
                }
            })
        }, (err) => {
            errors.push("playlist_error");

            res.render('index', {
                logged_in: false,
                errors: errors
            });
        });
    }else {
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

router.post('/randomize', (req, res) => {
    Spotify.getPlaylist(req.body.id).then((data) => {
        var tracks = [];

        data.body.tracks.items.forEach(track => {
            tracks.push(track.track.id)
        });

        console.log(tracks)

        tracks.shuffle();

        console.log(tracks)

        res.redirect('./')
    }, (err) => {
        res.status(400).redirect('./')
    })
})

module.exports = router;