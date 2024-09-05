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
        const updates = req.body;

        console.log('Received updates:', updates); // Log incoming data

        const filter = { _id: new ObjectId(id) };
        const updateFields = {};

        // Include only fields that are present in the request
        if (updates.profilePictureURL !== undefined) updateFields.profilePictureURL = updates.profilePictureURL;
        if (updates.name !== undefined) updateFields.name = updates.name;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updatedUser = {
            $set: updateFields,
        };

        try {
            const result = await userCollection.updateOne(filter, updatedUser);
            console.log('Update result:', result); // Log the result of the update operation

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User profile updated successfully' });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    router.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            if (result.deletedCount > 0) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: 'Blog not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });







    return router;
};
