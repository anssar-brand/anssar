

// Categories: "bags" | "stickers" | "kids"
const CATEGORY_IDS = { bags: 'grid-bags', stickers: 'grid-stickers', kids: 'grid-kids' };
const CATEGORY_LABELS = {
    bags: 'Sacs & Bags',
    stickers: 'Stickers',
    kids: 'Vêtements Enfants',
};

// Produits: une seule ligne par produit. Format: nom|prix|category|img|desc|hasSize
// imgs = [img] par défaut. Pour plusieurs images: img1.jpg,img2.jpg
const PRODUCTS_RAW = [
    'Velvet Makeup|150|bags|product.jpg|Un sac élégant.|false',
    'Tech Protection Sleeve|200|bags|IMG_1547.jpg|Protection maximale.|true',
    'Sticker Pack Aesthetic|25|stickers|product.jpg|Pack de stickers déco.|false',
    'Sticker Set Kawaii|30|stickers|product.jpg|Set stickers mignons.|false',
    'T-shirt Enfant Mignon|80|kids|product.jpg|T-shirt confort pour les petits.|true',
    'Robe Enfant Blossom|120|kids|IMG_1558.jpg|Robe légère pour fillette.|true',
];

function parseProduct(str) {
    const [name, price, category, img, desc, hasSize] = str.split('|');
    const imgs = img.includes(',') ? img.split(',') : [img];
    return { name: name.trim(), price: Number(price), category, img: imgs[0], imgs, desc, hasSize: hasSize === 'true' };
}

const myProducts = PRODUCTS_RAW.map(parseProduct);

let cart = [];
let selectedSize = null;

function renderProductCard(p) {
    var safeName = p.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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
    if (sizeSelector) {
        if (productData.hasSize === false) {
            sizeSelector.style.display = 'none'; 
            selectedSize = "Unique"; 
        } else {
            sizeSelector.style.display = 'block';
            selectedSize = null; 
        }
    }

    // Reset styles
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    var sizeError = document.getElementById('size-error');
    if (sizeError) sizeError.style.display = 'none';

    // Click dial Add to Cart f sf7a dyal produit
    var modalAddBtn = document.getElementById('modal-add-btn');
    if (modalAddBtn) {
        modalAddBtn.onclick = function() {
            if (!selectedSize && productData.hasSize) {
                if (sizeError) sizeError.style.display = 'block';
                return;
            }
            addToCart(productData.name, productData.price, productData.img);
            openCart();
        };
    }
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
    var modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.style.display = 'none';
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
    const cartCountSpan = document.getElementById('cart-count');
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    const confirmBtn = document.getElementById('confirm-order-btn');

    if (!cartItemsDiv) return;
    if (cartCountSpan) {
        cartCountSpan.innerText = cart.length;
    }

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p class='cart-empty-msg'>Votre panier est vide.</p>";
        if (totalPriceSpan) totalPriceSpan.innerText = "0";
        if (confirmBtn) confirmBtn.style.display = "none";
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
        if (totalPriceSpan) totalPriceSpan.innerText = total;
        if (confirmBtn) confirmBtn.style.display = "block";
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

function openCart() {
    var cartSection = document.getElementById('cart-section');
    var overlay = document.getElementById('overlay');
    if (!cartSection || !overlay) return;
    cartSection.style.display = 'block';
    overlay.style.display = 'block';
    document.body.classList.add('no-scroll');
    updateCartDisplay();
}

function closeCart() {
    var cartSection = document.getElementById('cart-section');
    var overlay = document.getElementById('overlay');
    var formArea = document.getElementById('checkout-form-area');
    if (cartSection) cartSection.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    if (formArea) formArea.style.display = 'none';
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
    var formArea = document.getElementById('checkout-form-area');
    var confirmBtn = document.getElementById('confirm-order-btn');
    if (formArea) formArea.style.display = 'block';
    if (confirmBtn) confirmBtn.style.display = 'none';
}

window.onload = displayProducts;

window.onclick = function(event) {
    var modal = document.getElementById('product-modal');
    if (modal && event.target === modal) closeProductModal();
    if (event.target === document.getElementById('overlay')) closeCart();
};

const orderForm = document.getElementById('order-form');
const successBoxId = 'order-success-box';
const WHATSAPP_NUMBER = '212650527938';

function showOrderSuccess(orderId) {
    let box = document.getElementById(successBoxId);
    if (!box) {
        box = document.createElement('div');
        box.id = successBoxId;
        box.className = 'order-success-box';
        document.body.appendChild(box);
    }
    box.innerHTML = `
        <div class="order-success-card">
            <h3>Commande confirmée ✅</h3>
            <p>Merci pour votre confiance !</p>
            <p>Votre <strong>numéro de commande</strong> est :</p>
            <div class="order-id">${orderId}</div>
            <button type="button" class="order-success-whatsapp-btn">Continuer vers WhatsApp</button>
        </div>
    `;
    box.style.display = 'flex';
    const whatsappBtn = box.querySelector('.order-success-whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.onclick = () => {
            var msg = 'Assalamo alaykum Anssar , أنا أؤكد طلبي الذي سجلته الآن في الموقع';
            var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
            window.open(url, '_blank');
            box.style.display = 'none';
        };
    }
}

