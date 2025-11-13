const express = require('express')
const Item = require('../models/item')

const router = express.Router()

router.get('/menu-items', async (req, res) => {

    try {
        const menuItems = await Item.find()
        res.json(menuItems)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch menu items' });
    }
})

router.post('/update-likes/:id', async (req, res) => {
    const itemId = req.params.id

    try {
        const item = await Item.findOne({_id:itemId})

        if (!item) {
            res.status(404).json({ message: 'Item not found' })
        }
        item.likes = item.likes + 1;
        await item.save();

        return res.status(200).json({ message: 'Like updated successfully', likes: item.likes });
    } catch (err) {
        return res.status(500).json({message: 'Error updating like', error: err.message})
    }
})

router.post('/update-dislikes/:id', async (req, res) => {
    const itemId = req.params.id
    try {
        const item = await Item.findOne({_id:itemId})
        if (!item) {
            res.status(404).json({ message: 'Item not found' })
        }
        item.dislikes= item.dislikes +1
        await item.save();
        

        return res.status(200).json({ message: 'dislike updated successfully', dislikes: item.dislikes });
    } catch (err) {
        return res.status(500).json({message: 'Error updating dislike', error: err.message})
    }
})

module.exports = router