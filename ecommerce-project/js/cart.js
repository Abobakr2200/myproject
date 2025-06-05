/**
 * وحدة إدارة سلة التسوق والطلبات
 * تتضمن وظائف إضافة المنتجات للسلة، تعديل الكميات، وإتمام عملية الشراء
 */

class CartManager {
    constructor() {
        this.cart = [];
        this.orders = [];
        this.loadCart();
        this.loadOrders();
        this.setupEventListeners();
    }

    /**
     * تحميل بيانات سلة التسوق من localStorage
     */
    loadCart() {
        const storedCart = localStorage.getItem('cart');
        this.cart = storedCart ? JSON.parse(storedCart) : [];
        this.updateCartCount();
    }

    /**
     * تحميل بيانات الطلبات من localStorage
     */
    loadOrders() {
        const storedOrders = localStorage.getItem('orders');
        this.orders = storedOrders ? JSON.parse(storedOrders) : [];
    }

    /**
     * حفظ بيانات سلة التسوق في localStorage
     */
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
    }

    /**
     * حفظ بيانات الطلبات في localStorage
     */
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    /**
     * إعداد مستمعي الأحداث لوظائف سلة التسوق والطلبات
     */
    setupEventListeners() {
        // عرض سلة التسوق
        document.getElementById('cartBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCartSection();
        });

        // إتمام الشراء
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (!window.authManager || !window.authManager.isLoggedIn()) {
                window.authManager.showNotification('يرجى تسجيل الدخول أولاً لإتمام عملية الشراء', 'error');
                window.authManager.showLoginForm();
                return;
            }
            this.showCheckoutSection();
        });

        // تأكيد الطلب
        document.getElementById('checkoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.placeOrder();
        });

        // العودة للتسوق بعد إتمام الطلب
        document.getElementById('backToShopBtn').addEventListener('click', () => {
            document.getElementById('orderConfirmationSection').style.display = 'none';
            if (window.productManager) {
                window.productManager.showProductsSection();
            }
        });
    }

    /**
     * تحديث عدد العناصر في سلة التسوق
     */
    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        const totalItems = this.cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    /**
     * عرض قسم سلة التسوق
     */
    showCartSection() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'block';
        
        this.displayCartItems();
    }

    /**
     * عرض قسم إتمام الطلب
     */
    showCheckoutSection() {
        if (this.cart.length === 0) {
            window.authManager.showNotification('سلة التسوق فارغة', 'error');
            return;
        }

        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'block';
    }

    /**
     * عرض عناصر سلة التسوق
     */
    displayCartItems() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="alert alert-info">سلة التسوق فارغة</div>';
            cartTotal.textContent = '0';
            return;
        }
        
        let total = 0;
        
        this.cart.forEach(item => {
            if (!window.productManager) return;
            
            const product = window.productManager.getProductById(item.productId);
            if (!product) return;
            
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item d-flex align-items-center py-3';
            cartItemElement.innerHTML = `
                <div class="flex-shrink-0">
                    <img src="${product.image}" alt="${product.name}" width="80" height="80" class="rounded">
                </div>
                <div class="flex-grow-1 ms-3">
                    <h5>${product.name}</h5>
                    <p class="text-muted mb-0">${product.price.toFixed(2)} ريال</p>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-product-id="${product.id}">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary increase-quantity" data-product-id="${product.id}">+</button>
                </div>
                <div class="ms-3 text-end">
                    <p class="fw-bold mb-0">${itemTotal.toFixed(2)} ريال</p>
                    <button class="btn btn-sm btn-danger remove-from-cart" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        cartTotal.textContent = total.toFixed(2);
        
        // إضافة مستمعي الأحداث لأزرار سلة التسوق
        this.setupCartButtonListeners();
    }

    /**
     * إعداد مستمعي الأحداث لأزرار سلة التسوق
     */
    setupCartButtonListeners() {
        // زيادة الكمية
        const increaseButtons = document.querySelectorAll('.increase-quantity');
        increaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                this.updateQuantity(productId, 1);
            });
        });
        
        // تقليل الكمية
        const decreaseButtons = document.querySelectorAll('.decrease-quantity');
        decreaseButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                this.updateQuantity(productId, -1);
            });
        });
        
        // إزالة من السلة
        const removeButtons = document.querySelectorAll('.remove-from-cart');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                this.removeFromCart(productId);
            });
        });
    }

    /**
     * إضافة منتج إلى سلة التسوق
     * @param {number} productId - معرف المنتج
     * @param {number} quantity - الكمية (افتراضياً 1)
     */
    addToCart(productId, quantity = 1) {
        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                productId,
                quantity
            });
        }
        
        this.saveCart();
        window.authManager.showNotification('تمت إضافة المنتج إلى السلة', 'success');
    }

    /**
     * تحديث كمية منتج في سلة التسوق
     * @param {number} productId - معرف المنتج
     * @param {number} change - التغيير في الكمية (موجب للزيادة، سالب للنقصان)
     */
    updateQuantity(productId, change) {
        const cartItem = this.cart.find(item => item.productId === productId);
        if (!cartItem) return;
        
        cartItem.quantity += change;
        
        if (cartItem.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.saveCart();
            this.displayCartItems();
        }
    }

    /**
     * إزالة منتج من سلة التسوق
     * @param {number} productId - معرف المنتج
     */
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveCart();
        this.displayCartItems();
        window.authManager.showNotification('تمت إزالة المنتج من السلة', 'success');
    }

    /**
     * إتمام الطلب وإنشاء طلب جديد
     */
    placeOrder() {
        if (!window.authManager || !window.authManager.isLoggedIn()) {
            window.authManager.showNotification('يرجى تسجيل الدخول أولاً لإتمام عملية الشراء', 'error');
            return;
        }
        
        if (this.cart.length === 0) {
            window.authManager.showNotification('سلة التسوق فارغة', 'error');
            return;
        }
        
        const shippingAddress = document.getElementById('shippingAddress').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        if (!shippingAddress || !paymentMethod) {
            window.authManager.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        // حساب إجمالي الطلب
        let total = 0;
        const orderItems = this.cart.map(item => {
            const product = window.productManager.getProductById(item.productId);
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            
            return {
                productId: item.productId,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                total: itemTotal
            };
        });
        
        // إنشاء الطلب الجديد
        const newOrder = {
            id: Date.now(),
            userId: window.authManager.getCurrentUser().username,
            userName: window.authManager.getCurrentUser().name,
            date: new Date().toISOString(),
            items: orderItems,
            total: total,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            status: 'pending' // قيد الانتظار
        };
        
        this.orders.push(newOrder);
        this.saveOrders();
        
        // إفراغ سلة التسوق
        this.cart = [];
        this.saveCart();
        
        // عرض تأكيد الطلب
        this.displayOrderConfirmation(newOrder);
    }

    /**
     * عرض تأكيد الطلب
     * @param {Object} order - بيانات الطلب
     */
    displayOrderConfirmation(order) {
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'block';
        
        document.getElementById('orderNumber').textContent = order.id;
        document.getElementById('orderTotal').textContent = order.total.toFixed(2);
        
        const orderDetailsContainer = document.getElementById('orderDetails');
        orderDetailsContainer.innerHTML = '';
        
        order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'd-flex justify-content-between mb-2';
            itemElement.innerHTML = `
                <div>
                    <h6>${item.productName}</h6>
                    <small class="text-muted">${item.price.toFixed(2)} ريال × ${item.quantity}</small>
                </div>
                <div>
                    <span class="fw-bold">${item.total.toFixed(2)} ريال</span>
                </div>
            `;
            
            orderDetailsContainer.appendChild(itemElement);
        });
        
        window.authManager.showNotification('تم تأكيد طلبك بنجاح!', 'success');
    }

    /**
     * تحديث حالة الطلب (للمشرف)
     * @param {number} orderId - معرف الطلب
     * @param {string} status - الحالة الجديدة
     */
    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        order.status = status;
        this.saveOrders();
        
        if (window.adminManager) {
            window.adminManager.displayOrders();
        }
        
        window.authManager.showNotification('تم تحديث حالة الطلب بنجاح', 'success');
    }

    /**
     * الحصول على جميع الطلبات
     * @returns {Array} - قائمة الطلبات
     */
    getAllOrders() {
        return [...this.orders];
    }

    /**
     * الحصول على طلبات مستخدم معين
     * @param {string} userId - معرف المستخدم
     * @returns {Array} - قائمة طلبات المستخدم
     */
    getUserOrders(userId) {
        return this.orders.filter(order => order.userId === userId);
    }

    /**
     * حساب إجمالي المبيعات
     * @returns {number} - إجمالي المبيعات
     */
    getTotalSales() {
        return this.orders.reduce((total, order) => total + order.total, 0);
    }
}

// إنشاء كائن من مدير سلة التسوق
const cartManager = new CartManager();

// تصدير الكائن للاستخدام في الملفات الأخرى
window.cartManager = cartManager;
