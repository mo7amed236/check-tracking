// نظام متابعة الشيكات - ملف JavaScript الرئيسي

// المتغيرات العامة
let checks = []; // مصفوفة لتخزين الشيكات
let currentFilter = 'all'; // الفلتر الحالي
let currentCheckId = null; // معرف الشيك الحالي للتعديل

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل البيانات من التخزين المحلي
    loadChecksFromLocalStorage();
    
    // تهيئة مفتاح الوضع الداكن
    initThemeSwitch();
    
    // تهيئة التنقل بين الصفحات
    initNavigation();
    
    // تهيئة زر إضافة شيك جديد والنافذة المنبثقة
    initAddCheckModal();
    
    // تهيئة نموذج إضافة شيك جديد
    initCheckForm();
    
    // تهيئة قائمة الشيكات والفلترة
    initChecksList();
    
    // تهيئة النافذة المنبثقة للتعديل
    initEditModal();
    
    // تهيئة صفحة التحليلات
    initAnalytics();
    
    // تحديث لوحة المعلومات
    updateDashboard();
});

// تهيئة مفتاح الوضع الداكن
function initThemeSwitch() {
    const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
    
    // التحقق من وجود تفضيل سابق في التخزين المحلي
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleSwitch.checked = true;
    }
    
    // إضافة مستمع حدث لتغيير الوضع
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}

// تهيئة التنقل بين الصفحات
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // إزالة الفئة النشطة من جميع الروابط
            navLinks.forEach(link => link.classList.remove('active'));
            
            // إضافة الفئة النشطة للرابط المحدد
            this.classList.add('active');
            
            // إخفاء جميع الصفحات
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            
            // إظهار الصفحة المطلوبة
            const targetPage = this.getAttribute('data-page');
            document.getElementById(targetPage).classList.add('active');
            
            // تحديث التحليلات إذا تم الانتقال إلى صفحة التحليلات
            if (targetPage === 'analytics') {
                updateAnalytics();
            }
        });
    });
}

// تهيئة زر إضافة شيك جديد والنافذة المنبثقة
function initAddCheckModal() {
    const addBtn = document.getElementById('add-check-btn');
    const modal = document.getElementById('add-check-modal');
    const closeBtn = modal.querySelector('.close');
    
    // فتح النافذة المنبثقة عند النقر على زر الإضافة
    addBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// تهيئة نموذج إضافة شيك جديد
function initCheckForm() {
    const checkForm = document.getElementById('check-form');
    const modal = document.getElementById('add-check-modal');
    
    checkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // جمع بيانات الشيك من النموذج
        const checkData = {
            id: Date.now().toString(), // إنشاء معرف فريد باستخدام الطابع الزمني
            number: document.getElementById('check-number').value,
            date: document.getElementById('check-date').value,
            entity: document.getElementById('check-entity').value,
            bank: document.getElementById('check-bank').value,
            amount: parseFloat(document.getElementById('check-amount').value),
            status: document.getElementById('check-status').value,
            notes: document.getElementById('check-notes').value
        };
        
        // إضافة الشيك إلى المصفوفة
        checks.push(checkData);
        
        // حفظ البيانات في التخزين المحلي
        saveChecksToLocalStorage();
        
        // إعادة تعيين النموذج
        checkForm.reset();
        
        // إغلاق النافذة المنبثقة
        modal.style.display = 'none';
        
        // تحديث قائمة الشيكات
        renderChecksTable();
        
        // تحديث لوحة المعلومات
        updateDashboard();
        
        // عرض رسالة نجاح
        alert('تم إضافة الشيك بنجاح');
        
        // الانتقال إلى صفحة قائمة الشيكات
        document.querySelector('nav a[data-page="check-list"]').click();
    });
}

// تهيئة قائمة الشيكات والفلترة
function initChecksList() {
    // تهيئة أزرار الفلترة
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // إضافة الفئة النشطة للزر المحدد
            this.classList.add('active');
            
            // تحديث الفلتر الحالي
            currentFilter = this.getAttribute('data-filter');
            
            // تحديث قائمة الشيكات
            renderChecksTable();
        });
    });
    
    // تهيئة البحث
    const searchInput = document.getElementById('search-checks');
    const searchButton = document.getElementById('search-btn');
    
    searchButton.addEventListener('click', function() {
        renderChecksTable();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            renderChecksTable();
        }
    });
    
    // عرض قائمة الشيكات
    renderChecksTable();
}

