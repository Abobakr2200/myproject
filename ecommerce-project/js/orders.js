/**
 * وحدة إدارة الطلبات
 * تتضمن وظائف عرض وإدارة الطلبات
 */

class OrderManager {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * إعداد مستمعي الأحداث لوظائف إدارة الطلبات
     */
    setupEventListeners() {
        // يتم تنفيذ معظم مستمعي الأحداث في وحدة سلة التسوق (cart.js)
        // هذه الوحدة تكميلية لتنظيم الكود بشكل أفضل
    }

    /**
     * عرض تفاصيل الطلب للمستخدم
     * @param {number} orderId - معرف الطلب
     */
    showUserOrderDetails(orderId) {
        if (!window.cartManager) return;
        
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const userOrders = window.cartManager.getUserOrders(currentUser.username);
        const order = userOrders.find(o => o.id === orderId);
        
        if (!order) return;
        
        // عرض تفاصيل الطلب (يمكن استخدام نفس المنطق الموجود في adminManager)
        if (window.adminManager) {
            window.adminManager.showOrderDetails(orderId);
        }
    }

    /**
     * عرض قائمة طلبات المستخدم الحالي
     */
    showUserOrders() {
        if (!window.cartManager || !window.authManager) return;
        
        const currentUser = window.authManager.getCurrentUser();
        if (!currentUser) {
            window.authManager.showNotification('يرجى تسجيل الدخول أولاً لعرض طلباتك', 'error');
            return;
        }
        
        const userOrders = window.cartManager.getUserOrders(currentUser.username);
        
        // إنشاء قسم لعرض طلبات المستخدم
        const userOrdersSection = document.createElement('div');
        userOrdersSection.id = 'userOrdersSection';
        userOrdersSection.className = 'container mt-4';
        userOrdersSection.innerHTML = `
            <h2>طلباتي</h2>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>رقم الطلب</th>
                            <th>التاريخ</th>
                            <th>المجموع</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="userOrdersList"></tbody>
                </table>
            </div>
            <button class="btn btn-primary" id="backToShopFromOrders">العودة للتسوق</button>
        `;
        
        // إضافة القسم إلى الصفحة
        document.body.appendChild(userOrdersSection);
        
        // إخفاء الأقسام الأخرى
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'none';
        userOrdersSection.style.display = 'block';
        
        // ملء جدول الطلبات
        const userOrdersList = document.getElementById('userOrdersList');
        
        if (userOrders.length === 0) {
            userOrdersList.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد طلبات</td></tr>';
        } else {
            // ترتيب الطلبات من الأحدث إلى الأقدم
            userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            userOrders.forEach(order => {
                const orderRow = document.createElement('tr');
                
                // تنسيق التاريخ
                const orderDate = new Date(order.date);
                const formattedDate = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
                
                // تحديد لون حالة الطلب
                let statusClass = '';
                let statusText = '';
                
                switch (order.status) {
                    case 'pending':
                        statusClass = 'bg-warning';
                        statusText = 'قيد الانتظار';
                        break;
                    case 'shipped':
                        statusClass = 'bg-info';
                        statusText = 'تم الشحن';
                        break;
                    case 'delivered':
                        statusClass = 'bg-success';
                        statusText = 'تم التوصيل';
                        break;
                    case 'cancelled':
                        statusClass = 'bg-danger';
                        statusText = 'ملغي';
                        break;
                }
                
                orderRow.innerHTML = `
                    <td>${order.id}</td>
                    <td>${formattedDate}</td>
                    <td>${order.total.toFixed(2)} ريال</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-user-order-details" data-order-id="${order.id}">
                            <i class="fas fa-eye"></i> عرض التفاصيل
                        </button>
                    </td>
                `;
                
                userOrdersList.appendChild(orderRow);
            });
        }
        
        // إضافة مستمع حدث لزر العودة للتسوق
        document.getElementById('backToShopFromOrders').addEventListener('click', () => {
            userOrdersSection.remove();
            if (window.productManager) {
                window.productManager.showProductsSection();
            }
        });
        
        // إضافة مستمعي أحداث لأزرار عرض التفاصيل
        const viewDetailsButtons = document.querySelectorAll('.view-user-order-details');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.showUserOrderDetails(orderId);
            });
        });
    }
}

// إنشاء كائن من مدير الطلبات
const orderManager = new OrderManager();

// تصدير الكائن للاستخدام في الملفات الأخرى
window.orderManager = orderManager;
