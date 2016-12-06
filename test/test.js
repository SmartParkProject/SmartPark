var assert = require("assert");
var request = require("supertest");
var jwt = require("jsonwebtoken");

var server = require("../server");
var models = require("../models");
var config = require("../config");
var agent = request.agent(server);

var options = {
  login: {
    username: "test",
    password: "test"
  },
  parking: {
    spot: 0
  },
  token: {}
};

before(function(){
  return models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0")
  .then(function(){
      return models.sequelize.sync({ force: true });
  })
  .then(function(){
      return models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
  })
  .then(function(){
      console.log("Database synchronised.");

      //Need to generate the token for testing requests
      return new Promise(function(resolve, reject){
        var account = {
          username: "token",
          password: "token"
        };
        agent.post("/account/register")
        .send(account)
        .end(function(err, res){
          agent.post("/account/login")
          .send(account)
          .end(function(err, res){
            options.token.token = res.body.result;
            resolve();
          });
        });
      });
  })
  .catch(function(err){
      console.log(err);
  });
});

describe("Accounts", function(){
  describe("POST /account/register", function() {
    it("Should respond with a status of 201 and json data", function(done) {
      agent.post("/account/register")
      .send(options.login)
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        done();
      });
    });
  });

  describe("POST /account/login", function() {
    it("Should respond with a status of 200 and valid token", function(done) {
      agent.post("/account/login")
      .send(options.login)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        try{
          jwt.verify(res.body.result, config.secret);
        }catch(e){
          return done(e);
        }
        done();
      });
    });
  });
});

describe("Parking", function(){
  describe("POST /parking/", function() {
    it("Should respond with a status of 201 and json data", function(done) {
      agent.post("/parking/")
      .send(Object.assign({}, options.parking, options.token))
      .set("Accept", "application/json")
      .expect(201)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        done();
      });
    });
  });

  describe("GET /parking/available", function() {
    it("Should respond with a status of 200 and json data", function(done) {
      agent.get("/parking/available")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        done();
      });
    });
  });
  describe("POST /parking/status", function() {
    it("Should respond with a status of 200 and json data", function(done) {
      agent.post("/parking/status")
      .send(options.token)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        done();
      });
    });
  });
});

describe("Payment", function(){
  describe("POST /payment/checkout", function() {
    it("Should respond with a status of 200 and json data", function(done) {
      agent.post("/payment/checkout")
      .send(options.token)
      .set("Accept", "application/json")
      .expect(200)
      .expect("Content-Type", /json/)
      .end(function(err, res){
        if(err) return done(err);
        done();
      });
    });
  });
});
