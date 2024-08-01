const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Ajouter un produit
router.post('/', async (req, res) => {
    const { name, quantity, price } = req.body;
    const total = quantity * price;
    const product = new Product({ name, quantity, price, total });
    try {
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Obtenir tous les produits
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Obtenir un produit par ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }
        res.send(product);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching product details' });
    }
});

module.exports = router;
