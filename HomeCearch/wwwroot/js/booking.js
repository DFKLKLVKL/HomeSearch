// ==================== Глобальные переменные ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                 JSON.parse(localStorage.getItem('userData')) || 
                 JSON.parse(localStorage.getItem('user')) || 
                 null;
let currentProperty = null;
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
let responses = JSON.parse(localStorage.getItem('responses')) || [];
let properties = JSON.parse(localStorage.getItem('properties')) || [];

// ==================== DOM элементы ====================
const propertyImages = document.getElementById('propertyImages');
const propertyTitle = document.getElementById('propertyTitle');
const propertyLocation = document.getElementById('propertyLocation');
const propertyGuests = document.getElementById('propertyGuests');
const propertyBedrooms = document.getElementById('propertyBedrooms');
const propertyBathrooms = document.getElementById('propertyBathrooms');
const propertyType = document.getElementById('propertyType');
const propertyAmenities = document.getElementById('propertyAmenities');
const propertyDescription = document.getElementById('propertyDescription');
const propertyRules = document.getElementById('propertyRules');
const pricePerNight = document.getElementById('pricePerNight');
const nightsCount = document.getElementById('nightsCount');
const totalNightsPrice = document.getElementById('totalNightsPrice');
const cleaningFee = document.getElementById('cleaningFee');
const serviceFee = document.getElementById('serviceFee');
const discountAmount = document.getElementById('discountAmount');
const totalPrice = document.getElementById('totalPrice');
const checkInDate = document.getElementById('checkInDate');
const checkOutDate = document.getElementById('checkOutDate');
const nightsInfo = document.getElementById('nightsInfo');
const adultsCount = document.getElementById('adultsCount');
const childrenCount = document.getElementById('childrenCount');
const messageToOwner = document.getElementById('messageToOwner');
const messageCharCount = document.getElementById('messageCharCount');
const contactInput = document.getElementById('contactInput');
const phoneInput = document.getElementById('phoneInput');
const bookingForm = document.getElementById('bookingForm');
const confirmationModal = document.getElementById('confirmationModal');
const bookingNumber = document.getElementById('bookingNumber');
const viewBookingBtn = document.getElementById('viewBookingBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logout');

// ==================== Инициализация ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница бронирования загружается...');
    
    // Проверка авторизации
    if (!currentUser) {
        alert('Для бронирования необходимо войти в систему');
        window.location.href = 'index.html';
        return;
    }
    
    // Обновляем имя пользователя
    updateUserName();
    
    // Получаем ID недвижимости из URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        alert('Не указана недвижимость для бронирования');
        window.location.href = 'catalog.html';
        return;
    }
    
    // Загружаем данные о недвижимости
    loadPropertyData(propertyId);
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Инициализируем форму
    initForm();
});

// ==================== Загрузка данных о недвижимости ====================
function loadPropertyData(propertyId) {
    // Ищем недвижимость в localStorage
    if (properties.length === 0) {
        // Если нет данных, создаем демо-недвижимость
        createDemoProperty(propertyId);
    }
    
    currentProperty = properties.find(p => p.id === propertyId);
    
    if (!currentProperty) {
        // Если не нашли, создаем демо-недвижимость
        currentProperty = createDemoProperty(propertyId);
    }
    
    // Заполняем информацию о недвижимости
    fillPropertyInfo();
    calculatePrices();
}

// ==================== Заполнение информации о недвижимости ====================
function fillPropertyInfo() {
    // Заголовок и местоположение
    propertyTitle.textContent = currentProperty.title;
    propertyLocation.textContent = `${currentProperty.city}, ${currentProperty.address || ''}`;
    
    // Характеристики
    propertyGuests.textContent = currentProperty.guests || 2;
    propertyBedrooms.textContent = currentProperty.bedrooms || 1;
    propertyBathrooms.textContent = currentProperty.bathrooms || 1;
    
    // Тип жилья
    const typeMap = {
        'apartment': 'Квартира',
        'house': 'Дом',
        'cottage': 'Коттедж',
        'hotel': 'Отель',
        'studio': 'Студия',
        'room': 'Комната'
    };
    propertyType.textContent = typeMap[currentProperty.type] || currentProperty.type;
    
    // Описание
    propertyDescription.textContent = currentProperty.description || 
        'Уютное жильё со всеми удобствами для комфортного проживания.';
    
    // Правила
    propertyRules.textContent = currentProperty.rules || 
        '• Заселение после 14:00\n• Выезд до 12:00\n• Курение запрещено\n• Нельзя с животными\n• Тихое время с 23:00 до 8:00';
    
    // Цена за ночь
    const price = currentProperty.price || 3000;
    pricePerNight.textContent = price.toLocaleString('ru-RU');
    
    // Удобства
    renderAmenities();
    
    // Изображения
    renderImages();
}

