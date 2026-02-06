const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose');
const port = process.env.PORT || 3000

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zhcuwp.mongodb.net/?appName=Cluster0`;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);

    coll = mongoose.connection.db.collection("scholarships");

    app.get('/scholarships',async (req,res) =>{

    } )
    app.post('/scholarships',async(req,res)=>{
        const scholarship = req.body;
        const result = await coll.insertOne(scholarship);
        res.send(result)
    })
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await mongoose.disconnect();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('ScholarStream server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
