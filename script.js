import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const CONFIG = {
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyD5AhcV4dky3MdBizPdrCkNHMb9_NF9Yko",
        authDomain: "lkhf-5a292.firebaseapp.com",
        projectId: "lkhf-5a292",
        storageBucket: "lkhf-5a292.firebasestorage.app",
        messagingSenderId: "722146610247",
        appId: "1:722146610247:web:b8583a37f0776acd4d3562",
        measurementId: "G-LWZKCMLESD"
    },
    COLLECTION_NAME: "products",
    ORDERS_COLLECTION: "orders"
};

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const db = getFirestore(app);

let cart = [];

// إخفاء الشاشة الترحيبية بعد 2.5 ثانية بسلاسة
window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.visibility = 'hidden', 800);
        }
    }, 2500); 
});

const loadProducts = () => {
    const q = query(collection(db, CONFIG.COLLECTION_NAME), orderBy("createdAt", "desc"));
    const container = document.getElementById('products-container');
    const loading = document.getElementById('loading');

    onSnapshot(q, (snapshot) => {
        loading.style.display = 'none';
        container.innerHTML = '';
        
        if(snapshot.empty) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--primary); padding: 40px; font-weight:bold; font-size:18px;">القائمة فارغة حالياً. سيتم إضافة ألذ الأصناف قريباً.</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const product = doc.data();
            const safeName = product.name.replace(/'/g, "\\'"); 
            
            container.innerHTML += `
                <div class="product-card">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-img">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">${product.price}$</p>
                    <button class="btn-add" onclick="window.addToCart('${doc.id}', '${safeName}', ${product.price}, '${product.imageUrl}', this)">
                        إضافة للطلب <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            `;
        });
    });
};

window.toggleCart = () => {
    const modal = document.getElementById('cart-overlay');
    modal.classList.toggle('active');
};

window.addToCart = (id, name, price, image, btn) => {
    cart.push({ id, name, price, image });
    updateCart();
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> تمت الإضافة';
    btn.style.background = '#f59e0b';
    btn.style.borderColor = '#f59e0b';
    btn.style.color = 'white';
    setTimeout(() => { btn.innerHTML = originalHTML; btn.style.background = ''; btn.style.borderColor = ''; btn.style.color = ''; }, 1000);
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCart();
};

function updateCart() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    let total = 0;
    cartItems.innerHTML = '';
    
    if(cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align:center; color:var(--primary); margin-top:20px; font-weight:bold;">سلة الطلبات فارغة</div>';
    } else {
        cart.forEach((item, index) => {
            total += parseFloat(item.price);
            cartItems.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" style="width:60px; height:60px; border-radius:12px; object-fit:cover; margin-left:15px; border:2px solid #bae6fd;">
                    <div class="item-info">
                        <div class="item-title">${item.name}</div>
                        <div class="item-price">${item.price}$</div>
                    </div>
                    <button class="remove-item" onclick="window.removeFromCart(${index})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        });
    }
    document.getElementById('total-price').innerText = total.toFixed(2);
}

document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if(cart.length === 0) { alert("يرجى اختيار الوجبات للسلة أولاً!"); return; }

    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إرسال الطلب...';

    try {
        await addDoc(collection(db, CONFIG.ORDERS_COLLECTION), {
            orderNumber: 'MN-' + Math.floor(Math.random() * 10000),
            customerName: document.getElementById('cus-name').value,
            customerPhone: document.getElementById('cus-phone').value,
            customerAddress: document.getElementById('cus-address').value,
            items: cart,
            totalPrice: document.getElementById('total-price').innerText,
            createdAt: serverTimestamp()
        });
        
        alert("بالعافية مقدماً! تم استلام طلبك بنجاح وسنتواصل معك للتوصيل.");
        cart = [];
        updateCart();
        window.toggleCart();
        this.reset();
    } catch (error) {
        alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
        console.error(error);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "تأكيد وإرسال الطلب";
    }
});

window.onload = loadProducts;
