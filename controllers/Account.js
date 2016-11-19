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

        var key = crypto.pbkdf2Sync(data.password, results[0].salt, 100000, 64, "sha512");
        if(key.toString("hex") == results[0].password){ //We have a match.
          var token = jwt.sign({userid:results[0].id}, config.secret, {expiresIn:"30d"}); //webtokens are pretty neat. Data embedded in token, used as authentication.
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
            res.json({status:201, result:"Successfully created account."}); //Probably just going to redirect to login page on success
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

    jwt.verify(data.token, config.secret, function(err, decoded){
      if(err){
        return next(new error.BadRequest("Token error: " + err.message));
      }
    });
    res.status(200);
    res.json({status:200, result:"Token is valid."});
  });

  return router;
}
