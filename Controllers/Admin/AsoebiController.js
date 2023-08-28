const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { GetAll } = require("../../Services/asoebi");
const {
  UpdateAsoebiTrans,
  GetAsoebiTrans,
  GetEventAsoebisTrans,
} = require("../../Services/Admin/asoebi");
const router = express.Router();
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

router.get("/AsoebiTrans/:asoebiId", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetAsoebiTrans(req.params.asoebiId);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get(
  "/EventAsoebisTrans/:eventId",
  AdminAuthenticated,
  async (req, res) => {
    try {
      let data = await GetEventAsoebisTrans(req.params.eventId);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.put("/Update/AsoebiTrans", AdminAuthenticated, async (req, res) => {
  try {
    let data = await UpdateAsoebiTrans(req.body);
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
