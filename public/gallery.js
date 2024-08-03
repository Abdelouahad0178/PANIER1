document.addEventListener('DOMContentLoaded', async function () {
    const gallery = document.getElementById('gallery');

    // Charger les produits à partir du fichier JSON
    const products = await fetch('products.json').then(res => res.json());

    // Fonction pour afficher les produits dans la galerie
    function renderGallery() {
        products.forEach(product => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';
            itemDiv.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Prix: ${product.price} Dhs</p>
                <button onclick="addToCart(${product.id})">Ajouter au Panier</button>
            `;
            gallery.appendChild(itemDiv);
        });
    }

    // Fonction pour ajouter un produit au panier
    window.addToCart = function (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            // Stocker les données du produit dans le stockage local
            localStorage.setItem('selectedProduct', JSON.stringify(product));
            // Redirection vers le formulaire du panier d'achat
            window.location.href = 'index.html';
        }
    };

    renderGallery();
});