// تهيئة النافذة المنبثقة للتعديل
function initEditModal() {
    const modal = document.getElementById('edit-modal');
    const closeBtn = modal.querySelector('.close');
    const editForm = document.getElementById('edit-check-form');
    const deleteBtn = document.getElementById('delete-check');
    
    // إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // معالجة تقديم نموذج التعديل
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // العثور على الشيك في المصفوفة
        const index = checks.findIndex(check => check.id === currentCheckId);
        
        if (index !== -1) {
            // تحديث بيانات الشيك
            checks[index] = {
                id: currentCheckId,
                number: document.getElementById('edit-check-number').value,
                date: document.getElementById('edit-check-date').value,
                entity: document.getElementById('edit-check-entity').value,
                bank: document.getElementById('edit-check-bank').value,
                amount: parseFloat(document.getElementById('edit-check-amount').value),
                status: document.getElementById('edit-check-status').value,
                notes: document.getElementById('edit-check-notes').value
            };
            
            // حفظ البيانات في التخزين المحلي
            saveChecksToLocalStorage();
            
            // تحديث قائمة الشيكات
            renderChecksTable();
            
            // تحديث لوحة المعلومات
            updateDashboard();
            
            // إغلاق النافذة المنبثقة
            modal.style.display = 'none';
            
            // عرض رسالة نجاح
            alert('تم تحديث الشيك بنجاح');
        }
    });
    
    // معالجة حذف الشيك
    deleteBtn.addEventListener('click', function() {
        if (confirm('هل أنت متأكد من حذف هذا الشيك؟')) {
            // حذف الشيك من المصفوفة
            checks = checks.filter(check => check.id !== currentCheckId);
            
            // حفظ البيانات في التخزين المحلي
            saveChecksToLocalStorage();
            
            // تحديث قائمة الشيكات
            renderChecksTable();
            
            // تحديث لوحة المعلومات
            updateDashboard();
            
            // إغلاق النافذة المنبثقة
            modal.style.display = 'none';
            
            // عرض رسالة نجاح
            alert('تم حذف الشيك بنجاح');
        }
    });
}

// تهيئة صفحة التحليلات
function initAnalytics() {
    // سيتم تحديث الرسوم البيانية عند الانتقال إلى صفحة التحليلات
}

// صرف الشيك
function cashCheck(checkId) {
    // العثور على الشيك في المصفوفة
    const index = checks.findIndex(check => check.id === checkId);
    
    if (index !== -1 && checks[index].status === 'pending') {
        // تحديث حالة الشيك إلى "تم الصرف"
        checks[index].status = 'cashed';
        
        // حفظ البيانات في التخزين المحلي
        saveChecksToLocalStorage();
        
        // تحديث قائمة الشيكات
        renderChecksTable();
        
        // تحديث لوحة المعلومات
        updateDashboard();
        
        // عرض رسالة نجاح
        alert('تم صرف الشيك بنجاح');
    }
}

// استرجاع الشيك
function restoreCheck(checkId) {
    // العثور على الشيك في المصفوفة
    const index = checks.findIndex(check => check.id === checkId);
    
    if (index !== -1 && checks[index].status === 'cashed') {
        // تحديث حالة الشيك إلى "قيد الانتظار"
        checks[index].status = 'pending';
        
        // حفظ البيانات في التخزين المحلي
        saveChecksToLocalStorage();
        
        // تحديث قائمة الشيكات
        renderChecksTable();
        
        // تحديث لوحة المعلومات
        updateDashboard();
        
        // عرض رسالة نجاح
        alert('تم استرجاع الشيك بنجاح');
    }
}

// حذف الشيك
function deleteCheck(checkId) {
    if (confirm('هل أنت متأكد من حذف هذا الشيك؟')) {
        // حذف الشيك من المصفوفة
        checks = checks.filter(check => check.id !== checkId);
        
        // حفظ البيانات في التخزين المحلي
        saveChecksToLocalStorage();
        
        // تحديث قائمة الشيكات
        renderChecksTable();
        
        // تحديث لوحة المعلومات
        updateDashboard();
        
        // عرض رسالة نجاح
        alert('تم حذف الشيك بنجاح');
    }
}

