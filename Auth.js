const passport = require('passport');
const bcrypt = require('bcrypt');
const mongo       = require('mongodb').MongoClient;
const ObjectID    = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');

module.exports = (app, db) => {
};