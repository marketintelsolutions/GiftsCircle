const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../DTO/Response");
const {
  Create,
  Update1,
  GetEvent,
  GetUserEvents,
  Update2,
  GetAllEvents,
  DeleteEvent,
  Update3,
  AddGuest,
  GetEventGuests,
  GetEventCoHosts,
  AddCoHost,
  GetCoHostGuestCode,
  GetGuestDetails,
} = require("../Services/Events");
const router = express.Router();
const EnsureAuthenticated = require("../Utils/EnsureAuthenticated");
const cloudinary = require("../config/Cloudinary");
const { upload, dataUri } = require("../config/multer");

// const upload = new Multer.memoryStorage();
const prisma = new PrismaClient();

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

router.get("/Events/GetAll", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetAllEvents();
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/UserEvents/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetUserEvents(req.params.id);
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

router.get("/guests/:id", EnsureAuthenticated, async (req, res) => {
  try {
    const data = await GetGuestDetails(req.params.id);
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
  "/GetCoHostGuesCode/:eventId/:userId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      const data = await GetCoHostGuestCode(
        req.params.userId,
        req.params.userId
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Event Not Found"));
    }
  }
);

router.post("/", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Create(req.body);
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

router.put("/create", EnsureAuthenticated, async (req, res) => {
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
  EnsureAuthenticated,
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

router.post("/create3", EnsureAuthenticated, async (req, res) => {
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

router.delete("/:id", EnsureAuthenticated, async (req, res) => {
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

router.post("/addGuest", EnsureAuthenticated, async (req, res) => {
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

router.post("/addCoHost", EnsureAuthenticated, async (req, res) => {
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
