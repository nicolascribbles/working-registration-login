'use strict';

const routes      = require('./Routes.js');
const auth        = require('./Auth.js');
const bcrypt      = require('bcrypt');
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session     = require('express-session');
const passport    = require('passport');
const mongo       = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug')

        app.route('/')
          .get((req, res) => {
            res.render(process.cwd() + '/views/pug/index', {title: 'Home Profile', message: 'Please login', showLogin: true, showRegistration: true});
          });
app.use(session({
  secret: 'shhh',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(process.env.DATABASE, (err, db) => {
    if(err) {
        console.log('YO DATABASE IS RUINED !');
    } else {
        console.log('hiiiiiiidey-ho!');

         function ensureAuthenticated(req, res, next) {
          if (req.isAuthenticated()) {
              return next();
          }
          res.redirect('/');
        };
          passport.serializeUser((user, done) => {
          done(null, user._id);
        });

        passport.deserializeUser((id, done) => {
            db.collection('users').findOne(
                {_id: new ObjectID(id)},
                (err, doc) => {
                    done(null, doc);
                }
            );
        });
      
        passport.use(new LocalStrategy(
          function(username, password, done) {
            db.collection('users').findOne({ username: username }, function (err, user) {
              console.log('User '+ username +' attempted to log in.');
              if (err) { return done(err); }
              if (!user) { return done(null, false); }
              if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
              return done(null, user);
            });}))
      
        app.route('/login')
          .post(passport.authenticate('local', { failureRedirect: '/' }),(req,res) => {
               res.redirect('/profile');
          });
      
        app.route('/profile')
          .get(ensureAuthenticated, (req, res) => {
               res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
          });
      
        app.route('/register')
          .post((req, res, next) => {
            var hash = bcrypt.hashSync(req.body.password, 12);
              db.collection('users').findOne({ username: req.body.username }, function (err, user) {
                  if(err) {
                      next(err);
                  } else if (user) {
                      res.redirect('/');
                  } else {
                      db.collection('users').insertOne(
                        {username: req.body.username,
                         password: hash},
                        (err, doc) => {
                            if(err) {
                                res.redirect('/');
                            } else {
                                next(null, user);
                            }
                        }
                      )
                  }
              })},
            passport.authenticate('local', { failureRedirect: '/' }),
            (req, res, next) => {
                res.redirect('/profile');
            }
        );
      
        app.route('/logout')
          .get((req, res) => {
              req.logout();
              res.redirect('/');
          });

 
        
      
      
      



        app.use((req, res, next) => {
          res.status(404)
            .type('text')
            .send('Not Found');
        });
               }});

        app.listen(process.env.PORT || 3000, () => {
          console.log("Listening on port " + process.env.PORT);
        });  