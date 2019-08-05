'use strict';
/**
 * exports Used Tokens table
 * tokens expire after a set time
 */

const mongoose = require('mongoose');

const usedTokens = new mongoose.Schema({
  usedToken: { type: String, required: true },
  sessionActivity: { type: Date, expires: process.env.EXPIRATION, default: Date.now }, //deletes entry after 1 min
});

module.exports = mongoose.model('usedTokens', usedTokens);
