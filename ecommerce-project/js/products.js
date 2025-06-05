/**
 * وحدة إدارة المنتجات
 * تتضمن وظائف إضافة وتعديل وحذف المنتجات، وعرضها وتصفيتها
 */

class ProductManager {
    constructor() {
        this.products = [];
        this.loadProducts();
        this.setupEventListeners();
        this.productModal = new bootstrap.Modal(document.getElementById('productModal'));
    }

    /**
     * تحميل بيانات المنتجات من localStorage
     */
    loadProducts() {
        const storedProducts = localStorage.getItem('products');
        this.products = storedProducts ? JSON.parse(storedProducts) : [];
        
        // إضافة بعض المنتجات الافتراضية إذا لم تكن هناك منتجات
        if (this.products.length === 0) {
            this.products = [
                {
                    id: 1,
                    name: 'هاتف ذكي',
                    price: 1999.99,
                    description: 'هاتف ذكي حديث بمواصفات عالية وكاميرا متطورة',
                    category: 'إلكترونيات',
                    image: 'https://via.placeholder.com/300x200?text=هاتف+ذكي'
                },
                {
                    id: 2,
                    name: 'حاسوب محمول',
                    price: 3499.99,
                    description: 'حاسوب محمول خفيف الوزن مع معالج قوي وبطارية طويلة الأمد',
                    category: 'إلكترونيات',
                    image: 'https://via.placeholder.com/300x200?text=حاسوب+محمول'
                },
                {
                    id: 3,
                    name: 'سماعات لاسلكية',
                    price: 499.99,
                    description: 'سماعات لاسلكية بجودة صوت عالية وعزل للضوضاء',
                    category: 'إلكترونيات',
                    image: 'https://via.placeholder.com/300x200?text=سماعات+لاسلكية'
                },
                {
                    id: 4,
                    name: 'قميص رجالي',
                    price: 149.99,
                    description: 'قميص رجالي أنيق مناسب للمناسبات الرسمية',
                    category: 'ملابس',
                    image: 'https://via.placeholder.com/300x200?text=قميص+رجالي'
                },
                {
                    id: 5,
                    name: 'حذاء رياضي',
                    price: 299.99,
                    description: 'حذاء رياضي مريح مناسب للجري والتمارين الرياضية',
                    category: 'أحذية',
                    image: 'https://via.placeholder.com/300x200?text=حذاء+رياضي'
                }
            ];
            this.saveProducts();
        }
    }

    /**
     * حفظ بيانات المنتجات في localStorage
     */
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    /**
     * إعداد مستمعي الأحداث لوظائف إدارة المنتجات
     */
    setupEventListeners() {
        // عرض صفحة المنتجات
        document.getElementById('productsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProductsSection();
        });
        
