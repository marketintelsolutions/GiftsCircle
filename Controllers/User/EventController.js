const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const {
  Create,
  Update1,
  GetEvent,
  GetUserEvents,
  Update2,
  DeleteEvent,
  Update3,
  AddGuest,
  GetEventGuests,
  GetEventCoHosts,
  AddCoHost,
  GetCoHostGuestCode,
  GetGuestDetails,
  GetCoHostGuests,
} = require("../../Services/Events");
const router = express.Router();
const cloudinary = require("../../config/Cloudinary");
const { upload, dataUri } = require("../../config/multer");
const { EnsureAuthenticated, UserAuthenticated } = require("../../Utils/EnsureAuthenticated");

// const upload = new Multer.memoryStorage();
const prisma = new PrismaClient();

router.get("/UserEvents", EnsureAuthenticated, async (req, res) => {
  try {
    
    let data = await GetUserEvents(req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});


router.get("/:id", async (req, res) => {
  try {
    let data = await GetEvent(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});



router.get("/guests/:id/:eventId", EnsureAuthenticated, async (req, res) => {
  try {
    const data = await GetGuestDetails(req.params.id, req.params.eventId);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
  }
});

router.get("/:id/guests", EnsureAuthenticated, async (req, res) => {
  try {
    const data = await GetEventGuests(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
  }
});

router.get("/:id/:coHostId/guests", EnsureAuthenticated, async (req, res) => {
  try {
    const data = await GetCoHostGuests(req.params.id, req.params.coHostId);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
  }
});

router.get("/:id/cohosts", EnsureAuthenticated, async (req, res) => {
  try {
    const data = await GetEventCoHosts(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
  }
});

router.get(
  "/GetCoHostGuestCode/:eventId/",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      const data = await GetCoHostGuestCode(
        req.params.eventId,
        req.user.id
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
    }
  }
);

router.post("/", UserAuthenticated, async (req, res) => {
  try {
    let data = await Create(req.body, req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "User not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/create", UserAuthenticated, async (req, res) => {
  try {
    let data = await Update1(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post(
  "/create2",
  upload.single("image"),
  UserAuthenticated,
  async (req, res) => {
    try {
      if (req.file) {
        const file = dataUri(req).content;
        const response = await cloudinary.uploader.upload(file, {
          folder: "eventcircle/events",
        });

        let data = await Update2(req.body, response.url);
        if (data) {
          return res.status(200).send(data);
        }
        return res.status(400).send(ResponseDTO("Failed", "Event not found"));
      } else {
        let data = await Update2(req.body, req.body.image);
        if (data) {
          return res.status(200).send(data);
        }
        return res.status(400).send(ResponseDTO("Failed", "Event not found"));
      }
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.post("/create3", UserAuthenticated, async (req, res) => {
  try {
    let data = await Update3(req.body);
    if (data) {
      req?.io?.emit(data.notification.userId, data.notification);
      return res.status(200).send(data.Data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Event not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.delete("/:id", UserAuthenticated, async (req, res) => {
  try {
    const data = await DeleteEvent(req.params.id);
    if (data.notification) {
      req.io.emit(data.notification.userId, data.notification);
      return res
        .status(200)
        .send(
          ResponseDTO(
            "Success",
            `Event with id ${req.params.id} deleted successfully`
          )
        );
    }
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Record Not Found"));
  }
});

router.post("/addGuest", async (req, res) => {
  try {
    const data = await AddGuest(req.body);
    if (data.status === "Failed") {
      return res.status(400).send(ResponseDTO("Failed", data.message));
    }
    if (data.message.notification) {
      req.io.emit(data.message.notification.userId, data.message.notification);
      return res.status(200).send(data.message.Data);
    }
    return res.status(200).send(data.message);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/addCoHost", async (req, res) => {
  try {
    const data = await AddCoHost(req.body);
    if (data.status === "Failed") {
      return res.status(400).send(ResponseDTO("Failed", data.message));
    }
    if (data.message.notification) {
      req.io.emit(data.message.notification.userId, data.message.notification);
      return res.status(200).send(data.message.Data);
    }
    return res.status(200).send(data.message);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

module.exports = router;
