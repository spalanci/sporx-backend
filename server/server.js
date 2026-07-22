import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'sporx_db',
};

app.get('/api/announcements', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [announcements] = await connection.query('SELECT id, title, content, target_role, is_active, created_at FROM announcements ORDER BY created_at DESC LIMIT 20');
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Duyurular veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/categories', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [categories] = await connection.query('SELECT id, name, slug, description, status FROM categories ORDER BY id DESC LIMIT 20');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kategoriler veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/courses', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [courses] = await connection.query('SELECT id, title, description, duration_minutes, capacity, status FROM courses ORDER BY id DESC LIMIT 20');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kurslar veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/users', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.query('SELECT id, first_name, last_name, email, role, status FROM users ORDER BY id DESC LIMIT 50');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kullanıcılar veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/applications', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [applications] = await connection.query(
      `SELECT
        ca.id,
        ca.status,
        ca.applied_at,
        ca.note,
        a.id AS athlete_id,
        u.first_name AS athlete_first_name,
        u.last_name AS athlete_last_name,
        u.email AS athlete_email,
        cs.id AS schedule_id,
        cs.start_time,
        cs.end_time,
        cs.location,
        cs.quota,
        cs.status AS schedule_status,
        c.id AS course_id,
        c.title AS course_title,
        cat.id AS category_id,
        cat.name AS category_name
      FROM course_applications ca
      JOIN athletes a ON ca.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      JOIN course_schedules cs ON ca.schedule_id = cs.id
      JOIN courses c ON cs.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      ORDER BY ca.applied_at DESC`
    );

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Başvurular veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/course-schedules', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const monthQuery = req.query.month?.toString();
    const now = new Date();
    const [year, month] = (monthQuery || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`).split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [schedules] = await connection.query(
      `SELECT
        cs.id,
        cs.course_id,
        c.title AS course_title,
        c.duration_minutes,
        c.capacity,
        cat.name AS category_name,
        u.first_name AS trainer_first_name,
        u.last_name AS trainer_last_name,
        cs.start_time,
        cs.end_time,
        cs.quota,
        cs.location,
        cs.status
      FROM course_schedules cs
      JOIN courses c ON cs.course_id = c.id
      LEFT JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE cs.start_time >= ? AND cs.start_time < ?
      ORDER BY cs.start_time ASC`,
      [startDate.toISOString().slice(0, 19).replace('T', ' '), endDate.toISOString().slice(0, 19).replace('T', ' ')]
    );

    const groupedByDay = {};
    for (const row of schedules) {
      const dateKey = new Date(row.start_time).toISOString().slice(0, 10);
      if (!groupedByDay[dateKey]) groupedByDay[dateKey] = [];
      groupedByDay[dateKey].push(row);
    }

    res.json({ month: `${year}-${String(month).padStart(2, '0')}`, schedule: groupedByDay });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kurs takvimi veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/static-pages', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const typeFlag = req.query.type_flag?.toString();
    const whereClause = typeFlag ? 'WHERE type_flag = ?' : '';
    const query = `SELECT id, type_flag, slug, title, content, status, sort_order, created_at, updated_at FROM static_pages ${whereClause} ORDER BY sort_order ASC, id ASC`;
    const params = typeFlag ? [typeFlag] : [];
    const [pages] = await connection.query(query, params);
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sabit sayfalar veritabanından alınamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/static-pages', async (req, res) => {
  let connection;
  try {
    const { type_flag, slug, title, content, status = 1, sort_order = 1 } = req.body || {};
    const allowedFlags = ['about', 'intro', 'contact', 'banner'];

    if (!allowedFlags.includes(type_flag) || !slug || !title || !content) {
      return res.status(400).json({ message: 'type_flag, slug, title ve content alanları zorunludur.' });
    }

    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.query(
      'INSERT INTO static_pages (type_flag, slug, title, content, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [type_flag, slug, title, content, Number(status), Number(sort_order)]
    );

    const [page] = await connection.query('SELECT id, type_flag, slug, title, content, status, sort_order, created_at, updated_at FROM static_pages WHERE id = ?', [result.insertId]);
    res.status(201).json(page[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sabit sayfa oluşturulamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/static-pages/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { type_flag, slug, title, content, status = 1, sort_order = 1 } = req.body || {};
    const allowedFlags = ['about', 'intro', 'contact', 'banner'];

    if (!allowedFlags.includes(type_flag) || !slug || !title || !content) {
      return res.status(400).json({ message: 'type_flag, slug, title ve content alanları zorunludur.' });
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.query(
      'UPDATE static_pages SET type_flag = ?, slug = ?, title = ?, content = ?, status = ?, sort_order = ? WHERE id = ?',
      [type_flag, slug, title, content, Number(status), Number(sort_order), id]
    );

    const [page] = await connection.query('SELECT id, type_flag, slug, title, content, status, sort_order, created_at, updated_at FROM static_pages WHERE id = ?', [id]);
    res.json(page[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sabit sayfa güncellenemedi', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/static-pages/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);
    await connection.query('DELETE FROM static_pages WHERE id = ?', [id]);
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sabit sayfa silinemedi', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/overview', async (_req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [categories] = await connection.query('SELECT id, name, slug, description, status FROM categories ORDER BY id DESC LIMIT 10');
    const [courses] = await connection.query('SELECT id, title, description, duration_minutes, capacity, status FROM courses ORDER BY id DESC LIMIT 10');
    const [contacts] = await connection.query('SELECT id, full_name, email, subject, message, is_read, created_at FROM contacts ORDER BY created_at DESC LIMIT 10');
    const [users] = await connection.query('SELECT id, first_name, last_name, email, role, status FROM users ORDER BY id DESC LIMIT 20');

    res.json({
      stats: [{ label: 'Toplam Kurs', value: '24', detail: 'Aktif kurs sayısı' }, { label: 'Başvuru', value: '128', detail: 'Bekleyen başvuru' }, { label: 'İletişim', value: '19', detail: 'Okunmamış mesaj' }, { label: 'Üye', value: '310', detail: 'Portal kaydı' }],
      categories,
      courses,
      contacts,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Veritabanı bağlantısı kurulamadı', error: String(error) });
  } finally {
    if (connection) await connection.end();
  }
});

app.listen(3001, () => {
  console.log('Sporx API running on http://localhost:3001');
});