// ==================== Рендер удобств ====================
function renderAmenities() {
    propertyAmenities.innerHTML = '';
    
    const amenities = currentProperty.amenities || [];
    const amenitiesMap = {
        'wifi': { icon: '📶', text: 'Wi-Fi' },
        'parking': { icon: '🅿️', text: 'Парковка' },
        'kitchen': { icon: '🍳', text: 'Кухня' },
        'ac': { icon: '❄️', text: 'Кондиционер' },
        'tv': { icon: '📺', text: 'Телевизор' },
        'washer': { icon: '🧺', text: 'Стиральная машина' },
        'breakfast': { icon: '🍽️', text: 'Завтрак' },
        'pool': { icon: '🏊', text: 'Бассейн' },
        'gym': { icon: '💪', text: 'Спортзал' },
        'pet': { icon: '🐾', text: 'Можно с животными' }
    };
    
    // Если нет удобств, показываем стандартные
    if (amenities.length === 0) {
        amenities.push('wifi', 'parking', 'kitchen');
    }
    
    amenities.forEach(amenity => {
        if (amenitiesMap[amenity]) {
            const amenityElement = document.createElement('div');
            amenityElement.className = 'amenity_item';
            amenityElement.innerHTML = `
                <span class="amenity_icon">${amenitiesMap[amenity].icon}</span>
                <span class="amenity_text">${amenitiesMap[amenity].text}</span>
            `;
            propertyAmenities.appendChild(amenityElement);
        }
    });
}

// ==================== Рендер изображений ====================
function renderImages() {
    propertyImages.innerHTML = '';
    
    const images = currentProperty.photos || ['img/default-property.jpg'];
    
    images.forEach((image, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = image;
        imgElement.alt = currentProperty.title;
        imgElement.className = index === 0 ? 'active' : '';
        propertyImages.appendChild(imgElement);
    });
}

// ==================== Настройка обработчиков событий ====================
function setupEventListeners() {
    // Обновление дат
    checkInDate.addEventListener('change', updateDates);
    checkOutDate.addEventListener('change', updateDates);
    
    // Количество гостей
    document.querySelectorAll('.counter_btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            const isPlus = this.classList.contains('plus');
            updateGuestCount(type, isPlus);
        });
    });
    
    // Способ связи
    document.querySelectorAll('input[name="contactMethod"]').forEach(radio => {
        radio.addEventListener('change', updateContactInput);
    });
    
    // Сообщение владельцу
    messageToOwner.addEventListener('input', function() {
        const count = this.value.length;
        messageCharCount.textContent = count;
        messageCharCount.style.color = count > 500 ? '#e53e3e' : '#a0aec0';
    });
    
    // Подтверждение бронирования
    bookingForm.addEventListener('submit', submitBooking);
    
    // Модальное окно
    viewBookingBtn.addEventListener('click', function() {
        window.location.href = 'buy.html';
    });
    
    closeModalBtn.addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        window.location.href = 'catalog.html';
    });
    
    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// ==================== Инициализация формы ====================
function initForm() {
    // Устанавливаем минимальные даты
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    checkInDate.min = today.toISOString().split('T')[0];
    checkOutDate.min = tomorrow.toISOString().split('T')[0];
    
    // Устанавливаем дефолтные даты
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + 3);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);
    
    checkInDate.value = checkIn.toISOString().split('T')[0];
    checkOutDate.value = checkOut.toISOString().split('T')[0];
    
    // Обновляем даты
    updateDates();
    
    // Обновляем поле контакта
    updateContactInput();
}

