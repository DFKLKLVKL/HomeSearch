// В начале main.js добавьте это:
function checkUserOnPage() {
    // Проверяем, на какой странице мы находимся
    const currentPage = window.location.pathname;
    const protectedPages = ['catalog.html', 'sell.html', 'foloving.html', 'buy.html', 'svyz.html'];
    
    // Если это защищенная страница
    if (protectedPages.some(page => currentPage.includes(page))) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || 
                           JSON.parse(localStorage.getItem('userData')) || 
                           JSON.parse(localStorage.getItem('user')) || 
                           null;
        
        // Если пользователь не авторизован и пытается зайти на защищенную страницу
        if (!currentUser && !currentPage.includes('index.html')) {
            // Не перенаправляем, а показываем сообщение или оставляем как есть
            console.log('Пользователь не авторизован, но страница откроется');
            // Можно показать сообщение или ничего не делать
        }
    }
}

// Вызовите эту функцию при загрузке каждой страницы
document.addEventListener('DOMContentLoaded', checkUserOnPage);
// main.js
document.addEventListener('DOMContentLoaded', function() {
    // Создаем оверлей для модальных окон
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    // Получаем элементы форм
    const enterForm = document.getElementById('enter_form');
    const registForm = document.getElementById('regist_form');
    const closeButtons = document.querySelectorAll('.close');
    const switchButtons = document.querySelectorAll('.regist');
    
    // Функция для открытия формы входа
    function openLoginForm() {
        document.querySelectorAll('.alert_enter_regist_container').forEach(form => {
            form.classList.remove('active');
        });
        enterForm.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Функция для открытия формы регистрации
    function openRegistForm() {
        document.querySelectorAll('.alert_enter_regist_container').forEach(form => {
            form.classList.remove('active');
        });
        registForm.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Функция для закрытия всех форм
    function closeAllForms() {
        document.querySelectorAll('.alert_enter_regist_container').forEach(form => {
            form.classList.remove('active');
        });
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Обработчики для ВСЕХ кнопок с href="enter_form"
    document.querySelectorAll('[href="enter_form"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openLoginForm();
        });
    });
    
    // Обработчик для кнопки "Сдать квартиру"
    const btnSdat = document.querySelector('.btn_sdat');
    if (btnSdat) {
        btnSdat.addEventListener('click', function(e) {
            e.preventDefault();
            openLoginForm();
        });
    }
    
    // Обработчики для кнопок закрытия
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            closeAllForms();
        });
    });
    
    // Обработчик для переключения между формами
    switchButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const currentForm = this.closest('.alert_enter_regist_container');
            
            closeAllForms();
            
            // Небольшая задержка для плавности
            setTimeout(() => {
                if (currentForm.id === 'enter_form') {
                    openRegistForm();
                } else if (currentForm.id === 'regist_form') {
                    openLoginForm();
                }
            }, 300);
        });
    });
    
    // Закрытие по клику на оверлей
    overlay.addEventListener('click', closeAllForms);
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllForms();
        }
    });
    
    // Валидация формы входа
    const loginForm = document.querySelector('#enter_form form');
    const registrForm = document.querySelector('#regist_form form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('#email');
            const password = this.querySelector('#password');
            let isValid = true;
            
            if (!email.value.trim() || !email.value.includes('@')) {
                email.style.borderColor = '#e53e3e';
                isValid = false;
            } else {
                email.style.borderColor = '#38a169';
            }
            
            if (!password.value.trim() || password.value.length < 6) {
                password.style.borderColor = '#e53e3e';
                isValid = false;
            } else {
                password.style.borderColor = '#38a169';
            }
            
            if (isValid) {
                // Имитация отправки формы
                const submitBtn = this.querySelector('.enter_btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Вход...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    closeAllForms();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    this.reset();
                }, 1500);
            } else {
                alert('Пожалуйста, заполните все поля корректно. Пароль должен быть не менее 6 символов.');
            }
        });
    }
    
    if (registrForm) {
        registrForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = '#e53e3e';
                    isValid = false;
                } else {
                    input.style.borderColor = '#38a169';
                }
            });
            
            const password = this.querySelector('#password_reg');
            if (password.value.length < 6) {
                password.style.borderColor = '#e53e3e';
                isValid = false;
            }
            
            const email = this.querySelector('#email_reg');
            if (!email.value.includes('@')) {
                email.style.borderColor = '#e53e3e';
                isValid = false;
            }
            
            if (isValid) {
                const submitBtn = this.querySelector('.enter_btn');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Регистрация...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    closeAllForms();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    this.reset();
                }, 1500);
            } else {
                alert('Пожалуйста, заполните все поля корректно. Проверьте email и пароль (не менее 6 символов).');
            }
        });
    }
    
    // Анимация при загрузке
    const logo = document.querySelector('.header_logo');
    if (logo) {
        setTimeout(() => {
            logo.style.transform = 'scale(1.1)';
            setTimeout(() => {
                logo.style.transform = 'scale(1)';
            }, 300);
        }, 500);
    }
    
    // Плавная прокрутка для ссылок с якорями
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#contact') return;
            
            e.preventDefault();
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Эффект параллакса для промо блоков
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const promoBlocks = document.querySelectorAll('.container_promo1, .container_promo2');
        
        promoBlocks.forEach((block, index) => {
            const rate = scrolled * (index === 0 ? 0.1 : 0.05);
            block.style.transform = `translateY(${rate}px)`;
        });
    });
    
    // Добавляем эффект наведения для иконок стран
    const countryIcons = document.querySelectorAll('.icon_country');
    countryIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const txt = this.querySelector('.country_txt');
            if (txt) {
                txt.style.transform = 'translateY(-3px)';
            }
        });
        
        icon.addEventListener('mouseleave', function() {
            const txt = this.querySelector('.country_txt');
            if (txt) {
                txt.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Анимация для карточек при появлении в поле зрения
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Наблюдаем за карточками
    document.querySelectorAll('.container_card, .container_sub').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    console.log('Home Search loaded successfully!');
    
    // Стилизация для текстового логотипа
    const headerLogoTxt = document.querySelector('.header_logo_txt');
    if (headerLogoTxt) {
        headerLogoTxt.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Элементы формы
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const registerLink = document.getElementById('registerLink');
    const loginLink = document.getElementById('loginLink');
    const loginForm = document.getElementById('enter_form');
    const registerForm = document.getElementById('regist_form');
    const closeBtns = document.querySelectorAll('.close');

    // Обработка кнопки "Войти"
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Проверка заполнения полей
            if (!email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Валидация email
            if (!validateEmail(email)) {
                alert('Пожалуйста, введите корректный email');
                return;
            }
            
            // Сохранение данных пользователя в localStorage
            saveUserData(email, password);
            
            // Показ сообщения об успехе
            showSuccessMessage('Вы успешно вошли в систему!');
            
            // Задержка перед перенаправлением
            setTimeout(() => {
                window.location.href = 'catalog.html';
            }, 1500);
        });
    }

    // Обработка кнопки "Зарегистрироваться"
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем стандартную отправку формы
            
            const name = document.getElementById('name_reg').value;
            const email = document.getElementById('email_reg').value;
            const password = document.getElementById('password_reg').value;
            const phone = document.getElementById('tel_reg').value;
            const birthdate = document.getElementById('date_reg').value;
            
            // Проверка заполнения всех полей
            if (!name || !email || !password || !phone || !birthdate) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Валидация email
            if (!validateEmail(email)) {
                alert('Пожалуйста, введите корректный email');
                return;
            }
            
            // Валидация телефона
            if (!validatePhone(phone)) {
                alert('Пожалуйста, введите корректный номер телефона');
                return;
            }
            
            // Проверка возраста (18+)
            if (!checkAge(birthdate)) {
                alert('Вы должны быть старше 18 лет для регистрации');
                return;
            }
            
            // Сохранение данных пользователя в localStorage
            saveUserData(email, password, name, phone, birthdate);
            
            // Показ сообщения об успехе
            showSuccessMessage('Регистрация прошла успешно!');
            
            // Задержка перед перенаправлением
            setTimeout(() => {
                window.location.href = 'catalog.html';
            }, 1500);
        });
    }

    // Обработка ссылок для переключения между формами
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationForm();
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Обработка кнопок закрытия
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const form = this.closest('.alert_enter_regist_container');
            if (form) {
                form.style.display = 'none';
            }
        });
    });

    // Вспомогательные функции
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\+]?[78][\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
        return re.test(phone);
    }

    function checkAge(birthdate) {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }

    function saveUserData(email, password, name = '', phone = '', birthdate = '') {
        const userData = {
            email: email,
            password: password,
            name: name,
            phone: phone,
            birthdate: birthdate,
            isLoggedIn: true,
            lastLogin: new Date().toISOString()
        };
        
        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('Данные пользователя сохранены:', userData);
    }

    function showSuccessMessage(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #38a169, #2f855a);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 2 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    function showLoginForm() {
        if (loginForm && registerForm) {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }

    function showRegistrationForm() {
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    // Добавляем стили для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .success-notification {
            font-weight: 600;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // Проверяем, залогинен ли пользователь
    checkUserLoginStatus();
    
    function checkUserLoginStatus() {
        const userData = JSON.parse(localStorage.getItem('userData') || 'null');
        
        if (userData && userData.isLoggedIn) {
            // Если пользователь уже залогинен, показываем его имя
            const profileElement = document.querySelector('.profile_info');
            if (profileElement && userData.name) {
                profileElement.innerHTML = `
                    <div class="logo_profil">
                        <img src="img/user-avatar.png" alt="Аватар">
                    </div>         
                    <div class="profil_name">
                        ${userData.name}
                    </div>
                `;
            }
        }
    }
});

