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
            req.session.loggedIn = false;
        })

        Spotify.getUserPlaylists(userId, {limit: 50}).then((data) => {
            console.log(data.body)
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
            tracks.push("spotify:track:" + track.track.id)
        });

        tracks.shuffle();

        Spotify.createPlaylist(
            req.session.user.id,
            "[Randomized] " + data.body.name,
            {
                public: false,
                description: "Randomized by ...."
            }
        ).then((data) => {
            Spotify.addTracksToPlaylist(data.body.id, tracks).then((addData) => {
                res.redirect('./success?id=' + data.body.id);
            }, (err) => {
                res.redirect('./error?id=' + data.body.id);
            })
        }, (err) => {
            res.redirect('./error')
        })
    }, (err) => {
        console.log(err)
        res.status(400).redirect('./')
    })
})

router.get('/success', (req, res) => {
    if(req.query.id){
        Spotify.getPlaylist(req.query.id).then((data) => {
            res.render('success', {
                data: data.body
            })
        }, (err) => {
            console.log(err)
            res.status(400).redirect('./');
        })
    }else{
        res.status(400).redirect('./');
    }
})

router.get('/error', (req, res) => {
    if(req.query.id){
        res.render('error', {
            createdPlaylist: true
        })
    }else{
        res.render('error', {
            createdPlaylist: false
        })
    }
})

module.exports = router;