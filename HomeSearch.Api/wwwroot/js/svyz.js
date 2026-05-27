// ==================== Глобальные переменные ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                 JSON.parse(localStorage.getItem('userData')) || 
                 JSON.parse(localStorage.getItem('user')) || 
                 null;
let responses = JSON.parse(localStorage.getItem('responses')) || [];
let properties = JSON.parse(localStorage.getItem('properties')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentPage = 1;
const itemsPerPage = 6;

// ==================== DOM элементы ====================
const buyerResponsesContainer = document.getElementById('buyerResponses');
const sellerResponsesContainer = document.getElementById('sellerResponses');
const typeButtons = document.querySelectorAll('.type_btn');
const logoutBtn = document.getElementById('logout');
const loadingOverlay = document.getElementById('loadingOverlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbers = document.getElementById('pageNumbers');
const pendingCount = document.getElementById('pendingCount');
const approvedCount = document.getElementById('approvedCount');
const rejectedCount = document.getElementById('rejectedCount');

// ==================== Инициализация ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница откликов загружается...');
    console.log('Текущий пользователь:', currentUser);
    
    // Проверка авторизации (НЕ ПЕРЕНАПРАВЛЯЕМ!)
    if (!currentUser) {
        console.log('Пользователь не авторизован');
        // Если пользователь не авторизован, показываем сообщение
        showLoginMessage();
        return;
    }
    
    console.log('Пользователь авторизован:', currentUser);
    
    // Обновляем имя в хедере
    updateProfileInfo();
    
    // Инициализируем данные
    initData();
    
    // Назначаем обработчики
    setupEventListeners();
    
    // Загружаем данные
    loadResponses();
});

