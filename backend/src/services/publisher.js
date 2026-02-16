const db = require('../db/connection');
const { uploadVideo: uploadToYouTube } = require('./youtube');

async function getVideoWithDebate(videoId) {
  const [rows] = await db.execute(`
    SELECT v.*, d.topic
    FROM videos v
    JOIN debates d ON d.id = v.debate_id
    WHERE v.id = ?
  `, [videoId]);
  return rows[0];
}

async function publish(videoId, platform = 'youtube') {
  const rec = await getVideoWithDebate(videoId);
  if (!rec) throw new Error('Video not found');

  let result;
  if (platform === 'youtube') {
    const meta = {
      title: rec.format === 'long' ? `Débat IA: ${rec.topic}` : `Short - ${rec.topic}`,
      description: `Vidéo générée automatiquement pour le débat: ${rec.topic}`,
      tags: ['AI', 'Debate', 'Automation'],
      privacyStatus: process.env.YOUTUBE_PRIVACY || 'private'
    };
    result = await uploadToYouTube(rec.path, meta);
  } else {
    throw new Error(`Platform not supported: ${platform}`);
  }

  const [[existing]] = await db.execute('SELECT id FROM publications WHERE video_id = ? AND platform = ?', [videoId, platform]);
  if (existing) {
    await db.execute('UPDATE publications SET status = ?, url = ?, published_at = NOW() WHERE id = ?', ['published', result.url, existing.id]);
  } else {
    await db.execute('INSERT INTO publications (video_id, platform, status, url, published_at) VALUES (?,?,?,?, NOW())', [videoId, platform, 'published', result.url]);
  }
  return result;
}

module.exports = { publish };