// Обработчики форм регистрации и входа
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('contactForm');
    const registerForm = document.getElementById('contactForm2');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const loginModal = document.getElementById('enter_form');
    const registerModal = document.getElementById('regist_form');

    // Проверка токена при загрузке
    checkAuth();

    // Переключение между формами
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.classList.remove('active');
            loginModal.classList.add('active');
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.remove('active');
            registerModal.classList.add('active');
        });
    }

    // Обработка входа
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Сохраняем токен в localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    alert('Вход выполнен успешно!');
                    loginModal.classList.remove('active');
                    
                    // Обновляем интерфейс
                    updateUIAfterLogin(data.user);
                } else {
                    alert(data.error || 'Ошибка при входе');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка соединения с сервером');
            }
        });
    }

    // Обработка регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name_reg').value;
            const email = document.getElementById('email_reg').value;
            const password = document.getElementById('password_reg').value;
            const tel = document.getElementById('tel_reg').value;
            const date = document.getElementById('date_reg').value;

            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        email, 
                        password, 
                        first_name: name,
                        phone: tel,
                        birth_date: date 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Сохраняем токен в localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    alert('Регистрация прошла успешно!');
                    registerModal.classList.remove('active');
                    
                    // Обновляем интерфейс
                    updateUIAfterLogin(data.user);
                } else {
                    alert(data.error || 'Ошибка при регистрации');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Ошибка соединения с сервером');
            }
        });
    }

    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/api/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    alert('Вы успешно вышли из системы');
                    updateUIAfterLogout();
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error);
            }
        });
    }
});

