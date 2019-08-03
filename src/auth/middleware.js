'use strict';

const User = require('./schemas/users-model.js');

module.exports = (capability) => {

  return (req, res, next) => {

    try {
      let [authType, authString] = req.headers.authorization.split(/\s+/);
      switch (authType.toLowerCase()) {
      case 'basic':
        return _authBasic(authString);
      case 'bearer':
        return _authBearer(authString);
      default:
        return _authError();
      }
    }
    catch (e) {
      next(e);
    }


    function _authBasic(str) {
      // str: am9objpqb2hubnk=
      let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
      let bufferString = base64Buffer.toString();    // john:mysecret
      let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
      let auth = { username, password }; // { username:'john', password:'mysecret' }

      return User.authenticateBasic(auth)
        .then(user => _authenticate(user))
        .catch(next);
    }

    function _authBearer(authString) {
      return User.authenticateToken(authString)
        .then(user => _authenticate(user))
        .catch(next);
    }

    function _authenticate(user) {
      if (user && (!capability || (user.can(capability)))) {
        req.user = user;
        req.token = user.generateToken();
        next();
      }
      else if(user.can(capability) === false) {
        next('you do not have the proper permissions');
      }
      else {
        _authError();
      }
    }

    function _authError() {
      next('Invalid User ID/Password');
    }

  };
};