// مصفوفة لتخزين كائنات المهام
let tasks = [];

// تحديد العناصر من DOM
const addTaskForm = document.getElementById('add-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const tasksList = document.getElementById('tasks-list');
const editTaskModal = document.getElementById('edit-task-modal');
const editTaskForm = document.getElementById('edit-task-form');
const editTaskIdInput = document.getElementById('edit-task-id');
const editTaskTitleInput = document.getElementById('edit-task-title');
const editTaskDescriptionInput = document.getElementById('edit-task-description');
const closeModalBtn = document.querySelector('.close-modal');

// تحميل المهام من التخزين المحلي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
});

// إضافة مهمة جديدة
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    
    if (title) {
        // إنشاء كائن مهمة جديد
        const newTask = {
            id: Date.now(), // استخدام الطابع الزمني كمعرف فريد
            title: title,
            description: description,
            completed: false,
            createdAt: new Date()
        };
        
        // إضافة المهمة إلى المصفوفة باستخدام push()
        tasks.push(newTask);
        
        // حفظ المهام في التخزين المحلي
        saveTasksToLocalStorage();
        
        // إعادة عرض المهام
        renderTasks();
        
        // إعادة تعيين النموذج
        addTaskForm.reset();
    }
});

// عرض المهام في القائمة
function renderTasks() {
    // مسح القائمة الحالية
    tasksList.innerHTML = '';
    
    // التحقق من وجود مهام
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="no-tasks">لا توجد مهام حالية</p>';
        return;
    }
    
    // إنشاء عنصر لكل مهمة
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task-item');
        if (task.completed) {
            taskElement.classList.add('task-completed');
        }
        
        taskElement.innerHTML = `
            <div class="task-info">
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description || 'لا يوجد وصف'}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn" data-id="${task.id}">${task.completed ? 'تراجع' : 'إكمال'}</button>
                <button class="edit-btn" data-id="${task.id}">تعديل</button>
                <button class="delete-btn" data-id="${task.id}">حذف</button>
            </div>
        `;
        
        tasksList.appendChild(taskElement);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    addTaskButtonListeners();
}

// إضافة مستمعي الأحداث لأزرار المهام
function addTaskButtonListeners() {
    // أزرار الإكمال
    document.querySelectorAll('.complete-btn').forEach(button => {
        button.addEventListener('click', toggleTaskCompletion);
    });
    
    // أزرار التعديل
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', openEditTaskModal);
    });
    
    // أزرار الحذف
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteTask);
    });
}

// تبديل حالة إكمال المهمة
function toggleTaskCompletion(e) {
    const taskId = parseInt(e.target.getAttribute('data-id'));
    
    // استخدام map() لإنشاء مصفوفة جديدة مع تحديث حالة المهمة المحددة
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    // حفظ المهام في التخزين المحلي
    saveTasksToLocalStorage();
    
    // إعادة عرض المهام
    renderTasks();
}

// فتح نافذة تعديل المهمة
function openEditTaskModal(e) {
    const taskId = parseInt(e.target.getAttribute('data-id'));
    const task = tasks.find(task => task.id === taskId);
    
    if (task) {
        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title;
        editTaskDescriptionInput.value = task.description || '';
        
        // عرض النافذة المنبثقة
        editTaskModal.style.display = 'block';
    }
}

// حفظ تعديلات المهمة
editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskId = parseInt(editTaskIdInput.value);
    const newTitle = editTaskTitleInput.value.trim();
    const newDescription = editTaskDescriptionInput.value.trim();
    
    if (newTitle) {
        // استخدام map() لإنشاء مصفوفة جديدة مع تحديث المهمة المحددة
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    title: newTitle,
                    description: newDescription
                };
            }
            return task;
        });
        
        // حفظ المهام في التخزين المحلي
        saveTasksToLocalStorage();
        
        // إعادة عرض المهام
        renderTasks();
        
        // إغلاق النافذة المنبثقة
        closeEditTaskModal();
    }
});

// حذف مهمة
function deleteTask(e) {
    const taskId = parseInt(e.target.getAttribute('data-id'));
    
    // استخدام طريقة filter() لإنشاء مصفوفة جديدة بدون المهمة المحددة
    tasks = tasks.filter(task => task.id !== taskId);
    
    // حفظ المهام في التخزين المحلي
    saveTasksToLocalStorage();
    
    // إعادة عرض المهام
    renderTasks();
}

// إغلاق نافذة تعديل المهمة
function closeEditTaskModal() {
    editTaskModal.style.display = 'none';
    editTaskForm.reset();
}

// إغلاق النافذة المنبثقة عند النقر على زر الإغلاق
closeModalBtn.addEventListener('click', closeEditTaskModal);

// إغلاق النافذة المنبثقة عند النقر خارجها
window.addEventListener('click', (e) => {
    if (e.target === editTaskModal) {
        closeEditTaskModal();
    }
});

// حفظ المهام في التخزين المحلي
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// تحميل المهام من التخزين المحلي
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

