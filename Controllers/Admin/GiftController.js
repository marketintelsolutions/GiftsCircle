const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const { GetAll } = require("../../Services/Gift");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { UpdateGiftTrans } = require("../../Services/Admin/gift");

const prisma = new PrismaClient();

router.get("/GetAll", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetAll();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/Update/GiftTrans", AdminAuthenticated, async (req, res) => {
  try {
    let data = await UpdateGiftTrans(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Transaction not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});


module.exports = router;
