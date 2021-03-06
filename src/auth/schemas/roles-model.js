'use strict';
/**
 * exports Roles table
 */

const mongoose = require('mongoose');

const rolesSchema = new mongoose.Schema({
  role: { type: String, required: true },
  capabilities: { type: Array, required: true },
});

module.exports = mongoose.model('roles', rolesSchema);