// عرض قائمة الشيكات
function renderChecksTable() {
    const tableBody = document.getElementById('checks-table-body');
    const recentChecksBody = document.getElementById('recent-checks-body');
    const searchInput = document.getElementById('search-checks');
    const searchTerm = searchInput.value.toLowerCase();
    
    // تصفية الشيكات حسب الفلتر الحالي والبحث
    let filteredChecks = checks.filter(check => {
        // تطبيق البحث
        const matchesSearch = 
            check.number.toLowerCase().includes(searchTerm) ||
            check.entity.toLowerCase().includes(searchTerm) ||
            check.bank.toLowerCase().includes(searchTerm) ||
            check.amount.toString().includes(searchTerm);
        
        if (!matchesSearch) {
            return false;
        }
        
        // تطبيق الفلتر
        if (currentFilter === 'all') {
            return true;
        } else if (currentFilter === 'expired') {
            return isExpired(check.date);
        } else if (currentFilter === 'due-soon') {
            return isDueSoon(check.date);
        } else if (currentFilter === 'cashed') {
            return check.status === 'cashed';
        }
        
        return true;
    });
    
    // ترتيب الشيكات حسب التاريخ
    filteredChecks.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // إنشاء صفوف الجدول
    tableBody.innerHTML = '';
    
    if (filteredChecks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">لا توجد شيكات متطابقة مع معايير البحث</td>
            </tr>
        `;
    } else {
        filteredChecks.forEach(check => {
            const row = document.createElement('tr');
            
            // تحديد لون الصف حسب حالة الشيك
            if (isExpired(check.date)) {
                row.classList.add('expired');
            } else if (isDueSoon(check.date)) {
                row.classList.add('due-soon');
            }
            
            // إنشاء أزرار الإجراءات المناسبة حسب حالة الشيك
            let actionButtons = `
                <div class="action-buttons">
                    <button class="btn action-btn primary edit-btn" data-id="${check.id}">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
            `;
            
            if (check.status === 'pending') {
                // إضافة زر صرف الشيك للشيكات قيد الانتظار
                actionButtons += `
                    <button class="btn action-btn success cash-btn" data-id="${check.id}">
                        <i class="fas fa-check"></i> صرف
                    </button>
                `;
            } else if (check.status === 'cashed') {
                // إضافة زر استرجاع الشيك للشيكات المصروفة
                actionButtons += `
                    <button class="btn action-btn warning restore-btn" data-id="${check.id}">
                        <i class="fas fa-undo"></i> استرجاع
                    </button>
                `;
            }
            
            // إضافة زر حذف الشيك لجميع الشيكات
            actionButtons += `
                <button class="btn action-btn danger delete-btn" data-id="${check.id}">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
            `;
            
            row.innerHTML = `
                <td>${check.number}</td>
                <td>${formatDate(check.date)}</td>
                <td>${check.entity}</td>
                <td>${check.bank}</td>
                <td>${formatCurrency(check.amount)}</td>
                <td>${getStatusText(check)}</td>
                <td>${actionButtons}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // إضافة مستمعي الأحداث لأزرار الإجراءات
        const editButtons = document.querySelectorAll('.edit-btn');
        const cashButtons = document.querySelectorAll('.cash-btn');
        const restoreButtons = document.querySelectorAll('.restore-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const checkId = this.getAttribute('data-id');
                openEditModal(checkId);
            });
        });
        
        cashButtons.forEach(button => {
            button.addEventListener('click', function() {
                const checkId = this.getAttribute('data-id');
                cashCheck(checkId);
            });
        });
        
        restoreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const checkId = this.getAttribute('data-id');
                restoreCheck(checkId);
            });
        });
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const checkId = this.getAttribute('data-id');
                deleteCheck(checkId);
            });
        });
    }
    
    // تحديث قائمة الشيكات الأخيرة في الصفحة الرئيسية
    recentChecksBody.innerHTML = '';
    
    // عرض أحدث 5 شيكات
    const recentChecks = [...checks].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    recentChecks.forEach(check => {
        const row = document.createElement('tr');
        
        // تحديد لون الصف حسب حالة الشيك
        if (isExpired(check.date)) {
            row.classList.add('expired');
        } else if (isDueSoon(check.date)) {
            row.classList.add('due-soon');
        }
        
        row.innerHTML = `
            <td>${check.number}</td>
            <td>${formatDate(check.date)}</td>
            <td>${check.entity}</td>
            <td>${check.bank}</td>
            <td>${formatCurrency(check.amount)}</td>
            <td>${getStatusText(check)}</td>
        `;
        
        recentChecksBody.appendChild(row);
    });
}

