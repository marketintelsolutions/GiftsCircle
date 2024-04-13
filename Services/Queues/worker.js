const { Worker, QueueEvents } = require("bullmq");
const redisConnection = require("../../config/redis");

const worker = new Worker(
  "payment",
  async (job) => {
    console.log(`Processing job ${job.id} with data ${job.data}`);
    return job.data;
  },
  { connection: redisConnection }
);

worker
  .on("completed", (job) => {
    console.log(
      `Job ${job.id} has been completed with result ${job.returnvalue}`
    );
  })
  .on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  })
  .on("error", (err) => {
    console.error(`Worker error: ${err.message}`);
  });

// Optionally, listen to worker events
const queueEvents = new QueueEvents("payment", { connection: redisConnection});
queueEvents.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result ${job.returnvalue}`);
});

