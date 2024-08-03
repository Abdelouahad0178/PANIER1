document.addEventListener('DOMContentLoaded', function () {
    const orderItemsContainer = document.getElementById('order-items');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    function renderOrders() {
        orderItemsContainer.innerHTML = '';
        orders.forEach(order => {
            order.forEach(item => {
                const itemTotal = item.price * item.quantity;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} Dhs</td>
                    <td>${itemTotal} Dhs</td>
                    <td>${item.clientName}</td>
                    <td>${item.clientPhone}</td>
                `;
                orderItemsContainer.appendChild(row);
            });
        });
    }

    renderOrders();
});
