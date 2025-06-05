/**
 * وحدة لوحة تحكم المشرف
 * تتضمن وظائف عرض مؤشرات الأداء وإدارة الطلبات
 */

class AdminManager {
    constructor() {
        this.setupEventListeners();
    }

    /**
     * إعداد مستمعي الأحداث للوحة التحكم
     */
    setupEventListeners() {
        // عرض لوحة التحكم
        document.getElementById('adminDashboardLink').addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!window.authManager || !window.authManager.isAdmin()) {
                window.authManager.showNotification('غير مصرح لك بالوصول إلى لوحة التحكم', 'error');
                return;
            }
            
            this.showAdminDashboard();
        });
    }

    /**
     * عرض لوحة تحكم المشرف
     */
    showAdminDashboard() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';
        
        this.updateDashboardStats();
        this.displayOrders();
    }

    /**
     * تحديث إحصائيات لوحة التحكم
     */
    updateDashboardStats() {
        // عدد المنتجات
        const totalProducts = window.productManager ? window.productManager.getAllProducts().length : 0;
        document.getElementById('totalProducts').textContent = totalProducts;
        
        // عدد الطلبات
        const totalOrders = window.cartManager ? window.cartManager.getAllOrders().length : 0;
        document.getElementById('totalOrders').textContent = totalOrders;
        
        // إجمالي المبيعات
        const totalSales = window.cartManager ? window.cartManager.getTotalSales() : 0;
        document.getElementById('totalSales').textContent = totalSales.toFixed(2);
        
        // عدد المستخدمين النشطين
        const activeUsers = window.authManager ? window.authManager.getActiveUsersCount() : 0;
        document.getElementById('activeUsers').textContent = activeUsers;
    }

    /**
     * عرض قائمة الطلبات في لوحة التحكم
     */
    displayOrders() {
        const ordersListContainer = document.getElementById('ordersList');
        ordersListContainer.innerHTML = '';
        
        if (!window.cartManager) return;
        
        const orders = window.cartManager.getAllOrders();
        
        if (orders.length === 0) {
            ordersListContainer.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد طلبات</td></tr>';
            return;
        }
        
        // ترتيب الطلبات من الأحدث إلى الأقدم
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        orders.forEach(order => {
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
                <td>${order.userName}</td>
                <td>${formattedDate}</td>
                <td>${order.total.toFixed(2)} جنيها</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            تحديث الحالة
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item update-status" href="#" data-order-id="${order.id}" data-status="pending">قيد الانتظار</a></li>
                            <li><a class="dropdown-item update-status" href="#" data-order-id="${order.id}" data-status="shipped">تم الشحن</a></li>
                            <li><a class="dropdown-item update-status" href="#" data-order-id="${order.id}" data-status="delivered">تم التوصيل</a></li>
                            <li><a class="dropdown-item update-status" href="#" data-order-id="${order.id}" data-status="cancelled">إلغاء</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-info view-order-details" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            ordersListContainer.appendChild(orderRow);
        });
        
        // إضافة مستمعي الأحداث لأزرار تحديث الحالة
        this.setupOrderButtonListeners();
    }

    /**
     * إعداد مستمعي الأحداث لأزرار الطلبات
     */
    setupOrderButtonListeners() {
        // أزرار تحديث حالة الطلب
        const statusButtons = document.querySelectorAll('.update-status');
        statusButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                const status = e.currentTarget.getAttribute('data-status');
                
                if (window.cartManager) {
                    window.cartManager.updateOrderStatus(orderId, status);
                }
            });
        });
        
        // أزرار عرض تفاصيل الطلب
        const viewDetailsButtons = document.querySelectorAll('.view-order-details');
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'));
                this.showOrderDetails(orderId);
            });
        });
    }

    /**
     * عرض تفاصيل الطلب
     * @param {number} orderId - معرف الطلب
     */
    showOrderDetails(orderId) {
        if (!window.cartManager) return;
        
        const orders = window.cartManager.getAllOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return;
        
        // إنشاء نافذة منبثقة لعرض التفاصيل
        const modalHtml = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">تفاصيل الطلب #${order.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>المستخدم:</strong> ${order.userName}</p>
                                    <p><strong>التاريخ:</strong> ${new Date(order.date).toLocaleString()}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>العنوان:</strong> ${order.shippingAddress}</p>
                                    <p><strong>طريقة الدفع:</strong> ${this.getPaymentMethodText(order.paymentMethod)}</p>
                                </div>
                            </div>
                            <h6>المنتجات:</h6>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>السعر</th>
                                        <th>الكمية</th>
                                        <th>المجموع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.items.map(item => `
                                        <tr>
                                            <td>${item.productName}</td>
                                            <td>${item.price.toFixed(2)} جنيها  </td>
                                            <td>${item.quantity}</td>
                                            <td>${item.total.toFixed(2)} جنيها</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colspan="3" class="text-end">الإجمالي:</th>
                                        <th>${order.total.toFixed(2)} جنيها</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النافذة المنبثقة إلى الصفحة
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // عرض النافذة المنبثقة
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
        
        // إزالة النافذة المنبثقة من DOM عند إغلاقها
        document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modalContainer);
        });
    }

    /**
     * الحصول على النص المقابل لطريقة الدفع
     * @param {string} method - رمز طريقة الدفع
     * @returns {string} - النص المقابل
     */
    getPaymentMethodText(method) {
        switch (method) {
            case 'creditCard':
                return 'بطاقة ائتمان';
            case 'paypal':
                return 'PayPal';
            case 'cashOnDelivery':
                return 'الدفع عند الاستلام';
            default:
                return method;
        }
    }
}

// إنشاء كائن من مدير لوحة التحكم
const adminManager = new AdminManager();

// تصدير الكائن للاستخدام في الملفات الأخرى
window.adminManager = adminManager;
