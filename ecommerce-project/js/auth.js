/**
 * وحدة المصادقة وإدارة المستخدمين
 * تتضمن وظائف تسجيل المستخدمين، تسجيل الدخول والخروج، والتحقق من صلاحيات المستخدم
 */

class AuthManager {
    constructor() {
        this.users = [];
        this.currentUser = null;
        this.loadUsers();
        this.setupEventListeners();
        this.checkLoggedInUser();
    }

    /**
     * تحميل بيانات المستخدمين من localStorage
     */
    loadUsers() {
        const storedUsers = localStorage.getItem('users');
        this.users = storedUsers ? JSON.parse(storedUsers) : [];
        
        // إنشاء حساب مشرف افتراضي إذا لم يكن موجوداً
        if (!this.users.some(user => user.isAdmin)) {
            this.users.push({
                name: 'مشرف النظام',
                email: 'admin@example.com',
                username: 'admin',
                password: 'admin123',
                isAdmin: true
            });
            this.saveUsers();
        }
    }

    /**
     * حفظ بيانات المستخدمين في localStorage
     */
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    /**
     * إعداد مستمعي الأحداث لنماذج تسجيل الدخول وإنشاء الحساب
     */
    setupEventListeners() {
        // أزرار التنقل بين نماذج تسجيل الدخول وإنشاء الحساب
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginForm());
        document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // نموذج تسجيل الدخول
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // نموذج إنشاء حساب
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // زر تسجيل الخروج
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    /**
     * التحقق من وجود مستخدم مسجل دخوله
     */
    checkLoggedInUser() {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateUIForLoggedInUser();
        }
    }

    /**
     * عرض نموذج تسجيل الدخول
     */
    showLoginForm() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'block';
    }

    /**
     * عرض نموذج إنشاء حساب
     */
    showRegisterForm() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'block';
    }

    /**
     * تسجيل الدخول
     */
    login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        // البحث عن المستخدم بواسطة اسم المستخدم أو البريد الإلكتروني
        const user = this.users.find(u => 
            (u.username === username || u.email === username) && u.password === password
        );

        if (user) {
            // تخزين بيانات المستخدم الحالي (باستثناء كلمة المرور)
            const { password, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            
            this.updateUIForLoggedInUser();
            this.showNotification('تم تسجيل الدخول بنجاح!', 'success');
            
            // إعادة توجيه المستخدم إلى الصفحة الرئيسية أو صفحة المنتجات
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('welcomeSection').style.display = 'block';
        } else {
            this.showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        }
    }

    /**
     * إنشاء حساب جديد
     */
    register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // التحقق من تطابق كلمتي المرور
        if (password !== confirmPassword) {
            this.showNotification('كلمتا المرور غير متطابقتين', 'error');
            return;
        }

        // التحقق من عدم وجود مستخدم بنفس اسم المستخدم أو البريد الإلكتروني
        if (this.users.some(u => u.username === username)) {
            this.showNotification('اسم المستخدم مستخدم بالفعل', 'error');
            return;
        }

        if (this.users.some(u => u.email === email)) {
            this.showNotification('البريد الإلكتروني مستخدم بالفعل', 'error');
            return;
        }

        // إنشاء المستخدم الجديد
        const newUser = {
            name,
            email,
            username,
            password,
            isAdmin: false
        };

        this.users.push(newUser);
        this.saveUsers();

        // تسجيل دخول المستخدم الجديد تلقائياً
        const { password: pwd, ...userWithoutPassword } = newUser;
        this.currentUser = userWithoutPassword;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        this.updateUIForLoggedInUser();
        this.showNotification('تم إنشاء الحساب بنجاح!', 'success');

        // إعادة توجيه المستخدم إلى الصفحة الرئيسية
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('welcomeSection').style.display = 'block';
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // تحديث واجهة المستخدم
        document.getElementById('userProfileSection').style.display = 'none';
        document.getElementById('userAuthSection').style.display = 'block';
        
        // إخفاء عناصر المشرف
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => el.style.display = 'none');
        
        this.showNotification('تم تسجيل الخروج بنجاح', 'success');
        
        // إعادة توجيه المستخدم إلى الصفحة الرئيسية
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('welcomeSection').style.display = 'block';
    }

    /**
     * تحديث واجهة المستخدم بعد تسجيل الدخول
     */
    updateUIForLoggedInUser() {
        if (this.currentUser) {
            // إظهار قسم الملف الشخصي وإخفاء أزرار تسجيل الدخول/التسجيل
            document.getElementById('userAuthSection').style.display = 'none';
            document.getElementById('userProfileSection').style.display = 'block';
            document.getElementById('welcomeUser').textContent = `مرحباً، ${this.currentUser.name}`;
            
            // إظهار عناصر المشرف إذا كان المستخدم مشرفاً
            if (this.currentUser.isAdmin) {
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => el.style.display = 'block');
            }
        }
    }

    /**
     * عرض إشعار للمستخدم
     * @param {string} message - نص الإشعار
     * @param {string} type - نوع الإشعار (success أو error)
     */
    showNotification(message, type) {
        // إزالة أي إشعارات سابقة
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // إضافة الإشعار إلى الصفحة
        document.body.appendChild(notification);
        
        // إخفاء الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * التحقق مما إذا كان المستخدم مسجل دخوله
     * @returns {boolean} - حالة تسجيل دخول المستخدم
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * التحقق مما إذا كان المستخدم الحالي مشرفاً
     * @returns {boolean} - حالة صلاحيات المشرف للمستخدم
     */
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin;
    }

    /**
     * الحصول على معلومات المستخدم الحالي
     * @returns {Object|null} - بيانات المستخدم الحالي
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// إنشاء كائن من مدير المصادقة
const authManager = new AuthManager();

// تصدير الكائن للاستخدام في الملفات الأخرى
window.authManager = authManager;
