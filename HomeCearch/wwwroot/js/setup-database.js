const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'homesearch',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: process.env.DB_PORT || 5432,
    });

    try {
        // Создание таблиц (SQL из первого шага)
        const sql = `
        -- SQL код из первого шага здесь
        `;

        await pool.query(sql);
        console.log('База данных успешно настроена!');
        
        // Создание тестового администратора
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(`
            INSERT INTO users (
                email, password_hash, first_name, last_name, 
                user_type, status, verification_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO NOTHING
        `, [
            'admin@homesearch.ru',
            hashedPassword,
            'Администратор',
            'Системы',
            'admin',
            'active',
            'verified'
        ]);

        console.log('Тестовый администратор создан: admin@homesearch.ru / admin123');
        
    } catch (error) {
        console.error('Ошибка при настройке базы данных:', error);
    } finally {
        await pool.end();
    }
}

setupDatabase();