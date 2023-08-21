const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  EnsureAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const {
  GetMarketTransactions,
  BuyMarketItems,
} = require("../../Services/MarketPlace");

const prisma = new PrismaClient();

router.get("/Get/All/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetMarketTransactions(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/create", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await BuyMarketItems(req.body);
    req.io.emit(data.notification.userId, data.notification);
    return res.status(200).send(data.Data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});


module.exports = router;
