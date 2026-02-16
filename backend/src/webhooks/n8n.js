const { io } = require('../realtime/io');
const verifyWebhook = require('../middleware/verifyWebhook');
const express = require('express');
const db = require('../db/connection');
const router = express.Router();
router.use(verifyWebhook);

router.post('/debate-complete', async (req, res, next) => {
  try {
    const { debate_id, status } = req.body || {};
    await db.execute('INSERT INTO webhook_logs (source, payload) VALUES (?, JSON_OBJECT("debate_id", ?, "status", ?))', ['n8n', debate_id || null, status || null]);
    if (debate_id) await db.execute('UPDATE debates SET status = ? WHERE id = ?', [status || 'video', debate_id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/audio-complete', async (req, res, next) => {
  try {
    const { debate_id } = req.body || {};
    await db.execute('INSERT INTO webhook_logs (source, payload) VALUES ("n8n", JSON_OBJECT("debate_id", ?))', [debate_id || null]);
    if (debate_id) { await db.execute('UPDATE debates SET status = ? WHERE id = ?', ['audio', debate_id]); io().emit('debate:update', { id: debate_id, status: 'audio' }); }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/video-complete', async (req, res, next) => {
  try {
    const { debate_id } = req.body || {};
    await db.execute('INSERT INTO webhook_logs (source, payload) VALUES ("n8n", JSON_OBJECT("debate_id", ?))', [debate_id || null]);
    if (debate_id) { await db.execute('UPDATE debates SET status = ? WHERE id = ?', ['video', debate_id]); io().emit('debate:update', { id: debate_id, status: 'video' }); }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/publish-complete', async (req, res, next) => {
  try {
    const { video_id, platform, url } = req.body || {};
    await db.execute('INSERT INTO webhook_logs (source, payload) VALUES ("n8n", JSON_OBJECT("video_id", ?, "platform", ?, "url", ?))', [video_id || null, platform || null, url || null]);
    if (video_id && platform) {
      await db.execute('UPDATE publications SET status = ?, url = ?, published_at = NOW() WHERE video_id = ? AND platform = ?', ['published', url || null, video_id, platform]); io().emit('publish:update', { video_id, platform, status: 'published', url });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;



