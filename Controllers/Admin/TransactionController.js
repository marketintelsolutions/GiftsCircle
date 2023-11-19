const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const {
  GetAllTransactions,
  Get,
} = require("../../Services/Admin/transactions");
const prisma = new PrismaClient();

router.get("/", AdminAuthenticated, async (req, res) => {
  try {
    const { page, perPage, type, status } = req.query;
    const trans = await GetAllTransactions(perPage, page, type, status);
    return res.status(200).send(trans);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/:id", AdminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const trans = Get(id);
    if (trans) {
      return res.status(200).send(trans);
    }
    return res.status(400).send("Transaction not found");
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
