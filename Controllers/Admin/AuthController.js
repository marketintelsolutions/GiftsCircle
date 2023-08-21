const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { Login, GetAdmin, GetAdmins } = require("../../Services/Admin/auth");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/:id", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetAdmin(req.params.id);
    if (data) {
      return res.status(200).send({ admin: data });
    }
    return res.status(400).send(ResponseDTO("Failed", "Admin not Found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/admins/GetAll", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetAdmins();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/login", async (req, res) => {
  try {
    let data = await Login(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Email or Password is Incorrect"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
