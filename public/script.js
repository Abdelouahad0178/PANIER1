document.addEventListener('DOMContentLoaded', async function () {
    try {
        let products = await fetch('http://localhost:3001/api/products').then(res => res.json());
        let cart = await fetch('http://localhost:3001/api/cart').then(res => res.json());
        let orders = []; // Array to store orders

        const productForm = document.getElementById('create-product-form');
        const productQuantity = document.getElementById('product-quantity');
        const productPrice = document.getElementById('product-price');
        const productTotal = document.getElementById('product-total');
        const placeOrderButton = document.getElementById('place-order-button');
        const orderItemsContainer = document.getElementById('order-items');

        function calculateTotal() {
            const quantity = parseInt(productQuantity.value) || 0;
            const price = parseFloat(productPrice.value) || 0;
            productTotal.value = quantity * price;
        }

        productQuantity.addEventListener('input', calculateTotal);
        productPrice.addEventListener('input', calculateTotal);

        function renderProducts() {
            const productContainer = document.getElementById('products');
            productContainer.innerHTML = '';
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <h3>${product.name}</h3>
                    <p>Quantité: ${product.quantity}</p>
                    <p>Prix: ${product.price} Dhs</p>
                    <p>Total: ${product.total} Dhs</p>
                    <button onclick="addToCart('${product._id}')">Ajouter au Panier</button>
                `;
                productContainer.appendChild(productDiv);
            });
        }

        function renderCart() {
            const cartItemsContainer = document.getElementById('cart-items');
            cartItemsContainer.innerHTML = '';
            let totalPrice = 0;

            cart.forEach(item => {
                const itemTotal = item.product.price * item.quantity;
                totalPrice += itemTotal;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.product.price} Dhs</td>
                    <td>${itemTotal} Dhs</td>
                    <td>
                        <button onclick="changeQuantity('${item._id}', -1)">-</button>
                        <button onclick="changeQuantity('${item._id}', 1)">+</button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            });

            document.getElementById('total-price').textContent = totalPrice;
        }

        function renderOrders() {
            orderItemsContainer.innerHTML = '';
            orders.forEach(order => {
                order.forEach(item => {
                    const itemTotal = item.product.price * item.quantity;
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.product.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.product.price} Dhs</td>
                        <td>${itemTotal} Dhs</td>
                    `;
                    orderItemsContainer.appendChild(row);
                });
            });
        }

        window.addToCart = async function (productId) {
            try {
                console.log('Adding product to cart with ID:', productId);

                // Fetch the product details to ensure the correct data is added to the cart
                const productResponse = await fetch(`http://localhost:3001/api/products/${productId}`);
                if (!productResponse.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const product = await productResponse.json();

                // Check if the product already exists in the cart
                const existingItem = cart.find(item => item.product._id === productId);

                if (existingItem) {
                    // Update the quantity of the existing item
                    existingItem.quantity += 1;
                    await fetch(`http://localhost:3001/api/cart/${existingItem._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: existingItem.quantity })
                    });
                } else {
                    // Add the product to the cart
                    const response = await fetch('http://localhost:3001/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product: productId, quantity: 1 })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to add product to cart');
                    }

                    const newItem = await response.json();
                    cart.push(newItem);
                }

                // Fetch updated cart from the server
                cart = await fetch('http://localhost:3001/api/cart').then(res => res.json());

                // Update the cart and re-render it
                renderCart();
            } catch (error) {
                console.error('Error adding product to cart:', error);
            }
        };

        window.changeQuantity = async function (itemId, change) {
            const item = cart.find(i => i._id === itemId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    await fetch(`http://localhost:3001/api/cart/${itemId}`, { method: 'DELETE' });
                    const index = cart.indexOf(item);
                    cart.splice(index, 1);
                } else {
                    await fetch(`http://localhost:3001/api/cart/${itemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: item.quantity })
                    });
                }
                // Fetch updated cart from the server
                cart = await fetch('http://localhost:3001/api/cart').then(res => res.json());
                renderCart();
            }
        };

        productForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('product-name').value;
            const quantity = parseInt(document.getElementById('product-quantity').value);
            const price = parseFloat(document.getElementById('product-price').value);
            const total = parseFloat(productTotal.value);

            // Vérification avant d'envoyer les données
            console.log({ name, quantity, price, total });
            
            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, quantity, price, total })
            });

            const newProduct = await response.json();
            products.push(newProduct);
            renderProducts();
            
            productForm.reset();
            productTotal.value = 0;
        });

        placeOrderButton.addEventListener('click', function () {
            if (cart.length > 0) {
                orders.push(cart);
                cart = [];
                renderCart();
                renderOrders();
            } else {
                alert('Votre panier est vide!');
            }
        });

        renderProducts();
        renderCart();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});
