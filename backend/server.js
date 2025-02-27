const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

//starting the server
const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`listening to request on port ${port}`)
})