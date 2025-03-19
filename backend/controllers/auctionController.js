const Auction = require('../models/auctionModel');

// Create new auction
exports.createAuction = async (req, res) => {
  try {
    const { productId, startingPrice, endTime, seller } = req.body;

    if (!productId || !startingPrice || !endTime || !seller) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required auction details'
      });
    }

    const auction = await Auction.create({
      product: productId,
      startingPrice,
      currentPrice: startingPrice,
      endTime,
      seller,
      status: 'active'
    });

    res.status(201).json({
      status: 'success',
      data: auction
    });

  } catch (error) {
    res.status(500).json({
      status: 'error', 
      message: error.message
    });
  }
};

// Get all active auctions
exports.getActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('product')
      .populate('seller', 'username name');

    res.status(200).json({
      status: 'success',
      results: auctions.length,
      data: auctions
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single auction
exports.getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('product')
      .populate('seller', 'username name')
      .populate('bids.bidder', 'username name');

    if (!auction) {
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: auction
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Place bid
exports.placeBid = async (req, res) => {
  try {
    const { bidAmount, bidder } = req.body;
    const auctionId = req.params.id;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This auction is no longer active'
      });
    }

    if (bidAmount <= auction.currentPrice) {
      return res.status(400).json({
        status: 'fail',
        message: 'Bid amount must be higher than current price'
      });
    }

    auction.bids.push({
      bidder,
      amount: bidAmount,
      time: Date.now()
    });

    auction.currentPrice = bidAmount;
    await auction.save();

    res.status(200).json({
      status: 'success',
      data: auction
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// End auction
exports.endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This auction is already ended'
      });
    }

    auction.status = 'ended';
    if (auction.bids.length > 0) {
      auction.winner = auction.bids[auction.bids.length - 1].bidder;
      auction.finalPrice = auction.currentPrice;
    }

    await auction.save();

    res.status(200).json({
      status: 'success',
      data: auction
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
