const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { GetAll, Get } = require("../../Services/Contact");
const router = express.Router();

const prisma = new PrismaClient();

router.get("/Get", AdminAuthenticated, async (req, res) => {
  try {
    const { email } = req.query;
    let data = await Get(email);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/GetAll", AdminAuthenticated, async (req, res) => {
  try {
    const { page, perPage } = req.query;
    let data = await GetAll(parseInt(page), parseInt(perPage));
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
