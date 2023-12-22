const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const { EnsureAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { GetAll } = require("../../Services/Admin/category");
const ResponseDTO = require("../../DTO/Response");
const prisma = new PrismaClient();

router.get("/", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetAll();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
