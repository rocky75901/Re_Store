const { io } = require('socket.io-client');

// Connect to backend server
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);

  // Join a chat room with a valid ObjectId (as a string)
  const chatId = "65eafb6c7c4a2d3f9b3e1234";  // Ensure this is a valid MongoDB ObjectId string
  socket.emit('join_chat', chatId);
  console.log(`📌 Joined chat: ${chatId}`);

  // Send a test message after 2 seconds
  setTimeout(() => {
    socket.emit('send_message', {
      chatId,  // Keep it as a string, backend will convert it
      senderId: "65eafb6c7c4a2d3f9b3e5678",  // Use valid ObjectId string
      receiverId: "65eafb6c7c4a2d3f9b3e9101",  // Use valid ObjectId string
      message: "Hello from test client!"
    });
    console.log('📩 Test message sent!');
  }, 2000);
});

// Listen for incoming messages
socket.on('receive_message', (data) => {
  console.log('📩 New message received:', data);
});

