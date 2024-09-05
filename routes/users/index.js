const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

module.exports = function (database) {
    const userCollection = database.collection("UserCollection");

    // POST route for creating a new user
    router.post('/', async (req, res) => {
        try {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error inserting document:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET route for fetching all users
    router.get('/', async (req, res) => {
        try {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET route for fetching a user by ID
    router.get('/:id', async (req, res) => {
        try {
            const userId = req.params.id;

            const query = { _id: new ObjectId(userId) };
            const result = await userCollection.findOne(query);
            if (result) {
                res.send(result);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // GET route for fetching a user by email
    router.get('/email/:email', async (req, res) => {
        try {
            const userEmail = req.params.email;

            const query = { email: userEmail };
            const result = await userCollection.findOne(query);
            if (result) {
                res.send(result);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user by email:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const { photoURL } = req.body; // Extract photoURL from request body
    
        if (!photoURL) {
            return res.status(400).json({ message: 'photoURL is required' });
        }
    
        const filter = { _id: new ObjectId(id) };
        const updatedUser = {
            $set: {
                profilePictureURL: profilePictureURL,
            },
        };
    
        try {
            const result = await userCollection.updateOne(filter, updatedUser);
    
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            res.status(200).json({ message: 'Profile picture updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    
    
    

    return router;
};
