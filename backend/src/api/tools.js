const express = require('express');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const db = require('../db/connection');
const axios = require('axios');

const router = express.Router();
const uploadsRoot = process.env.UPLOADS_DIR || path.resolve('/app/uploads');

function run(cmd, args, opts={}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, opts, (err, stdout, stderr) => {
      if (err) { err.stderr = stderr; return reject(err); }
      resolve({ stdout, stderr });
    });
  });
}

router.post('/tts/batch', async (req, res, next) => {
  try {
    const { debate_id, speakers = ['speaker1','speaker2','moderator'], duration = 10 } = req.body || {};
    if (!debate_id) return res.status(400).json({ error: 'debate_id required' });
    const [[deb]] = await db.execute('SELECT topic FROM debates WHERE id = ?', [debate_id]);
    const topic = deb?.topic || `Debate ${debate_id}`;
    const baseUrl = process.env.TTS_SERVICE_URL;
    const debateDir = path.join(uploadsRoot, 'debates', String(debate_id));
    await fs.mkdir(debateDir, { recursive: true });

    for (const sp of speakers) {
      const out = path.join(debateDir, `${sp}.wav`);
      if (baseUrl) {
        try {
          await axios.post(`${baseUrl}/synthesize`, {
            text: `${sp} about ${topic}. `.repeat(Math.max(1, Math.floor(duration / 2))),
            voice: sp,
            sample_rate: 22050,
            duration_seconds: duration,
            output_path: out,
            format: 'wav'
          }, { timeout: 30000 });
        } catch (e) {
          const freq = sp === 'speaker2' ? 550 : (sp === 'moderator' ? 180 : 440);
          await run('ffmpeg', ['-y','-f','lavfi','-i',`sine=frequency=${freq}:duration=${duration}`,'-acodec','pcm_s16le','-ar','22050', out]);
        }
      } else {
        const freq = sp === 'speaker2' ? 550 : (sp === 'moderator' ? 180 : 440);
        await run('ffmpeg', ['-y','-f','lavfi','-i',`sine=frequency=${freq}:duration=${duration}`,'-acodec','pcm_s16le','-ar','22050', out]);
      }
      await db.execute('INSERT INTO audio_files (debate_id, speaker, path, duration_seconds, status) VALUES (?,?,?,?,?)', [debate_id, sp, out, duration, 'ready']);
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/video/generate', async (req, res, next) => {
  try {
    const { debate_id, width=1280, height=720 } = req.body || {};
    if (!debate_id) return res.status(400).json({ error: 'debate_id required' });
    const debateDir = path.join(uploadsRoot, 'debates', String(debate_id));
    await fs.mkdir(debateDir, { recursive: true });
    const [aud] = await db.execute('SELECT * FROM audio_files WHERE debate_id = ? ORDER BY id ASC', [debate_id]);
    if (!aud[0]) return res.status(400).json({ error: 'no audio files' });
    const audioPath = aud[0].path;
    const out = path.join(debateDir, 'long.mp4');
    const drawText = `drawtext=fontfile=/usr/share/fonts/TTF/DejaVuSans.ttf:text='Debate ${debate_id}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`;
    await run('ffmpeg', ['-y','-f','lavfi','-i',`color=c=black:s=${width}x${height}:d=60`,'-i', audioPath,'-vf', drawText,'-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac', out]);
    await db.execute('INSERT INTO videos (debate_id, format, path, duration_seconds, status) VALUES (?,?,?,?,?)', [debate_id, 'long', out, 60, 'ready']);
    res.json({ ok: true, path: out });
  } catch (e) { next(e); }
});

router.post('/video/segment', async (req, res, next) => {
  try {
    const { debate_id, segments = [ {start:0,duration:10}, {start:10,duration:10}, {start:20,duration:10} ] } = req.body || {};
    if (!debate_id) return res.status(400).json({ error: 'debate_id required' });
    const debateDir = path.join(uploadsRoot, 'debates', String(debate_id));
    const long = path.join(debateDir, 'long.mp4');
    for (let i=0; i<segments.length; i++) {
      const seg = segments[i];
      const out = path.join(debateDir, `short${i+1}.mp4`);
      await run('ffmpeg', ['-y','-ss', String(seg.start), '-i', long, '-t', String(seg.duration), '-c','copy', out]);
      await db.execute('INSERT INTO videos (debate_id, format, path, duration_seconds, status) VALUES (?,?,?,?,?)', [debate_id, 'short', out, seg.duration, 'ready']);
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
