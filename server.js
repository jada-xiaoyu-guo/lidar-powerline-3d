/*const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const allowedOrigins = [
  'http://localhost:5500',
  'http://localhost:5504',
  'http://localhost:5505',
  'http://localhost:5506',
  'http://127.0.0.1:5504',
  'http://127.0.0.1:5505',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://112.1.219.75:3000',
  'https://1455d428f89b.ngrok-free.app', // 新增
  'http://1455d428f89b.ngrok-free.app'   // 新增
];

const app = express();
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(bodyParser.json({limit: '2mb'}));
app.use(express.static(__dirname));
app.use(express.json());

const reports = {};

// 保存报告内容，返回唯一ID
app.post('/api/save-report', (req, res) => {
    const { html } = req.body;
    if (!html) return res.status(400).json({error: 'No html'});
    const id = 'r' + Date.now() + Math.floor(Math.random()*100000);
    reports[id] = html;
    res.json({ id });
});

// 获取报告内容
app.get('/api/get-report', (req, res) => {
    const id = req.query.id;
    if (!id || !reports[id]) return res.status(404).json({error: 'Not found'});
    res.json({ html: reports[id] });
});

// 只保留一个 listen
const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log('服务已启动，端口', port);
});
/*
// ================== 数据库相关API ==================
const pool = new Pool({
    user: 'testuser',
    host: '172.31.92.223', // 数据库主机地址
    database: 'postgres',
    password: 'Test@123456',
    port: 8888,
});

// 电力线属性 API
app.get('/api/power_line_metrics', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, coordinates, length, sag, tension, confidence FROM power_line_metrics');
        res.json(result.rows);
    } catch (err) {
        console.error('数据库查询出错:', err);
        res.status(500).json({ error: err.message });
    }
});

// 点云数据 API
app.get('/api/refined_power_lines', async (req, res) => {
    try {
        const result = await pool.query('SELECT x, y, z, labels, r, g, b FROM refined_power_lines');
        res.json(result.rows);
    } catch (err) {
        console.error('数据库查询出错:', err);
        res.status(500).json({ error: err.message });
    }
});

// 静态文件服务（可选，前端静态文件放这里）
app.use(express.static(__dirname));



// 使用内存存储，直接拿 buffer
const upload = multer({ storage: multer.memoryStorage() });

// 上传接口：文件内容写入数据库
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const { originalname, buffer } = req.file;
        await pool.query(
            'INSERT INTO las_files (filename, content) VALUES ($1, $2)',
            [originalname, buffer]
        );
        res.json({ success: true, filename: originalname });
    } catch (err) {
        console.error('数据库写入失败:', err);
        res.status(500).json({ error: '数据库写入失败' });
    }
});

// 你还可以加上读取接口
app.get('/api/las-files', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, filename, upload_time FROM las_files ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: '数据库读取失败' });
    }
});

// 下载接口（按id下载文件）
app.get('/api/las-files/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT filename, content FROM las_files WHERE id=$1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Not found');
        res.setHeader('Content-Disposition', `attachment; filename="${result.rows[0].filename}"`);
        res.send(result.rows[0].content);
    } catch (err) {
        res.status(500).send('数据库读取失败');
    }
});

app.listen(8888, () => {
    console.log('文件上传服务已启动，端口 8888');
});*/