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
        "http://localhost:5173",
        "https://eventcircleadmin.netlify.app",
        "https://eventcirco.com",
        "https://staging.eventcirco.com"
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
        "https://staging.eventcirco.com",
        "http://localhost:5173",
        "https://eventcircleadmin.netlify.app",
        "https://eventcirco.com",
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
