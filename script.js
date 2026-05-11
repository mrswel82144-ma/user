// 1. إخفاء الشاشة الترحيبية
window.onload = () => {
    setTimeout(() => {
        let splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => splash.style.display = 'none', 800);
        
        loadStoreData(); // تحميل بيانات المتجر بعد اختفاء الشاشة
        loadProfile();   // تحميل البروفايل المحفوظ
    }, 2500);
};

// 2. التبديل بين الصفحات
window.switchPage = function(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    btn.classList.add('active');
};

// 3. شريط البحث
window.toggleSearch = function() {
    document.getElementById('search-box').classList.toggle('active');
};
window.searchProducts = function(val) {
    let prods = JSON.parse(localStorage.getItem('products')) || [];
    let filtered = prods.filter(p => p.name.includes(val));
    renderProducts(filtered);
};

// 4. تحميل وعرض البيانات من الأدمن
let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let deliveryPrice = Number(localStorage.getItem('deliveryPrice')) || 0;

function loadStoreData() {
    // البنرات المتحركة
    let banners = JSON.parse(localStorage.getItem('banners')) || [];
    let bCont = document.getElementById('banner-container');
    bCont.innerHTML = '';
    banners.forEach(b => {
        bCont.innerHTML += `<img src="${b.image}" class="banner-item">`;
    });
    
    // تحريك البنرات كل 5 ثواني
    let slideIndex = 0;
    setInterval(() => {
        if(banners.length > 0) {
            slideIndex = (slideIndex + 1) % banners.length;
            bCont.scrollTo({ left: slideIndex * bCont.clientWidth, behavior: 'smooth' });
        }
    }, 5000);

    // الأقسام
    let cats = JSON.parse(localStorage.getItem('categories')) || [];
    let cCont = document.getElementById('categories-container');
    cCont.innerHTML = '';
    cats.forEach(c => {
        cCont.innerHTML += `<div class="cat-item"><img src="${c.image}"><p style="font-size:12px; font-weight:bold; margin-top:5px;">${c.name}</p></div>`;
    });

    // المنتجات
    currentProducts = JSON.parse(localStorage.getItem('products')) || [];
    renderProducts(currentProducts);
    updateCartUI();
}

function renderProducts(productsArray) {
    let pCont = document.getElementById('products-container');
    pCont.innerHTML = '';
    productsArray.forEach(p => {
        pCont.innerHTML += `
            <div class="product-card" onclick="openProductDetails(${p.id})">
                <img src="${p.image}">
                <h4>${p.name}</h4>
                <div class="price">${Number(p.price).toLocaleString()} د.ع</div>
                <button class="btn-plus" onclick="event.stopPropagation(); addToCart(${p.id})">+</button>
            </div>
        `;
    });
}

// 5. نافذة تفاصيل المنتج
window.openProductDetails = function(id) {
    let p = currentProducts.find(x => x.id === id);
    document.getElementById('m-img').src = p.image;
    document.getElementById('m-title').innerText = p.name;
    document.getElementById('m-desc').innerText = p.desc;
    document.getElementById('m-price').innerText = Number(p.price).toLocaleString() + ' د.ع';
    document.getElementById('m-add-btn').onclick = () => { addToCart(p.id); document.getElementById('product-modal').style.display='none'; };
    document.getElementById('product-modal').style.display = 'flex';
};