        document.getElementById('shopNowBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showProductsSection();
        });

        // إضافة منتج جديد
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showAddProductForm();
        });

        // حفظ المنتج (إضافة أو تعديل)
        document.getElementById('saveProductBtn').addEventListener('click', () => {
            this.saveProduct();
        });

        // البحث والتصفية
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.filterProducts();
        });
        
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.filterProducts();
            }
        });
        
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterProducts();
        });
        
        document.getElementById('priceSort').addEventListener('change', () => {
            this.filterProducts();
        });
    }

    /**
     * عرض قسم المنتجات
     */
    showProductsSection() {
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'none';
        document.getElementById('cartSection').style.display = 'none';
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('orderConfirmationSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'none';
        document.getElementById('productsSection').style.display = 'block';
        
        this.displayProducts();
        this.populateCategoryFilter();
    }

    /**
     * عرض المنتجات في الصفحة
     * @param {Array} filteredProducts - قائمة المنتجات المفلترة (اختياري)
     */
    displayProducts(filteredProducts = null) {
        const productsToDisplay = filteredProducts || this.products;
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        if (productsToDisplay.length === 0) {
            productsList.innerHTML = '<div class="col-12"><div class="alert alert-info">لا توجد منتجات متاحة</div></div>';
            return;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 col-sm-6';
            productCard.innerHTML = `
                <div class="card product-card">
                    <img src="${product.image}" class="card-img-top product-image" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-truncate">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary fw-bold">${product.price.toFixed(2)} جنيها</span>
                            <span class="badge bg-secondary">${product.category}</span>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                                <i class="fas fa-cart-plus"></i> إضافة للسلة
                            </button>
                            ${window.authManager && window.authManager.isAdmin() ? `
                                <button class="btn btn-outline-secondary edit-product-btn" data-product-id="${product.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger delete-product-btn" data-product-id="${product.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            productsList.appendChild(productCard);
        });

        // إضافة مستمعي الأحداث لأزرار المنتجات
        this.setupProductButtonListeners();
    }

    /**
     * إعداد مستمعي الأحداث لأزرار المنتجات
     */
    setupProductButtonListeners() {
        // أزرار إضافة للسلة
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                if (window.cartManager) {
                    window.cartManager.addToCart(productId);
                } else {
                    console.error('Cart manager not initialized');
                }
            });
        });

        // أزرار تعديل المنتج (للمشرف فقط)
        const editButtons = document.querySelectorAll('.edit-product-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                this.showEditProductForm(productId);
            });
        });

        // أزرار حذف المنتج (للمشرف فقط)
        const deleteButtons = document.querySelectorAll('.delete-product-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.getAttribute('data-product-id'));
                this.deleteProduct(productId);
            });
        });
    }

    /**
     * ملء قائمة تصفية الفئات
     */
    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        // الاحتفاظ بخيار "جميع الفئات"
        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
        
        // استخراج الفئات الفريدة من المنتجات
        const categories = [...new Set(this.products.map(product => product.category))];
        
        // إضافة خيارات الفئات
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * تصفية المنتجات حسب معايير البحث
     */
    filterProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const priceSort = document.getElementById('priceSort').value;
        
        // تصفية المنتجات حسب النص والفئة
        let filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                 product.description.toLowerCase().includes(searchTerm);
            const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        // ترتيب المنتجات حسب السعر
        if (priceSort === 'lowToHigh') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'highToLow') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
        
        // عرض المنتجات المفلترة
        this.displayProducts(filteredProducts);
    }

    /**
     * عرض نموذج إضافة منتج جديد
     */
    showAddProductForm() {
        // إعادة تعيين النموذج
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
        
        // عرض النموذج
        this.productModal.show();
    }

    /**
     * عرض نموذج تعديل منتج
     * @param {number} productId - معرف المنتج المراد تعديله
     */
    showEditProductForm(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // ملء النموذج ببيانات المنتج
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        
        document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
        
        // عرض النموذج
        this.productModal.show();
    }

    /**
     * حفظ المنتج (إضافة جديد أو تحديث موجود)
     */
    saveProduct() {
        const productId = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const description = document.getElementById('productDescription').value;
        const category = document.getElementById('productCategory').value;
        const image = document.getElementById('productImage').value || 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(name);
        
        if (!name || isNaN(price) || !description || !category) {
            if (window.authManager) {
                window.authManager.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            }
            return;
        }
        
        if (productId) {
            // تحديث منتج موجود
            const index = this.products.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                this.products[index] = {
                    ...this.products[index],
                    name,
                    price,
                    description,
                    category,
                    image
                };
                
                if (window.authManager) {
                    window.authManager.showNotification('تم تحديث المنتج بنجاح', 'success');
                }
            }
        } else {
            // إضافة منتج جديد
            const newProduct = {
                id: Date.now(), // استخدام الطابع الزمني كمعرف فريد
                name,
                price,
                description,
                category,
                image
            };
            
            this.products.push(newProduct);
            
            if (window.authManager) {
                window.authManager.showNotification('تم إضافة المنتج بنجاح', 'success');
            }
        }
        
        // حفظ التغييرات وتحديث العرض
        this.saveProducts();
        this.displayProducts();
        this.populateCategoryFilter();
        
        // إغلاق النموذج
        this.productModal.hide();
    }

    /**
     * حذف منتج
     * @param {number} productId - معرف المنتج المراد حذفه
     */
    deleteProduct(productId) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.displayProducts();
            this.populateCategoryFilter();
            
            if (window.authManager) {
                window.authManager.showNotification('تم حذف المنتج بنجاح', 'success');
            }
        }
    }

    /**
     * الحصول على منتج بواسطة المعرف
     * @param {number} productId - معرف المنتج
     * @returns {Object|null} - بيانات المنتج أو null إذا لم يتم العثور عليه
     */
    getProductById(productId) {
        return this.products.find(p => p.id === productId) || null;
    }

    /**
     * الحصول على قائمة جميع المنتجات
     * @returns {Array} - قائمة المنتجات
     */
    getAllProducts() {
        return [...this.products];
    }
}

// إنشاء كائن من مدير المنتجات
const productManager = new ProductManager();

// تصدير الكائن للاستخدام في الملفات الأخرى
window.productManager = productManager;
