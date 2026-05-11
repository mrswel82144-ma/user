// بيانات المنتجات الوهمية للتجربة
const products = [
    { id: 1, name: 'منسف لحم بلدي', desc: 'لحم بلدي طازج مع الجميد الكركي', price: 15.00, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500' },
    { id: 2, name: 'منسف دجاج', desc: 'دجاج محمر مع الأرز واللوز', price: 8.00, image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=500' },
    { id: 3, name: 'رأس خروف إضافي', desc: 'رأس محمر متبل', price: 5.00, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500' }
];

let cart = [];

// 1. التبديل بين التبويبات (Navigation)
function switchTab(tabId, element) {
    // إخفاء كل المحتوى
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    // إزالة التفعيل من كل الأزرار السفلية
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    
    // إظهار القسم المطلوب وتفعيل الزر
    document.getElementById(tabId + '-tab').classList.add('active');
    element.classList.add('active');
}

// 2. عرض المنتجات في الصفحة الرئيسية
function renderProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>${p.desc}</p>
                <span class="price">${p.price} د.أ</span>
                <button class="add-btn" onclick="addToCart(${p.id})">أضف للسلة</button>
            </div>
        `;
    });
}

// 3. إضافة منتج للسلة
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);
    
    if(existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    
    // تنبيه بصري خفيف
    const badge = document.getElementById('cart-badge');
    badge.style.transform = 'scale(1.5)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
}

// 4. تحديث واجهة السلة (الرقم الإجمالي، المنتجات، والسعر)
function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-badge');
    const totalPriceEl = document.getElementById('cart-total-price');
    
    let totalQty = 0;
    let totalPrice = 0;
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart" style="text-align:center; padding:20px;">السلة فارغة حالياً</p>';
    } else {
        cart.forEach((item, index) => {
            totalQty += item.qty;
            totalPrice += (item.price * item.qty);
            
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-info">
                        <h4>${item.name}</h4>
                        <span class="price">${item.price} د.أ</span>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
    }
    
    badge.innerText = totalQty;
    totalPriceEl.innerText = totalPrice.toFixed(2) + ' د.أ';
}

// 5. تعديل الكمية وحذف العناصر
function changeQty(index, amount) {
    cart[index].qty += amount;
    if (cart[index].qty <= 0) {
        removeItem(index);
    } else {
        updateCartUI();
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// 6. إرسال الطلب عبر الواتساب (WhatsApp Checkout)
function checkoutWhatsApp() {
    if (cart.length === 0) {
        alert("السلة فارغة! يرجى إضافة منتجات أولاً.");
        return;
    }

    let message = "*مرحباً، أود إتمام طلب جديد من تطبيق مناسف:*\n\n";
    let total = 0;

    cart.forEach(item => {
        let itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `▪️ ${item.name} (الكمية: ${item.qty}) - ${itemTotal} د.أ\n`;
    });

    message += `\n*الإجمالي الكلي:* ${total.toFixed(2)} د.أ\n`;
    message += `يرجى تزويدي بتفاصيل الدفع وموعد التوصيل. شكراً لك!`;

    // استبدل الرقم برقم الواتساب الخاص بالمتجر (مع رمز الدولة، مثلا 962 للأردن)
    const phoneNumber = "962790000000"; 
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// تهيئة التطبيق عند التحميل
window.onload = () => {
    renderProducts();
};
