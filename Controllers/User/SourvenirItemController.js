const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  Get,
  GetAll,
  searchSouvernirItemsByCategorySlug,
} = require("../../Services/sourvenirItem");
const { EnsureAuthenticated } = require("../../Utils/EnsureAuthenticated");
const prisma = new PrismaClient();

router.get("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Get(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Sourvenir Item not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/Get/All", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetAll();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/Get/BySlug/:slug", EnsureAuthenticated, async (req, res) => {
  const { slug } = req.params;
  try {
    let data = await searchSouvernirItemsByCategorySlug(slug);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
