document.addEventListener('DOMContentLoaded', function() {
    // Объединяем данные: моковые + из localStorage
    const mockProducts = JSON.parse(localStorage.getItem('catalogData') || '[]');
    const catalogProperties = JSON.parse(localStorage.getItem('catalogProperties') || '[]');
    const userProperties = JSON.parse(localStorage.getItem('userProperties') || '[]');
    
    // Объединяем все продукты: сначала моковые, затем из каталога
    let allProducts = [...mockProducts, ...catalogProperties];
    
    // Добавляем уникальные идентификаторы для продуктов
    allProducts = allProducts.map((product, index) => ({
        ...product,
        uniqueId: product.id || `product-${index}`,
        isUserProperty: product.ownerId === 1 || product.isUserProperty
    }));
    
    // Элементы DOM
    const productsGrid = document.getElementById('products_grid');
    const searchInput = document.getElementById('search_input');
    const typeButtons = document.querySelectorAll('.type_btn');
    const minPrice = document.getElementById('min_price');
    const maxPrice = document.getElementById('max_price');
    const priceMinRange = document.getElementById('price_min');
    const priceMaxRange = document.getElementById('price_max');
    const amenitiesCheckboxes = document.querySelectorAll('.amenity_checkbox input');
    const applyFiltersBtn = document.querySelector('.apply_filters_btn');
    const resetFiltersBtn = document.querySelector('.reset_filters_btn');
    const sortSelect = document.querySelector('.sort_select');
    const totalResults = document.getElementById('total_results');
    const guestMinus = document.querySelector('.guest_btn.minus');
    const guestPlus = document.querySelector('.guest_btn.plus');
    const guestCount = document.querySelector('.guest_count');
    const quickView = document.getElementById('quick_view');
    const closeQuickView = document.querySelector('.close_quick_view');
    
    const ratingButtons = document.querySelectorAll('.rating_btn');
    
    // Текущие фильтры
    let currentFilters = {
        search: '',
        type: 'all',
        minPrice: 1000,
        maxPrice: 20000,
        guests: 2,
        amenities: ['wifi', 'parking'],
        minRating: 0,
        sortBy: 'popular'
    };

    // Инициализация
    initFilters();
    renderProducts();

    function initFilters() {
        // Настройка ценовых слайдеров
        priceMinRange.min = 0;
        priceMinRange.max = 50000;
        priceMinRange.step = 1000;
        priceMinRange.value = currentFilters.minPrice;
        
        priceMaxRange.min = 0;
        priceMaxRange.max = 50000;
        priceMaxRange.step = 1000;
        priceMaxRange.value = currentFilters.maxPrice;
        
        minPrice.textContent = formatPrice(currentFilters.minPrice);
        maxPrice.textContent = formatPrice(currentFilters.maxPrice);

        priceMinRange.addEventListener('input', function() {
            const minValue = parseInt(this.value);
            const maxValue = parseInt(priceMaxRange.value);
            
            if (minValue > maxValue - 5000) {
                this.value = maxValue - 5000;
                currentFilters.minPrice = maxValue - 5000;
            } else {
                currentFilters.minPrice = minValue;
            }
            minPrice.textContent = formatPrice(currentFilters.minPrice);
            debounceFilter();
        });

        priceMaxRange.addEventListener('input', function() {
            const maxValue = parseInt(this.value);
            const minValue = parseInt(priceMinRange.value);
            
            if (maxValue < minValue + 5000) {
                this.value = minValue + 5000;
                currentFilters.maxPrice = minValue + 5000;
            } else {
                currentFilters.maxPrice = maxValue;
            }
            maxPrice.textContent = formatPrice(currentFilters.maxPrice);
            debounceFilter();
        });

        typeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                typeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilters.type = this.dataset.type;
                renderProducts();
            });
        });

        if (ratingButtons.length > 0) {
            ratingButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    ratingButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilters.minRating = parseFloat(this.dataset.rating);
                    renderProducts();
                });
            });
        }

        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value.toLowerCase();
            debounceSearch();
        });

        guestMinus.addEventListener('click', function() {
            if (currentFilters.guests > 1) {
                currentFilters.guests--;
                guestCount.textContent = currentFilters.guests;
                debounceFilter();
            }
        });

        guestPlus.addEventListener('click', function() {
            if (currentFilters.guests < 10) {
                currentFilters.guests++;
                guestCount.textContent = currentFilters.guests;
                debounceFilter();
            }
        });

        amenitiesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const amenityName = this.name;
                if (this.checked) {
                    if (!currentFilters.amenities.includes(amenityName)) {
                        currentFilters.amenities.push(amenityName);
                    }
                } else {
                    currentFilters.amenities = currentFilters.amenities.filter(a => a !== amenityName);
                }
                debounceFilter();
            });
        });

        sortSelect.addEventListener('change', function() {
            currentFilters.sortBy = this.value;
            renderProducts();
        });

        applyFiltersBtn.addEventListener('click', function() {
            renderProducts();
            this.classList.add('applied');
            setTimeout(() => this.classList.remove('applied'), 1000);
        });

        resetFiltersBtn.addEventListener('click', function() {
            currentFilters = {
                search: '',
                type: 'all',
                minPrice: 1000,
                maxPrice: 20000,
                guests: 2,
                amenities: ['wifi', 'parking'],
                minRating: 0,
                sortBy: 'popular'
            };
            
            searchInput.value = '';
            priceMinRange.value = 1000;
            priceMaxRange.value = 20000;
            minPrice.textContent = formatPrice(1000);
            maxPrice.textContent = formatPrice(20000);
            guestCount.textContent = '2';
            
            typeButtons.forEach(b => {
                b.classList.remove('active');
                if (b.dataset.type === 'all') b.classList.add('active');
            });
            
            if (ratingButtons.length > 0) {
                ratingButtons.forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.rating === '0') b.classList.add('active');
                });
            }
            
            amenitiesCheckboxes.forEach(cb => {
                cb.checked = cb.name === 'wifi' || cb.name === 'parking';
            });
            
            sortSelect.value = 'popular';
            
            renderProducts();
            
            this.classList.add('reset');
            setTimeout(() => this.classList.remove('reset'), 1000);
        });

        closeQuickView.addEventListener('click', function() {
            quickView.classList.remove('active');
        });

        quickView.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });

        styleSelect();
    }

    function styleSelect() {
        const sortSelect = document.querySelector('.sort_select');
        
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        
        const selectedOption = document.createElement('div');
        selectedOption.className = 'custom-select__selected';
        selectedOption.textContent = sortSelect.options[sortSelect.selectedIndex].text;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select__options';
        
        Array.from(sortSelect.options).forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-select__option';
            optionDiv.textContent = option.text;
            optionDiv.dataset.value = option.value;
            
            if (option.selected) {
                optionDiv.classList.add('selected');
            }
            
            optionDiv.addEventListener('click', function() {
                sortSelect.value = this.dataset.value;
                selectedOption.textContent = this.textContent;
                
                optionsContainer.querySelectorAll('.custom-select__option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                currentFilters.sortBy = this.dataset.value;
                renderProducts();
                
                optionsContainer.style.display = 'none';
            });
            
            optionsContainer.appendChild(optionDiv);
        });
        
        selectedOption.addEventListener('click', function(e) {
            e.stopPropagation();
            optionsContainer.style.display = 
                optionsContainer.style.display === 'block' ? 'none' : 'block';
        });
        
        customSelect.appendChild(selectedOption);
        customSelect.appendChild(optionsContainer);
        
        sortSelect.style.display = 'none';
        sortSelect.parentNode.insertBefore(customSelect, sortSelect.nextSibling);
        
        document.addEventListener('click', function(e) {
            if (!customSelect.contains(e.target)) {
                optionsContainer.style.display = 'none';
            }
        });
    }

    let searchTimeout;
    function debounceSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            renderProducts();
        }, 500);
    }

    let filterTimeout;
    function debounceFilter() {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            renderProducts();
        }, 300);
    }

    function formatPrice(price) {
        if (price >= 1000000) {
            return (price / 1000000).toFixed(1) + ' млн ₽';
        } else if (price >= 1000) {
            return (price / 1000).toFixed(0) + ' тыс ₽';
        }
        return price.toLocaleString('ru-RU') + ' ₽';
    }

    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '★';
            } else {
                stars += '☆';
            }
        }
        
        return `<span class="stars">${stars}</span> <span class="rating_num">${rating.toFixed(1)}</span>`;
    }

    function openQuickView(product) {
        document.getElementById('quick_view_title').textContent = product.title;
        document.getElementById('quick_view_price').textContent = formatPrice(product.price) + ' / ночь';
        document.getElementById('quick_view_desc').textContent = `${product.bedrooms || 1} спальни · ${product.guests || 2} гостей · ${product.bathrooms || 1} ванные`;
        document.getElementById('quick_view_img').src = product.image || 'img/default-property.jpg';
        document.getElementById('quick_view_img').alt = product.title;
        
        quickView.classList.add('active');
    }

    function renderProducts() {
        let filteredProducts = allProducts.filter(product => {
            if (currentFilters.search && 
                !product.title.toLowerCase().includes(currentFilters.search) &&
                !(product.location && product.location.toLowerCase().includes(currentFilters.search))) {
                return false;
            }
            
            if (currentFilters.type !== 'all' && product.type !== currentFilters.type) {
                return false;
            }
            
            if (product.price < currentFilters.minPrice || product.price > currentFilters.maxPrice) {
                return false;
            }
            
            if (product.guests < currentFilters.guests) {
                return false;
            }
            
            if (product.rating < currentFilters.minRating) {
                return false;
            }
            
            for (const amenity of currentFilters.amenities) {
                if (!product[amenity]) {
                    return false;
                }
            }
            
            return true;
        });

        filteredProducts.sort((a, b) => {
            switch (currentFilters.sortBy) {
                case 'price_low':
                    return (a.price || 0) - (b.price || 0);
                case 'price_high':
                    return (b.price || 0) - (a.price || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'new':
                    return (b.id || 0) - (a.id || 0);
                default:
                    return ((b.rating || 0) * 10 + (b.price || 0)/10000) - ((a.rating || 0) * 10 + (a.price || 0)/10000);
            }
        });

        totalResults.textContent = filteredProducts.length;
        productsGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product_card';
            
            // Определяем иконку для своего объекта
            const isOwnProperty = product.isUserProperty;
            const typeBadge = isOwnProperty ? 
                `<span class="owner-badge" title="Ваш объект">👑</span>` : '';
            
            productCard.innerHTML = `
                <div class="product_image_container">
                    <img src="${product.image || 'img/default-property.jpg'}" alt="${product.title}" class="product_image">
                    <div class="product_type_badge ${product.type}">
                        ${typeBadge}
                        ${product.type === 'apartment' ? '🏠 Квартира' : 
                          product.type === 'house' ? '🏡 Дом' :
                          product.type === 'hotel' ? '🏨 Отель' : '🏡 Коттедж'}
                    </div>
                </div>
                <div class="product_info">
                    <h3 class="product_title">${product.title}</h3>
                    <div class="product_location">📍 ${product.location || 'Не указано'}</div>
                    <div class="product_features">
                        <span class="feature">👥 ${product.guests || 2}</span>
                        <span class="feature">🛏️ ${product.bedrooms || 1}</span>
                        <span class="feature">🚿 ${product.bathrooms || 1}</span>
                    </div>
                    <div class="product_rating">
                        ${generateStars(product.rating || 0)}
                    </div>
                    <div class="product_price">
                        <div class="price">
                            ${formatPrice(product.price)} <span>/ ночь</span>
                        </div>
                        <div class="product_actions">
                            <button class="fav_btn" data-id="${product.uniqueId}">
                                <span class="fav_icon">🤍</span>
                            </button>
                            ${isOwnProperty ? 
                                `<button class="own_property_btn" data-id="${product.id}" title="Это ваш объект">Моё</button>` : 
                                `<button class="book_btn" data-id="${product.uniqueId}">Забронировать</button>`}
                        </div>
                    </div>
                </div>
            `;

            const favBtn = productCard.querySelector('.fav_btn');
            const bookBtn = productCard.querySelector('.book_btn');
            const ownPropertyBtn = productCard.querySelector('.own_property_btn');

            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const icon = this.querySelector('.fav_icon');
                const isFav = icon.textContent === '❤️';
                icon.textContent = isFav ? '🤍' : '❤️';
                this.classList.toggle('active');
                
                const productId = this.dataset.id;
                let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                
                if (isFav) {
                    favorites = favorites.filter(id => id !== productId);
                } else {
                    favorites.push(productId);
                }
                
                localStorage.setItem('favorites', JSON.stringify(favorites));
            });

            if (bookBtn) {
                bookBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const productId = this.dataset.id;
                    const product = allProducts.find(p => p.uniqueId === productId);
                    
                    if (!product) return;
                    
                    localStorage.setItem('selectedProperty', JSON.stringify(product));
                    window.location.href = `booking.html?id=${productId}`;
                });
            }

            if (ownPropertyBtn) {
                ownPropertyBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    showNotification('Это ваш объект. Для редактирования перейдите в раздел "Сдать жильё"', 'info');
                });
            }

            productCard.addEventListener('click', function(e) {
                if (!e.target.closest('.product_actions') && !e.target.closest('.fav_btn')) {
                    openQuickView(product);
                }
            });

            productsGrid.appendChild(productCard);
        });
        
        loadFavorites();
    }

    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            }
        });
    }

    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        favorites.forEach(productId => {
            const favBtn = document.querySelector(`.fav_btn[data-id="${productId}"]`);
            if (favBtn) {
                const icon = favBtn.querySelector('.fav_icon');
                icon.textContent = '❤️';
                favBtn.classList.add('active');
            }
        });
    }

    // Функция для создания отклика на жильё
    function createResponse(propertyId) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || { id: 1 };
        
        if (!currentUser) {
            alert('Пожалуйста, войдите в систему для подачи заявки');
            window.location.href = 'index.html';
            return;
        }
        
        const property = allProducts.find(p => p.uniqueId === propertyId);
        
        if (!property) return;
        
        const checkIn = document.getElementById('checkin_date')?.value;
        const checkOut = document.getElementById('checkout_date')?.value;
        const guests = document.querySelector('.guest_count')?.textContent || '2';
        
        if (!checkIn || !checkOut) {
            alert('Пожалуйста, выберите даты заезда и выезда');
            return;
        }
        
        const response = {
            id: 'response_' + Date.now(),
            propertyId: propertyId,
            buyerId: currentUser.id,
            buyerName: currentUser.name || 'Пользователь',
            buyerContacts: `${currentUser.phone || ''} ${currentUser.email}`.trim(),
            propertyTitle: property.title,
            propertyImage: property.image || 'img/default-property.jpg',
            status: 'pending',
            message: prompt('Введите сообщение для владельца (необязательно):', ''),
            guests: parseInt(guests),
            checkIn: checkIn,
            checkOut: checkOut,
            totalPrice: calculateTotalPrice(property.price, checkIn, checkOut),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        let responses = JSON.parse(localStorage.getItem('responses') || '[]');
        responses.push(response);
        localStorage.setItem('responses', JSON.stringify(responses));
        
        alert('Ваша заявка отправлена! Вы можете отслеживать её статус в разделе "Отклики"');
        
        window.location.href = 'svyz.html';
    }

    function calculateTotalPrice(pricePerNight, checkIn, checkOut) {
        const oneDay = 24 * 60 * 60 * 1000;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const nights = Math.round(Math.abs((end - start) / oneDay));
        return pricePerNight * nights;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => notification.remove());
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Загрузка избранного
    setTimeout(loadFavorites, 100);
    
    console.log('Каталог загружен успешно!');
});