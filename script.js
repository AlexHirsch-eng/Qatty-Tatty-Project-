function addToCart(pancakeName, price) {
    let cart = JSON.parse(localStorage.getItem('qattyTattyCart')) || [];
    cart.push({ name: pancakeName, price: price });
    localStorage.setItem('qattyTattyCart', JSON.stringify(cart));
    alert(pancakeName + " добавлен в корзину!");
}


document.querySelector('form').onsubmit = function(e) {
    const pass = document.querySelector('input[type="password"]').value;
    if (pass.length < 8) {
        alert("Пароль должен быть не менее 8 символов!"); [cite: 169]
        e.preventDefault();
    }
};