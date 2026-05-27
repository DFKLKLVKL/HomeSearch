document.addEventListener('DOMContentLoaded', function() {
    // Инициализация истории
    initHistoryPage();
    
    function initHistoryPage() {
        setupEventListeners();
        loadHistoryData();
    }
    
    function loadHistoryData() {
        // Загрузка данных истории из localStorage или API
        const historyData = JSON.parse(localStorage.getItem('userHistory') || '[]');
        
        if (historyData.length === 0) {
            // Показать сообщение "нет истории"
            document.getElementById('noHistoryMessage').style.display = 'block';
            document.getElementById('historyGrid').style.display = 'none';
        } else {
            // Отобразить данные
            document.getElementById('noHistoryMessage').style.display = 'none';
            document.getElementById('historyGrid').style.display = 'flex';
        }
    }
    
    function setupEventListeners() {
        // Кнопки связи с арендодателем
        document.querySelectorAll('.call_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const phone = this.closest('.owner_card').querySelector('a[href^="tel:"]');
                if (phone) {
                    window.location.href = phone.getAttribute('href');
                }
            });
        });
        
        document.querySelectorAll('.message_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const telegram = this.closest('.owner_card').querySelector('a[href*="t.me"]');
                if (telegram) {
                    window.open(telegram.getAttribute('href'), '_blank');
                }
            });
        });
        
        // Кнопки действий в истории
        document.querySelectorAll('.review_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyTitle = this.closest('.history_info').querySelector('.history_title').textContent;
                alert(`Форма отзыва для: ${propertyTitle}\n(Функция в разработке)`);
            });
        });
        
        document.querySelectorAll('.repeat_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const propertyTitle = this.closest('.history_info').querySelector('.history_title').textContent;
                if (confirm(`Хотите снова забронировать "${propertyTitle}"?`)) {
                    window.location.href = 'catalog.html';
                }
            });
        });
        
        document.querySelectorAll('.cancel_btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите отменить бронирование?')) {
                    
                }
            });
        });
        
        // Фильтры
        document.querySelector('.apply_filters_btn').addEventListener('click', applyFilters);
        document.querySelector('.reset_filters_btn').addEventListener('click', resetFilters);
        
        // Поиск
        const searchInput = document.getElementById('search_input');
        searchInput.addEventListener('input', debounceSearch);
        
        // Выход
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Вы уверены, что хотите выйти?')) {
                    window.location.href = 'index.html';
                }
            });
        }
    }
    
    function applyFilters() {
        const statusFilter = document.querySelector('.status_filter').value;
        const sortFilter = document.querySelector('.sort_filter').value;
        const searchTerm = document.getElementById('search_input').value.toLowerCase();
        
        // Здесь будет логика фильтрации
        
    }
    
    function resetFilters() {
        document.querySelector('.status_filter').value = 'all';
        document.querySelector('.sort_filter').value = 'new';
        document.getElementById('search_input').value = '';
        
    }
    
    function debounceSearch() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const searchTerm = this.value.toLowerCase();
            // Здесь будет логика поиска
            console.log('Поиск:', searchTerm);
        }, 300);
    }
    
    // Вспомогательная функция для форматирования цены
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }
});
// В buy.js добавьте функцию для отображения истории бронирований
function loadBookingHistory() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const historyGrid = document.getElementById('historyGrid');
    
    if (!historyGrid) return;
    
    // Фильтруем бронирования текущего пользователя
    const userBookings = bookings.filter(booking => 
        booking.buyerId === currentUser.id || 
        booking.buyerId === currentUser.email ||
        booking.buyerId === currentUser.userId
    );
    
    if (userBookings.length === 0) {
        document.getElementById('noHistoryMessage').style.display = 'block';
        return;
    }
    
    userBookings.forEach(booking => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history_item';
        historyItem.innerHTML = `
            <div class="history_main_card">
                <div class="history_status ${booking.status === 'approved' ? 'status_completed' : 
                                           booking.status === 'pending' ? 'status_upcoming' : 
                                           'status_cancelled'}">
                    <span class="status_icon">
                        ${booking.status === 'approved' ? '✅' : 
                          booking.status === 'pending' ? '📅' : '❌'}
                    </span>
                    ${booking.status === 'approved' ? 'Завершено' : 
                      booking.status === 'pending' ? 'Ожидает подтверждения' : 'Отменено'}
                </div>
                
                <div class="history_images">
                    <img src="${booking.propertyImage}" alt="${booking.propertyTitle}">
                </div>
                
                <div class="history_info">
                    <div class="history_header">
                        <h3 class="history_title">${booking.propertyTitle}</h3>
                        <div class="history_booking_id">
                            #${booking.id}
                        </div>
                    </div>
                    
                    <div class="history_dates">
                        <div class="date_item">
                            <span class="date_label">Заезд:</span>
                            <span class="date_value">${formatDate(booking.checkIn)}</span>
                        </div>
                        <div class="date_item">
                            <span class="date_label">Выезд:</span>
                            <span class="date_value">${formatDate(booking.checkOut)}</span>
                        </div>
                        <div class="date_item">
                            <span class="date_label">Всего:</span>
                            <span class="date_value">${booking.nights} ночей</span>
                        </div>
                    </div>
                    
                    <div class="history_features">
                        <span class="feature">👥 ${booking.guests} гостей</span>
                        <span class="feature">💵 ${booking.totalAmount.toLocaleString('ru-RU')} ₽</span>
                        <span class="feature">📞 ${booking.contactMethod}: ${booking.contactValue}</span>
                    </div>
                    
                    ${booking.message ? `
                        <div class="history_message">
                            <strong>Ваше сообщение:</strong> ${booking.message}
                        </div>
                    ` : ''}
                    
                    <div class="history_actions">
                        <button class="history_btn details_btn" onclick="showBookingDetails('${booking.id}')">
                            <span class="btn_icon">📋</span> Детали
                        </button>
                        ${booking.status === 'pending' ? `
                            <button class="history_btn cancel_btn" onclick="cancelBooking('${booking.id}')">
                                <span class="btn_icon">❌</span> Отменить
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Карточка владельца будет загружена отдельно -->
        `;
        
        historyGrid.appendChild(historyItem);
    });
}