// ==================== Обновление дат ====================
function updateDates() {
    const checkIn = new Date(checkInDate.value);
    const checkOut = new Date(checkOutDate.value);
    
    // Проверка корректности дат
    if (checkIn >= checkOut) {
        checkOutDate.value = '';
        alert('Дата выезда должна быть позже даты заезда');
        return;
    }
    
    // Расчет количества ночей
    const timeDiff = checkOut - checkIn;
    const nights = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (nights < 1) {
        alert('Минимальное количество ночей: 1');
        checkOutDate.value = '';
        return;
    }
    
    // Обновляем информацию о ночах
    nightsCount.textContent = nights;
    nightsInfo.textContent = `${nights} ${getNightWord(nights)}`;
    
    // Пересчитываем цены
    calculatePrices();
}

// ==================== Обновление количества гостей ====================
function updateGuestCount(type, isPlus) {
    const countElement = type === 'adults' ? adultsCount : childrenCount;
    let count = parseInt(countElement.textContent);
    
    if (isPlus) {
        if (type === 'adults' && count < 10) {
            count++;
        } else if (type === 'children' && count < 5) {
            count++;
        }
    } else {
        if (type === 'adults' && count > 1) {
            count--;
        } else if (type === 'children' && count > 0) {
            count--;
        }
    }
    
    countElement.textContent = count;
    
    // Проверяем общее количество гостей
    const totalGuests = parseInt(adultsCount.textContent) + parseInt(childrenCount.textContent);
    const maxGuests = currentProperty.guests || 4;
    
    if (totalGuests > maxGuests) {
        alert(`Максимальное количество гостей: ${maxGuests}`);
        if (type === 'adults') {
            adultsCount.textContent = maxGuests - parseInt(childrenCount.textContent);
        } else {
            childrenCount.textContent = maxGuests - parseInt(adultsCount.textContent);
        }
    }
}

// ==================== Обновление поля контакта ====================
function updateContactInput() {
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    
    // Очищаем контейнер
    contactInput.innerHTML = '';
    
    let inputElement;
    
    switch (selectedMethod) {
        case 'phone':
            inputElement = document.createElement('input');
            inputElement.type = 'tel';
            inputElement.id = 'phoneInput';
            inputElement.placeholder = '+7 (999) 123-45-67';
            inputElement.pattern = '^\\+7\\s\\(\\d{3}\\)\\s\\d{3}-\\d{2}-\\d{2}$';
            inputElement.required = true;
            break;
            
        case 'email':
            inputElement = document.createElement('input');
            inputElement.type = 'email';
            inputElement.id = 'emailInput';
            inputElement.placeholder = 'email@example.com';
            inputElement.required = true;
            break;
            
        case 'telegram':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.id = 'telegramInput';
            inputElement.placeholder = '@username';
            inputElement.pattern = '^@[A-Za-z0-9_]{5,32}$';
            inputElement.required = true;
            break;
            
        case 'whatsapp':
            inputElement = document.createElement('input');
            inputElement.type = 'tel';
            inputElement.id = 'whatsappInput';
            inputElement.placeholder = '+7 (999) 123-45-67';
            inputElement.pattern = '^\\+7\\s\\(\\d{3}\\)\\s\\d{3}-\\d{2}-\\d{2}$';
            inputElement.required = true;
            break;
    }
    
    contactInput.appendChild(inputElement);
}

