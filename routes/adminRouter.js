const express = require("express");
const router = express.Router();

const marketplaceController = require("../Controllers/Admin/MarketplaceController");
const complimentaryGiftController = require("../Controllers/Admin/ComplimentaryGiftController");
const fundraisingController = require("../Controllers/Admin/FundraisingController");
const giftController = require("../Controllers/Admin/GiftController");
const userController = require("../Controllers/Admin/UserController");
const eventController = require("../Controllers/Admin/EventController");
const giftItemController = require("../Controllers/Admin/GiftItemController");
const asoebiItemController = require("../Controllers/Admin/AsoebiItemController");
const sourvenirItemController = require("../Controllers/Admin/SourvenirItemController");
const asoebiController = require('../Controllers/Admin/AsoebiController');
const smsController = require('../Controllers/User/SmsController');
const sourvenirController = require('../Controllers/Admin/SourvenirController');
const categoryController = require('../Controllers/Admin/CategoryController');
const contactController = require('../Controllers/Admin/ContactController');
const authController = require('../Controllers/Admin/AuthController');
const transactionController  = require('../Controllers/Admin/TransactionController')

router.use("/transaction", transactionController);
router.use("/marketPlace", marketplaceController);
router.use("/complimentaryGift", complimentaryGiftController);
router.use("/fundRaising", fundraisingController);
router.use("/gift", giftController);
router.use("/user", userController);
router.use("/event", eventController);
router.use("/giftItem", giftItemController);
router.use("/asoebiItem", asoebiItemController);
router.use("/sourvenirItem", sourvenirItemController);
router.use('/asoebi', asoebiController);
router.use('/sms', smsController);
router.use('/sourvenir', sourvenirController);
router.use('/category', categoryController);
router.use('/contact', contactController);
router.use('/', authController);

module.exports = router;
