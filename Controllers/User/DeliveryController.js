const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  Get,
  Create,
  Delete,
  Update,
  GetEventDeliveryDetails,
  GetDeliveryTrans,
  GetUserDeliveryTrans,
  CreateDeliveryTrans,
} = require("../../Services/Delivery");
const {
  UserAuthenticated,
  EnsureAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const prisma = new PrismaClient();

router.get("/", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Get(req.user.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/EventDetails/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetEventDeliveryDetails(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/deliveryTrans/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetDeliveryTrans(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/user/deliveryTrans", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetUserDeliveryTrans(req.user.id);
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
    if (data) {
      return res.status(200).send(data);
    } else {
      return res
        .status(400)
        .send(ResponseDTO("Failed", "Delivery Details already Exists"));
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/deliveryTrans/", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await CreateDeliveryTrans(req.body, req.user.id);
    if (data) {
      req.io.emit(data.notification.userId, data.notification);
      return res.status(200).send(data.deliveries);
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/:id", UserAuthenticated, async (req, res) => {
  try {
    let data = await Update(req.params.id, req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Delivery Details not found"));
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
          `Delivery Details with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Record not found"));
  }
});

module.exports = router;
