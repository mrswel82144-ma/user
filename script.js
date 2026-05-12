import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD5AhcV4dky3MdBizPdrCkNHMb9_NF9Yko",
    authDomain: "lkhf-5a292.firebaseapp.com",
    projectId: "lkhf-5a292",
    storageBucket: "lkhf-5a292.firebasestorage.app",
    messagingSenderId: "722146610247",
    appId: "1:722146610247:web:b8583a37f0776acd4d3562",
    measurementId: "G-LWZKCMLESD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let deliveryPrice = 0;

window.onload = () => {
    setTimeout(() => {
        let splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => splash.style.display = 'none', 800);
        loadProfile();
        updateCartUI();
    }, 2500);
};

onSnapshot(collection(db, 'banners'), (snap) => {
    let bCont = document.getElementById('banner-container');
    bCont.innerHTML = '';
    snap.forEach(docSnap => { bCont.innerHTML += `<img src="${docSnap.data().image}" class="banner-item">`; });
});

let bCont = document.getElementById('banner-container');
let slideIndex = 0;
setInterval(() => {
    if(bCont.children.length > 0) {
        slideIndex = (slideIndex + 1) % bCont.children.length;
        bCont.scrollTo({ left: slideIndex * bCont.clientWidth, behavior: 'smooth' });
    }
}, 5000);

onSnapshot(collection(db, 'categories'), (snap) => {
    let cCont = document.getElementById('categories-container');
    cCont.innerHTML = '';
    snap.forEach(docSnap => {
        let c = docSnap.data();
        cCont.innerHTML += `<div class="cat-item"><img src="${c.image}"><p style="font-size:12px; font-weight:bold; margin-top:5px;">${c.name}</p></div>`;
    });
});

onSnapshot(collection(db, 'products'), (snap) => {
    currentProducts = [];
    snap.forEach(docSnap => { currentProducts.push({ id: docSnap.id, ...docSnap.data() }); });
    renderProducts(currentProducts);
});

onSnapshot(doc(db, 'settings', 'delivery'), (docSnap) => {
    if(docSnap.exists()) {
        deliveryPrice = docSnap.data().price || 0;
        updateCartUI();
    }
});

function renderProducts(productsArray) {
    let pCont = document.getElementById('products-container');
    pCont.innerHTML = '';
    productsArray.forEach(p => {
        pCont.innerHTML += `
            <div class="product-card" onclick="openProductDetails('${p.id}')">
                <img src="${p.image}">
                <h4>${p.name}</h4>
                <div class="price">${Number(p.price).toLocaleString()} د.ع</div>
                <button class="btn-plus" onclick="event.stopPropagation(); addToCart('${p.id}')">+</button>
            </div>
        `;
    });
}

window.switchPage = function(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId + '-page').classList.add('active');
    btn.classList.add('active');
};

window.toggleSearch = function() { document.getElementById('search-box').classList.toggle('active'); };
window.searchProducts = function(val) { renderProducts(currentProducts.filter(p => p.name.includes(val))); };

window.openProductDetails = function(id) {
    let p = currentProducts.find(x => x.id === id);
    if(p) {
        document.getElementById('m-img').src = p.image;
        document.getElementById('m-title').innerText = p.name;
        document.getElementById('m-desc').innerText = p.desc;
        document.getElementById('m-price').innerText = Number(p.price).toLocaleString() + ' د.ع';
        document.getElementById('m-add-btn').onclick = () => { addToCart(p.id); document.getElementById('product-modal').style.display='none'; };
        document.getElementById('product-modal').style.display = 'flex';
    }
};

window.addToCart = function(id) {
    let p = currentProducts.find(x => x.id === id);
    let exist = cart.find(x => x.id === id);
    if(exist) exist.qty += 1; else cart.push({ ...p, qty: 1 });
    
    localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI();
    
    let badge = document.getElementById('cart-badge');
    badge.style.transform = 'scale(1.5)'; setTimeout(() => badge.style.transform = 'scale(1)', 200);
};

window.changeQty = function(id, amount) {
    let item = cart.find(x => x.id === id);
    item.qty += amount;
    if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart)); updateCartUI();
};

function updateCartUI() {
    let cList = document.getElementById('cart-items');
    cList.innerHTML = '';
    let total = 0; let qtyCount = 0;
    
    cart.forEach(c => {
        let itemTotal = c.price * c.qty; total += itemTotal; qtyCount += c.qty;
        cList.innerHTML += `
            <div class="cart-item">
                <img src="${c.image}">
                <div class="cart-info">
                    <h4 style="margin-bottom:5px;">${c.name}</h4>
                    <strong style="color:var(--primary);">${Number(itemTotal).toLocaleString()} د.ع</strong>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button class="qty-btn" onclick="changeQty('${c.id}', 1)">+</button>
                    <strong>${c.qty}</strong>
                    <button class="qty-btn" onclick="changeQty('${c.id}', -1)">-</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('cart-badge').innerText = qtyCount;
    document.getElementById('delivery-cost').innerText = Number(deliveryPrice).toLocaleString();
    document.getElementById('total-cost').innerText = Number(total > 0 ? total + deliveryPrice : 0).toLocaleString();
}

window.showCheckout = function() {
    if(cart.length === 0) return alert('السلة فارغة!');
    document.getElementById('checkout-fields').style.display = 'flex';
    document.getElementById('u-name').value = localStorage.getItem('userName') || '';
    document.getElementById('u-phone').value = localStorage.getItem('userPhone') || '';
    document.getElementById('u-address').value = localStorage.getItem('userAddress') || '';
};

// تعديل دالة الإرسال - فقط تحفظ في القاعدة وتظهر إشعار
window.sendOrder = async function() {
    let name = document.getElementById('u-name').value;
    let phone = document.getElementById('u-phone').value;
    let address = document.getElementById('u-address').value;
    if(!name || !phone || !address) return alert('يرجى ملء كافة الحقول!');

    let total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + deliveryPrice;
    
    await addDoc(collection(db, 'orders'), {
        name, phone, address, items: cart, total, status: 'pending', createdAt: Date.now()
    });

    alert('تم ارسال الطلب الى قسم الادارة بنجاح!');
    
    cart = []; localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    document.getElementById('checkout-fields').style.display = 'none';
    switchPage('home', document.getElementById('btn-home'));
};

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
        document.getElementById('dark-toggle').checked = true; document.body.classList.add('dark-mode');
    }
}

window.toggleTheme = function() {
    let isDark = document.getElementById('dark-toggle').checked;
    if(isDark) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', isDark);
};

// ================= إعدادات PWA =================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwa-modal').style.display = 'flex';
});

window.installPWA = async function() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        document.getElementById('pwa-modal').style.display = 'none';
    }
};

window.skipPWA = function() {
    document.getElementById('pwa-modal').style.display = 'none';
};

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Registration Failed', err));
    });
}
