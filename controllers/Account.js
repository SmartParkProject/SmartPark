var express = require("express"),
    LocalStrategy = require("passport-local").Strategy,
    Ajv = require("ajv")
    crypto = require("crypto"),
    jwt = require("jsonwebtoken");

var error = require("../utilities/error");

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

module.exports = function(database, logger, passport){
  var router = express.Router();
  //It might be worthwhile to figure out how to return messages in json format.
  passport.use(new LocalStrategy({
    passReqToCallback: true,
    session: false
  },
  function(req, username, password, done) {
    var data = req.body;
    var valid = ajv.validate(accountSchema, data);
    if(!valid)
      return done(null, false, {message: ajv.errorsText()});

    database.getConnection(function(err, connection){
      if(err) throw err;
      connection.query("SELECT username, password, salt FROM users WHERE username=?", [data.username], function(err, results){
        connection.release();
        if(err) throw err;

        if(results.length == 0) return done(null, false); //Couldn't find a match for user

        var key = crypto.pbkdf2Sync(data.password, results[0].salt, 100000, 512, "sha512");
        if(key.toString("hex") == results[0].password){
          return done(null, data.username);
        }else{
          return done(null, false);
        }
      });
    });
  }));

  router.post("/login", passport.authenticate("local", function(req, res){
    req.user.username;
    var token = jwt.sign({user:req.user.username}, config.secret, {expiresIn:"30d"}); //webtokens are pretty neat. Data embedded in token, used as authentication.
    res.json({status:200, result:token});
    //Now we want to generate a token for the user. http://stackoverflow.com/questions/17397052/nodejs-passport-authentication-token
  }));

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
          key = crypto.pbkdf2Sync(data.password, salt, 100000, 512, "sha512");
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

  return router;
}
