const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  GetFundRaising,
  Create,
  UpdateAmount,
  UpdateStatus,
  Donate,
  GetFundDonors,
  DeleteFundRaising,
  GetCoHostFundRaising,
} = require("../../Services/FundRaising");
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUri } = require("../../config/multer");
const {
  EnsureAuthenticated,
  UserAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const prisma = new PrismaClient();

router.get("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetFundRaising(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/:eventId/:coHostId", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetCoHostFundRaising(
      req.params.eventId,
      req.params.coHostId
    );
    if (data) {
      return res.status(200).send(data);
    } else {
      return res.status(400).send(ResponseDTO("Failed", "Not found"));
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post(
  "/create",
  upload.single("image"),
  UserAuthenticated,
  async (req, res) => {
    try {
      const file = dataUri(req).content;
      const response = await cloudinary.uploader.upload(file, {
        folder: "eventcircle/fundRaising",
      });
      let data = await Create(req.body, response.url, req.user.id);
      if (data) {
        if (data.notification) {
          req.io.emit(data.notification.userId, data.notification);
          return res.status(200).send(data.fundRaising);
        }
        return res.status(200).send(data);
      }
      return res.status(400).send(ResponseDTO("Failed", "Event not found"));
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.put("/UpdateAmount", UserAuthenticated, async (req, res) => {
  try {
    let data = await UpdateAmount(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Fund Raising Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/UpdateStatus", UserAuthenticated, async (req, res) => {
  try {
    let data = await UpdateStatus(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Fund Raising Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/Donate", UserAuthenticated, async (req, res) => {
  try {
    let data = await Donate(req.body,  req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Fund raising Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/CoHost/GetFundDonors/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetFundDonors(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.delete("/:id", UserAuthenticated, async (req, res) => {
  try {
    await DeleteFundRaising(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `FundRaising with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
