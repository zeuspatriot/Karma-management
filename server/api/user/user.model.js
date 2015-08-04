'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var Log = require('../log/log.model');
var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  points: {type: Number, default: 0},
  recent: {
    points: {type: Number, default: 0},
    date: {type: String, default: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')},
    msg: {type: String, default: "Karma untouched yet..."},
    updatedBy: {type: String, default: "System"},
    note: String
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  team: String,
  jobCode: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {

    if (!this.isNew) return next();
    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  incrementKarma: function(pointsToIncrement){
    this.points += pointsToIncrement;
    this.save();
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};
  // Recieves Query object: query.user, query.log . Udpate object: update.msg, update.pointsToIncrement . And Callback
UserSchema
  .statics
  .findAndUpdateKarma = function (query, update, cb){ 
    this.update(query.user, {
      $inc : {'points': update.pointsToIncrement},
      $set :{
        recent: {
          points: update.pointsToIncrement,
          date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
          msg: update.msg,
          updatedBy: update.updatedBy,
          note: update.note ? update.note : ""
        }
      }
    },
    {multi:true}, cb);
    Log.update(
          query.log,
          {
            $push:{
              log: 
                {
                  'points': update.pointsToIncrement, 
                  'date': new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
                  'msg': update.msg,
                  'updatedBy': update.updatedBy,
                  'note': update.note ? update.note : ""
                }
            }
          },
          {multi:true},
          function (err, log){
            if(err) console.error("Error during log save", err);
            if(!log) console.log("Log was not found.");
          });
  }
module.exports = mongoose.model('User', UserSchema);
