const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  Get,
  Create,
  Delete,
  GetEventGifts,
  CreateMany,
  EnableContribution,
  GetUserPurchasedGifts,
  Buy,
  GetEventGiftTransactions,
  GetUserEventPurchasedGifts,
  GetEventGiftsByHost,
  GetCoHostEventGiftTransactions,
} = require("../../Services/Gift");
const {EnsureAuthenticated, UserAuthenticated} = require("../../Utils/EnsureAuthenticated");

const prisma = new PrismaClient();

router.get("/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await Get(req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Gift not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get("/Get/EventGifts/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetEventGifts(req.params.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.get(
  "/Get/EventGifts/:id/:hostId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetEventGiftsByHost(req.params.id, req.params.hostId);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get(
  "/Get/EventGiftsTrans/:id",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetEventGiftTransactions(req.params.id);
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get(
  "/Get/UserEventGiftsTrans/:id/:eventId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetUserEventPurchasedGifts(
        req.params.id,
        req.params.eventId
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get(
  "/Get/CoHostEventGiftsTrans/:userId/:eventId",
  EnsureAuthenticated,
  async (req, res) => {
    try {
      let data = await GetCoHostEventGiftTransactions(
        req.params.userId,
        req.params.eventId
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  }
);

router.get("/Get/PurchasedBy/:id", EnsureAuthenticated, async (req, res) => {
  try {
    let data = await GetUserPurchasedGifts(req.params.id);
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
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/createMany", UserAuthenticated, async (req, res) => {
  try {
    let data = await CreateMany(req.body,   req.user.id);
    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/Buy", UserAuthenticated, async (req, res) => {
  try {
    let data = await Buy(req.body, req.user.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Asoebi Details not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/EnableContribution", UserAuthenticated, async (req, res) => {
  try {
    let data = await EnableContribution(req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Gift not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/EnableContribution/:id", UserAuthenticated, async (req, res) => {
  try {
    let data = await EnableContribution(req.body, req.params.id);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Gift not found"));
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
          `Gift with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
