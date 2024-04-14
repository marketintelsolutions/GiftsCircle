const { PrismaClient } = require("@prisma/client");
const express = require("express");
const ResponseDTO = require("../../DTO/Response");
const { AdminAuthenticated, SuperAdminAuthenticated } = require("../../Utils/EnsureAuthenticated");
const { GetUsers, DeleteUser, Withdraw } = require("../../Services/Admin/user");
const router = express.Router();
const prisma = new PrismaClient();

router.get("/users/GetAll", AdminAuthenticated, async (req, res) => {
  try {
    let data = await GetUsers();
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "Request Failed"));
  }
});

router.post("/withdraw/:id", SuperAdminAuthenticated, async (req, res) => {
  try {
    let data = await Withdraw(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", err.message));
  }
});

router.delete("/:id", AdminAuthenticated, async (req, res) => {
  try {
    await DeleteUser(req.params.id);
    return res
      .status(200)
      .send(
        ResponseDTO(
          "Success",
          `user with id ${req.params.id} deleted successfully`
        )
      );
  } catch (err) {
    console.log(err);
    await prisma.$disconnect();
    return res.status(400).send(ResponseDTO("Failed", "User not found"));
  }
});

module.exports = router;
