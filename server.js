var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Actor = require('./Movies');
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code === 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            }
        });
    });
});


router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {

        var movie = new Movie();
        var actor = new Actor();

        movie.title = req.body.title;
        movie.year = req.body.year;
        movie.genre = req.body.genre;

        actor.actorName = req.body.actorName;
        actor.characterName = req.body.characterName;

        movie.actors = req.body.actors;

        movie.save(function(err) {
            if (err) return res.send(err);

            res.json({ message: 'Movie created!' });
        });
    })

    .get(authJwtController.isAuthenticated, function (req, res) {

        Movie.findByTitle(req.params.title, function(err, movie) {

            if (err) res.send(err);

            var movieJSON = JSON.stringify(movie);
            //return that movie
            res.json(movie);
        })
    })

    .put(authJwtController.isAuthenticated, function (req, res) {

        Movie.findByTitle(req.params.title, function(err, movie) {
            if (err) res.send(err);

            if (req.body.title) movie.title = req.body.title;
            if (req.body.year) movie.year = req.body.year;
            if (req.body.genre) movie.genre = req.body.genre;
            if (req.body.actorName) movie.actors.actorName = req.body.actorName;
            if (req.body.characterName) movie.actors.characterName = req.body.characterName;

            movie.save(function(err) {
              if (err) res.send(err);

                res.json({ message: 'Movie updated!' });
            })
        })
    })

    .delete(authJwtController.isAuthenticated, function (req, res) {
        Movie.remove({
            _title: req.params.title
        }, function(err, movie) {
                if (err) return res.send(err);

                res.json({ message: 'Successfully deleted' });
        });
    });



app.use('/', router);
app.listen(process.env.PORT || 8080);
