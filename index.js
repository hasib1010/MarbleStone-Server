const express = require('express'); 
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4xo1h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function initializeDatabase() {
  try {
    await client.connect();
    const database = client.db("marbleStoneDB");
    const blogCollection = database.collection("BlogCollection");

    // Define routes
    app.get('/', (req, res) => res.send('Hello World!'));

    app.post('/blogs', async (req, res) => {
      try {
        const newBlog = req.body;
        const result = await blogCollection.insertOne(newBlog);
        res.status(201).json(result);
      } catch (error) {
        console.error('Error inserting document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/blogs', async (req, res) => {
      try {
        const cursor = blogCollection.find();
        const blogs = await cursor.toArray();
        res.status(200).json({ blogs });
      } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/blogs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.findOne(query);
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: 'Blog not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.delete('/blogs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.deleteOne(query);
        if (result.deletedCount > 0) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: 'Blog not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.put('/blogs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Invalid ID format' });
        }

        const blog = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateBlog = {
          $set: {
            title: blog.title,
            author: blog.author,
            author_avatar: blog.author_avatar,
            published_date: blog.published_date,
            blog_banner_image: blog.blog_banner_image,
            blog_image: blog.blog_image,
            category: blog.category,
            subtitles: blog.subtitles || [],
            content: blog.content || []
          }
        };

        const result = await blogCollection.updateOne(filter, updateBlog);
        if (result.modifiedCount > 0) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: 'Blog not found or no changes made' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initializeDatabase();
