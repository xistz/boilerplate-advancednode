'use strict';

require('dotenv').config();
const express = require('express');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const passport = require('passport');
const session = require('express-session');

const mongo = require('mongodb').MongoClient;

const routes = require('./routes');
const auth = require('./auth');

const port = process.env.PORT || 3000;
const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongo.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.log('Database error: ' + err);
    } else {
      console.log('Successful database connection');

      const db = client.db('test');

      //serialization and app.listen
      auth(app, db);

      routes(app, db);

      app.listen(port, () => {
        console.log('Listening on port ' + port);
      });
    }
  }
);
