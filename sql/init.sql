-- CREATE TABLE IF NOT EXISTS customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE DATABASE IF NOT EXISTS smartpark;
use smartpark;
CREATE TABLE IF NOT EXISTS transactions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userid CHAR(15) NOT NULL,
  spot INT NOT NULL,
  reserve_time DATETIME NOT NULL,
  reserve_length INT NOT NULL
);
-- This is not complete at all.
CREATE TABLE IF NOT EXISTS users (
  userid INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username CHAR(20) NOT NULL,
  password CHAR(1024) NOT NULL,
  salt INT NOT NULL
);
