const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const {
  Login,
  Create,
  GoogleSignIn,
  SetPassword,
  VerifyOtp,
  SendVerifyEmail,
  SendResetPasswordEmail,
  GetAdmin,
  GetAdmins,
  ChangePassword,
} = require("../../Services/Admin/auth");
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

router.post("/register", async (req, res) => {
  try {
    let data = await Create(req.body);
    if (data) {
      return res.status(201).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "User already exists"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/googleSignin", async (req, res) => {
  try {
    let data = await GoogleSignIn(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Admin not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/setPassword", async (req, res) => {
  try {
    let data = await SetPassword(req.body, "SET");
    if (data) {
      return res
        .status(201)
        .send(ResponseDTO("Success", "Password set successfully"));
    }
    return res.status(400).send(ResponseDTO("Failed", "Admin not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/resetPassword", async (req, res) => {
  try {
    let data = await SetPassword(req.body, "RESET");
    if (data) {
      return res
        .status(201)
        .send(ResponseDTO("Success", "Password reset successfully"));
    }
    return res.status(400).send(ResponseDTO("Failed", "Admin not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/verifyEmail", async (req, res) => {
  try {
    let data = await VerifyOtp(req.body);
    if (data.status === "Success") {
      return res.status(200).send(data);
    }
    return res.status(400).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/sendVerifyEmail", async (req, res) => {
  try {
    let data = await SendVerifyEmail(req.body.email);
    if (data.status) {
      return res
        .status(201)
        .send(ResponseDTO("Success", "Email sent successfully"));
    }
    return res.status(400).send(ResponseDTO("Failed", "Admin not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/sendResetEmail", async (req, res) => {
  try {
    let data = await SendResetPasswordEmail(req.body.email);
    if (data) {
      return res
        .status(201)
        .send(ResponseDTO("Success", "Email sent successfully"));
    } else {
      return res.status(400).send(ResponseDTO("Failed", "Admin not found"));
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/changePassword", AdminAuthenticated, async (req, res) => {
    try {
      let data = await ChangePassword(req.body);
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

module.exports = router;
