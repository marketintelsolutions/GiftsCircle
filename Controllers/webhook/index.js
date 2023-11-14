const express = require("express");
const router = express.Router();
const { ValidateWebhook } = require("../../Utils/EnsureAuthenticated");

router.post("/payment", ValidateWebhook, async (req, res) => {
  try {
    console.log(req.body);
    res.send(200);
  } catch (err) {
    console.log(err);

    return res.status(400);
  }
});

module.exports = router;
