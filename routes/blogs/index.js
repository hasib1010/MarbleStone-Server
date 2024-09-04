const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router(); 

// Function to initialize the router with the database collection
module.exports = function(database) {
  const blogCollection = database.collection("BlogCollection");

  // Create a new blog
  router.post('/', async (req, res) => {
    try {
      const newBlog = req.body;
      const result = await blogCollection.insertOne(newBlog);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error inserting document:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get all blogs
  router.get('/', async (req, res) => {
    try {
      const cursor = blogCollection.find();
      const blogs = await cursor.toArray();
      res.status(200).json({ blogs });
    } catch (error) {
      console.error('Error retrieving documents:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Get a single blog by ID
  router.get('/:id', async (req, res) => {
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

  // Delete a blog by ID
  router.delete('/:id', async (req, res) => {
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

  // Update a blog by ID
  router.put('/:id', async (req, res) => {
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

  return router;
};
