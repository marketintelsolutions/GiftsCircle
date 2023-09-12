const { PrismaClient } = require("@prisma/client");
const express = require("express");
const router = express.Router();
const { AdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { Create, Delete, GetAll, Update } = require("../../Services/Admin/category");
const ResponseDTO = require("../../DTO/Response");
const prisma = new PrismaClient();

router.post("/", AdminAuthenticated, async (req, res) => {
  try {
    let data = await Create(req.body, req.user);
    if (data) {
      return res.status(201).send(data);
    }
    return res
      .status(400)
      .send(ResponseDTO("Failed", "Category already exists"));
  } catch (err) {
    console.log(err);
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.put("/:id", AdminAuthenticated, async (req, res) => {
  try {
    let data = await Update(req.params.id, req.body);
    if (data) {
      return res.status(200).send(data);
    }
    return res.status(400).send(ResponseDTO("Failed", "Category not found"));
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});


router.delete("/:id", AdminAuthenticated, async (req, res) => {
  try {
    await Delete(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `Category with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send({ msg: "Record not found" });
  }
});

module.exports = router;