window.sendOrder = function sendOrder() {
    const nameEl = document.getElementById('name');
    const phoneEl = document.getElementById('phone');
    const cityEl = document.getElementById('city');
    const addressEl = document.getElementById('address');

    const name = nameEl ? nameEl.value.trim() : '';
    const phone = phoneEl ? phoneEl.value.trim() : '';
    const city = cityEl ? cityEl.value.trim() : '';
    const address = addressEl ? addressEl.value.trim() : '';

    if (!cart || cart.length === 0) {
        showToast("Votre panier est vide.");
        return;
    }
    if (!name || !phone || !city || !address) {
        showToast("Veuillez remplir tous les champs du formulaire.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const productsList = cart.map(item => item.name).join(', ');

    // --- A. SJEL L-DATA F L-PC (LOCAL STORAGE) ---
    const orderId = 'ORD-' + Date.now(); // Raqm commande jdid
    const newOrder = {
        id: orderId,
        customerName: name,
        phone: phone,
        city: city,
        address: address,
        products: cart.map(item => ({ name: item.name, price: item.price })),
        total: total,
        date: new Date().toLocaleString()
    };

    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    orders.push(newOrder);
    localStorage.setItem('myOrders', JSON.stringify(orders));

    // --- B. SIYFET L-WHATSAPP ---
    const message = `*Nouvelle Commande - Anssar Store*\n\n` +
                  `*Nom:* ${name}\n` +
                  `*Tél:* ${phone}\n` +
                  `*Ville:* ${city}\n` +
                  `*Adresse:* ${address}\n\n` +
                  `*Articles:* ${productsList}\n` +
                  `*Total:* ${total} DH`;

    const whatsappUrl = `https://wa.me/212650527938?text=${encodeURIComponent(message)}`;

    // Nqiw l-panier w n-seddouh
    closeCart();
    cart.length = 0;
    updateCartDisplay();
    if (document.getElementById('order-form')) {
        document.getElementById('order-form').reset();
    }

    // N-7ellu l-modal d-naja7 (li fih bouton WhatsApp)
    showOrderSuccess(orderId);
    showToast("Commande enregistrée !");

    // Khzini l-URL d-whatsapp f l-bouton dyal l-modal success
    setTimeout(() => {
        const successWhatsappBtn = document.querySelector('.order-success-whatsapp-btn');
        if (successWhatsappBtn) {
            successWhatsappBtn.onclick = () => {
                window.open(whatsappUrl, '_blank');
                const box = document.getElementById('order-success-box');
                if (box) box.style.display = 'none';
            };
        }
    }, 500);
};

if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        window.sendOrder();
    });
}
// Recherche: n-filter-iw kol category b 7edha
function searchProducts() {
    displayProducts();
}
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.querySelector('.close-sidebar');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar && sidebar.classList.add('active');
    });
}
if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        sidebar && sidebar.classList.remove('active');
    });
}

// Exposer les fonctions dans le scope global pour les attributs onclick/onkeyup du HTML
window.openProduct = openProduct;
window.quickAddToCart = quickAddToCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.selectSize = selectSize;
window.selectModalImage = selectModalImage;
window.closeProductModal = closeProductModal;
window.showCheckoutForm = showCheckoutForm;
window.removeFromCart = removeFromCart;
window.searchProducts = searchProducts;

// Loader global: index (catalogue) w product.html (détails)
window.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    renderProductDetailPage();
});