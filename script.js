// 1. List dyal l-mantioujat (Zid hasSize: true/false l kulla wa7ed)
const myProducts = [
    { name: 'Velvet Makeup Bag', price: 150, category : "bags" , img: 'product.jpg', desc: 'Un sac élégant.', hasSize: false },
    { name: 'Tech Protection Sleeve', price: 200, category : "tech" , img: 'IMG_1547.jpg', desc: 'Protection maximale.', hasSize: true },
    { name: 'Aesthetic Water Bottle', price: 120, category : "accessories" , img: 'IMG_1548.jpg', desc: 'Restez hydraté.', hasSize: false },
    { name: 'blossom nuha', price: 120, category : "tech" , img: 'IMG_1558.jpg', desc: 'miamii.', hasSize: true }
];

let cart = [];
let selectedSize = null;

// 2. Function bach t-fichi l-mantioujat
function displayProducts() {
    const grid = document.getElementById('main-products');
    if (!grid) return;
    grid.innerHTML = ""; 

    myProducts.forEach(p => {
        grid.innerHTML += `
            <div class="product-card" onclick="openProduct('${p.name}')" style="cursor: pointer;">
                <img src="${p.img}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${p.price} DH</p>
                    <div class="product-actions">
                        <button class="btn-buy">Voir Détails</button>
                        <button type="button" class="quick-add-cart" onclick="quickAddToCart('${p.name.replace(/'/g, "\\'")}', event)" title="Ajouter au panier"><i class="fa-solid fa-cart-plus"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 3. Product Modal Logic
function openProduct(productName) {
    // N-qalbo 3la l-mantiouj f l-list "myProducts"
    const productData = myProducts.find(p => p.name === productName);
    
    if (!productData) return; // Ila malqahch may-dir walou

    document.getElementById('product-modal').style.display = 'flex';
    document.getElementById('modal-title').innerText = productData.name;
    document.getElementById('modal-price').innerText = productData.price + " DH";
    document.getElementById('modal-desc').innerText = productData.desc;
    document.getElementById('main-modal-img').src = productData.img;

    const sizeSelector = document.querySelector('.size-selector');
    
    // Logic dyal Taille
    if (productData.hasSize === false) {
        sizeSelector.style.display = 'none'; 
        selectedSize = "Unique"; 
    } else {
        sizeSelector.style.display = 'block';
        selectedSize = null; 
    }

    // Reset styles
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('size-error').style.display = 'none';
    document.body.classList.add('no-scroll');

    // Click dial Add to Cart wast l-modal
    document.getElementById('modal-add-btn').onclick = function() {
        if (!selectedSize && productData.hasSize) {
            document.getElementById('size-error').style.display = 'block';
            return;
        }
        addToCart(productData.name, productData.price, productData.img);
        closeProductModal();
        openCart();
    };
}

function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('size-error').style.display = 'none';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

// 4. Cart Logic
function addToCart(name, price, img) {
    let finalName = (selectedSize && selectedSize !== "Unique") ? `${name} (${selectedSize})` : name;
    cart.push({ name: finalName, price: price, image: img });
    updateCartDisplay();
    showToast(`${name} ajouté au panier !`);
}

function quickAddToCart(productName, ev) {
    if (ev) ev.stopPropagation();
    const productData = myProducts.find(p => p.name === productName);
    if (!productData) return;
    if (productData.hasSize) {
        showToast("Veuillez choisir une taille pour ce produit.");
        openProduct(productName);
        return;
    }
    selectedSize = "Unique";
    addToCart(productData.name, productData.price, productData.img);
    openCart();
}

function updateCartDisplay() {
    const cartCountSpan = document.getElementById('cart-count'); // Drna focus 3la l-count bo7dou
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    const confirmBtn = document.getElementById('confirm-order-btn');

    // 1. Update l-count bla ma n-mshou l-icon d l-bag
    if (cartCountSpan) {
        cartCountSpan.innerText = cart.length;
    }

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p class='cart-empty-msg'>Votre panier est vide.</p>";
        totalPriceSpan.innerText = "0";
        confirmBtn.style.display = "none";
    } else {
        cartItemsDiv.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;
            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <div class="item-info">
                        <img src="${item.image}" class="cart-img-small" alt="">
                        <div class="item-details">
                            <span>${item.name}</span>
                            <b>${item.price} DH</b>
                        </div>
                    </div>
                    <button type="button" onclick="removeFromCart(${index})" class="remove-btn">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>`;
        });
        totalPriceSpan.innerText = total;
        confirmBtn.style.display = "block";
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function openCart() {
    document.getElementById('cart-section').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.body.classList.add('no-scroll'); 
    updateCartDisplay();
}

function closeCart() {
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('checkout-form-area').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

// Notif Toast
function showToast(message) {
    const oldToast = document.querySelector('.toast-msg');
    if (oldToast) oldToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { if(toast) toast.remove(); }, 3000);
}

// WhatsApp & Forms
function showCheckoutForm() {
    document.getElementById('checkout-form-area').style.display = 'block';
    document.getElementById('confirm-order-btn').style.display = 'none';
}

window.onload = displayProducts;

window.onclick = function(event) {
    if (event.target == document.getElementById('product-modal')) closeProductModal();
    if (event.target == document.getElementById('overlay')) closeCart();
}

const orderForm = document.getElementById('order-form');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const city = document.getElementById('city').value;
        const address = document.getElementById('address').value;
        let productList = cart.map(item => `- ${item.name} (${item.price} DH)`).join('%0A');
        let total = cart.reduce((sum, item) => sum + item.price, 0);
        const text = `*NOUVELLE COMMANDE - ANSSAR*%0A%0A*Produits:*%0A${productList}%0A%0A*Total:* ${total} DH%0A%0A👤 *Nom:* ${name}%0A📍 *Ville:* ${city}%0A📞 *Tél:* ${phone}%0A🏠 *Adresse:* ${address}`;
        window.open(`https://wa.me/212650527938?text=${text}`, '_blank');
    });
}
function searchProducts() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('main-products');
    
    // N-filter-iw l-list 3la 7ssab chnou ktab l-klyan
    const filtered = myProducts.filter(p => 
        p.name.toLowerCase().includes(input)
    );

    grid.innerHTML = ""; 

    if (filtered.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 50px;'>Aucun produit trouvé.</p>";
        return;
    }

    // N-fichi-w ghir dakchi li lqina
    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="product-card" onclick="openProduct('${p.name}')" style="cursor: pointer;">
                <img src="${p.img}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">${p.price} DH</p>
                    <div class="product-actions">
                        <button class="btn-buy">Voir Détails</button>
                        <button type="button" class="quick-add-cart" onclick="quickAddToCart('${p.name.replace(/'/g, "\\'")}', event)" title="Ajouter au panier"><i class="fa-solid fa-cart-plus"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.querySelector('.close-sidebar');

menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('active');
});