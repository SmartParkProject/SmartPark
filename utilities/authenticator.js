var jwt = require("jsonwebtoken");
var config = require("../config"),
    error = require("./error"),
    models = require("../models");

// Middleware
var verifier = function(req, res, next){
  var data = req.body;
  if(!data.token)
    return next(new error.Unauthorized("No token provided."));

  var token_data = null;
  try{
    req.token_data = token_data = jwt.verify(data.token, config.secret);
  }catch(e){
    return next(new error.Unauthorized("Token error: " + e.message));
  }
  if(!token_data.userid || !token_data.salt)
    return next(new error.Unauthorized("Malformed token."));

  models.User.findOne({where: {id: token_data.userid}}).then(function(user){
    if(user)
      if(token_data.salt !== user.token_salt){
        return next(new error.Unauthorized("Token is invalid."));
      }else{
        return next();
      }
  });
};

module.exports = verifier;
