// sell.js - Исправленный и полный код
document.addEventListener('DOMContentLoaded', function() {
    // Данные пользователя
    const userData = {
        id: 1,
        name: "Иван Иванов",
        email: "ivan@example.com",
        phone: "+7 (999) 123-45-67"
    };

    // Имитация базы данных объектов
    let userProperties = JSON.parse(localStorage.getItem('userProperties') || '[]');
    
    // Элементы DOM
    const propertiesGrid = document.getElementById('propertiesGrid');
    const noProperties = document.getElementById('noProperties');
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    const addFirstBtn = document.getElementById('addFirstBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const propertyForm = document.getElementById('propertyForm');
    const floatingAddBtn = document.getElementById('floatingAddBtn');
    
    // Статистика
    const totalProperties = document.getElementById('totalProperties');
    const activeProperties = document.getElementById('activeProperties');
    const totalEarnings = document.getElementById('totalEarnings');
    const avgRating = document.getElementById('avgRating');
    
    // Фильтры
    const filterTabs = document.querySelectorAll('.filter_tab');
    const searchTrackingInput = document.querySelector('.search_tracking_input');
    
    // Шаги формы
    const steps = document.querySelectorAll('.form_step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const stepDots = document.querySelectorAll('.step_dot');
    
    let currentStep = 1;
    let selectedFiles = [];
    let editingPropertyId = null;
    let existingImages = [];

    // Инициализация
    init();
    
    function init() {
        loadProperties();
        updateStats();
        setupEventListeners();
        setupFormValidation();
    }
    
    function loadProperties() {
        userProperties = JSON.parse(localStorage.getItem('userProperties') || '[]');
        
        if (userProperties.length === 0) {
            propertiesGrid.style.display = 'none';
            noProperties.style.display = 'block';
            return;
        }
        
        propertiesGrid.style.display = 'grid';
        noProperties.style.display = 'none';
        
        renderProperties();
    }
    
    function renderProperties(filteredProperties = userProperties) {
        propertiesGrid.innerHTML = '';
        
        filteredProperties.forEach(property => {
            const propertyCard = createPropertyCard(property);
            propertiesGrid.appendChild(propertyCard);
        });
        
        // Анимация появления
        setTimeout(() => {
            document.querySelectorAll('.property_card').forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        }, 100);
    }
    
    function createPropertyCard(property) {
        const card = document.createElement('div');
        card.className = 'property_card';
        card.dataset.id = property.id;
        
        let statusIcon, statusClass, statusText;
        switch(property.status) {
            case 'active':
                statusIcon = '✅';
                statusClass = 'status_active';
                statusText = 'Активно';
                break;
            case 'pending':
                statusIcon = '⏳';
                statusClass = 'status_pending';
                statusText = 'На рассмотрении';
                break;
            case 'rejected':
                statusIcon = '❌';
                statusClass = 'status_rejected';
                statusText = 'Отклонено';
                break;
            case 'archived':
                statusIcon = '📁';
                statusClass = 'status_archived';
                statusText = 'В архиве';
                break;
            default:
                statusIcon = '❓';
                statusClass = 'status_unknown';
                statusText = 'Неизвестно';
        }
        
        let typeIcon, typeText;
        switch(property.type) {
            case 'apartment':
                typeIcon = '🏠';
                typeText = 'Квартира';
                break;
            case 'house':
                typeIcon = '🏡';
                typeText = 'Дом';
                break;
            case 'cottage':
                typeIcon = '🌲';
                typeText = 'Коттедж';
                break;
            case 'hotel':
                typeIcon = '🏨';
                typeText = 'Отель';
                break;
            case 'studio':
                typeIcon = '🏢';
                typeText = 'Студия';
                break;
            case 'room':
                typeIcon = '🚪';
                typeText = 'Комната';
                break;
            default:
                typeIcon = '🏘️';
                typeText = 'Другое';
        }
        
        const formattedPrice = formatPrice(property.price);
        const imageUrl = property.images && property.images.length > 0 
            ? property.images[0] 
            : 'img/default-property.jpg';
        
        card.innerHTML = `
            <div class="property_image">
                <img src="${imageUrl}" alt="${property.title}" onerror="this.src='img/default-property.jpg'">
                <div class="property_status ${statusClass}">
                    ${statusIcon} ${statusText}
                </div>
                <div class="property_type_badge">
                    ${typeIcon} ${typeText}
                </div>
            </div>
            
            <div class="property_info">
                <div class="property_header">
                    <h3 class="property_title">${property.title}</h3>
                    <div class="property_rating">
                        <span class="stars">${generateStars(property.rating || 0)}</span>
                        <span class="rating_count">(${property.reviews || 0})</span>
                    </div>
                </div>
                
                <div class="property_location">
                    <span class="location_icon">📍</span>
                    ${property.city || ''}, ${property.address || ''}
                </div>
                
                <div class="property_features">
                    <span class="feature">👥 ${property.guests || 0} гост.</span>
                    <span class="feature">🛏️ ${property.bedrooms || 0} сп.</span>
                    <span class="feature">🚿 ${property.bathrooms || 0} ван.</span>
                </div>
                
                <div class="property_meta">
                    <div class="property_price">
                        ${formattedPrice} <span>/ сутки</span>
                    </div>
                    <div class="property_meta_info">
                        <span class="meta_item">Добавлено: ${formatDate(property.createdAt)}</span>
                        <span class="meta_item">Просмотры: ${property.views || 0}</span>
                    </div>
                </div>
                
                <div class="property_actions">
                    <button class="action_btn edit_btn" data-action="edit">
                        <span class="action_icon">✏️</span> 
                        <span class="action_text">Редактировать</span>
                    </button>
                    <button class="action_btn stats_btn" data-action="stats">
                        <span class="action_icon">📊</span>
                        <span class="action_text">Статистика</span>
                    </button>
                    <button class="action_btn ${property.status === 'active' ? 'pause_btn' : 'activate_btn'}" 
                            data-action="${property.status === 'active' ? 'pause' : 'activate'}">
                        <span class="action_icon">${property.status === 'active' ? '⏸️' : '▶️'}</span>
                        <span class="action_text">${property.status === 'active' ? 'Приостановить' : 'Активировать'}</span>
                    </button>
                </div>
            </div>
        `;
        
        const buttons = card.querySelectorAll('.action_btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                const propertyId = parseInt(card.dataset.id);
                handlePropertyAction(action, propertyId);
            });
        });
        
        return card;
    }

    // Функция обновления статистики
    function updateStats() {
        const total = userProperties.length;
        const active = userProperties.filter(p => p.status === 'active').length;
        
        // Рассчитываем доход из истории бронирований
        let earnings = 0;
        let totalRating = 0;
        let ratedProperties = 0;
        
        // Получаем бронирования из localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        
        userProperties.forEach(property => {
            // Суммируем доход только от подтвержденных бронирований этого свойства
            const propertyBookings = bookings.filter(b => 
                b.propertyId == property.id && 
                b.status === 'completed'
            );
            
            propertyBookings.forEach(booking => {
                earnings += parseFloat(booking.totalPrice) || 0;
            });
            
            // Рассчитываем средний рейтинг
            if (property.rating && property.rating > 0) {
                totalRating += parseFloat(property.rating);
                ratedProperties++;
            }
        });
        
        const avg = ratedProperties > 0 ? (totalRating / ratedProperties).toFixed(1) : '0.0';
        
        // Обновляем UI
        totalProperties.textContent = total;
        activeProperties.textContent = active;
        totalEarnings.textContent = formatPrice(earnings) + ' ₽';
        avgRating.textContent = avg;
    }
    
    // Функция добавления/обновления в каталоге
    function updatePropertyInCatalog(property) {
        // Получаем текущий каталог из localStorage
        let catalog = JSON.parse(localStorage.getItem('catalogProperties') || '[]');
        
        // Удаляем старую версию объекта, если она существует
        catalog = catalog.filter(item => item.id != property.id);
        
        // Добавляем новый объект только если он активен
        if (property.status === 'active') {
            // Форматируем объект для каталога
            const catalogProperty = {
                id: property.id,
                title: property.title,
                location: `${property.city || ''}, ${property.address || ''}`,
                image: property.images && property.images.length > 0 ? property.images[0] : 'img/default-property.jpg',
                price: property.price,
                guests: property.guests,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                rating: property.rating || 0,
                type: property.type,
                wifi: property.amenities ? property.amenities.includes('wifi') : false,
                parking: property.amenities ? property.amenities.includes('parking') : false,
                kitchen: property.amenities ? property.amenities.includes('kitchen') : false,
                pool: property.amenities ? property.amenities.includes('pool') : false,
                ac: property.amenities ? property.amenities.includes('ac') : false,
                ownerId: userData.id,
                ownerName: userData.name,
                isUserProperty: true
            };
            
            catalog.push(catalogProperty);
        }
        
        // Сохраняем обновленный каталог
        localStorage.setItem('catalogProperties', JSON.stringify(catalog));
    }
    
    function handlePropertyAction(action, propertyId) {
        const property = userProperties.find(p => p.id == propertyId);
        if (!property) return;
        
        switch(action) {
            case 'edit':
                editProperty(propertyId);
                break;
            case 'stats':
                showPropertyStats(propertyId);
                break;
            case 'pause':
                pauseProperty(propertyId);
                break;
            case 'activate':
                activateProperty(propertyId);
                break;
        }
    }
    
    // ФУНКЦИЯ РЕДАКТИРОВАНИЯ
    function editProperty(propertyId) {
        const property = userProperties.find(p => p.id == propertyId);
        if (!property) return;
        
        editingPropertyId = propertyId;
        existingImages = property.images || [];
        selectedFiles = [];
        
        // Заполняем форму данными
        document.getElementById('propertyTitle').value = property.title;
        document.querySelector('select[name="type"]').value = property.type;
        
        // Заполняем способ связи
        if (property.contactType) {
            document.querySelector('select[name="contactType"]').value = property.contactType;
            initContactFields();
            
            if (property.contactType === 'email') {
                document.getElementById('contactEmail').value = property.contactInfo || '';
            } else if (property.contactType === 't-number') {
                document.getElementById('contactPhone').value = property.contactInfo || '';
            }
        }
        
        // Заполняем контактные данные по умолчанию
        if (!property.contactInfo) {
            document.getElementById('contactEmail').value = userData.email;
            document.getElementById('contactPhone').value = userData.phone;
        }
        
        document.getElementById('propertyCountry').value = property.country || 'ru';
        document.getElementById('propertyCity').value = property.city || '';
        document.getElementById('propertyAddress').value = property.address || '';
        document.getElementById('propertyZip').value = property.zip || '';
        document.getElementById('propertyPrice').value = property.price || '';
        document.getElementById('propertyDiscount').value = property.discount || 10;
        document.getElementById('propertyRules').value = property.rules || '';
        document.getElementById('propertyCheckIn').value = property.check_in || 'flexible';
        document.getElementById('propertyCheckOut').value = property.check_out || 'flexible';
        
        // Заполняем удобства
        const amenitiesCheckboxes = document.querySelectorAll('.amenity_checkbox input');
        amenitiesCheckboxes.forEach(checkbox => {
            checkbox.checked = property.amenities ? property.amenities.includes(checkbox.value) : false;
        });
        
        // Показываем существующие фотографии
        const photosPreview = document.getElementById('photosPreview');
        photosPreview.innerHTML = '';
        
        if (existingImages.length > 0) {
            existingImages.forEach((imgUrl, index) => {
                const preview = document.createElement('div');
                preview.className = 'photo_preview';
                preview.innerHTML = `
                    <img src="${imgUrl}" alt="Превью ${index + 1}" onerror="this.src='img/default-property.jpg'">
                    <button type="button" class="remove_photo" data-index="${index}">×</button>
                `;
                photosPreview.appendChild(preview);
                
                const removeBtn = preview.querySelector('.remove_photo');
                removeBtn.addEventListener('click', function() {
                    const idx = parseInt(this.dataset.index);
                    existingImages.splice(idx, 1);
                    preview.remove();
                    document.getElementById('photosCount').textContent = existingImages.length + selectedFiles.length;
                });
            });
        }
        
        document.getElementById('photosCount').textContent = existingImages.length;
        
        // Показываем модальное окно
        openModal();
        
        // Меняем заголовок формы
        document.querySelector('.modal_title').textContent = 'Редактировать объект';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
        
        // Устанавливаем начальный шаг
        currentStep = 1;
        updateStepNavigation();
        
        // Обновляем предпросмотр
        updatePreview();
        
        showNotification('Редактирование объекта', 'info');
    }
    
    function showPropertyStats(propertyId) {
        const property = userProperties.find(p => p.id == propertyId);
        if (!property) return;
        
        // Получаем бронирования для этого объекта
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const propertyBookings = bookings.filter(b => b.propertyId == propertyId);
        const completedBookings = propertyBookings.filter(b => b.status === 'completed');
        const totalEarnings = completedBookings.reduce((sum, booking) => sum + (parseFloat(booking.totalPrice) || 0), 0);
        
        const statsHtml = `
            <div class="stats_modal">
                <h3>Статистика: ${property.title}</h3>
                <div class="stats_details">
                    <div class="stat_item">
                        <span class="stat_label">Просмотры:</span>
                        <span class="stat_value">${property.views || 0}</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Всего бронирований:</span>
                        <span class="stat_value">${propertyBookings.length}</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Завершённые бронирования:</span>
                        <span class="stat_value">${completedBookings.length}</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Общий доход:</span>
                        <span class="stat_value">${formatPrice(totalEarnings)} ₽</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Средний доход/бронирование:</span>
                        <span class="stat_value">${formatPrice(completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0)} ₽</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Рейтинг:</span>
                        <span class="stat_value">${property.rating || 0}/5 ⭐</span>
                    </div>
                    <div class="stat_item">
                        <span class="stat_label">Отзывы:</span>
                        <span class="stat_value">${property.reviews || 0}</span>
                    </div>
                </div>
                ${propertyBookings.length > 0 ? `
                <div class="stats_chart">
                    <h4>Бронирования по месяцам</h4>
                    <div class="chart_bars">
                        ${generateMonthlyChart(propertyBookings)}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        showNotification(statsHtml, 'info');
    }
    
    function generateMonthlyChart(bookings) {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const now = new Date();
        const currentMonth = now.getMonth();
        
        let chartHTML = '';
        for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = months[monthIndex];
            const monthBookings = bookings.filter(booking => {
                if (!booking.createdAt) return false;
                const date = new Date(booking.createdAt);
                return date.getMonth() === monthIndex && date.getFullYear() === now.getFullYear();
            }).length;
            
            const height = Math.min(monthBookings * 20, 100);
            
            chartHTML += `
                <div class="chart_bar">
                    <div class="bar_fill" style="height: ${height}%"></div>
                    <span class="bar_label">${monthName}</span>
                    <span class="bar_value">${monthBookings}</span>
                </div>
            `;
        }
        
        return chartHTML;
    }
    
    function pauseProperty(propertyId) {
        const index = userProperties.findIndex(p => p.id == propertyId);
        if (index !== -1) {
            userProperties[index].status = 'archived';
            localStorage.setItem('userProperties', JSON.stringify(userProperties));
            removeFromCatalog(propertyId);
            loadProperties();
            updateStats();
            showNotification('Объект приостановлен', 'success');
        }
    }
    
    function activateProperty(propertyId) {
        const index = userProperties.findIndex(p => p.id == propertyId);
        if (index !== -1) {
            userProperties[index].status = 'active';
            localStorage.setItem('userProperties', JSON.stringify(userProperties));
            updatePropertyInCatalog(userProperties[index]);
            loadProperties();
            updateStats();
            showNotification('Объект активирован', 'success');
        }
    }
    
    function removeFromCatalog(propertyId) {
        let catalog = JSON.parse(localStorage.getItem('catalogProperties') || '[]');
        catalog = catalog.filter(item => item.id != propertyId);
        localStorage.setItem('catalogProperties', JSON.stringify(catalog));
    }
    
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        if (typeof message === 'string') {
            notification.textContent = message;
        } else {
            notification.innerHTML = message;
        }
        
        // Добавляем кнопку закрытия
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-notification';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => notification.remove());
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    function setupEventListeners() {
        addPropertyBtn.addEventListener('click', () => {
            editingPropertyId = null;
            existingImages = [];
            openModal();
        });
        
        addFirstBtn.addEventListener('click', () => {
            editingPropertyId = null;
            existingImages = [];
            openModal();
        });
        
        floatingAddBtn.addEventListener('click', () => {
            editingPropertyId = null;
            existingImages = [];
            openModal();
        });
        
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                filterTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                filterProperties(filter);
            });
        });
        
        searchTrackingInput.addEventListener('input', debounceSearch);
        
        prevBtn.addEventListener('click', goToPrevStep);
        nextBtn.addEventListener('click', goToNextStep);
        
        // Загрузка фотографий
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });
        
        const photoUpload = document.getElementById('photoUpload');
        photoUpload.addEventListener('change', handleFileSelect);
        
        const uploadArea = document.getElementById('photoUploadArea');
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleFileDrop);
        
        // Событие для инициализации полей связи
        const contactTypeSelect = document.querySelector('select[name="contactType"]');
        if (contactTypeSelect) {
            contactTypeSelect.addEventListener('change', initContactFields);
        }
        
        // Подсказки цен
        document.querySelectorAll('.price_suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                const price = this.dataset.price;
                document.getElementById('propertyPrice').value = price;
            });
        });
        
        propertyForm.addEventListener('submit', handleFormSubmit);
        
        // Выход из системы
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Вы уверены, что хотите выйти?')) {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                }
            });
        }
    }
    
    function initContactFields() {
        const contactTypeSelect = document.querySelector('select[name="contactType"]');
        const emailInput = document.getElementById('contactEmail');
        const phoneInput = document.getElementById('contactPhone');
        
        if (!contactTypeSelect || !emailInput || !phoneInput) return;
        
        const selectedValue = contactTypeSelect.value;
        
        // Скрываем оба поля сначала
        emailInput.style.display = 'none';
        phoneInput.style.display = 'none';
        emailInput.required = false;
        phoneInput.required = false;
        
        if (selectedValue === 'email') {
            emailInput.style.display = 'block';
            emailInput.required = true;
            // Заполняем email пользователя по умолчанию, если пусто
            if (!emailInput.value && userData.email) {
                emailInput.value = userData.email;
            }
        } else if (selectedValue === 't-number') {
            phoneInput.style.display = 'block';
            phoneInput.required = true;
            // Заполняем телефон пользователя по умолчанию, если пусто
            if (!phoneInput.value && userData.phone) {
                phoneInput.value = userData.phone;
            }
        }
    }
    
    function setupFormValidation() {
        // Валидация при клике на "Далее"
        nextBtn.addEventListener('click', function() {
            if (!validateCurrentStep()) {
                return false;
            }
        });
        
        // Валидация при сабмите формы
        propertyForm.addEventListener('submit', function(e) {
            if (!validateCurrentStep()) {
                e.preventDefault();
                return false;
            }
        });
    }
    
    function validateCurrentStep() {
        const step = document.getElementById(`step${currentStep}`);
        const inputs = step.querySelectorAll('[required]');
        
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showInputError(input, 'Это поле обязательно для заполнения');
            } else {
                clearInputError(input);
                
                // Дополнительные проверки
                if (input.type === 'email' && !isValidEmail(input.value)) {
                    isValid = false;
                    showInputError(input, 'Введите корректный email');
                }
                
                if (input.type === 'tel' && !isValidPhone(input.value)) {
                    isValid = false;
                    showInputError(input, 'Введите корректный номер телефона');
                }
                
                if (input.id === 'propertyPrice' && (input.value < 100 || input.value > 1000000)) {
                    isValid = false;
                    showInputError(input, 'Цена должна быть от 100 до 1 000 000 ₽');
                }
            }
        });
        
        // Проверка для шага 2 (фотографии)
        if (currentStep === 2) {
            const totalPhotos = existingImages.length + selectedFiles.length;
            if (totalPhotos < 2 && !editingPropertyId) {
                isValid = false;
                showNotification('Необходимо загрузить минимум 2 фотографии', 'error');
            }
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function isValidPhone(phone) {
        return /^[\+]?[0-9\s\-\(\)]+$/.test(phone);
    }
    
    function showInputError(input, message) {
        const formGroup = input.closest('.form_group');
        let errorElement = formGroup.querySelector('.form_error');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form_error';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.add('error');
        
        // Удаляем ошибку при вводе
        input.addEventListener('input', function clearError() {
            this.classList.remove('error');
            if (errorElement) {
                errorElement.remove();
            }
            this.removeEventListener('input', clearError);
        }, { once: true });
    }
    
    function clearInputError(input) {
        input.classList.remove('error');
        const errorElement = input.closest('.form_group')?.querySelector('.form_error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    function openModal() {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        if (!editingPropertyId) {
            resetForm();
        }
        
        // Инициализируем поля связи
        setTimeout(initContactFields, 100);
    }
    
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        resetForm();
        editingPropertyId = null;
        existingImages = [];
        document.querySelector('.modal_title').textContent = 'Добавить новое жильё';
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Опубликовать';
    }
    
    function resetForm() {
        currentStep = 1;
        selectedFiles = [];
        existingImages = [];
        updateStepNavigation();
        propertyForm.reset();
        document.getElementById('photosPreview').innerHTML = '';
        document.getElementById('photosCount').textContent = '0';
        initContactFields();
    }
    
    function goToPrevStep() {
        if (currentStep > 1) {
            currentStep--;
            updateStepNavigation();
        }
    }
    
    function goToNextStep() {
        if (currentStep < 4) {
            if (validateCurrentStep()) {
                currentStep++;
                updateStepNavigation();
                updatePreview();
            }
        }
    }
    
    function updateStepNavigation() {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === currentStep);
        });
        
        stepDots.forEach((dot, index) => {
            dot.classList.toggle('active', index + 1 === currentStep);
        });
        
        prevBtn.disabled = currentStep === 1;
        
        if (currentStep === 4) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
            updatePreview();
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
    
    function updatePreview() {
        const preview = document.getElementById('previewSummary');
        const formData = new FormData(propertyForm);
        
        const title = formData.get('title') || '';
        const type = formData.get('type') || '';
        const city = formData.get('city') || '';
        const guests = formData.get('guests') || 1;
        const bedrooms = formData.get('bedrooms') || 1;
        const price = formData.get('price') || 0;
        const totalPhotos = existingImages.length + selectedFiles.length;
        
        let typeText = '';
        switch(type) {
            case 'apartment': typeText = 'Квартира'; break;
            case 'house': typeText = 'Дом'; break;
            case 'cottage': typeText = 'Коттедж'; break;
            case 'hotel': typeText = 'Отель'; break;
            case 'studio': typeText = 'Студия'; break;
            case 'room': typeText = 'Комната'; break;
            default: typeText = 'Неизвестно';
        }
        
        preview.innerHTML = `
            <h4>Сводка:</h4>
            <div class="preview_item">
                <strong>${title}</strong>
            </div>
            <div class="preview_item">
                ${typeText} · ${city}
            </div>
            <div class="preview_item">
                👥 ${guests} гостей · 🛏️ ${bedrooms} спальни
            </div>
            <div class="preview_item">
                💰 ${formatPrice(price)} / сутки
            </div>
            <div class="preview_item">
                📸 ${totalPhotos} фотографий
            </div>
        `;
    }
    
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        handleFiles(files);
        e.target.value = ''; // Сбрасываем input
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    function handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }
    
    function handleFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (selectedFiles.length + imageFiles.length > 5) {
            showNotification('Можно загрузить максимум 5 фотографий', 'error');
            return;
        }
        
        imageFiles.forEach(file => {
            if (selectedFiles.length < 5) {
                selectedFiles.push(file);
                createImagePreview(file);
            }
        });
        
        document.getElementById('photosCount').textContent = existingImages.length + selectedFiles.length;
    }
    
    function createImagePreview(file) {
        const reader = new FileReader();
        const photosPreview = document.getElementById('photosPreview');
        
        reader.onload = function(e) {
            const preview = document.createElement('div');
            preview.className = 'photo_preview';
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Превью">
                <button type="button" class="remove_photo" data-file="${file.name}">×</button>
            `;
            
            photosPreview.appendChild(preview);
            
            const removeBtn = preview.querySelector('.remove_photo');
            removeBtn.addEventListener('click', function() {
                const fileName = this.dataset.file;
                selectedFiles = selectedFiles.filter(f => f.name !== fileName);
                preview.remove();
                document.getElementById('photosCount').textContent = existingImages.length + selectedFiles.length;
            });
        };
        
        reader.readAsDataURL(file);
    }
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
            return;
        }
        
        const totalPhotos = existingImages.length + selectedFiles.length;
        if (totalPhotos < 2 && !editingPropertyId) {
            showNotification('Необходимо загрузить минимум 2 фотографии', 'error');
            return;
        }
        
        submitBtn.innerHTML = editingPropertyId ? 
            '<i class="fas fa-spinner fa-spin"></i> Сохранение...' : 
            '<i class="fas fa-spinner fa-spin"></i> Публикация...';
        submitBtn.disabled = true;
        
        try {
            let imageUrls = [...existingImages];
            
            // Загружаем новые изображения
            if (selectedFiles.length > 0) {
                const newUrls = await uploadImages();
                imageUrls = [...imageUrls, ...newUrls];
            }
            
            const formData = new FormData(propertyForm);
            const amenities = Array.from(formData.getAll('amenities'));
            
            // Получаем способ связи
            const contactType = formData.get('contactType');
            let contactInfo = '';
            if (contactType === 'email') {
                contactInfo = document.getElementById('contactEmail')?.value || '';
            } else if (contactType === 't-number') {
                contactInfo = document.getElementById('contactPhone')?.value || '';
            }
            
            // Собираем данные объекта
            const propertyData = {
                id: editingPropertyId || Date.now(),
                title: formData.get('title'),
                type: formData.get('type'),
                contactType: contactType,
                contactInfo: contactInfo,
                country: formData.get('country'),
                city: formData.get('city'),
                address: formData.get('address'),
                zip: formData.get('zip') || '',
                price: parseFloat(formData.get('price')) || 0,
                discount: parseInt(formData.get('discount')) || 0,
                amenities: amenities,
                rules: formData.get('rules') || '',
                check_in: formData.get('check_in') || 'flexible',
                check_out: formData.get('check_out') || 'flexible',
                guests: 2, // По умолчанию
                bedrooms: 1, // По умолчанию
                bathrooms: 1, // По умолчанию
                images: imageUrls.length > 0 ? imageUrls : ['img/default-property.jpg'],
                status: editingPropertyId ? 
                    userProperties.find(p => p.id == editingPropertyId)?.status || 'pending' : 'pending',
                createdAt: editingPropertyId ? 
                    userProperties.find(p => p.id == editingPropertyId)?.createdAt || new Date().toISOString() : 
                    new Date().toISOString(),
                views: editingPropertyId ? userProperties.find(p => p.id == editingPropertyId)?.views || 0 : 0,
                rating: editingPropertyId ? userProperties.find(p => p.id == editingPropertyId)?.rating || 0 : 0,
                reviews: editingPropertyId ? userProperties.find(p => p.id == editingPropertyId)?.reviews || 0 : 0
            };
            
            if (editingPropertyId) {
                // Обновляем существующий объект
                const index = userProperties.findIndex(p => p.id == editingPropertyId);
                if (index !== -1) {
                    userProperties[index] = { ...userProperties[index], ...propertyData };
                    showNotification('Объект успешно обновлен!', 'success');
                }
            } else {
                // Добавляем новый объект
                userProperties.unshift(propertyData);
                showNotification('Объект успешно добавлен!', 'success');
            }
            
            // Сохраняем в localStorage
            localStorage.setItem('userProperties', JSON.stringify(userProperties));
            
            // Обновляем в каталоге
            updatePropertyInCatalog(propertyData);
            
            setTimeout(() => {
                closeModal();
                loadProperties();
                updateStats();
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            showNotification('Произошла ошибка при сохранении', 'error');
        } finally {
            submitBtn.innerHTML = editingPropertyId ? 
                '<i class="fas fa-save"></i> Сохранить изменения' : 
                '<i class="fas fa-check"></i> Опубликовать';
            submitBtn.disabled = false;
        }
    }
    
    function uploadImages() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const imageUrls = selectedFiles.map((_, index) => 
                    `img/property-${Date.now()}-${index}.jpg`
                );
                resolve(imageUrls);
            }, 1000);
        });
    }
    
    function filterProperties(filter) {
        let filtered = userProperties;
        
        if (filter !== 'all') {
            filtered = userProperties.filter(property => property.status === filter);
        }
        
        const searchTerm = searchTrackingInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(property => 
                property.title.toLowerCase().includes(searchTerm) ||
                (property.address && property.address.toLowerCase().includes(searchTerm)) ||
                (property.city && property.city.toLowerCase().includes(searchTerm))
            );
        }
        
        renderProperties(filtered);
        
        if (filtered.length === 0) {
            propertiesGrid.innerHTML = `
                <div class="no_results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3 style="color: white; margin-bottom: 10px;">Ничего не найдено</h3>
                    <p style="color: #a0aec0;">Попробуйте изменить критерии поиска</p>
                </div>
            `;
        }
    }
    
    function debounceSearch() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const activeFilter = document.querySelector('.filter_tab.active').dataset.filter;
            filterProperties(activeFilter);
        }, 300);
    }
    
    // Вспомогательные функции
    function formatPrice(price) {
        if (!price) return '0';
        return new Intl.NumberFormat('ru-RU').format(price);
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Недавно';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Недавно';
        return date.toLocaleDateString('ru-RU');
    }
    
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        if (hasHalfStar) stars += '☆';
        stars += '☆'.repeat(5 - Math.ceil(rating));
        return stars;
    }
});