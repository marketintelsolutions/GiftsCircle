const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../DTO/Response");
const router = express.Router();
const cloudinary = require("../config/Cloudinary");
const { upload, dataUri } = require("../config/multer");
const {
  Get,
  GetAll,
  Create,
  Update,
  Delete,
} = require("../Services/sourvenirItem");
const prisma = new PrismaClient();

router.get("/:id", async (req, res) => {
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

router.get("/Get/All", async (req, res) => {
  try {
    let data = await GetAll();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const file = dataUri(req).content;
    const response = await cloudinary.uploader.upload(file, {
      folder: "eventcircle/sourvenir",
    });
    let data = await Create(req.body, response.url);

    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const file = dataUri(req).content;
    const response = await cloudinary.uploader.upload(file, {
      folder: "eventcircle/sourvenir",
    });
    let data = await Update(req.params.id, req.body, response.url);
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

router.delete("/:id", async (req, res) => {
  try {
    await Delete(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `Sourvenir Item with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;