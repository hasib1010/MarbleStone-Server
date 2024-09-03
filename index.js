const express = require('express');
const cors = require('cors');
require('dotenv').config()
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5001;

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

// Initialize MongoDB connection
async function initializeDatabase() {
  try {
    await client.connect(); 

    const database = client.db("marbleStoneDB");
    const blogCollection = database.collection("BlogCollection");

    // Define routes
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.post('/blogs', async (req, res) => {
      try {
        const newBlog = req.body;
        console.log(newBlog);
        const result = await blogCollection.insertOne(newBlog);
        res.status(201).send(result);
      } catch (error) {
        console.error('Error inserting document:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    // GET route to retrieve all blogs
    app.get('/blogs', async (req, res) => {
      try {
        const cursor = blogCollection.find();
        const blogs = await cursor.toArray();
        res.status(200).json({ blogs }); // Send the data as { blogs: [...] }
      } catch (error) {
        console.error('Error retrieving documents:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result)
    })
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };
      try {
        const result = await blogCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "An error occurred" });
      }
    });

    app.put("/blogs/:id", async (req, res) => {
      const id = req.params.id;
  
      // Validate ID format
      if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
      }
  
      const blog = req.body;
      const filter = { _id: new ObjectId(id) };
      
      // Construct the update object
      const updateBlog = {
          $set: {
              title: blog.title,
              author: blog.author,
              author_avatar: blog.author_avatar,
              published_date: blog.published_date,
              blog_banner_image: blog.blog_banner_image,
              blog_image: blog.blog_image,
              category: blog.category,
              subtitles: blog.subtitles || [], // Set new subtitles or default to empty array
              content: blog.content || []      // Set new content or default to empty array
          }
      };
  
      try {
          // Perform the update
          const result = await blogCollection.updateOne(filter, updateBlog);
          if (result.modifiedCount === 0) {
              return res.status(404).send({ error: "Blog not found or no changes made" });
          }
          res.send(result);
      } catch (error) {
          res.status(500).send({ error: "An error occurred while updating the blog" });
      }
  });
  


    // Start the server
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call the function to initialize the database and server
initializeDatabase();
