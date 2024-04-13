// userRoutes.js

const express = require('express');
const router = express.Router();

const userController = require('../Controllers/User/UserController');
const eventController = require('../Controllers/User/EventController');
const giftItemController = require('../Controllers/User/GiftItemController');
const asoebiItemController = require('../Controllers/User/AsoebiItemController');
const sourvenirItemController = require('../Controllers/User/SourvenirItemController');
const seasonalItemController = require('../Controllers/User/SeasonalItemController');
const marketplaceController = require('../Controllers/User/MarketplaceController');
const mediaController = require('../Controllers/User/MediaController');
const complimentaryGiftController = require('../Controllers/User/ComplimentaryGift');
const giftController = require('../Controllers/User/GiftController');
const asoebiController = require('../Controllers/User/AsoebiController');
const smsController = require('../Controllers/User/SmsController');
const sourvenirController = require('../Controllers/User/SourvenirController');
const deliveryController = require('../Controllers/User/DeliveryController');
const fundRaisingController = require('../Controllers/User/FundRaisingController');
const authController = require('../Controllers/User/AuthController');
const categoryController = require('../Controllers/User/CategoryController');
const cartController = require('../Controllers/User/CartController');
const contactController = require('../Controllers/User/ContactController');

// Define routes
router.use('/user', userController);
router.use('/event', eventController);
router.use('/giftItem', giftItemController);
router.use('/asoebiItem', asoebiItemController);
router.use('/sourvenirItem', sourvenirItemController);
router.use('/seasonalItem', seasonalItemController);
router.use('/marketPlace', marketplaceController);
router.use('/media', mediaController);
router.use('/complimentaryGift', complimentaryGiftController);
router.use('/gift', giftController);
router.use('/asoebi', asoebiController);
router.use('/sms', smsController);
router.use('/sourvenir', sourvenirController);
router.use('/delivery', deliveryController);
router.use('/fundRaising', fundRaisingController);
router.use('/', authController);
router.use('/category', categoryController);
router.use('/cart', cartController);
router.use('/contact', contactController);

module.exports = router;
