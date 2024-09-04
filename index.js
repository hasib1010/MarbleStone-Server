const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4xo1h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const blogsRoute = require('./routes/blogs');
const usersRoute = require('./routes/users');

async function initializeDatabase() {
  try {
    await client.connect();
    const database = client.db("marbleStoneDB");

    app.get('/', (req, res) => res.send('Hello World!'));

    // Pass the database instance to the routes
    app.use('/blogs', blogsRoute(database));
    app.use('/users', usersRoute(database)); // Ensure this line is present

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