// فتح النافذة المنبثقة للتعديل
function openEditModal(checkId) {
    const modal = document.getElementById('edit-modal');
    const check = checks.find(check => check.id === checkId);
    
    if (check) {
        // تخزين معرف الشيك الحالي
        currentCheckId = checkId;
        
        // ملء النموذج ببيانات الشيك
        document.getElementById('edit-check-id').value = check.id;
        document.getElementById('edit-check-number').value = check.number;
        document.getElementById('edit-check-date').value = check.date;
        document.getElementById('edit-check-entity').value = check.entity;
        document.getElementById('edit-check-bank').value = check.bank;
        document.getElementById('edit-check-amount').value = check.amount;
        document.getElementById('edit-check-status').value = check.status;
        document.getElementById('edit-check-notes').value = check.notes;
        
        // عرض النافذة المنبثقة
        modal.style.display = 'block';
    }
}

// تحديث لوحة المعلومات
function updateDashboard() {
    // تحديث إحصائيات الشيكات
    document.getElementById('total-checks').textContent = checks.length;
    document.getElementById('due-soon-checks').textContent = checks.filter(check => isDueSoon(check.date) && !isExpired(check.date)).length;
    document.getElementById('expired-checks').textContent = checks.filter(check => isExpired(check.date)).length;
    document.getElementById('cashed-checks').textContent = checks.filter(check => check.status === 'cashed').length;
}

// تحديث صفحة التحليلات
function updateAnalytics() {
    // حساب الإحصائيات
    const totalAmount = checks.reduce((sum, check) => sum + check.amount, 0);
    const averageAmount = checks.length > 0 ? totalAmount / checks.length : 0;
    const highestAmount = checks.length > 0 ? Math.max(...checks.map(check => check.amount)) : 0;
    const lowestAmount = checks.length > 0 ? Math.min(...checks.map(check => check.amount)) : 0;
    
    // تحديث ملخص الإحصائيات
    document.getElementById('total-amount').textContent = formatCurrency(totalAmount);
    document.getElementById('average-amount').textContent = formatCurrency(averageAmount);
    document.getElementById('highest-amount').textContent = formatCurrency(highestAmount);
    document.getElementById('lowest-amount').textContent = formatCurrency(lowestAmount);
    
    // إنشاء الرسوم البيانية
    createBankChart();
    createMonthChart();
    createStatusChart();
    createEntityChart();
}

