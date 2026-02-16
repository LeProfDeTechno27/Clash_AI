const express = require('express');
const db = require('../db/connection');
const { getJSON, setJSON } = require('../services/cache');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [[debates]] = await db.execute('SELECT COUNT(*) AS count FROM debates');
    const [[videos]] = await db.execute('SELECT COUNT(*) AS count FROM videos');
    const [[pubs]] = await db.execute('SELECT COUNT(*) AS count FROM publications');
    res.json({ debates: debates.count, videos: videos.count, publications: pubs.count });
  } catch (err) { next(err); }
});

module.exports = router;


