const express = require("express");
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const adminRouter = require("./routes/adminRouter")
const userRouter = require("./routes/userRouter")

const dotenv = require("dotenv");
dotenv.config();

const run = async () => {

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://giftscircle.netlify.app",
        "https://eventcircleadmin.netlify.app",
      ],
    },
  });

  let Socket;

  io.on("connection", (socket) => {
    Socket = socket;
  });

  app.use(function (req, res, next) {
    req.io = Socket;
    next();
  });

  const dotenv = require("dotenv");
  dotenv.config();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://giftscircle.netlify.app",
        "https://demo.twilio.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://finddmee.netlify.app",
        "https://eventcircleadmin.netlify.app",
      ],
    })
  );

  app.get("/", async (req, res) => {
    return res.json({ msg: "hello world" });
  });
  // app.use('/images', express.static('images'))

  app.use('/api', userRouter);

  app.use('/api/admin', adminRouter);

  app.use("/api/webhook/", require("./Controllers/webhook/"));

  app.use("/api/docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


  const PORT = process.env.PORT || 4000;

  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
};

run().catch((err) => console.log(err));