// ==================== Расчет цен ====================
function calculatePrices() {
    const price = currentProperty.price || 3000;
    const nights = parseInt(nightsCount.textContent) || 3;
    const discount = currentProperty.discount || 0;
    
    // Цена за ночи
    const nightsPrice = price * nights;
    totalNightsPrice.textContent = nightsPrice.toLocaleString('ru-RU') + ' ₽';
    
    // Плата за уборку (10% от стоимости ночей, минимум 500)
    const cleaningFeeAmount = Math.max(500, Math.round(nightsPrice * 0.1));
    cleaningFee.textContent = cleaningFeeAmount.toLocaleString('ru-RU') + ' ₽';
    
    // Сервисный сбор (5% от стоимости)
    const serviceFeeAmount = Math.round(nightsPrice * 0.05);
    serviceFee.textContent = serviceFeeAmount.toLocaleString('ru-RU') + ' ₽';
    
    // Скидка
    let discountAmountValue = 0;
    if (discount > 0 && nights >= 7) {
        discountAmountValue = Math.round(nightsPrice * (discount / 100));
        discountAmount.textContent = '-' + discountAmountValue.toLocaleString('ru-RU') + ' ₽';
        document.getElementById('discountRow').style.display = 'flex';
    } else {
        document.getElementById('discountRow').style.display = 'none';
    }
    
    // Итоговая сумма
    const total = nightsPrice + cleaningFeeAmount + serviceFeeAmount - discountAmountValue;
    totalPrice.textContent = total.toLocaleString('ru-RU') + ' ₽';
}

// ==================== Отправка бронирования ====================
function submitBooking(e) {
    e.preventDefault();
    
    // Проверка заполнения всех полей
    if (!validateForm()) {
        return;
    }
    
    // Создание объекта бронирования
    const booking = createBookingObject();
    
    // Сохранение бронирования
    saveBooking(booking);
    
    // Создание отклика для владельца
    createResponseForOwner(booking);
    
    // Показ модального окна подтверждения
    showConfirmationModal(booking);
}

// ==================== Валидация формы ====================
function validateForm() {
    // Проверка дат
    if (!checkInDate.value || !checkOutDate.value) {
        alert('Пожалуйста, выберите даты заезда и выезда');
        return false;
    }
    
    const checkIn = new Date(checkInDate.value);
    const checkOut = new Date(checkOutDate.value);
    
    if (checkIn >= checkOut) {
        alert('Дата выезда должна быть позже даты заезда');
        return false;
    }
    
    // Проверка контактной информации
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    let contactValue = '';
    
    switch (selectedMethod) {
        case 'phone':
            contactValue = document.getElementById('phoneInput').value;
            if (!contactValue || !/^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(contactValue)) {
                alert('Пожалуйста, введите корректный номер телефона в формате +7 (999) 123-45-67');
                return false;
            }
            break;
            
        case 'email':
            contactValue = document.getElementById('emailInput').value;
            if (!contactValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)) {
                alert('Пожалуйста, введите корректный email');
                return false;
            }
            break;
            
        case 'telegram':
            contactValue = document.getElementById('telegramInput').value;
            if (!contactValue || !/^@[A-Za-z0-9_]{5,32}$/.test(contactValue)) {
                alert('Пожалуйста, введите корректный Telegram username (например, @username)');
                return false;
            }
            break;
            
        case 'whatsapp':
            contactValue = document.getElementById('whatsappInput').value;
            if (!contactValue || !/^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/.test(contactValue)) {
                alert('Пожалуйста, введите корректный номер WhatsApp в формате +7 (999) 123-45-67');
                return false;
            }
            break;
    }
    
    // Проверка согласия с правилами
    const agreeRules = document.getElementById('agreeRules');
    if (!agreeRules.checked) {
        alert('Необходимо согласиться с правилами проживания');
        return false;
    }
    
    return true;
}

