const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Connexion à MongoDB
mongoose.connect('mongodb+srv://abdelouahad165:64oPEKJDxnkZfiV9@cluster0.kvvhl4c.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
