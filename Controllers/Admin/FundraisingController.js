const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");

const router = express.Router();
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { UpdateFundraisingState } = require("../../Services/Admin/fundraising");

const prisma = new PrismaClient();

router.put("/Update/Withdrawal", AdminAuthenticated, async (req, res) => {
  try {
    let data = await UpdateFundraisingState(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Fundraising not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