// ==================== Показать сообщение о входе ====================
function showLoginMessage() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty_list" style="grid-column: 1/-1; margin-top: 100px;">
            <div class="empty_icon">🔒</div>
            <h3 class="empty_message">Требуется авторизация</h3>
            <p>Для просмотра откликов необходимо войти в систему</p>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                <a href="index.html" class="type_btn active" style="text-decoration: none;">
                    <i class="fas fa-sign-in-alt"></i> Войти
                </a>
                <a href="index.html#regist_form" class="type_btn" style="text-decoration: none; background: rgba(255,255,255,0.1);">
                    <i class="fas fa-user-plus"></i> Зарегистрироваться
                </a>
            </div>
        </div>
    `;
    
    // Скрываем элементы, которые не должны показываться
    document.querySelector('.status_counter')?.style.display = 'none';
    document.querySelector('.filter_group')?.style.display = 'none';
}

// ==================== Инициализация данных ====================
function initData() {
    // Если нет данных в localStorage, создаем демо-данные
    if (responses.length === 0) {
        createDemoResponses();
    }
    
    if (properties.length === 0) {
        createDemoProperties();
    }
    
    if (users.length === 0) {
        createDemoUsers();
    }
}

// ==================== Настройка обработчиков событий ====================
function setupEventListeners() {
    // Переключение между типами откликов
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            typeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.dataset.type;
            showResponsesByType(type);
        });
    });
    
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Обновление статуса отклика (делегирование событий)
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('sort_select')) {
            const card = e.target.closest('.card_container');
            const responseId = card.dataset.id;
            const newStatus = e.target.value;
            
            updateResponseStatus(responseId, newStatus);
        }
    });
    
    // Пагинация
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPrevPage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextPage);
    }
    
    // Клик по номеру страницы
    if (pageNumbers) {
        pageNumbers.addEventListener('click', function(e) {
            if (e.target.classList.contains('page_number')) {
                const page = parseInt(e.target.dataset.page);
                goToPage(page);
            }
        });
    }
}

// ==================== Загрузка откликов ====================
function loadResponses() {
    showLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
        showResponsesByType('all');
        showLoading(false);
    }, 500);
}

// ==================== Показать отклики по типу ====================
function showResponsesByType(type) {
    currentPage = 1; // Сбрасываем на первую страницу
    
    if (type === 'all') {
        // Показываем мои отклики (как покупатель)
        const myResponses = responses.filter(response => 
            response.buyerId === currentUser.id
        );
        
        updateCounters();
        renderBuyerResponses(myResponses);
        
        buyerResponsesContainer.classList.add('active');
        sellerResponsesContainer.classList.remove('active');
        
    } else if (type === 'apartment') {
        // Показываем отклики на мои объявления (как продавец)
        const myPropertiesIds = properties
            .filter(prop => prop.ownerId === currentUser.id)
            .map(prop => prop.id);
        
        const propertyResponses = responses.filter(response =>
            myPropertiesIds.includes(response.propertyId)
        );
        
        updateCounters();
        renderSellerResponses(propertyResponses);
        
        sellerResponsesContainer.classList.add('active');
        buyerResponsesContainer.classList.remove('active');
    }
    
    // Обновляем пагинацию
    updatePagination();
}

// ==================== Рендер откликов покупателя ====================
function renderBuyerResponses(responsesList) {
    buyerResponsesContainer.innerHTML = '';
    
    if (responsesList.length === 0) {
        showEmptyState(buyerResponsesContainer, 'buyer');
        return;
    }
    
    // Пагинация
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResponses = responsesList.slice(startIndex, endIndex);
    
    paginatedResponses.forEach(response => {
        const property = properties.find(p => p.id === response.propertyId);
        if (!property) return;
        
        const card = document.createElement('div');
        card.className = 'card_container';
        card.dataset.id = response.id;
        
        // Определяем класс статуса
        const statusClass = response.status === 'approved' ? 'approved' : 
                           response.status === 'rejected' ? 'rejected' : 'pending';
        
        // Определяем иконку важности
        const importanceIcon = getImportanceIcon(response);
        const importanceClass = getImportanceClass(response);
        
        card.innerHTML = `
            ${importanceIcon ? `<div class="importance_${importanceClass}"></div>` : ''}
            ${isNewResponse(response) ? '<div class="new_badge">Новый</div>' : ''}
            
            <img class="img_zayavk" src="${property.photos[0] || 'img/default-property.jpg'}" 
                 alt="${property.title}">
            
            <h3 class="name_zayavki">${property.title}</h3>
            <h3 class="sposob_svyz_buyer">
                Контакты владельца: ${response.ownerContacts || 'Не указаны'}
            </h3>
            
            <div class="status ${statusClass}">
                ${getStatusText(response.status)}
            </div>
            
            <div class="response_details">
                <p><strong>Дата подачи:</strong> ${formatDate(response.createdAt)}</p>
                <p><strong>Даты проживания:</strong> ${formatDate(response.checkIn)} - ${formatDate(response.checkOut)}</p>
                <p><strong>Кол-во гостей:</strong> ${response.guests || 1}</p>
                <p><strong>Общая сумма:</strong> ${response.totalPrice || '0'} ₽</p>
                ${response.message ? `<p><strong>Ваше сообщение:</strong> ${response.message}</p>` : ''}
            </div>
            
            <div class="response_actions">
                <button class="quick_reply_btn" data-id="${response.id}" title="Написать владельцу">
                    <i class="fas fa-reply"></i>
                </button>
            </div>
        `;
        
        buyerResponsesContainer.appendChild(card);
    });
    
    // Добавляем обработчик для кнопки ответа
    document.querySelectorAll('.quick_reply_btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const responseId = this.dataset.id;
            const response = responses.find(r => r.id === responseId);
            if (response) {
                const message = prompt('Введите сообщение для владельца:');
                if (message) {
                    showNotification('Сообщение отправлено владельцу', 'info');
                }
            }
        });
    });
}

// ==================== Рендер откликов продавца ====================
function renderSellerResponses(responsesList) {
    sellerResponsesContainer.innerHTML = '';
    
    if (responsesList.length === 0) {
        showEmptyState(sellerResponsesContainer, 'seller');
        return;
    }
    
    // Пагинация
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResponses = responsesList.slice(startIndex, endIndex);
    
    paginatedResponses.forEach(response => {
        const property = properties.find(p => p.id === response.propertyId);
        const buyer = getBuyerInfo(response.buyerId);
        
        if (!property || !buyer) return;
        
        const card = document.createElement('div');
        card.className = 'card_container';
        card.dataset.id = response.id;
        
        // Определяем иконку важности
        const importanceIcon = getImportanceIcon(response);
        const importanceClass = getImportanceClass(response);
        
        card.innerHTML = `
            ${importanceIcon ? `<div class="importance_${importanceClass}"></div>` : ''}
            ${isNewResponse(response) ? '<div class="new_badge">Новый</div>' : ''}
            
            <img class="img_otklik" src="${property.photos[0] || 'img/default-property.jpg'}" 
                 alt="${property.title}">
            
            <h3 class="name_otklyk">${property.title}</h3>
            <h3 class="name_buyer">${buyer.name}</h3>
            <h3 class="sposob_svyz_seller">
                Контакты покупателя: ${response.buyerContacts || buyer.phone || buyer.email}
            </h3>
            
            <div class="status_svyz">
                <label>Статус заявки</label>
                <select class="sort_select" data-id="${response.id}">
                    <option value="pending" ${response.status === 'pending' ? 'selected' : ''}>В ожидании</option>
                    <option value="approved" ${response.status === 'approved' ? 'selected' : ''}>Согласовано</option>
                    <option value="rejected" ${response.status === 'rejected' ? 'selected' : ''}>Отказано</option>
                </select>
            </div>
            
            <div class="response_details">
                <p><strong>Дата подачи:</strong> ${formatDate(response.createdAt)}</p>
                <p><strong>Даты проживания:</strong> ${formatDate(response.checkIn)} - ${formatDate(response.checkOut)}</p>
                <p><strong>Кол-во гостей:</strong> ${response.guests || 1}</p>
                <p><strong>Общая сумма:</strong> ${response.totalPrice || '0'} ₽</p>
                <p><strong>Сообщение от покупателя:</strong> ${response.message || 'Нет сообщения'}</p>
            </div>
            
            <div class="response_actions">
                <button class="quick_reply_btn" data-id="${response.id}" title="Ответить покупателю">
                    <i class="fas fa-reply"></i>
                </button>
            </div>
        `;
        
        sellerResponsesContainer.appendChild(card);
    });
    
    // Добавляем обработчик для кнопки ответа
    document.querySelectorAll('.quick_reply_btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const responseId = this.dataset.id;
            const response = responses.find(r => r.id === responseId);
            if (response) {
                const message = prompt('Введите ответ покупателю:');
                if (message) {
                    showNotification('Ответ отправлен покупателю', 'info');
                }
            }
        });
    });
}

// ==================== Обновление статуса отклика ====================
function updateResponseStatus(responseId, newStatus) {
    const responseIndex = responses.findIndex(r => r.id === responseId);
    
    if (responseIndex !== -1) {
        responses[responseIndex].status = newStatus;
        responses[responseIndex].updatedAt = new Date().toISOString();
        
        // Сохраняем в localStorage
        localStorage.setItem('responses', JSON.stringify(responses));
        
        // Показываем уведомление
        showNotification(`Статус обновлен: ${getStatusText(newStatus)}`, 'success');
        
        // Обновляем отображение
        updateCounters();
        const activeType = document.querySelector('.type_btn.active').dataset.type;
        showResponsesByType(activeType);
    }
}

// ==================== Пагинация ====================
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        const activeType = document.querySelector('.type_btn.active').dataset.type;
        showResponsesByType(activeType);
    }
}

function goToNextPage() {
    const activeContainer = document.querySelector('.zayavki_container.active') || 
                          document.querySelector('.otklyki_container.active');
    
    if (activeContainer) {
        const activeType = document.querySelector('.type_btn.active').dataset.type;
        const responsesList = getResponsesByType(activeType);
        const totalPages = Math.ceil(responsesList.length / itemsPerPage);
        
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            showResponsesByType(activeType);
        }
    }
}

function goToPage(page) {
    currentPage = page;
    updatePagination();
    const activeType = document.querySelector('.type_btn.active').dataset.type;
    showResponsesByType(activeType);
}

function updatePagination() {
    const activeContainer = document.querySelector('.zayavki_container.active') || 
                          document.querySelector('.otklyki_container.active');
    
    if (!activeContainer) return;
    
    const activeType = document.querySelector('.type_btn.active').dataset.type;
    const responsesList = getResponsesByType(activeType);
    const totalPages = Math.ceil(responsesList.length / itemsPerPage);
    
    // Обновляем кнопки
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Обновляем номера страниц
    pageNumbers.innerHTML = '';
    
    if (totalPages <= 5) {
        // Показываем все страницы
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page_number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.dataset.page = i;
            pageNumbers.appendChild(pageBtn);
        }
    } else {
        // Показываем с точками
        if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page_number ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.dataset.page = i;
                pageNumbers.appendChild(pageBtn);
            }
            pageNumbers.innerHTML += '<span class="page_dots">...</span>';
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'page_number';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.dataset.page = totalPages;
            pageNumbers.appendChild(lastPageBtn);
        } else if (currentPage >= totalPages - 2) {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'page_number';
            firstPageBtn.textContent = '1';
            firstPageBtn.dataset.page = 1;
            pageNumbers.appendChild(firstPageBtn);
            
            pageNumbers.innerHTML += '<span class="page_dots">...</span>';
            
            for (let i = totalPages - 3; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page_number ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.dataset.page = i;
                pageNumbers.appendChild(pageBtn);
            }
        } else {
            const firstPageBtn = document.createElement('button');
            firstPageBtn.className = 'page_number';
            firstPageBtn.textContent = '1';
            firstPageBtn.dataset.page = 1;
            pageNumbers.appendChild(firstPageBtn);
            
            pageNumbers.innerHTML += '<span class="page_dots">...</span>';
            
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page_number ${i === currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.dataset.page = i;
                pageNumbers.appendChild(pageBtn);
            }
            
            pageNumbers.innerHTML += '<span class="page_dots">...</span>';
            
            const lastPageBtn = document.createElement('button');
            lastPageBtn.className = 'page_number';
            lastPageBtn.textContent = totalPages;
            lastPageBtn.dataset.page = totalPages;
            pageNumbers.appendChild(lastPageBtn);
        }
    }
}

// ==================== Вспомогательные функции ====================
function getResponsesByType(type) {
    if (type === 'all') {
        return responses.filter(response => response.buyerId === currentUser.id);
    } else if (type === 'apartment') {
        const myPropertiesIds = properties
            .filter(prop => prop.ownerId === currentUser.id)
            .map(prop => prop.id);
        return responses.filter(response => myPropertiesIds.includes(response.propertyId));
    }
    return [];
}

function updateProfileInfo() {
    const profileName = document.querySelector('.profil_name');
    if (profileName && currentUser) {
        profileName.textContent = currentUser.name || 
                                 currentUser.firstName || 
                                 currentUser.email || 
                                 'Пользователь';
    }
}

function getBuyerInfo(buyerId) {
    return users.find(user => user.id === buyerId) || { 
        name: 'Неизвестный пользователь', 
        email: 'Не указан', 
        phone: 'Не указан' 
    };
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'В ожидании',
        'approved': 'Согласовано',
        'rejected': 'Отказано'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function updateCounters() {
    const myPropertiesIds = properties
        .filter(prop => prop.ownerId === currentUser.id)
        .map(prop => prop.id);
    
    const sellerResponses = responses.filter(response =>
        myPropertiesIds.includes(response.propertyId)
    );
    
    const counts = {
        pending: sellerResponses.filter(r => r.status === 'pending').length,
        approved: sellerResponses.filter(r => r.status === 'approved').length,
        rejected: sellerResponses.filter(r => r.status === 'rejected').length
    };
    
    if (pendingCount) pendingCount.textContent = counts.pending;
    if (approvedCount) approvedCount.textContent = counts.approved;
    if (rejectedCount) rejectedCount.textContent = counts.rejected;
}

function showEmptyState(container, type) {
    const message = type === 'seller' 
        ? 'У вас нет откликов на ваши объявления' 
        : 'У вас нет активных заявок на аренду';
    
    container.classList.add('active');
    container.innerHTML = `
        <div class="empty_list">
            <div class="empty_icon">📋</div>
            <h3 class="empty_message">${message}</h3>
            <a href="${type === 'seller' ? 'sell.html' : 'catalog.html'}" 
               class="type_btn active">
                ${type === 'seller' ? 'Добавить объявление' : 'Найти жильё'}
            </a>
        </div>
    `;
}

function showNotification(message, type) {
    // Удаляем существующие уведомления
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
    
    // Закрытие по клику
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function getImportanceIcon(response) {
    const daysAgo = Math.floor((new Date() - new Date(response.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (daysAgo < 1) return 'high';
    if (daysAgo < 3) return 'medium';
    return 'low';
}

function getImportanceClass(response) {
    const daysAgo = Math.floor((new Date() - new Date(response.createdAt)) / (1000 * 60 * 60 * 24));
    
    if (daysAgo < 1) return 'high';
    if (daysAgo < 3) return 'medium';
    return 'low';
}

function isNewResponse(response) {
    const hoursAgo = Math.floor((new Date() - new Date(response.createdAt)) / (1000 * 60 * 60));
    return hoursAgo < 24;
}

function logout() {
    // Удаляем все данные пользователя
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    window.location.href = 'index.html';
}

// ==================== Демо-данные ====================
function createDemoResponses() {
    const demoResponses = [
        {
            id: 'response_1',
            propertyId: 'property_1',
            buyerId: currentUser ? currentUser.id : 'user_1',
            buyerContacts: '+7 (999) 123-45-67, buyer@email.com',
            ownerContacts: '+7 (911) 222-33-44',
            status: 'pending',
            message: 'Здравствуйте! Интересует ваша квартира на даты 15-20 января',
            guests: 2,
            checkIn: '2024-01-15',
            checkOut: '2024-01-20',
            totalPrice: '15 000 ₽',
            createdAt: '2024-01-10T10:30:00Z',
            updatedAt: '2024-01-10T10:30:00Z'
        },
        {
            id: 'response_2',
            propertyId: 'property_2',
            buyerId: 'user_3',
            buyerContacts: '+7 (977) 555-66-77',
            ownerContacts: '+7 (911) 222-33-44',
            status: 'approved',
            message: 'Хотим отметить день рождения в вашем коттедже',
            guests: 4,
            checkIn: '2024-02-01',
            checkOut: '2024-02-07',
            totalPrice: '28 000 ₽',
            createdAt: '2024-01-08T14:20:00Z',
            updatedAt: '2024-01-09T11:15:00Z'
        },
        {
            id: 'response_3',
            propertyId: 'property_1',
            buyerId: 'user_2',
            buyerContacts: 'another@email.com',
            ownerContacts: '+7 (911) 222-33-44',
            status: 'approved',
            message: 'Интересует квартира для командировки',
            guests: 1,
            checkIn: '2024-01-25',
            checkOut: '2024-01-30',
            totalPrice: '12 500 ₽',
            createdAt: '2024-01-05T09:45:00Z',
            updatedAt: '2024-01-06T16:30:00Z'
        }
    ];
    
    responses = demoResponses;
    localStorage.setItem('responses', JSON.stringify(responses));
}

function createDemoProperties() {
    const demoProperties = [
        {
            id: 'property_1',
            title: 'Уютная квартира в центре Москвы',
            ownerId: currentUser ? currentUser.id : 'user_1',
            photos: ['img/apartment-1.jpg'],
            price: 3000,
            city: 'Москва',
            type: 'apartment'
        },
        {
            id: 'property_2',
            title: 'Коттедж у озера в Подмосковье',
            ownerId: currentUser ? currentUser.id : 'user_1',
            photos: ['img/cottage-1.jpg'],
            price: 4000,
            city: 'Подмосковье',
            type: 'house'
        },
        {
            id: 'property_3',
            title: 'Апартаменты в Санкт-Петербурге',
            ownerId: 'user_2',
            photos: ['img/apartment-2.jpg'],
            price: 2500,
            city: 'Санкт-Петербург',
            type: 'apartment'
        }
    ];
    
    properties = demoProperties;
    localStorage.setItem('properties', JSON.stringify(properties));
}

function createDemoUsers() {
    const demoUsers = [
        {
            id: currentUser ? currentUser.id : 'user_1',
            name: currentUser ? currentUser.name : 'Иван Иванов',
            email: currentUser ? currentUser.email : 'ivan@example.com',
            phone: '+7 (999) 123-45-67'
        },
        {
            id: 'user_2',
            name: 'Мария Соколова',
            email: 'maria@example.com',
            phone: '+7 (977) 555-66-77'
        },
        {
            id: 'user_3',
            name: 'Алексей Петров',
            email: 'alex@example.com',
            phone: '+7 (911) 888-99-00'
        }
    ];
    
    users = demoUsers;
    localStorage.setItem('users', JSON.stringify(users));
}

// ==================== Стили для уведомлений (если их нет) ====================
if (!document.querySelector('style[data-notification-styles]')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.dataset.notificationStyles = true;
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.success {
            background: #4CAF50;
            border-left: 4px solid #2E7D32;
        }
        
        .notification.error {
            background: #F44336;
            border-left: 4px solid #C62828;
        }
        
        .notification.info {
            background: #2196F3;
            border-left: 4px solid #0D47A1;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 15px;
            padding: 0;
            line-height: 1;
        }
        
        .close-notification:hover {
            opacity: 0.8;
        }
        
        .response_details {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            font-size: 13px;
            color: #666;
        }
        
        .response_details p {
            margin: 5px 0;
        }
        
        .response_details strong {
            color: #333;
        }
        
        .response_actions {
            margin-top: 15px;
            display: flex;
            justify-content: flex-end;
        }
        
        .importance_high, .importance_medium, .importance_low {
            position: absolute;
            top: 15px;
            left: 15px;
            border-radius: 50%;
            z-index: 2;
        }
        
        .importance_high {
            width: 12px;
            height: 12px;
            background: linear-gradient(135deg, #e53e3e, #c53030);
            box-shadow: 0 0 15px rgba(229, 62, 62, 0.5);
            animation: pulse 2s infinite;
        }
        
        .importance_medium {
            width: 10px;
            height: 10px;
            background: linear-gradient(135deg, #ed8936, #dd6b20);
            box-shadow: 0 0 10px rgba(237, 137, 54, 0.3);
        }
        
        .importance_low {
            width: 8px;
            height: 8px;
            background: linear-gradient(135deg, #38a169, #2f855a);
            box-shadow: 0 0 8px rgba(56, 161, 105, 0.2);
        }
        
        .new_badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #ed8936, #dd6b20);
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 700;
            z-index: 2;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { 
                opacity: 1; 
                transform: scale(1);
            }
            50% { 
                opacity: 0.7; 
                transform: scale(1.05);
            }
        }
    `;
    
    document.head.appendChild(notificationStyles);
}
// В svyz.js добавьте функцию для отображения откликов от покупателей
function renderSellerResponses(responsesList) {
    responsesList.forEach(response => {
        // ... существующий код ...
        
        // Добавьте отображение сообщения от покупателя
        if (response.message) {
            card.innerHTML += `
                <div class="response_message">
                    <strong>Сообщение от покупателя:</strong>
                    <p>${response.message}</p>
                </div>
            `;
        }
        
        // ... остальной код ...
    });
}