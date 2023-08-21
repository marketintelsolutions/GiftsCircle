const { PrismaClient } = require("@prisma/client");
const express = require("express");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { UpdateTransaction } = require("../../Services/MarketPlace");
const router = express.Router();

const prisma = new PrismaClient();


router.put("/:id", AdminAuthenticated, async (req, res) => {
  try {
    let data = await UpdateTransaction(req.params.id, req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Item Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});



module.exports = router;