// Проверка авторизации
async function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            const response = await fetch('http://localhost:3000/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                updateUIAfterLogin(data.user);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUIAfterLogout();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            updateUIAfterLogout();
        }
    }
}

// Обновление UI после входа
function updateUIAfterLogin(user) {
    // Обновляем навигацию
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.innerHTML = `
            <a class="header_btn" href="catalog.html">каталог</a>
            <a class="header_btn" href="favorites.html">избранное</a>
            <a class="header_btn" href="sell.html">сдать жильё</a>
            <a class="header_btn" href="history.html">история</a>
            <div class="profile_info">
                <div class="logo_profil">
                    ${user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div class="profil_name">${user.firstName}</div>
                <div class="profile_menu">
                    <a href="profile.html">Мой профиль</a>
                    <a href="settings.html">Настройки</a>
                    <a href="#" id="logoutBtn">Выйти</a>
                </div>
            </div>
        `;
        
        // Добавляем обработчик для выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateUIAfterLogout();
                alert('Вы успешно вышли из системы');
            });
        }
    }
}

// Обновление UI после выхода
function updateUIAfterLogout() {
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.innerHTML = `
            <a class="header_btn" href="catalog.html">каталог</a>
            <a class="header_btn" href="favorites.html">избранное</a>
            <a class="header_btn" href="sell.html">сдать жильё</a>
            <a class="header_btn" href="#enter_form">войти</a>
        `;
    }
}

// Функция для защищенных запросов
async function makeAuthRequest(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Требуется авторизация');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    const response = await fetch(`http://localhost:3000${url}`, finalOptions);
    
    if (response.status === 401) {
        // Токен устарел
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateUIAfterLogout();
        alert('Сессия истекла. Пожалуйста, войдите снова.');
        return null;
    }

    return response;
}