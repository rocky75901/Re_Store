# Real-time Chat System for OLX-style Marketplace

A real-time chat system that enables communication between buyers and sellers in a marketplace platform.

## Features

- Real-time messaging using Socket.IO
- Message persistence in MongoDB
- Chat rooms for buyer-seller conversations
- Message history
- Connection status indicators
- Loading and error states
- Responsive and modern UI
- Timestamps for messages
- Auto-scrolling to latest messages

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── chatRoutes.js
│   │   └── messageRoutes.js
│   ├── index.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Chat.js
    │   │   └── Chat.css
    │   ├── pages/
    │   │   └── TestChat.js
    │   └── App.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the backend directory:

   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend development server:
   ```bash
   npm start
   ```

## Testing the Chat System

1. Open `http://localhost:3000` in two different browser windows (or one normal and one incognito)
2. In one window, you'll be "Test Buyer"
3. In the other window, click "Switch User" to become "Test Seller"
4. Start sending messages between the two users

The chat system should:

- Show different message alignments for sent/received messages
- Display timestamps
- Persist messages after refresh
- Update in real-time between windows
- Show connection status
- Handle errors gracefully
- Provide loading states

## Error Handling

The system handles various error cases:

- Connection failures
- Message sending failures
- Database errors
- Loading errors

Each error is displayed to the user with a retry option where applicable.

## Production Deployment

Before deploying to production:

1. Update the CORS settings in `backend/index.js` to your production domain
2. Update the `ENDPOINT` constant in `frontend/src/components/Chat.js`
3. Set up proper environment variables
4. Implement user authentication
5. Add message encryption if required
6. Set up proper MongoDB indexes for performance

## Contributing

Feel free to submit issues and enhancement requests.
