var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
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
        var movieNew = new Movie();

        movieNew.title = req.body.title;
        movieNew.year = req.body.year;
        movieNew.genre = req.body.genre;
        movieNew.actors = req.body.actors;

        movieNew.save(function (err) {
            if (err) {
                res.send(err);
            }
            else
                res.json({message: 'Movie created!'});
        });
    });

router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.findById(req.params.movieId, function(err, movie) {
            if (err)
                res.send(err);
            else
                res.json(movie);
        });
    })

    .put(authJwtController.isAuthenticated, function (req, res) {
        Movie.findById(req.params.movieId, function(err, movie) {
            if (err) res.send(err);
            else {
                if (req.body.title) movie.title = req.body.title;
                if (req.body.year) movie.year = req.body.year;
                if (req.body.genre) movie.genre = req.body.genre;
                if (req.body.actors) movie.actors = req.body.actors;
            }

            movie.save(function(err) {
              if (err) res.send(err);
              else res.json({ message: 'Movie updated!' });
            })
        })
    })

    .delete(authJwtController.isAuthenticated, function (req, res) {
        Movie.findById(req.params.movieId, function(err, movie) {
            if (err) res.send(err);
            else
                movie.remove();
                res.json({ message: 'Successfully deleted' });
        });
    });



app.use('/', router);
app.listen(process.env.PORT || 8080);
