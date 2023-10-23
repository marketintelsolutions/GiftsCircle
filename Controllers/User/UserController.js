const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const {
  ChangePassword,
  GetUser,
  UpdateUser,
  GetUserNotifications,
  UpdateNotifications,
} = require("../../Services/Users");
const { EnsureAuthenticated, UserAuthenticated } = require("../../Utils/EnsureAuthenticated");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetUser(req.user.id);
    if (data) {
      return res.status(200).send({ user: data });
    }
    return res.status(400).send(ResponseDTO("Failed", "User not Found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/notifications/", UserAuthenticated, async (req, res) => {
  try {
    let data = await GetUserNotifications(req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "User not Found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/notifications/:id", UserAuthenticated, async (req, res) => {
  try {
    let data = await UpdateNotifications(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "User not Found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});



router.post("/changePassword", UserAuthenticated, async (req, res) => {
  try {
    let data = await ChangePassword(req.body, req.user.id);
    if (data) {
      res
        .status(201)
        .send(ResponseDTO("Success", "Password changed successfully"));
    }
    return res.status(400).send(ResponseDTO("Failed", "Password is Incorrect"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/", UserAuthenticated, async (req, res) => {
  try {
    let data = await UpdateUser(req.body, req.user.id);
    if (data) {
      req.io.emit(data.notification.userId, data.notification);
      return res.status(201).send(data.updatedUser);
    }
    return res.status(400).send(ResponseDTO("Failed", "User not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