// ==================== Создание объекта бронирования ====================
function createBookingObject() {
    const selectedMethod = document.querySelector('input[name="contactMethod"]:checked').value;
    let contactValue = '';
    
    switch (selectedMethod) {
        case 'phone':
            contactValue = document.getElementById('phoneInput').value;
            break;
        case 'email':
            contactValue = document.getElementById('emailInput').value;
            break;
        case 'telegram':
            contactValue = document.getElementById('telegramInput').value;
            break;
        case 'whatsapp':
            contactValue = document.getElementById('whatsappInput').value;
            break;
    }
    
    const bookingId = 'B' + Date.now().toString(36).toUpperCase();
    const totalAdults = parseInt(adultsCount.textContent);
    const totalChildren = parseInt(childrenCount.textContent);
    const totalGuests = totalAdults + totalChildren;
    const nights = parseInt(nightsCount.textContent);
    
    // Расчет итоговой суммы
    const price = currentProperty.price || 3000;
    const nightsPrice = price * nights;
    const cleaningFeeAmount = Math.max(500, Math.round(nightsPrice * 0.1));
    const serviceFeeAmount = Math.round(nightsPrice * 0.05);
    const discount = currentProperty.discount || 0;
    const discountAmountValue = discount > 0 && nights >= 7 ? Math.round(nightsPrice * (discount / 100)) : 0;
    const totalAmount = nightsPrice + cleaningFeeAmount + serviceFeeAmount - discountAmountValue;
    
    return {
        id: bookingId,
        propertyId: currentProperty.id,
        propertyTitle: currentProperty.title,
        propertyImage: currentProperty.photos?.[0] || 'img/default-property.jpg',
        buyerId: currentUser.id || currentUser.email || 'user_1',
        buyerName: currentUser.name || currentUser.firstName || 'Пользователь',
        ownerId: currentProperty.ownerId || 'owner_1',
        checkIn: checkInDate.value,
        checkOut: checkOutDate.value,
        nights: nights,
        adults: totalAdults,
        children: totalChildren,
        guests: totalGuests,
        contactMethod: selectedMethod,
        contactValue: contactValue,
        message: messageToOwner.value,
        pricePerNight: price,
        nightsPrice: nightsPrice,
        cleaningFee: cleaningFeeAmount,
        serviceFee: serviceFeeAmount,
        discount: discountAmountValue,
        totalAmount: totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// ==================== Сохранение бронирования ====================
function saveBooking(booking) {
    // Загружаем существующие бронирования
    bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Добавляем новое бронирование
    bookings.push(booking);
    
    // Сохраняем в localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    console.log('Бронирование сохранено:', booking);
}

// ==================== Создание отклика для владельца ====================
function createResponseForOwner(booking) {
    // Загружаем существующие отклики
    responses = JSON.parse(localStorage.getItem('responses')) || [];
    
    const response = {
        id: 'R' + Date.now().toString(36).toUpperCase(),
        bookingId: booking.id,
        propertyId: booking.propertyId,
        buyerId: booking.buyerId,
        buyerName: booking.buyerName,
        buyerContacts: `${booking.contactMethod}: ${booking.contactValue}`,
        ownerId: booking.ownerId,
        status: 'pending',
        message: booking.message,
        guests: booking.guests,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: booking.totalAmount + ' ₽',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Добавляем отклик
    responses.push(response);
    
    // Сохраняем в localStorage
    localStorage.setItem('responses', JSON.stringify(responses));
    
    console.log('Отклик создан для владельца:', response);
}

// ==================== Показ модального окна подтверждения ====================
function showConfirmationModal(booking) {
    // Генерация номера бронирования
    bookingNumber.textContent = booking.id;
    
    // Показываем модальное окно
    confirmationModal.classList.add('active');
    
    // Блокируем прокрутку страницы
    document.body.style.overflow = 'hidden';
}

// ==================== Вспомогательные функции ====================
function getNightWord(nights) {
    if (nights % 10 === 1 && nights % 100 !== 11) {
        return 'ночь';
    } else if (nights % 10 >= 2 && nights % 10 <= 4 && (nights % 100 < 10 || nights % 100 >= 20)) {
        return 'ночи';
    } else {
        return 'ночей';
    }
}

function updateUserName() {
    if (userName && currentUser) {
        userName.textContent = currentUser.name || 
                              currentUser.firstName || 
                              currentUser.email || 
                              'Пользователь';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ==================== Демо-данные ====================
function createDemoProperty(propertyId) {
    const demoProperty = {
        id: propertyId || 'property_1',
        title: 'Уютная квартира в центре Москвы',
        type: 'apartment',
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        price: 3500,
        city: 'Москва',
        address: 'ул. Тверская, д. 10',
        description: 'Просторная светлая квартира с видом на Кремль. Полностью оборудованная кухня, современная техника, высокоскоростной Wi-Fi. Идеально подходит для деловой поездки или отдыха.',
        rules: '• Заселение после 14:00\n• Выезд до 12:00\n• Курение запрещено\n• Нельзя с животными\n• Тихое время с 23:00 до 8:00',
        amenities: ['wifi', 'parking', 'kitchen', 'ac', 'tv', 'washer'],
        photos: ['img/apartment-1.jpg', 'img/apartment-2.jpg'],
        discount: 10,
        ownerId: 'owner_1'
    };
    
    // Сохраняем демо-недвижимость
    properties.push(demoProperty);
    localStorage.setItem('properties', JSON.stringify(properties));
    
    return demoProperty;
}

// ==================== Стили для страницы бронирования ====================
const bookingStyles = document.createElement('style');
bookingStyles.textContent = `
    /* Контейнер бронирования */
    .booking_container {
        padding: 30px 0 80px;
        background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
        min-height: 100vh;
    }
    
    .booking_wrapper {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 40px;
        margin-top: 30px;
    }
    
    /* Левая часть: информация о жилье */
    .booking_left {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 25px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .property_card_booking {
        display: flex;
        flex-direction: column;
        gap: 25px;
    }
    
    .property_images {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        border-radius: 15px;
        overflow: hidden;
    }
    
    .property_images img {
        width: 100%;
        height: 250px;
        object-fit: cover;
        border-radius: 10px;
        transition: transform 0.3s ease;
    }
    
    .property_images img:hover {
        transform: scale(1.02);
    }
    
    .property_info_booking h2 {
        color: white;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
    }
    
    .property_location_booking {
        color: #a0aec0;
        font-size: 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .property_location_booking:before {
        content: '📍';
    }
    
    .property_details_booking {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .detail_item {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #d1d5db;
        font-size: 15px;
        background: rgba(255, 255, 255, 0.05);
        padding: 10px 15px;
        border-radius: 10px;
    }
    
    .detail_item i {
        color: #667eea;
        font-size: 18px;
    }
    
    .property_amenities_booking {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .amenity_item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #d1d5db;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.05);
        padding: 8px 12px;
        border-radius: 8px;
    }
    
    .amenity_icon {
        font-size: 16px;
    }
    
    .property_description_booking,
    .property_rules_booking {
        margin-bottom: 25px;
    }
    
    .property_description_booking h3,
    .property_rules_booking h3 {
        color: white;
        font-size: 20px;
        margin-bottom: 15px;
        font-weight: 600;
    }
    
    .property_description_booking p,
    .property_rules_booking p {
        color: #a0aec0;
        line-height: 1.6;
        white-space: pre-line;
    }
    
    /* Правая часть: форма бронирования */
    .booking_right {
        position: sticky;
        top: 100px;
        height: fit-content;
    }
    
    .booking_form_card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 25px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .booking_form_card h2 {
        color: white;
        font-size: 24px;
        margin-bottom: 25px;
        text-align: center;
    }
    
    /* Сводка по ценам */
    .price_summary {
        background: rgba(255, 255, 255, 0.03);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 30px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .price_row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        color: #a0aec0;
        font-size: 15px;
    }
    
    .price_row.discount_row {
        color: #38a169;
    }
    
    .price_total {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 20px;
        font-weight: 700;
    }
    
    /* Форма бронирования */
    .booking_form .form_section {
        margin-bottom: 25px;
        padding-bottom: 25px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .booking_form .form_section:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
    
    .booking_form .form_section h3 {
        color: white;
        font-size: 18px;
        margin-bottom: 15px;
        font-weight: 600;
    }
    
    /* Даты */
    .date_inputs_booking {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    
    .date_input_group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .date_input_group label {
        color: #d1d5db;
        font-size: 14px;
        font-weight: 600;
    }
    
    .date_input_group input {
        padding: 12px 15px;
        border-radius: 10px;
        border: 2px solid #4a5568;
        background: rgba(255, 255, 255, 0.08);
        color: white;
        font-size: 15px;
        transition: all 0.3s ease;
    }
    
    .date_input_group input:focus {
        border-color: #667eea;
        outline: none;
    }
    
    .nights_info {
        color: #a0aec0;
        font-size: 14px;
        margin-top: 10px;
        text-align: center;
    }
    
    /* Гости */
    .guests_selector_booking {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .guest_type {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }
    
    .guest_type span:first-child {
        color: white;
        font-weight: 600;
    }
    
    .guest_counter {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .counter_btn {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 2px solid #4a5568;
        background: transparent;
        color: #a0aec0;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .counter_btn:hover:not(:disabled) {
        border-color: #667eea;
        color: #667eea;
    }
    
    .counter_btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    
    .guest_count {
        color: white;
        font-size: 18px;
        font-weight: 600;
        min-width: 30px;
        text-align: center;
    }
    
    /* Способ связи */
    .contact_methods {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .contact_method input {
        display: none;
    }
    
    .contact_method label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 15px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid #4a5568;
        border-radius: 10px;
        color: #a0aec0;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .contact_method input:checked + label {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }
    
    .contact_method label i {
        font-size: 20px;
    }
    
    .contact_method label span {
        font-size: 13px;
        font-weight: 600;
    }
    
    .contact_input input {
        width: 100%;
        padding: 12px 15px;
        border-radius: 10px;
        border: 2px solid #4a5568;
        background: rgba(255, 255, 255, 0.08);
        color: white;
        font-size: 15px;
        transition: all 0.3s ease;
    }
    
    .contact_input input:focus {
        border-color: #667eea;
        outline: none;
    }
    
    /* Сообщение владельцу */
    .booking_form textarea {
        width: 100%;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #4a5568;
        background: rgba(255, 255, 255, 0.08);
        color: white;
        font-size: 15px;
        resize: vertical;
        transition: all 0.3s ease;
    }
    
    .booking_form textarea:focus {
        border-color: #667eea;
        outline: none;
    }
    
    .char_count_booking {
        text-align: right;
        color: #a0aec0;
        font-size: 14px;
        margin-top: 5px;
    }
    
    /* Правила отмены */
    .cancellation_policy {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
    }
    
    .cancellation_policy p {
        color: #a0aec0;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .cancellation_policy p:last-child {
        margin-bottom: 0;
    }
    
    .cancellation_policy i {
        color: #667eea;
    }
    
    /* Соглашение */
    .agreement_checkbox {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    
    .agreement_checkbox input {
        margin-top: 5px;
        accent-color: #667eea;
    }
    
    .agreement_checkbox label {
        color: #a0aec0;
        font-size: 14px;
        line-height: 1.5;
    }
    
    .agreement_checkbox a {
        color: #667eea;
        text-decoration: none;
    }
    
    .agreement_checkbox a:hover {
        text-decoration: underline;
    }
    
    /* Кнопка подтверждения */
    .confirm_booking_btn {
        width: 100%;
        padding: 18px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 15px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 25px;
    }
    
    .confirm_booking_btn:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }
    
    .confirm_booking_btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .booking_note {
        margin-top: 20px;
        text-align: center;
    }
    
    .booking_note p {
        color: #a0aec0;
        font-size: 13px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    /* Модальное окно подтверждения */
    .booking_modal {
        text-align: center;
        max-width: 450px;
    }
    
    .modal_success_icon {
        font-size: 80px;
        color: #38a169;
        margin-bottom: 20px;
    }
    
    .modal_message {
        color: #a0aec0;
        margin-bottom: 30px;
        line-height: 1.6;
    }
    
    .modal_message strong {
        color: white;
        font-weight: 700;
    }
    
    .modal_actions {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    
    .modal_btn {
        padding: 12px 25px;
        border-radius: 10px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .modal_btn.primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
    }
    
    .modal_btn.secondary {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        border: 1px solid #4a5568;
    }
    
    .modal_btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    /* Адаптивность */
    @media (max-width: 992px) {
        .booking_wrapper {
            grid-template-columns: 1fr;
        }
        
        .booking_right {
            position: static;
        }
    }
    
    @media (max-width: 768px) {
        .date_inputs_booking {
            grid-template-columns: 1fr;
        }
        
        .contact_methods {
            grid-template-columns: 1fr;
        }
        
        .modal_actions {
            flex-direction: column;
        }
    }
    
    @media (max-width: 576px) {
        .booking_left,
        .booking_form_card {
            padding: 20px;
        }
        
        .property_details_booking {
            grid-template-columns: 1fr;
        }
        
        .property_amenities_booking {
            grid-template-columns: repeat(2, 1fr);
        }
    }
`;

document.head.appendChild(bookingStyles);