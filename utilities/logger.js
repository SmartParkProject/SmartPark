var winston = require("winston");

module.exports = new winston.Logger({
  transports: [
    new winston.transports.File({
      filename: "log/critical.log",
      level: "info"
    }),
    new winston.transports.Console({level: "debug"})
  ]
});
