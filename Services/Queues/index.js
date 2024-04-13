const { Queue } = require("bullmq");
const redisConnection = require("../../config/redis");

const queue = new Queue("payment", { connection: redisConnection });

module.exports = queue;
