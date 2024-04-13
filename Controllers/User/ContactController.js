const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { Create } = require("../../Services/Contact");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    let data = await Create(req.body);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
