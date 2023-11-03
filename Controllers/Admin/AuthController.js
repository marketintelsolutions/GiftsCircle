const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const {
  Login,
  GetAdmin,
  GetAdmins,
  Create,
  UpdateAdmin,
  DeleteAdmin,
  SetPassword,
  Logout,
  RefreshToken,
} = require("../../Services/Admin/auth");
const {
  SuperAdminAuthenticated,
  AdminAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUri } = require("../../config/multer");
const { SendEmail } = require("../../Utils/Email/EmailService");
const {
  AdminSetPasswordEmail,
} = require("../../Utils/Email/NodemailerEmailService");
const { GenerateToken } = require("../../Utils/HelperFunctions");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/:id", SuperAdminAuthenticated, async (req, res) => {
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

router.get("/Get/All", SuperAdminAuthenticated, async (req, res) => {
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

router.post(
  "/create",
  upload.single("image"),
  SuperAdminAuthenticated,
  async (req, res) => {
    try {
      const file = dataUri(req).content;
      const response = await cloudinary.uploader.upload(file, {
        folder: "eventcircle/admins",
      });

      let data = await Create(req.body, response.url);
      if (data) {
        const token = GenerateToken(data.email, data.id, data.role, "24h");
        AdminSetPasswordEmail(
          data.firstname,
          data.defaultPassword,
          data.email,
          token
        );
        return res.status(200).send(data);
      }
      return res
        .status(400)
        .send(ResponseDTO("Failed", "Admin already exists"));
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.put("/setPassword", AdminAuthenticated, async (req, res) => {
  try {
    let data = await SetPassword(req.body, req.user.email);
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

router.put("/:id", SuperAdminAuthenticated, async (req, res) => {
  try {
    let data = await UpdateAdmin(req.body, req.params.id);
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

router.delete("/:id", SuperAdminAuthenticated, async (req, res) => {
  try {
    let data = await DeleteAdmin(req.params.id);
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

router.post("/refreshToken", async (req, res) => {
  try {
    let data = await RefreshToken(req.body);
    if (data) {
      return res.status(200).send(data);
    } else {
      return res.status(400).send(ResponseDTO("Failed", "Tokens are invalid"));
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/logout", AdminAuthenticated, async (req, res) => {
  try {
    let data = await Logout(req.user.id);

    if (data) {
      return res.sendStatus(200);
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});
module.exports = router;
