// Categories: "bags" | "stickers" | "kids" (vêtements drari sghar)
const CATEGORY_IDS = { bags: 'grid-bags', stickers: 'grid-stickers', kids: 'grid-kids' };
const CATEGORY_LABELS = {
    bags: 'Sacs & Bags',
    stickers: 'Stickers',
    kids: 'Vêtements Enfants (Drari Sghar)'
};

// 1. List dyal l-mantioujat — kol category b 7edha
const myProducts = [
    // ——— Bags ———
    { name: 'Velvet Makeup Bag', price: 150, category: 'bags', img: 'product.jpg', imgs: ['product.jpg'], desc: 'Un sac élégant.', hasSize: false },
    { name: 'Tech Protection Sleeve', price: 200, category: 'bags', img: 'IMG_1547.jpg', imgs: ['IMG_1547.jpg'], desc: 'Protection maximale.', hasSize: true },
    // ——— Stickers ———
    { name: 'Sticker Pack Aesthetic', price: 25, category: 'stickers', img: 'product.jpg', imgs: ['product.jpg'], desc: 'Pack de stickers déco.', hasSize: false },
    { name: 'Sticker Set Kawaii', price: 30, category: 'stickers', img: 'product.jpg', imgs: ['product.jpg'], desc: 'Set stickers mignons.', hasSize: false },
    // ——— Vêtements Enfants (drari sghar) ———
    { name: 'T-shirt Enfant Mignon', price: 80, category: 'kids', img: 'product.jpg', imgs: ['product.jpg'], desc: 'T-shirt confort pour les petits.', hasSize: true },
    { name: 'Robe Enfant Blossom', price: 120, category: 'kids', img: 'IMG_1558.jpg', imgs: ['IMG_1558.jpg'], desc: 'Robe légère pour fillette.', hasSize: true }
];

let cart = [];
let selectedSize = null;

function renderProductCard(p) {
    const safeName = p.name.replace(/'/g, "\\'");
    return `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="price">${p.price} DH</p>
                <div class="product-actions">
                    <button type="button" class="btn-buy" onclick="openProduct('${safeName}')">Voir Détails</button>
                    <button type="button" class="quick-add-cart" onclick="quickAddToCart('${safeName}', event)" title="Ajouter au panier"><i class="fa-solid fa-cart-plus"></i></button>
                </div>
            </div>
        </div>`;
}

// 2. Bach t-fichi l-mantioujat — kol category f grid mte3ha
function displayProducts() {
    const searchRaw = (document.getElementById('searchInput') && document.getElementById('searchInput').value) || '';
    const search = searchRaw.toLowerCase().trim().replace(/[<>]/g, '');

    const titleEl = document.getElementById('products-title');
    let activeCategoryLabel = null;

    // Ila kayn search, n9elbo luwlen b smiyat dyal produits
    let globalNameMatchesByCat = null;
    if (search) {
        globalNameMatchesByCat = {};
        myProducts.forEach(p => {
            if (p.name.toLowerCase().includes(search)) {
                if (!globalNameMatchesByCat[p.category]) {
                    globalNameMatchesByCat[p.category] = [];
                }
                globalNameMatchesByCat[p.category].push(p);
            }
        });
    }

    Object.keys(CATEGORY_IDS).forEach(cat => {
        const grid = document.getElementById(CATEGORY_IDS[cat]);
        const section = document.getElementById(`section-${cat}`);
        if (!grid || !section) return;

        const fullList = myProducts.filter(p => p.category === cat);
        let filtered = fullList;

        if (search) {
            const nameMatches = (globalNameMatchesByCat && globalNameMatchesByCat[cat]) || [];

            if (nameMatches.length > 0) {
                const lowerSearch = search;
                const startsWith = nameMatches.filter(p =>
                    p.name.toLowerCase().startsWith(lowerSearch)
                );
                const nameContains = nameMatches.filter(p =>
                    !startsWith.includes(p) && p.name.toLowerCase().includes(lowerSearch)
                );
                filtered = [...startsWith, ...nameContains];
            } else {
                // Makan thta produit b had smiya, njarreb 3la smit l-category
                const categoryMatched = search.includes(cat.toLowerCase());
                if (categoryMatched) {
                    filtered = fullList;
                    if (!activeCategoryLabel && CATEGORY_LABELS[cat]) {
                        activeCategoryLabel = CATEGORY_LABELS[cat];
                    }
                } else {
                    filtered = [];
                }
            }
        }

        if (search && filtered.length === 0) {
            section.style.display = 'none';
            grid.innerHTML = '';
        } else {
            section.style.display = '';
            const toRender = search ? filtered : fullList;
            grid.innerHTML = toRender.map(p => renderProductCard(p)).join('');
        }
    });

    // Update titre principal 7asab l-search
    if (titleEl) {
        if (search && activeCategoryLabel) {
            titleEl.innerText = activeCategoryLabel;
        } else {
            titleEl.innerText = 'Our Products';
        }
    }
}

// 3. Product Detail Page (sf7a khassa)
function renderProductDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get('product');
    if (!productName) return;

    // Ila ma kaynach had l-page (mafihach had les IDs) n-stoppi
    const titleEl = document.getElementById('modal-title');
    if (!titleEl) return;

    const productData = myProducts.find(p => p.name === productName);
    if (!productData) return;

    document.title = 'Anssar Store - ' + productData.name;

    titleEl.innerText = productData.name;
    document.getElementById('modal-price').innerText = productData.price + " DH";
    document.getElementById('modal-desc').innerText = productData.desc;
    
    const images = productData.imgs || [productData.img];
    const mainImg = document.getElementById('main-modal-img');
    const galleryScroll = document.getElementById('modal-gallery-scroll');
    mainImg.src = images[0];
    mainImg.alt = productData.name;
    
    galleryScroll.innerHTML = images.map((src, i) => 
        `<img src="${src}" alt="${productData.name}" class="modal-thumb ${i === 0 ? 'active' : ''}" onclick="selectModalImage(this)">`
    ).join('');

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

    // Click dial Add to Cart f sf7a dyal produit
    document.getElementById('modal-add-btn').onclick = function() {
        if (!selectedSize && productData.hasSize) {
            document.getElementById('size-error').style.display = 'block';
            return;
        }
        addToCart(productData.name, productData.price, productData.img);
        openCart();
    };
}

// 3bis. openProduct daba kat-hawwel l-sf7a khassa
function openProduct(productName) {
    const productData = myProducts.find(p => p.name === productName);
    if (!productData) return;
    window.location.href = `product.html?product=${encodeURIComponent(productData.name)}`;
}

function selectSize(size, btn) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('size-error').style.display = 'none';
}

function selectModalImage(thumbEl) {
    if (!thumbEl || !thumbEl.src) return;
    document.getElementById('main-modal-img').src = thumbEl.src;
    document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
    thumbEl.classList.add('active');
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
// Recherche: n-filter-iw kol category b 7edha
function searchProducts() {
    displayProducts();
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

// Loader global: index (catalogue) w product.html (détails)
window.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    renderProductDetailPage();
});