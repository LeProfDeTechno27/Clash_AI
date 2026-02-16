const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { publishQueue } = require('../services/queue');
const router = express.Router();

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Video not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    const video = rows[0];
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const uploadsRoot = path.resolve('/app/uploads');
    const filePath = path.resolve(video.path || '');
    if (!filePath.startsWith(uploadsRoot)) return res.status(400).json({ error: 'Invalid path' });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (err) { next(err); }
});

router.post('/:id/publish', async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const platform = req.body?.platform || 'youtube';
    const [rows] = await db.execute('SELECT * FROM videos WHERE id = ?', [videoId]);
    if (!rows[0]) return res.status(404).json({ error: 'Video not found' });

    if (platform === 'youtube') {
      await publishQueue.add({ video_id: videoId, platform: 'youtube' }, { removeOnComplete: true });
      return res.json({ id: videoId, status: 'queued' });
    }

    // Simulate publish for other platforms
    const url = `https://${platform}.example.com/video/${videoId}`;
    await db.execute('INSERT INTO publications (video_id, platform, status, url, published_at) VALUES (?,?,?,?, NOW())', [videoId, platform, 'published', url]);
    res.json({ id: videoId, status: 'published', platform, url });
  } catch (err) { next(err); }
});

module.exports = router;
