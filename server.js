// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let infoCollection;

async function run() {
  try {
    await client.connect();
    const db = client.db("divisionDB");
    infoCollection = db.collection("divisionInfo");
    console.log("MongoDB connected successfully.");

    app.get('/', (req, res) => {
      res.send('Division Info API is running');
    });

    // Get info by division
    app.get('/api/info/:division', async (req, res) => {
      const division = req.params.division;
      const result = await infoCollection.find({ division }).sort({ _id: 1 }).toArray();
      res.send(result);
    });

    // Post new info
    app.post('/api/info', async (req, res) => {
      const info = req.body; // { division: 'Dhaka', text: 'Some info' }
      const result = await infoCollection.insertOne(info);
      res.send(result);
    });

    // DELETE info by ID
    app.delete('/api/info/:id', async (req, res) => {
      const id = req.params.id;
      const result = await infoCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // UPDATE info by ID
    app.patch('/api/info/:id', async (req, res) => {
      const id = req.params.id;
      const { text } = req.body;
      const result = await infoCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text } }
      );
      res.send(result);
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (err) {
    console.error('Connection error:', err);
  }
}

run().catch(console.dir);
