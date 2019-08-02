'use strict';

const express = require('express');
const auth = require('../middleware.js');

const router = express.Router();

router.get('/danger', auth('create', 'update'), (req, res) => {
  res.status(200).send('welcome to the danger zone');
});

module.exports = router;