// إنشاء رسم بياني للبنوك
function createBankChart() {
    const bankCanvas = document.getElementById('bank-chart');
    
    // حساب عدد الشيكات لكل بنك
    const bankCounts = {};
    
    checks.forEach(check => {
        if (bankCounts[check.bank]) {
            bankCounts[check.bank]++;
        } else {
            bankCounts[check.bank] = 1;
        }
    });
    
    // تحويل البيانات إلى تنسيق Chart.js
    const labels = Object.keys(bankCounts);
    const data = Object.values(bankCounts);
    
    // إنشاء الرسم البياني
    if (window.bankChart) {
        window.bankChart.destroy();
    }
    
    window.bankChart = new Chart(bankCanvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: generateColors(labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
}

// إنشاء رسم بياني للشهور
function createMonthChart() {
    const monthCanvas = document.getElementById('month-chart');
    
    // تهيئة مصفوفة للشهور
    const months = Array(12).fill(0);
    
    // حساب عدد الشيكات لكل شهر
    checks.forEach(check => {
        const date = new Date(check.date);
        const month = date.getMonth();
        months[month]++;
    });
    
    // أسماء الشهور بالعربية
    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    // إنشاء الرسم البياني
    if (window.monthChart) {
        window.monthChart.destroy();
    }
    
    window.monthChart = new Chart(monthCanvas, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'عدد الشيكات',
                data: months,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
}

// إنشاء رسم بياني للحالة
function createStatusChart() {
    const statusCanvas = document.getElementById('status-chart');
    
    // حساب عدد الشيكات لكل حالة
    const expired = checks.filter(check => isExpired(check.date)).length;
    const dueSoon = checks.filter(check => isDueSoon(check.date) && !isExpired(check.date)).length;
    const cashed = checks.filter(check => check.status === 'cashed').length;
    const pending = checks.filter(check => check.status === 'pending' && !isDueSoon(check.date) && !isExpired(check.date)).length;
    
    // إنشاء الرسم البياني
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    window.statusChart = new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
            labels: ['منتهية', 'تستحق قريباً', 'تم صرفها', 'قيد الانتظار'],
            datasets: [{
                data: [expired, dueSoon, cashed, pending],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(52, 152, 219, 0.7)'
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(39, 174, 96, 1)',
                    'rgba(52, 152, 219, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
}

// إنشاء رسم بياني للجهات
function createEntityChart() {
    const entityCanvas = document.getElementById('entity-chart');
    
    // حساب إجمالي المبالغ لكل جهة
    const entityAmounts = {};
    
    checks.forEach(check => {
        if (entityAmounts[check.entity]) {
            entityAmounts[check.entity] += check.amount;
        } else {
            entityAmounts[check.entity] = check.amount;
        }
    });
    
    // تحويل البيانات إلى تنسيق Chart.js
    const labels = Object.keys(entityAmounts);
    const data = Object.values(entityAmounts);
    
    // إنشاء الرسم البياني
    if (window.entityChart) {
        window.entityChart.destroy();
    }
    
    window.entityChart = new Chart(entityCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'إجمالي المبالغ (ج.م)',
                data: data,
                backgroundColor: 'rgba(155, 89, 182, 0.7)',
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                    }
                }
            }
        }
    });
}

// التحقق مما إذا كان الشيك منتهياً
function isExpired(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate < today;
}

// التحقق مما إذا كان الشيك يستحق خلال أسبوع
function isDueSoon(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const checkDate = new Date(dateStr);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate >= today && checkDate <= nextWeek;
}

// الحصول على نص الحالة
function getStatusText(check) {
    if (check.status === 'cashed') {
        return '<span class="status cashed">تم الصرف</span>';
    } else if (isExpired(check.date)) {
        return '<span class="status expired">منتهي</span>';
    } else if (isDueSoon(check.date)) {
        return '<span class="status due-soon">يستحق قريباً</span>';
    } else {
        return '<span class="status pending">قيد الانتظار</span>';
    }
}

// تنسيق التاريخ
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('ar-EG', options);
}

// تنسيق العملة
function formatCurrency(amount) {
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' });
}

// إنشاء ألوان عشوائية للرسوم البيانية
function generateColors(count) {
    const colors = [
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(52, 73, 94, 0.7)',
        'rgba(22, 160, 133, 0.7)',
        'rgba(39, 174, 96, 0.7)',
        'rgba(243, 156, 18, 0.7)',
        'rgba(211, 84, 0, 0.7)',
        'rgba(231, 76, 60, 0.7)'
    ];
    
    // إذا كان عدد الألوان المطلوبة أكبر من عدد الألوان المتاحة، قم بإنشاء ألوان إضافية
    if (count > colors.length) {
        for (let i = colors.length; i < count; i++) {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
    }
    
    return colors.slice(0, count);
}

// حفظ الشيكات في التخزين المحلي
function saveChecksToLocalStorage() {
    localStorage.setItem('checks', JSON.stringify(checks));
}

// تحميل الشيكات من التخزين المحلي
function loadChecksFromLocalStorage() {
    const savedChecks = localStorage.getItem('checks');
    
    if (savedChecks) {
        checks = JSON.parse(savedChecks);
    }
}
