const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

// Create new auction
router.post('/', auctionController.createAuction);

// Get all auctions
router.get('/', auctionController.getActiveAuctions);

// Get all products marked for auction
router.get('/products', auctionController.getAuctionProducts);

// Get all regular products (non-auction)
router.get('/regular-products', auctionController.getRegularProducts);

// Get single auction
router.get('/:id', auctionController.getAuction);

// Place bid on auction
router.post('/:id/bid', auctionController.placeBid);

// End auction
router.patch('/:id/end', auctionController.endAuction);

module.exports = router;
