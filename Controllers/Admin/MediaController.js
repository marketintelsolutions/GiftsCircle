const express = require("express");
const router = express.Router();
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUriMultiple } = require("../../config/multer");
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const ResponseDTO = require("../../DTO/Response");

router.post(
  "/UploadImages",
  upload.array("images"),
  AdminAuthenticated,
  async (req, res) => {
    try {
      const data = req.files;
      if (data.length === 0)
        return res.status(400).send(ResponseDTO("Failed", "At least one image required"));
      const uploadPromises = data.map((ele) => {
        const file = dataUriMultiple(ele).content;

        return cloudinary.uploader.upload(file, {
          folder: "eventcircle/giftImages",
        });
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 40000);
      });

      const responses = await Promise.race([
        Promise.all(uploadPromises),
        timeoutPromise,
      ]);

      if (responses instanceof Array) {
        const result = responses.map((response) => response.url);
        return res.status(200).send(result);
      } else {
        console.log("Request timeout");
        return res.status(408).send(ResponseDTO("Failed", "Request Timeout"));
      }
    } catch (err) {
      console.log(err);
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

module.exports = router;
