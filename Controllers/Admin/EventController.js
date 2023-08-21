const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { GetAllEvents } = require("../../Services/Events");
const router = express.Router();
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");

const prisma = new PrismaClient();

router.get("/GetAll", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetAllEvents();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
