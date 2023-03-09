const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../DTO/Response");
const {
  Create,
  Update1,
  GetEvent,
  GetUserEvents,
  Update2,
  GetAllEvents,
  DeleteEvent,
  Update3,
} = require("../Services/Events");
const router = express.Router();
const EnsureAuthenticated = require("../Utils/EnsureAuthenticated");
const cloudinary = require("../config/Cloudinary");
const { upload, dataUri } = require("../config/multer");

// const upload = new Multer.memoryStorage();
const prisma = new PrismaClient();

router.get("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetEvent(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.get("/Events/GetAll", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetAllEvents();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.get("/UserEvents/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetUserEvents(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.post("/create", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Create(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "User not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.put("/create", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Update1(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.post(
  "/create2",
  upload.single("image"),
  EnsureAuthenticated,
  async (req, res) => {
    try {
      const file = dataUri(req).content;
      const response = await cloudinary.uploader.upload(file, {
        folder: "eventcircle",
      });

      let data = await Update2(req.body, response.url);
      if (data) {
        return res.status(200).send(data);
      }
      return res.status(400).send(ResponseDTO("Failed", "Event not found"));
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send({ msg: "Request Failed" });
    }
  }
);

router.post("/create3", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Update3(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Request Failed" });
  }
});

router.delete("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    await DeleteEvent(req.params.id);
    return res
      .status(200)
      .send({ msg: `Event with id ${req.params.id} deleted successfully` });
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
