const dotenv = require("dotenv");
const IORedis = require('ioredis');
dotenv.config();

const redisConnection = new IORedis({
  port: "12510",
  host: "redis-12510.c9.us-east-1-4.ec2.cloud.redislabs.com",
  username: 'default',
  password: "CmO8gLfqc40k5CwaUf6npsYPZl41E0O3",
});

module.exports = redisConnection;
