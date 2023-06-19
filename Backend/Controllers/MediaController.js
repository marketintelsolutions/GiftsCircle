const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../DTO/Response");
const router = express.Router();
const cloudinary = require("../config/Cloudinary");
const { upload, dataUri, dataUriMultiple } = require("../config/multer");
const EnsureAuthenticated = require("../Utils/EnsureAuthenticated");
const {
  Create,
  GetGuestSentMedia,
  GetEventGuestMedia,
  GetEventMediaFiles,
  Delete,
  CreateComplimentaryMessage,
  GetComplimentaryMessage,
  UpdateVisibility,
} = require("../Services/Media");
const prisma = new PrismaClient();

router.get(
  "/Get/EventMediaFiles/:id",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetEventMediaFiles(req.params.id);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get("/Get/GuestSentFiles/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetEventGuestMedia(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get(
  "/Get/GuestSentMedia/:eventId/:userId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetGuestSentMedia(req.params.eventId, req.params.userId);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get(
  "/Get/ComplimentaryMessages/:eventId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetComplimentaryMessage(req.params.eventId);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.post(
  "/upload",
  upload.single("image"),
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = req.file;
      if (data.size > 100000000) {
        return res
          .status(400)
          .send(ResponseDTO("Failed", "Files must be below 100MB"));
      } else {
        const file = dataUri(req).content;
        let response = await cloudinary.uploader.upload(file, {
          folder: "eventcircle/media",
          resource_type: "video",
        });
        return res.status(200).send(response.url);
      }
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.post(
  "/UploadImages",
  upload.array("images"),
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = req.files;
      data.map((ele) => {
        const file = dataUriMultiple(ele).content;

        cloudinary.uploader
          .upload(file, {
            folder: "eventcircle/media",
          })
          .then((response) => {
            Create(req.body, response.url);
          })
          .catch((err) => console.log(err));
      });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.post("/UploadVideo", EnsureAuthenticated, async (req, res) => {
  try {
    let Data = await Create(req.body, req.body.files);
    return res.status(200).send(Data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/UploadMessage", EnsureAuthenticated, async (req, res) => {
  try {
    let Data = await CreateComplimentaryMessage(req.body);
    return res.status(200).send(Data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/UpdateVisibility/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let Data = await UpdateVisibility(req.params.id, req.body);
    return res.status(200).send(Data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.delete("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    await Delete(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `Media with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
