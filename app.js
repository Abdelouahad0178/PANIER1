const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');

const app = express();
const port = 3000;

// Connexion à MongoDB Atlas
mongoose.connect('mongodb+srv://abdelouahad165:64oPEKJDxnkZfiV9@cluster0.kvvhl4c.mongodb.net/shopping-cart?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
