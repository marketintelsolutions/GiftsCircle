const express = require("express");
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");
// const { createBullBoard } = require("@bull-board/api");
// const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
// const { ExpressAdapter } = require("@bull-board/express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const queue = require("./Services/Queues/index");

const dotenv = require("dotenv");
dotenv.config();

const run = async () => {
  // const serverAdapter = new ExpressAdapter();
  // serverAdapter.setBasePath("/admin/queues");

  // createBullBoard({
  //   queues: [new BullMQAdapter(queue)],
  //   serverAdapter,
  // });
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
  app.use("/api/user/", require("./Controllers/User/UserController"));
  app.use("/api/event/", require("./Controllers/User/EventController"));
  app.use("/api/giftItem/", require("./Controllers/User/GiftItemController"));
  app.use(
    "/api/asoebiItem/",
    require("./Controllers/User/AsoebiItemController")
  );
  app.use(
    "/api/sourvenirItem/",
    require("./Controllers/User/SourvenirItemController")
  );
  app.use(
    "/api/marketPlace/",
    require("./Controllers/User/MarketplaceController")
  );
  app.use("/api/media/", require("./Controllers/User/MediaController"));
  app.use(
    "/api/complimentaryGift/",
    require("./Controllers/User/ComplimentaryGift")
  );
  app.use("/api/gift/", require("./Controllers/User/GiftController"));
  app.use("/api/asoebi/", require("./Controllers/User/AsoebiController"));
  app.use("/api/sms/", require("./Controllers/User/SmsController"));
  app.use("/api/sourvenir/", require("./Controllers/User/SourvenirController"));
  app.use("/api/delivery/", require("./Controllers/User/DeliveryController"));
  app.use(
    "/api/fundRaising/",
    require("./Controllers/User/FundRaisingController")
  );
  app.use("/api/", require("./Controllers/User/AuthController"));
  app.use("/api/category/", require("./Controllers/User/CategoryController"));
  app.use("/api/cart/", require("./Controllers/User/CartController"));
  app.use("/api/contact/", require("./Controllers/User/ContactController"));

  //apis for admin
  app.use("/api/admin/user/", require("./Controllers/Admin/UserController"));
  app.use("/api/admin/event/", require("./Controllers/Admin/EventController"));
  app.use(
    "/api/admin/giftItem/",
    require("./Controllers/Admin/GiftItemController")
  );
  app.use(
    "/api/admin/asoebiItem/",
    require("./Controllers/Admin/AsoebiItemController")
  );
  app.use(
    "/api/admin/sourvenirItem/",
    require("./Controllers/Admin/SourvenirItemController")
  );
  app.use(
    "/api/admin/marketPlace/",
    require("./Controllers/Admin/MarketplaceController")
  );
  app.use(
    "/api/admin/complimentaryGift/",
    require("./Controllers/Admin/ComplimentaryGiftController")
  );
  app.use(
    "/api/admin/fundRaising/",
    require("./Controllers/Admin/FundraisingController")
  );
  app.use("/api/admin/gift/", require("./Controllers/Admin/GiftController"));
  app.use(
    "/api/admin/asoebi/",
    require("./Controllers/Admin/AsoebiController")
  );
  app.use("/api/admin/sms/", require("./Controllers/User/SmsController"));
  app.use(
    "/api/admin/sourvenir/",
    require("./Controllers/Admin/SourvenirController")
  );
  app.use(
    "/api/admin/category",
    require("./Controllers/Admin/CategoryController")
  );
  app.use(
    "/api/admin/contact",
    require("./Controllers/Admin/ContactController")
  );
  app.use("/api/admin/", require("./Controllers/Admin/AuthController"));

  app.use("/api/webhook/", require("./Controllers/webhook/"));

  app.use("/api/docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // app.use("/admin/queues", serverAdapter.getRouter());

  const PORT = process.env.PORT || 4000;

  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
};

run().catch((err) => console.log(err));
