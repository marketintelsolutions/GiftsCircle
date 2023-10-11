const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const router = express.Router();
const {
  EnsureAuthenticated,
  UserAuthenticated,
} = require("../../Utils/EnsureAuthenticated");
const { GetAll, Create, Update, Delete } = require("../../Services/Cart");
const prisma = new PrismaClient();

router.get("/GetAll", UserAuthenticated, async (req, res) => {
  try {
    let data = await GetAll(req.user.id);

    return res.status(200).send(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/", UserAuthenticated, async (req, res) => {
    try {
      let data = await Create(req.body, req.user.id);
      if (data) {;
        return res.status(200).send(data);
      }
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
    }
  });
  
  router.put("/:id", UserAuthenticated, async (req, res) => {
    try {
      let data = await Update(req.params.id, req.body);
      if (data) {
        return res.status(200).send(data);
      }
      return res
        .status(400)
        .send(ResponseDTO("Failed", "Cart Details not found"));
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
            `Cart Details with id ${req.params.id} deleted successfully`
          )
        );
    } catch (err) {
      console.log(err);
      await prisma.$disconnect();
      return res.status(400).send(ResponseDTO("Failed", "Record not found"));
    }
  });



module.exports = router;