// 6. السلة والطلبات
window.addToCart = function(id) {
    let p = currentProducts.find(x => x.id === id);
    let exist = cart.find(x => x.id === id);
    if(exist) exist.qty += 1;
    else cart.push({ ...p, qty: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    
    let badge = document.getElementById('cart-badge');
    badge.style.transform = 'scale(1.5)'; setTimeout(() => badge.style.transform = 'scale(1)', 200);
};

window.changeQty = function(id, amount) {
    let item = cart.find(x => x.id === id);
    item.qty += amount;
    if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
};

function updateCartUI() {
    let cList = document.getElementById('cart-items');
    cList.innerHTML = '';
    let total = 0;
    let qtyCount = 0;
    
    cart.forEach(c => {
        let itemTotal = c.price * c.qty;
        total += itemTotal;
        qtyCount += c.qty;
        cList.innerHTML += `
            <div class="cart-item">
                <img src="${c.image}">
                <div class="cart-info">
                    <h4 style="margin-bottom:5px;">${c.name}</h4>
                    <strong style="color:var(--primary);">${Number(itemTotal).toLocaleString()} د.ع</strong>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button class="qty-btn" onclick="changeQty(${c.id}, 1)">+</button>
                    <strong>${c.qty}</strong>
                    <button class="qty-btn" onclick="changeQty(${c.id}, -1)">-</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('cart-badge').innerText = qtyCount;
    document.getElementById('delivery-cost').innerText = Number(deliveryPrice).toLocaleString();
    let finalTotal = total > 0 ? total + deliveryPrice : 0;
    document.getElementById('total-cost').innerText = Number(finalTotal).toLocaleString();
}

// 7. إتمام الطلب (Checkout)
window.showCheckout = function() {
    if(cart.length === 0) return alert('السلة فارغة!');
    document.getElementById('checkout-fields').style.display = 'flex';
    // ملء الحقول تلقائياً من البروفايل
    document.getElementById('u-name').value = localStorage.getItem('userName') || '';
    document.getElementById('u-phone').value = localStorage.getItem('userPhone') || '';
    document.getElementById('u-address').value = localStorage.getItem('userAddress') || '';
};

window.sendOrder = function() {
    let name = document.getElementById('u-name').value;
    let phone = document.getElementById('u-phone').value;
    let address = document.getElementById('u-address').value;
    if(!name || !phone || !address) return alert('يرجى ملء كافة الحقول!');

    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + deliveryPrice;
    
    // حفظ الطلب في الأدمن
    let adminOrders = JSON.parse(localStorage.getItem('orders')) || [];
    adminOrders.push({ id: Date.now(), name, phone, address, items: cart, total, status: 'pending' });
    localStorage.setItem('orders', JSON.stringify(adminOrders));

    // رسالة الواتساب
    let msg = `*طلب جديد من تطبيق مناسف*\n\nالاسم: ${name}\nالرقم: ${phone}\nالعنوان: ${address}\n\n*الطلب:*\n`;
    cart.forEach(c => msg += `- ${c.qty}x ${c.name} (${Number(c.price * c.qty).toLocaleString()} د.ع)\n`);
    msg += `\nالتوصيل: ${Number(deliveryPrice).toLocaleString()} د.ع\n*الإجمالي: ${Number(total).toLocaleString()} د.ع*`;
    
    let whatsappUrl = `https://wa.me/964700000000?text=${encodeURIComponent(msg)}`; // ضع رقم هاتفك مكان الأصفار 964...
    window.open(whatsappUrl, '_blank');
    
    // تفريغ السلة
    cart = []; localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    document.getElementById('checkout-fields').style.display = 'none';
    switchPage('home', document.getElementById('btn-home'));
};

// 8. البروفايل والوضع الليلي
window.saveProfile = function() {
    localStorage.setItem('userName', document.getElementById('p-name').value);
    localStorage.setItem('userPhone', document.getElementById('p-phone').value);
    localStorage.setItem('userAddress', document.getElementById('p-address').value);
    alert('تم حفظ البيانات بنجاح!');
};

function loadProfile() {
    document.getElementById('p-name').value = localStorage.getItem('userName') || '';
    document.getElementById('p-phone').value = localStorage.getItem('userPhone') || '';
    document.getElementById('p-address').value = localStorage.getItem('userAddress') || '';
    
    if(localStorage.getItem('darkMode') === 'true') {
        document.getElementById('dark-toggle').checked = true;
        document.body.classList.add('dark-mode');
    }
}

window.toggleTheme = function() {
    let isDark = document.getElementById('dark-toggle').checked;
    if(isDark) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', isDark);
};
