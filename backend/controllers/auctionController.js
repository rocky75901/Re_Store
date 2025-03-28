const Auction = require('../models/auctionModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Email = require('../utils/email');
const mongoose = require('mongoose');

// Create new auction
exports.createAuction = async (req, res) => {
  try {
    const {
      productId,
      startingPrice,
      startTime,
      endTime,
      seller,
      bidIncrement = 10,
    } = req.body;

    if (!productId || !startingPrice || !startTime || !endTime || !seller) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required auction details',
      });
    }

    // Find product and seller info
    const product = await Product.findById(productId);
    const sellerUser = await User.findById(seller);

    if (!product || !sellerUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product or seller not found',
      });
    }

    const auction = await Auction.create({
      product: productId,
      startingPrice,
      currentPrice: startingPrice,
      startTime,
      endTime,
      seller,
      sellerName: sellerUser.username,
      status: 'active',
      bidIncrement: bidIncrement || 10,
    });

    // Schedule auction ending
    const now = new Date();
    const auctionEndTime = new Date(endTime);
    const timeUntilEnd = auctionEndTime - now;

    if (timeUntilEnd > 0) {
      setTimeout(async () => {
        await endAuctionById(auction._id);
      }, timeUntilEnd);
    }

    res.status(201).json({
      status: 'success',
      data: auction,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// End auction by ID (for scheduled ending)
const endAuctionById = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId)
      .populate('product')
      .populate('seller');

    if (!auction || auction.status !== 'active') {
      console.log(`Auction ${auctionId} already ended or not found`);
      return;
    }

    auction.status = 'ended';

    // If there are bids, set the winner
    if (auction.bids.length > 0) {
      const lastBid = auction.bids[auction.bids.length - 1];
      auction.winner = lastBid.bidder;
      auction.winnerId = lastBid.bidderId;
      auction.winnerEmail = lastBid.bidderEmail;
      auction.finalPrice = auction.currentPrice;

      // Send emails to winner and seller
      try {
        // Get winner details
        const winner = await User.findById(lastBid.bidderId);

        console.log('Attempting to send winner email to:', winner?.email);
        if (winner && winner.email) {
          const winnerEmail = new Email(
            winner,
            `${req.protocol}://${req.get('host')}/auction/${auction._id}`
          );
          await winnerEmail.sendAuctionWinner({
            productName: auction.product.name,
            finalPrice: auction.finalPrice,
            sellerName: auction.sellerName,
          });
          console.log('Winner email sent successfully to:', winner.email);
        } else {
          console.log('Winner email not sent: Invalid winner details', winner);
        }

        // Send email to seller
        const seller = await User.findById(auction.seller);
        console.log('Attempting to send seller email to:', seller?.email);
        if (seller && seller.email) {
          const sellerEmail = new Email(
            seller,
            `${req.protocol}://${req.get('host')}/auction/${auction._id}`
          );
          await sellerEmail.sendAuctionSeller({
            productName: auction.product.name,
            finalPrice: auction.finalPrice,
            winnerName: lastBid.bidder,
          });
          console.log('Seller email sent successfully to:', seller.email);
        } else {
          console.log('Seller email not sent: Invalid seller details', seller);
        }
      } catch (emailError) {
        console.error('Error sending auction end emails:', emailError);
        console.error('Error details:', emailError.message);
      }
    }

    await auction.save();
    console.log(`Auction ${auctionId} ended automatically`);
  } catch (error) {
    console.error('Error ending auction:', error);
  }
};

// Get all active auctions
exports.getActiveAuctions = async (req, res) => {
  try {
    // Get auctions with status either 'active' or 'ended'
    const auctions = await Auction.find({
      status: { $in: ['active', 'ended'] },
    })
      .populate('product')
      .populate('seller', 'username email');

    res.status(200).json({
      status: 'success',
      results: auctions.length,
      data: auctions,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get single auction
exports.getAuction = async (req, res) => {
  try {
    console.log(`Fetching auction with ID: ${req.params.id}`);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log(`Invalid auction ID format: ${req.params.id}`);
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid auction ID format'
      });
    }
    
    // First check if auction exists
    const auctionExists = await Auction.exists({ _id: req.params.id });
    if (!auctionExists) {
      console.log(`No auction found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID',
      });
    }
    
    // Try to populate related data
    try {
      const auction = await Auction.findById(req.params.id)
        .populate('product')
        .populate('seller', 'username email _id')
        .populate('bids.bidder', 'username name');

      console.log(`Successfully found auction: ${auction._id}`);
      
      // Check if product exists
      if (!auction.product) {
        console.log(`Auction ${auction._id} has missing product reference`);
      }
      
      // Check if seller exists
      if (!auction.seller) {
        console.log(`Auction ${auction._id} has missing seller reference`);
      }
      
      return res.status(200).json({
        status: 'success',
        data: auction
      });
    } catch (populateError) {
      console.error(`Error populating auction data: ${populateError.message}`);
      console.error(populateError.stack);
      
      // Try to get auction without population
      const basicAuction = await Auction.findById(req.params.id);
      
      return res.status(200).json({
        status: 'success',
        data: basicAuction,
        warning: 'Some related data could not be populated'
      });
    }
  } catch (error) {
    console.error(`Error in getAuction: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({
      status: 'error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Place bid
exports.placeBid = async (req, res) => {
  try {
    const { bidAmount, bidderId, bidderName } = req.body;
    const auctionId = req.params.id;

    // Log the incoming bid data for debugging
    console.log('Bid data received:', { bidAmount, bidderId, bidderName });

    const auction = await Auction.findById(auctionId).populate('product');

    if (!auction) {
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID',
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This auction is no longer active',
      });
    }

    // Check if bid is higher than current price + bid increment
    const minimumBid = auction.currentPrice + auction.bidIncrement;
    if (bidAmount < minimumBid) {
      return res.status(400).json({
        status: 'fail',
        message: `Bid amount must be at least ₹${minimumBid} (current price + ₹${auction.bidIncrement})`,
      });
    }

    // Get bidder info - with extra validation
    let bidder;
    try {
      // Check if bidderId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(bidderId)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid bidder ID format'
        });
      }
      
      bidder = await User.findById(bidderId);
    } catch (error) {
      console.error('Error finding bidder:', error);
      return res.status(400).json({
        status: 'fail',
        message: 'Error processing bidder information'
      });
    }
    
    if (!bidder) {
      return res.status(404).json({
        status: 'fail',
        message: 'Bidder not found',
      });
    }

    // Prevent seller from bidding on their own auction
    if (bidderId.toString() === auction.seller.toString()) {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot bid on your own auction',
      });
    }

    // Add bid
    auction.bids.push({
      bidder: bidderName || bidder.username,
      bidderId: bidderId,
      bidderEmail: bidder.email,
      amount: bidAmount,
      timestamp: new Date(),
    });

    auction.currentPrice = bidAmount;
    await auction.save();

    res.status(200).json({
      status: 'success',
      data: auction,
    });
  } catch (error) {
    console.error('Bid placement error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// End auction manually
exports.endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        status: 'fail',
        message: 'No auction found with that ID',
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This auction is already ended',
      });
    }

    // End the auction
    await endAuctionById(auction._id);

    // Get updated auction
    const updatedAuction = await Auction.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: updatedAuction,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// Get all products marked for auction
exports.getAuctionProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isAuction: true,
      sellingType: 'auction',
    }).populate('seller', 'username name email');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

// Get all regular products (non-auction)
exports.getRegularProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isAuction: false,
      sellingType: 'regular',
    }).populate('seller', 'username name email');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
