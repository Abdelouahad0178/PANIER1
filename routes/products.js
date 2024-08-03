const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Route pour créer un produit
router.post('/', async (req, res) => {
    const { name, quantity, price, total, clientName, clientPhone } = req.body;
    const product = new Product({ name, quantity, price, total, clientName, clientPhone });
    try {
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route pour obtenir tous les produits
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route pour obtenir un produit par ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
});

// Route pour mettre à jour un produit par ID
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price, total, clientName, clientPhone } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(id, { name, quantity, price, total, clientName, clientPhone }, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).send();
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route pour supprimer un produit par ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).send();
        }
        res.status(200).send(product);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
