var jwt = require("jsonwebtoken");
var config = require("../config"),
    error = require("./error"),
    models = require("../models");

//Middleware
function verifier(req, res, next){
  var data = req.body;
  if(!data.token){
    return next(new error.Unauthorized("No token provided."));
  }
  var token_data;
  try{
    req.token_data = token_data = jwt.verify(data.token, config.secret);
  }catch(e){
    return next(new error.Unauthorized("Token error: " + e.message));
  }
  if(!token_data.userid || !token_data.salt)
    return next(new error.Unauthorized("Malformed token."));

  models.User.findOne({where: {id:token_data.userid}}).then(function(user){
    if(user){
      if(token_data.salt != user.token_salt){
        next(new error.Unauthorized("Token is invalid."))
      }else{
        next();
      }
    }
  });
}

module.exports = verifier;
