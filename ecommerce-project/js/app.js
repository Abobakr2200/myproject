/**
 * الملف الرئيسي للتطبيق
 * يقوم بتهيئة التطبيق وربط جميع الوحدات معاً
 */

// التأكد من تحميل جميع الوحدات
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة مدير المصادقة
    if (!window.authManager) {
        console.error('مدير المصادقة غير متاح');
    }
    
    // تهيئة مدير المنتجات
    if (!window.productManager) {
        console.error('مدير المنتجات غير متاح');
    }
    
    // تهيئة مدير سلة التسوق
    if (!window.cartManager) {
        console.error('مدير سلة التسوق غير متاح');
    }
    
    // تهيئة مدير لوحة التحكم
    if (!window.adminManager) {
        console.error('مدير لوحة التحكم غير متاح');
    }
    
    // إضافة وظيفة للحصول على عدد المستخدمين النشطين
    if (window.authManager) {
        window.authManager.getActiveUsersCount = function() {
            // في هذا المثال، نعتبر أن المستخدمين النشطين هم جميع المستخدمين المسجلين
            return this.users.length;
        };
    }
    
    // تهيئة صورة الصفحة الرئيسية
    const heroImage = document.getElementById('heroImage');
    if (heroImage) {
        heroImage.src = 'https://via.placeholder.com/600x400?text=متجر+إلكتروني';
    }
    
    // إضافة مستمعي الأحداث العامة
    setupGlobalEventListeners();
    
    console.log('تم تهيئة التطبيق بنجاح');
});

/**
 * إعداد مستمعي الأحداث العامة
 */
function setupGlobalEventListeners() {
    // العودة إلى الصفحة الرئيسية
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.addEventListener('click', function(e) {
            e.preventDefault();
            showHomeSection();
        });
    }
}

/**
 * عرض الصفحة الرئيسية
 */
function showHomeSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('productsSection').style.display = 'none';
    document.getElementById('cartSection').style.display = 'none';
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('orderConfirmationSection').style.display = 'none';
    document.getElementById('adminDashboardSection').style.display = 'none';
    document.getElementById('welcomeSection').style.display = 'block';
}

/**
 * التحقق من تكامل localStorage
 * هذه الوظيفة تتأكد من أن localStorage متاح ويعمل بشكل صحيح
 */
function checkLocalStorageIntegrity() {
    try {
        // التحقق من توفر localStorage
        if (typeof localStorage === 'undefined') {
            console.error('localStorage غير متاح في هذا المتصفح');
            return false;
        }
        
        // اختبار الكتابة والقراءة
        localStorage.setItem('test', 'test');
        const testValue = localStorage.getItem('test');
        localStorage.removeItem('test');
        
        if (testValue !== 'test') {
            console.error('فشل اختبار localStorage');
            return false;
        }
        
        // التحقق من وجود البيانات الأساسية
        const requiredKeys = ['users', 'products', 'cart', 'orders'];
        const missingKeys = requiredKeys.filter(key => localStorage.getItem(key) === null);
        
        if (missingKeys.length > 0) {
            console.warn('بعض بيانات localStorage مفقودة:', missingKeys);
            // لا نعتبر هذا خطأً، لأن البيانات قد تكون غير موجودة في أول استخدام
        }
        
        console.log('تم التحقق من تكامل localStorage بنجاح');
        return true;
    } catch (error) {
        console.error('حدث خطأ أثناء التحقق من localStorage:', error);
        return false;
    }
}

// تنفيذ التحقق من تكامل localStorage
checkLocalStorageIntegrity();
