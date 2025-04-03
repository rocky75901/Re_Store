const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server'); // Import server.js instead of app.js
const Auction = require('../models/auctionModel'); // Import your Auction model
const path = require("path");

// Sample test data

let authToken; // Store authentication token
let userResponse;
let authToken2; // Store authentication token
let userResponse2;
let productId;
let sampleAuction;
beforeAll(async () => {
  await mongoose.connect(process.env.DATABASE);
  
  // Step 1: Register/Login a test user and get the auth token
  userResponse = await request(server)
    .post('/api/v1/users/login') // Adjust this if you have a different login route
    .send({ email: 'bharatula23@iitk.ac.in', password: 'test@1234' })
    .expect(200);

  authToken = userResponse.body.token;
  
  const productResponse = await request(server)
      .post('/api/v1/products') // Send token for authentication
      .set("Authorization", `Bearer ${authToken}`)
      .field("name", "Test Product")
      .field("description", "This is a test product")
      .field("category", "Electronics")
      .field("buyingPrice", 100)
      .field("sellingPrice", 100)
      .field("condition", "New")
      .field("usedFor", 0)
      .field("isAuction", true)
      .attach("imageCover", path.join(__dirname, "1.jpg"))
      .expect(201);
  
    productId = productResponse.body.data.product._id;
    sampleAuction = {
      productId: productId,
      startingPrice: 100,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      seller: productResponse.body.data.product.seller, // Seller assigned from authentication
      bidIncrement: 10,
    };
});



// Test creating an auction
describe('Auction API Tests', () => {
  it('should create a new auction', async () => {
    
  
    
  
    // Step 3: Create an auction using the created product
    
  
    const auctionResponse = await request(server)
      .post('/api/v1/auctions')
      .set('Authorization', `Bearer ${authToken}`) // Authenticate request
      .send(sampleAuction)
      .expect(201);
  
    expect(auctionResponse.body.status).toBe('success');
    expect(auctionResponse.body.data).toHaveProperty('_id');
    expect(auctionResponse.body.data.product).toBe(sampleAuction.productId);
    expect(auctionResponse.body.data.seller).toBe(sampleAuction.seller);
    expect(auctionResponse.body.data.currentPrice).toBe(sampleAuction.startingPrice);
    expect(auctionResponse.body.data.bidIncrement).toBe(sampleAuction.bidIncrement);
    expect(auctionResponse.body.data.status).toBe('active');
  });
  
  

  it('should fetch all auctions', async () => {
    

    const response = await request(server).get('/api/v1/auctions').expect(200);

    expect(response.body.results).toBeGreaterThan(0);
  });

  it('should fetch a single auction by ID', async () => {
    const auction = await request(server)
      .post('/api/v1/auctions')
      .set('Authorization', `Bearer ${authToken}`) // Authenticate request
      .send(sampleAuction)
      .expect(201);

    const response = await request(server)
      .get(`/api/v1/auctions/${auction.body.data._id}`)
      .expect(200);

    expect(response.body.data._id).toBe(auction.body.data._id.toString());
  });

  it('should end an auction', async () => {
    const auction = await request(server)
    .post('/api/v1/auctions')
    .set('Authorization', `Bearer ${authToken}`) // Authenticate request
    .send(sampleAuction)
    .expect(201);
    

    const response = await request(server)
      .patch(`/api/v1/auctions/${auction.body.data._id}/end`)
      .expect(200);

    expect(response.body.data.status).toBe('ended');
  });

  it('should place a valid bid', async () => {
    const auction = await request(server)
    .post('/api/v1/auctions')
    .set('Authorization', `Bearer ${authToken}`) // Authenticate request
    .send(sampleAuction)
    .expect(201);
    
    

    const bidData = {
      bidAmount: 600, // Must be higher than currentPrice + bidIncrement (500 + 50)
      bidderId: '67ee8585453bd3dd69b3cb33',
      bidderName: 'Soma'
    };

    const response = await request(server)
      .post(`/api/v1/auctions/${auction.body.data._id}/bid`)
      .send(bidData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.bids.length).toBe(1);
    expect(response.body.data.bids[0].amount).toBe(600);
    expect(response.body.data.currentPrice).toBe(600);
  });
});

// Cleanup after tests
afterAll(async () => {

  await mongoose.connection.close();
  server.close(); // Stop the HTTP server
});
