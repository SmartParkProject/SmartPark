var express = require("express"),
    Ajv = require("ajv")
    crypto = require("crypto"),
    jwt = require("jsonwebtoken");

var config = require("../config"),
    error = require("../utilities/error");

var ajv = new Ajv();
var accountSchema = {
  "properties":{
    "username":{"$ref":"/username"},
    "password":{"$ref":"/password"},
  },
  "required":["username", "password"]
};

var usernameSchema = {
  "type":"string",
  "minLength":1,
  "maxLength":20
}

var passwordSchema = {
  "type":"string",
  "minimum":6
}

ajv.addSchema(usernameSchema, "/username");
ajv.addSchema(passwordSchema, "/password");

module.exports = function Account(database, logger){
  var router = express.Router();

  router.post("/login", function(req, res, next){
    var data = req.body;
    var valid = ajv.validate(accountSchema, data);
    if(!valid)
      return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT id, username, password, salt FROM users WHERE username=?", [data.username], function(err, results){
        connection.release();
        if(err) throw err;
        if(results.length == 0)
          return next(new error.Unauthorized("Incorrect username or password.")); //Couldn't find a match for user

        //TODO: Look into storing a token salt with users data to allow for manual invalidation of tokens.
        //Also: consider adjusting expiration timer. Spec: https://tools.ietf.org/id/draft-ietf-oauth-jwt-bearer-05.html
        var key = crypto.pbkdf2Sync(data.password, results[0].salt, 100000, 64, "sha512");
        if(key.toString("hex") == results[0].password){ //We have a match.
          var token = jwt.sign({userid:results[0].id}, config.secret, {expiresIn:"30d"});
          res.json({status:200, result:token});
        }else{
          return next(new error.Unauthorized("Incorrect username or password."));
        }
      });
    });
  });

  router.post("/register", function(req, res, next){
    var data = req.body;
    var valid = ajv.validate(accountSchema, data);
    if(!valid)
      return next(new error.BadRequest("Bad parameter: " + ajv.errorsText()));

    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT COUNT(*) FROM users WHERE username=?", [data.username], function(err, results){
        if(err) throw err;
        if(results.length!=0){
          salt = crypto.randomBytes(16).toString("hex");
          key = crypto.pbkdf2Sync(data.password, salt, 100000, 64, "sha512");
          connection.query("INSERT INTO users (username, password, salt) VALUES(?, ?, ?)", [data.username, key.toString("hex"), salt], function(err, results){
            connection.release();
            if(err) throw err;
            res.status(201);
            res.json({status:201, result:"Successfully created account."});
          });
        }else{
          return next(new error.BadRequest("Account already exists with username: " + data.username));
        }
      });
    });
  });

  router.post("/checktoken", function(req, res, next){
    var data = req.body;
    if(!data.token)
      return next(new error.BadRequest("No token provided."));

    try{
      jwt.verify(data.token, config.secret);
    }catch(e){
      return next(new error.BadRequest("Token error: " + e.message));
    }
    res.status(200);
    res.json({status:200, result:"Token is valid."});
  });

  return router;
}
