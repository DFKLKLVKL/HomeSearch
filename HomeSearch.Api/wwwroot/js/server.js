const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // ← ДОБАВЬТЕ ЭТУ СТРОКУ ТУТ!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Для обслуживания статических файлов

// Подключение к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Проверка соединения с базой данных
pool.connect((err, client, release) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Успешное подключение к базе данных');
        release();
    }
});

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Неверный токен' });
        }
        req.user = user;
        next();
    });
};

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    try {
        const { 
            email, 
            password, 
            first_name, 
            last_name, 
            phone, 
            birth_date,
            telegram_username,
            whatsapp_number 
        } = req.body;

        // Проверка обязательных полей
        if (!email || !password || !first_name) {
            return res.status(400).json({ 
                error: 'Email, пароль и имя являются обязательными полями' 
            });
        }

        // Проверка формата email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: 'Неверный формат email' 
            });
        }

        // Проверка сложности пароля
        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Пароль должен содержать минимум 6 символов' 
            });
        }

        // Проверка, существует ли пользователь с таким email
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Пользователь с таким email уже существует' 
            });
        }

        // Проверка телефона, если указан
        if (phone) {
            const phoneExists = await pool.query(
                'SELECT id FROM users WHERE phone = $1',
                [phone]
            );
            if (phoneExists.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'Пользователь с таким телефоном уже существует' 
                });
            }
        }

        // Хеширование пароля
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Вставка пользователя в базу данных
        const result = await pool.query(
            `INSERT INTO users (
                email, password_hash, first_name, last_name, 
                phone, birth_date, telegram_username, whatsapp_number,
                registration_date, last_login, last_update
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, email, first_name, last_name, user_type, status, verification_status, avatar_url`,
            [
                email, 
                passwordHash, 
                first_name, 
                last_name || null, 
                phone || null, 
                birth_date || null,
                telegram_username || null,
                whatsapp_number || null
            ]
        );

        const user = result.rows[0];

        // Создание JWT токена
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                userType: user.user_type 
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Сохранение сессии
        await pool.query(
            'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        );

        res.status(201).json({
            message: 'Регистрация успешна',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type,
                status: user.status,
                verificationStatus: user.verification_status,
                avatarUrl: user.avatar_url
            },
            token
        });

    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при регистрации',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверка обязательных полей
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email и пароль являются обязательными полями' 
            });
        }

        // Поиск пользователя по email
        const result = await pool.query(
            `SELECT 
                id, email, password_hash, first_name, last_name, 
                user_type, status, verification_status, avatar_url,
                phone, birth_date, last_login
            FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Неверный email или пароль' 
            });
        }

        const user = result.rows[0];

        // Проверка статуса пользователя
        if (user.status !== 'active') {
            return res.status(403).json({ 
                error: 'Аккаунт не активен. Свяжитесь с администратором.' 
            });
        }

        // Проверка пароля
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: 'Неверный email или пароль' 
            });
        }

        // Обновление времени последнего входа
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Создание JWT токена
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                userType: user.user_type 
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Сохранение сессии
        await pool.query(
            'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        );

        res.json({
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                userType: user.user_type,
                status: user.status,
                verificationStatus: user.verification_status,
                avatarUrl: user.avatar_url,
                phone: user.phone,
                birthDate: user.birth_date,
                lastLogin: user.last_login
            },
            token
        });

    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ 
            error: 'Ошибка сервера при входе',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Выход пользователя
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            await pool.query('DELETE FROM sessions WHERE id = $1', [token]);
        }

        res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        res.status(500).json({ error: 'Ошибка сервера при выходе' });
    }
});

// Получение информации о текущем пользователе
app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                id, email, first_name, last_name, phone, birth_date,
                user_type, status, verification_status, avatar_url,
                telegram_username, whatsapp_number, rating_as_guest,
                rating_as_host, total_reviews, about, preferred_language,
                registration_date, last_login
            FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const user = result.rows[0];
        
        // Получение статистики пользователя
        const [bookings, favorites, properties] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM bookings WHERE user_id = $1', [user.id]),
            pool.query('SELECT COUNT(*) FROM favorites WHERE user_id = $1', [user.id]),
            pool.query('SELECT COUNT(*) FROM properties WHERE owner_id = $1', [user.id])
        ]);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                birthDate: user.birth_date,
                userType: user.user_type,
                status: user.status,
                verificationStatus: user.verification_status,
                avatarUrl: user.avatar_url,
                telegramUsername: user.telegram_username,
                whatsappNumber: user.whatsapp_number,
                ratingAsGuest: user.rating_as_guest,
                ratingAsHost: user.rating_as_host,
                totalReviews: user.total_reviews,
                about: user.about,
                preferredLanguage: user.preferred_language,
                registrationDate: user.registration_date,
                lastLogin: user.last_login
            },
            stats: {
                bookings: parseInt(bookings.rows[0].count),
                favorites: parseInt(favorites.rows[0].count),
                properties: parseInt(properties.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление профиля пользователя
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { 
            first_name, 
            last_name, 
            phone, 
            birth_date,
            telegram_username,
            whatsapp_number,
            about,
            preferred_language
        } = req.body;

        // Проверка телефона на уникальность
        if (phone) {
            const phoneExists = await pool.query(
                'SELECT id FROM users WHERE phone = $1 AND id != $2',
                [phone, req.user.userId]
            );
            if (phoneExists.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'Пользователь с таким телефоном уже существует' 
                });
            }
        }

        const result = await pool.query(
            `UPDATE users SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                phone = COALESCE($3, phone),
                birth_date = COALESCE($4, birth_date),
                telegram_username = COALESCE($5, telegram_username),
                whatsapp_number = COALESCE($6, whatsapp_number),
                about = COALESCE($7, about),
                preferred_language = COALESCE($8, preferred_language),
                last_update = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *`,
            [
                first_name, 
                last_name, 
                phone, 
                birth_date,
                telegram_username,
                whatsapp_number,
                about,
                preferred_language,
                req.user.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const user = result.rows[0];
        res.json({
            message: 'Профиль успешно обновлен',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                birthDate: user.birth_date,
                telegramUsername: user.telegram_username,
                whatsappNumber: user.whatsapp_number,
                about: user.about,
                preferredLanguage: user.preferred_language
            }
        });

    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Изменение пароля
app.put('/api/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Текущий пароль и новый пароль обязательны' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'Новый пароль должен содержать минимум 6 символов' 
            });
        }

        // Получение текущего хеша пароля
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const currentHash = result.rows[0].password_hash;

        // Проверка текущего пароля
        const passwordMatch = await bcrypt.compare(currentPassword, currentHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Неверный текущий пароль' });
        }

        // Хеширование нового пароля
        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);

        // Обновление пароля
        await pool.query(
            'UPDATE users SET password_hash = $1, last_update = CURRENT_TIMESTAMP WHERE id = $2',
            [newHash, req.user.userId]
        );

        // Удаление всех сессий пользователя (кроме текущей)
        const authHeader = req.headers['authorization'];
        const currentToken = authHeader && authHeader.split(' ')[1];
        if (currentToken) {
            await pool.query(
                'DELETE FROM sessions WHERE user_id = $1 AND id != $2',
                [req.user.userId, currentToken]
            );
        }

        res.json({ message: 'Пароль успешно изменен' });

    } catch (error) {
        console.error('Ошибка при изменении пароля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Проверка доступности email
app.get('/api/check-email', async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email обязателен' });
        }

        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        res.json({ available: result.rows.length === 0 });

    } catch (error) {
        console.error('Ошибка при проверке email:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление аккаунта
app.delete('/api/account', authenticateToken, async (req, res) => {
    try {
        const { confirmEmail, password } = req.body;

        if (!confirmEmail || !password) {
            return res.status(400).json({ 
                error: 'Подтверждение email и пароль обязательны' 
            });
        }

        if (confirmEmail !== req.user.email) {
            return res.status(400).json({ 
                error: 'Email не совпадает с текущим' 
            });
        }

        // Проверка пароля
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        const currentHash = result.rows[0].password_hash;
        const passwordMatch = await bcrypt.compare(password, currentHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        // Удаление пользователя (каскадное удаление через foreign key constraints)
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.userId]);

        res.json({ message: 'Аккаунт успешно удален' });

    } catch (error) {
        console.error('Ошибка при удалении аккаунта:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение списка пользователей (только для администраторов)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Проверка прав администратора
        const userCheck = await pool.query(
            'SELECT user_type FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (userCheck.rows.length === 0 || userCheck.rows[0].user_type !== 'admin') {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const query = `
            SELECT 
                id, email, first_name, last_name, phone,
                user_type, status, verification_status,
                registration_date, last_login,
                COUNT(*) OVER() as total_count
            FROM users
            WHERE 
                email ILIKE $1 OR 
                first_name ILIKE $1 OR 
                last_name ILIKE $1 OR 
                phone ILIKE $1
            ORDER BY registration_date DESC
            LIMIT $2 OFFSET $3
        `;

        const result = await pool.query(query, [`%${search}%`, limit, offset]);

        res.json({
            users: result.rows.map(row => ({
                id: row.id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                phone: row.phone,
                userType: row.user_type,
                status: row.status,
                verificationStatus: row.verification_status,
                registrationDate: row.registration_date,
                lastLogin: row.last_login
            })),
            total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Запуск сервера в конце файла - УДАЛИТЕ ЭТОТ КОД ИЗ НАЧАЛА ФАЙЛА:
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});