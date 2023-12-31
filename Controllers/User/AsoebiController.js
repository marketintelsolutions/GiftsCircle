const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  Get,
  Create,
  Delete,
  CreateMany,
  GetEventAsoebi,
  GetAsoebiBuyers,
  Buy,
} = require("../../Services/asoebi");
const {
  EnsureAuthenticated,
  UserAuthenticated,
} = require("../../Utils/EnsureAuthenticated");

const prisma = new PrismaClient();

router.get("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Get(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Asoebi not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/Get/EventAsoebi/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetEventAsoebi(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/Get/AsoebiBuyers/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetAsoebiBuyers(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/create", UserAuthenticated, async (req, res) => {
  try {
    let data = await Create(req.body, req.user.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/createMany", UserAuthenticated, async (req, res) => {
  try {
    let data = await CreateMany(req.body, req.user.id);
    req.io.emit(data.notification.userId, data.notification);
    return res.status(200).send(data.data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/Buy", UserAuthenticated, async (req, res) => {
  try {
    let data = await Buy(req.body, req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Asoebi Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.delete("/:id", UserAuthenticated, async (req, res) => {
  try {
    await Delete(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `Asoebi with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
