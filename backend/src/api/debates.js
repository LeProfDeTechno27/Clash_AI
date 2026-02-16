const express = require('express');
const Joi = require('joi');
const db = require('../db/connection');
const { debateQueue } = require('../services/queue');
const { getJSON, setJSON } = require('../services/cache');
const { debatesCreated } = require('../metrics');
const { io } = require('../realtime/io');

const router = express.Router();

// List debates (latest first)
router.get('/', async (req, res, next) => {
  try {
    const limitRaw = parseInt(req.query.limit || '50', 10);
    const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 100)) : 50;
    const sql = `SELECT id, topic, status, created_at, updated_at FROM debates ORDER BY created_at DESC LIMIT ${limit}`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) { next(err); }
});


const debateSchema = Joi.object({
  topic: Joi.string().min(3).max(255).required(),
  position1: Joi.string().allow('', null),
  position2: Joi.string().allow('', null),
  duration_target: Joi.number().integer().min(2).max(30).default(12)
});

router.post('/', async (req, res, next) => {
  try {
    const value = await debateSchema.validateAsync(req.body);
    const [result] = await db.execute(
      'INSERT INTO debates (topic, position1, position2, duration_target) VALUES (?,?,?,?)',
      [value.topic, value.position1 || null, value.position2 || null, value.duration_target]
    );
    await debateQueue.add({ debate_id: result.insertId, topic: value.topic }, { removeOnComplete: true });
    debatesCreated.inc();
    io().emit('debate:update', { id: result.insertId, status: 'queued' });
    res.status(201).json({ id: result.insertId, status: 'queued' });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM debates WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/status', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id, status, created_at, updated_at FROM debates WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/videos', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM videos WHERE debate_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
