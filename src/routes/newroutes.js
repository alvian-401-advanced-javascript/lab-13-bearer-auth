'use strict';

const express = require('express');
const auth = require('../auth/middleware.js');

const router = express.Router();

router.get('/danger', auth('create', 'update'), (req, res) => {
  res.status(200).send('welcome to the danger zone');
});

router.get('/public-stuff', (req,res,next) => {
  res.status(200).send('public stuff');
});

router.get('/hidden-stuff', auth(),(req,res,next) => {
  res.status(200).send('hidden stuff');
});

router.get('/something-to-read', auth('read'),(req,res,next) => {
  res.status(200).send('congrats you can read');
});

router.post('/create-a-thing', auth('create'),(req,res,next) => {
  res.status(200).send('create away');
});

router.put('/update', auth('update'),(req,res,next) => {
  res.status(200).send('update this');
});

router.patch('/jp', auth('update'),(req,res,next) => {
  res.status(200).send('update just a bit');
});

router.delete('/bye-bye', auth('delete'),(req,res,next) => {
  res.status(200).send('delete delete');
});

router.get('/everything', auth('read','create','update','delete'),(req,res,next) => {
  res.status(200).send('hello lebron');
});

module.exports = router;
