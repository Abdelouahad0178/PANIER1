document.addEventListener('DOMContentLoaded', async function () {
    try {
        let products = await fetch('http://localhost:3000/api/products').then(res => res.json());
        let cart = await fetch('http://localhost:3000/api/cart').then(res => res.json());
        let orders = []; // Array to store orders
        let editingProductId = null;

        const productForm = document.getElementById('create-product-form');
        const productNameInput = document.getElementById('product-name');
        const productQuantity = document.getElementById('product-quantity');
        const productPrice = document.getElementById('product-price');
        const productTotal = document.getElementById('product-total');
        const clientNameInput = document.getElementById('client-name');
        const clientPhoneInput = document.getElementById('client-phone');
        const submitButton = document.getElementById('submit-button');
        const placeOrderButton = document.getElementById('place-order-button');
        const orderItemsContainer = document.getElementById('order-items');
        const printOrderButton = document.getElementById('print-order-button');
        const cancelPrintButton = document.getElementById('cancel-print-button');

        // Pré-remplir le formulaire si des données de produit sont stockées
        const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));
        if (selectedProduct) {
            productNameInput.value = selectedProduct.name;
            productQuantity.value = 1;  // Quantité par défaut
            productPrice.value = selectedProduct.price;
            productTotal.value = selectedProduct.price;
            clientNameInput.value = '';  // Nom du client à renseigner
            clientPhoneInput.value = '';  // Téléphone du client à renseigner

            // Effacer les données du produit stockées après remplissage
            localStorage.removeItem('selectedProduct');
        }

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
                    <p>Nom du Client: ${product.clientName}</p>
                    <p>Téléphone: ${product.clientPhone}</p>
                    <button onclick="editProduct('${product._id}')">Modifier</button>
                    <button onclick="deleteProduct('${product._id}')">Supprimer</button>
                    <button onclick="addToCart('${product._id}')">Ajouter au Panier</button>
                `;
                productContainer.appendChild(productDiv);
            });
        }

        function renderCart() {
            const cartItemsContainer = document.getElementById('cart-items');
            cartItemsContainer.innerHTML = '';
            let totalPrice = 0;
            let clientMap = {};

            cart.forEach(item => {
                if (item.product && item.product.price) {
                    const itemTotal = item.product.price * item.quantity;
                    totalPrice += itemTotal;
                    const clientKey = `${item.product.clientName}_${item.product.clientPhone}`;

                    if (!clientMap[clientKey]) {
                        clientMap[clientKey] = {
                            clientName: item.product.clientName,
                            clientPhone: item.product.clientPhone,
                            items: [],
                            subTotal: 0
                        };
                    }

                    clientMap[clientKey].items.push(item);
                    clientMap[clientKey].subTotal += itemTotal;
                }
            });

            Object.values(clientMap).forEach(client => {
                client.items.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.product.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.product.price} Dhs</td>
                        <td>${item.product.price * item.quantity} Dhs</td>
                        <td>${item.product.clientName}</td>
                        <td>${item.product.clientPhone}</td>
                        <td>
                            <button onclick="changeQuantity('${item._id}', -1)">-</button>
                            <button onclick="changeQuantity('${item._id}', 1)">+</button>
                        </td>
                    `;
                    cartItemsContainer.appendChild(row);
                });

                const subTotalRow = document.createElement('tr');
                subTotalRow.innerHTML = `
                    <td colspan="3"><strong>Sous-Total pour ${client.clientName}</strong></td>
                    <td><strong>${client.subTotal} Dhs</strong></td>
                    <td colspan="3"></td>
                `;
                cartItemsContainer.appendChild(subTotalRow);
            });

            document.getElementById('total-price').textContent = totalPrice;
        }

        function renderOrders() {
            orderItemsContainer.innerHTML = '';
            orders.forEach(order => {
                order.forEach(item => {
                    if (item.product && item.product.price) { // Vérification de l'existence des propriétés
                        const itemTotal = item.product.price * item.quantity;
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${item.product.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.product.price} Dhs</td>
                            <td>${itemTotal} Dhs</td>
                            <td>${item.product.clientName}</td>
                            <td>${item.product.clientPhone}</td>
                        `;
                        orderItemsContainer.appendChild(row);
                    }
                });
            });
        }

        window.addToCart = async function (productId) {
            try {
                const productResponse = await fetch(`http://localhost:3000/api/products/${productId}`);
                if (!productResponse.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const product = await productResponse.json();
                console.log('Product fetched:', product);
                if (!product || !product._id) {
                    throw new Error('Product not found');
                }

                const existingItem = cart.find(item => item.product && item.product._id === productId);

                if (existingItem) {
                    existingItem.quantity += 1;
                    await fetch(`http://localhost:3000/api/cart/${existingItem._id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: existingItem.quantity })
                    });
                } else {
                    const response = await fetch('http://localhost:3000/api/cart', {
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

                cart = await fetch('http://localhost:3000/api/cart').then(res => res.json());
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
                    await fetch(`http://localhost:3000/api/cart/${itemId}`, { method: 'DELETE' });
                    const index = cart.indexOf(item);
                    cart.splice(index, 1);
                } else {
                    await fetch(`http://localhost:3000/api/cart/${itemId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ quantity: item.quantity })
                    });
                }
                cart = await fetch('http://localhost:3000/api/cart').then(res => res.json());
                renderCart();
            }
        };

        window.editProduct = function (productId) {
            const product = products.find(p => p._id === productId);
            if (product) {
                editingProductId = productId;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-quantity').value = product.quantity;
                document.getElementById('product-price').value = product.price;
                document.getElementById('client-name').value = product.clientName;
                document.getElementById('client-phone').value = product.clientPhone;
                calculateTotal();
                submitButton.textContent = 'Modifier le Produit';
            }
        };

        window.deleteProduct = async function (productId) {
            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete product');
                }

                products = products.filter(p => p._id !== productId);
                renderProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        };

        productForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const name = document.getElementById('product-name').value;
            const quantity = parseInt(document.getElementById('product-quantity').value);
            const price = parseFloat(document.getElementById('product-price').value);
            const total = parseFloat(productTotal.value);
            const clientName = clientNameInput.value;
            const clientPhone = clientPhoneInput.value;

            if (editingProductId) {
                // Modifier le produit existant
                const response = await fetch(`http://localhost:3000/api/products/${editingProductId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, quantity, price, total, clientName, clientPhone })
                });

                if (!response.ok) {
                    throw new Error('Failed to update product');
                }

                const updatedProduct = await response.json();
                products = products.map(p => p._id === editingProductId ? updatedProduct : p);
                editingProductId = null;
                submitButton.textContent = 'Ajouter le Produit';
            } else {
                // Ajouter un nouveau produit
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, quantity, price, total, clientName, clientPhone })
                });

                if (!response.ok) {
                    throw new Error('Failed to add product');
                }

                const newProduct = await response.json();
                products.push(newProduct);
            }

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

                document.querySelectorAll('h2, form, #products, #cart-table, #cart-total, #place-order-button')
                    .forEach(el => el.style.display = 'none');
                document.getElementById('order-table').style.display = 'table';
            } else {
                alert('Votre panier est vide!');
            }
        });

        // Fonction d'impression de la commande
        printOrderButton.addEventListener('click', function () {
            const orderTable = document.getElementById('order-table');
            const originalContent = document.body.innerHTML;
            document.body.innerHTML = orderTable.outerHTML;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload();
        });

        // Fonction d'annulation de l'impression
        cancelPrintButton.addEventListener('click', function () {
            window.location.reload();
        });

        renderProducts();
        renderCart();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});
