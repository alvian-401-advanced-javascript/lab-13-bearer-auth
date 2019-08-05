'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usedTokens = require('../schemas/used.js');
require('./roles-model.js');


/**
 * exports Users Table
 */
const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'user', enum: ['admin', 'editor', 'user'] },
}, { toObject: { virtuals: true }, toJson: { virtuals: true } });

users.virtual('acl', {
  ref: 'roles',
  localField: 'role',
  foreignField: 'role',
  justOne: true,
});

users.pre('findOne', function () {
  try {
    this.populate('acl');
  }
  catch (e) {
    throw new Error(e.message);
  }
});

users.pre('save', function (next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(console.error);
});


/**
 *
 *
 * @param {*} email
 * @returns
 */
users.statics.createFromOauth = function (email) {

  if (!email) { return Promise.reject('Validation Error'); }

  return this.findOne({ email })
    .then(user => {
      if (!user) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch(error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({ username, password, email });
    });

};
/**
 * Basic authentication
 *Takes in hashed username & password
 *searches database for match
 * @param {*} auth
 * @returns an authenticated user or throws error
 *
 */
users.statics.authenticateBasic = function (auth) {
  
  let query = { username: auth.username };
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => { throw error; });
};

/**
 *Token auth
 *First checks db to see if token has been used
 *If token has been used, promise rejected
 *if token is new, it is parsed and checked
 *against user data to check if valid
 * @param {*} token
 * @returns validated user
 */
users.statics.authenticateToken = async function (token) {
  
  const tokenIsUsed = await usedTokens.countDocuments({ usedToken: token }, function (err, count) {
    if (err) { throw err; }
  });
  if (tokenIsUsed > 0) { return Promise.reject('token no longer valid'); }

  let parsedToken = jwt.verify(token, process.env.SECRET);
  let query = { _id: parsedToken.id };
  return this.findOne(query);

};
/**
 *checks user permissions and returns
 *a boolean indicating if they have the proper
 *permissions
 * @param {*} capability
 * @returns boolean
 */
users.methods.can = function (capability) {
  
  console.log('user has the following permissions', this.acl.capabilities);
  return this.acl.capabilities.includes(capability);
};
/**
 *compares inputed password to
 *stored user password
 * @param {*} password
 * @returns
 */
users.methods.comparePassword = function (password) {
  
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};
/**
 *
 *
 * @returns new token
 */
users.methods.generateToken = function () {

  let token = {
    id: this._id,
    role: this.role,
  };

  let options = {};
  let key = false;
  if (key) {
    options = { expiresIn: process.env.EXPIRATION };
  }

  return jwt.sign(token, process.env.SECRET, options);
};

users.methods.generateKey = function () {
  return this.generateToken('key');
};

module.exports = mongoose.model('users', users);
