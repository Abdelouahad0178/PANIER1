const express = require('express');
const router = express.Router();
const CartItem = require('../models/cart');

// Ajouter un article au panier
router.post('/', async (req, res) => {
    const { product, quantity } = req.body;
    try {
        const cartItem = new CartItem({ product, quantity });
        await cartItem.save();
        res.status(201).send(cartItem);
    } catch (error) {
        res.status(400).send({ message: 'Error adding item to cart', error });
    }
});

// Obtenir tous les articles du panier
router.get('/', async (req, res) => {
    try {
        const cartItems = await CartItem.find().populate('product');
        res.send(cartItems);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching cart items', error });
    }
});

// Mettre à jour la quantité d'un article du panier
router.patch('/:id', async (req, res) => {
    const { quantity } = req.body;
    try {
        const cartItem = await CartItem.findById(req.params.id);
        if (!cartItem) {
            return res.status(404).send({ message: 'Cart item not found' });
        }
        cartItem.quantity = quantity;
        await cartItem.save();
        res.send(cartItem);
    } catch (error) {
        res.status(400).send({ message: 'Error updating cart item', error });
    }
});

// Supprimer un article du panier
router.delete('/:id', async (req, res) => {
    try {
        const cartItem = await CartItem.findByIdAndDelete(req.params.id);
        if (!cartItem) {
            return res.status(404).send({ message: 'Cart item not found' });
        }
        res.send(cartItem);
    } catch (error) {
        res.status(500).send({ message: 'Error deleting cart item', error });
    }
});

module.exports = router;
