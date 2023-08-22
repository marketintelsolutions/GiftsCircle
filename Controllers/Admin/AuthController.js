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
} = require("../../Services/Admin/auth");
const {
  AdminAuthenticated,
  SuperAdminAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUri } = require("../../config/multer");
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

module.exports = router;
