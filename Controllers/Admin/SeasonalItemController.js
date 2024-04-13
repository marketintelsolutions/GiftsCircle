const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUri } = require("../../config/multer");
const {
  AdminAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const { Create, Update, Delete } = require("../../Services/SeasonalItem");
const prisma = new PrismaClient();

router.post(
  "/create",
  upload.single("image"),
  AdminAuthenticated,
  async (req, res) => {
    try {
      const file = dataUri(req).content;
      const response = await cloudinary.uploader.upload(file, {
        folder: "eventcircle/seasonal",
      });
      let data = await Create(req.body, response.url);
      if(data){      
        return res.status(200).send(data);
      }
      return res.status(400).send(ResponseDTO("Failed", "Error occured while adding seasonalItem"));
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.put(
  "/:id",
  upload.single("image"),
  AdminAuthenticated,
  async (req, res) => {
    try {
      let data = null;
      if (req.file) {
        const file = dataUri(req).content;
        const response = await cloudinary.uploader.upload(file, {
          folder: "eventcircle/seasonal",
        });
        
        data = await Update(req.params.id, req.body, response.url);
        if (data) {
          return res.status(200).send(data);
        }
        return res
          .status(400)
          .send(ResponseDTO("Failed", "SeasonalItem not found"));
      } else {
        data = await Update(req.params.id, req.body, null);
        if (data) {
          return res.status(200).send(data);
        }
        return res
          .status(400)
          .send(ResponseDTO("Failed", "SeasonalItem not found"));
      }
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.delete("/:id", AdminAuthenticated, async (req, res) => {
  try {
    await Delete(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `SeasonalItem with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
