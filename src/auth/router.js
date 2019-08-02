'use strict';

const express = require('express');
const authRouter = express.Router();

const Role = require('./roles-model.js');
const User = require('./users-model.js');
const usedTokens = require('./used.js');
const auth = require('./middleware.js');
// const oauth = require('./oauth/google.js');

authRouter.post('/signup', (req, res, next) => {
  let user = new User(req.body);
  user.save()
    .then((user) => {
      req.token = user.generateToken();
      req.user = user;
      res.set('token', req.token);
      res.cookie('auth', req.token);
      res.send(req.token);
    }).catch(next);
});

authRouter.post('/signin', auth(), (req, res, next) => {
  res.cookie('auth', req.token);
  let [authType, authString] = req.headers.authorization.split(/\s+/);
  let usedToken = new usedTokens({ usedToken: authString });
  usedToken.save();
  res.send(req.token);
});

authRouter.post('/key', auth(), (req, res, next) => {
  let key = req.user.generateKey();
  res.status(200).send(key);
});

authRouter.post('/roles', (req, res, next) => {
  let role = new Role(req.body);
  role.save()
    .then((role) => {
      res.send(role);
    }).catch(next);
});

// authRouter.get('/oauth', (req,res,next) => {
//   oauth.authorize(req)
//     .then( token => {
//       res.status(200).send(token);
//     })
//     .catch(next);
// });

module.exports = authRouter;
