const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// Route pour ajouter un article au panier
router.post('/', async (req, res) => {
    const { product, quantity } = req.body;
    const cartItem = new Cart({ product, quantity });
    try {
        await cartItem.save();
        res.status(201).send(cartItem);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route pour obtenir tous les articles du panier
router.get('/', async (req, res) => {
    try {
        const cartItems = await Cart.find().populate('product');
        res.status(200).send(cartItems);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route pour mettre à jour la quantité d'un article du panier
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        const cartItem = await Cart.findByIdAndUpdate(id, { quantity }, { new: true, runValidators: true });
        if (!cartItem) {
            return res.status(404).send();
        }
        res.status(200).send(cartItem);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route pour supprimer un article du panier
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const cartItem = await Cart.findByIdAndDelete(id);
        if (!cartItem) {
            return res.status(404).send();
        }
        res.status(200).send(cartItem);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
