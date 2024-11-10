const express = require("express");
const router = express.Router();
const { ValidateWebhook } = require("../../Utils/EnsureAuthenticated");
const { PayIn } = require("../../Services/Webhook");

router.post("/payment", ValidateWebhook, async (req, res) => {
  try {
    PayIn(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);

    return res.status(400);
  }
});

module.exports = router;
