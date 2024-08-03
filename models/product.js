const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
