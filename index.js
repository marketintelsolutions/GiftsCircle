const express = require("express");
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      // "http://localhost:3001",
      "https://giftscircle.netlify.app",
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
      "https://finddmee.netlify.app",
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
app.use("/api/asoebiItem/", require("./Controllers/User/AsoebiItemController"));
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
  require("./Controllers/Admin/ComplimentaryGift")
);
app.use("/api/admin/gift/", require("./Controllers/Admin/GiftController"));
app.use("/api/admin/asoebi/", require("./Controllers/Admin/AsoebiController"));
app.use("/api/admin/sms/", require("./Controllers/User/SmsController"));
app.use(
  "/api/admin/sourvenir/",
  require("./Controllers/Admin/SourvenirController")
);
app.use("/api/admin/", require("./Controllers/Admin/AuthController"));

app.use("/api/docs/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use(
//   "/api/admin/docs/",
//   swaggerUi.serve,
//   swaggerUi.setup(AdminSwaggerDocument)
// );
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
