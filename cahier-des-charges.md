# CAHIER DES CHARGES DÉTAILLÉ - AI Debate Channel (OPTION 1)

## 1. SPÉCIFICATIONS GÉNÉRALES

### 1.1 Objectif du Projet
Créer une plateforme automatisée de génération, création et publication de vidéos de débats entre IA (ChatGPT vs Claude AI, avec Perplexity comme modérateur).

**Format de livrable:**
- 1 vidéo YouTube longue (10-15 min)
- 3 vidéos shorts (≤2 min) pour TikTok/Instagram Reels

**Fréquence cible:** 2-4 débats/semaine

### 1.2 Stack Technique

#### Frontend
```
Framework: React 18 + TypeScript
Build tool: Vite
Styling: Tailwind CSS
State management: Zustand
HTTP Client: Axios
UI Components: shadcn/ui (optionnel)
```

#### Backend
```
Runtime: Node.js 18+
Framework: Express.js
Language: JavaScript
Database: MySQL 8.0
ORM: Knex.js ou Sequelize
Job Queue: Bull (Redis)
File Storage: Local filesystem (uploads/)
```

#### Infrastructure Locale
```
Serveur: Node.js (port 5000)
Database: MySQL (port 3306)
Reverse Proxy: Nginx (optionnel, port 80/443)
n8n: Local installation (port 5678)
Redis: Pour Bull job queue (port 6379)
```

#### Services Externes (APIs)
```
OpenAI (ChatGPT):    https://api.openai.com/v1
Anthropic (Claude):  https://api.anthropic.com/v1
Perplexity:          https://api.perplexity.ai
Google TTS:          google-cloud-texttospeech
Google Veo 3:        https://aistudio.google.com (API pending)
DaVinci Resolve:     Local CLI
FFmpeg:              Local CLI
```

---

## 2. ARCHITECTURE SYSTÈME

### 2.1 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  http://localhost:3000                                      │
│  ├─ Créer débat (formulaire)                                │
│  ├─ Suivi progression (WebSocket)                           │
│  ├─ Gestion vidéos (liste + preview)                        │
│  └─ Publication programmée                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST + WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (Express.js)                         │
│  http://localhost:5000/api                                  │
│  ├─ POST /debates               (créer débat)              │
│  ├─ GET /debates/:id            (récupérer débat)          │
│  ├─ GET /debates/:id/status     (suivi progression)        │
│  ├─ POST /videos/publish        (publier vidéo)            │
│  └─ GET /analytics              (stats)                     │
└─────────┬──────────────────────────────┬────────────────────┘
          │                              │
          ▼                              ▼
    ┌──────────────┐           ┌──────────────────┐
    │  MySQL DB    │           │  n8n Workflows   │
    │localhost:3306│           │localhost:5678    │
    │              │           │                  │
    │ debates      │           │ Debate generator │
    │ videos       │           │ Video processor  │
    │ publications │           │ Publisher        │
    └──────────────┘           └──────────────────┘
          ▲                              │
          └──────────────────────────────┘
               Webhook callback
```

### 2.2 Structure de Fichiers

```
ai-debate-platform/
├── frontend/                    # Application React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreateDebate.tsx
│   │   │   ├── VideoManager.tsx
│   │   │   ├── PublishManager.tsx
│   │   │   └── Analytics.tsx
│   │   ├── hooks/
│   │   │   ├── useDebates.ts
│   │   │   └── useWebSocket.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── api/
│   │   │   ├── debates.js       # CRUD débats
│   │   │   ├── videos.js        # CRUD vidéos
│   │   │   ├── publish.js       # Publication
│   │   │   └── analytics.js     # Stats
│   │   ├── middleware/
│   │   │   ├── auth.js          # Validation
│   │   │   └── errorHandler.js
│   │   ├── db/
│   │   │   ├── connection.js    # MySQL setup
│   │   │   ├── schema.sql       # Migrations
│   │   │   └── queries.js
│   │   ├── webhooks/
│   │   │   └── n8n.js           # Callback n8n
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── validators.js
│   │   ├── services/
│   │   │   ├── n8nService.js    # Orchestration
│   │   │   └── youtubeService.js # Publication
│   │   └── server.js
│   ├── .env.local
│   ├── package.json
│   └── knexfile.js
│
├── scripts/                     # Scripts utilitaires
│   ├── setup.sh                 # Installation initiale
│   ├── migrate.sh               # Migrations DB
│   └── backup.sh                # Sauvegarde DB
│
├── n8n/                         # Workflows n8n
│   └── workflows/
│       ├── debate-generator.json
│       ├── video-processor.json
│       └── publisher.json
│
├── local-tools/                 # Scripts Python/CLI
│   ├── kokoro_tts.py
│   ├── davinci_export.py
│   └── youtube_uploader.py
│
└── docker-compose.yml           # (Optionnel) pour local
```

---

## 3. SPÉCIFICATIONS DÉTAILLÉES PAR MODULE

### 3.1 Module Backend - API Endpoints

#### Création de Débat
```
POST /api/debates
Body:
{
  "topic": string,
  "position1": string,        // Argument position 1
  "position2": string,        // Argument position 2
  "duration_target": number,  // Minutes (10-15)
  "moderation_style": enum,   // "neutral" | "humorous" | "socratic"
  "scheduled_for": datetime    // Quand lancer la génération
}

Response 201:
{
  "id": "uuid",
  "status": "queued",
  "created_at": datetime,
  "estimated_completion": datetime,
  "webhook_url": "http://localhost:5000/webhooks/n8n/debate-123"
}
```

#### Suivi Progression
```
GET /api/debates/:id/status
WebSocket: /ws/debates/:id/progress

Response:
{
  "id": "uuid",
  "status": "generating_script" | "generating_audio" | "creating_video" | "editing" | "completed" | "failed",
  "progress_percent": 0-100,
  "current_step": {
    "name": string,
    "started_at": datetime,
    "estimated_completion": datetime
  },
  "logs": [string],
  "error": string (if failed)
}
```

#### Récupérer Vidéo
```
GET /api/debates/:id/videos

Response:
[
  {
    "id": "uuid",
    "debate_id": "uuid",
    "format": "youtube_long" | "tiktok_short" | "instagram_reel",
    "duration": 720,           // secondes
    "file_path": "uploads/debates/xxx/youtube.mp4",
    "thumbnail_url": "uploads/debates/xxx/thumb.jpg",
    "size_mb": 450,
    "created_at": datetime,
    "status": "ready" | "processing" | "failed"
  }
]
```

#### Publier Vidéo
```
POST /api/videos/:id/publish
Body:
{
  "platforms": ["youtube", "tiktok", "instagram"],
  "title": string,
  "description": string,
  "tags": [string],
  "scheduled_for": datetime,
  "publish_immediately": boolean
}

Response:
{
  "id": "uuid",
  "video_id": "uuid",
  "status": "scheduled" | "published" | "failed",
  "platform_urls": {
    "youtube": "https://youtube.com/shorts/...",
    "tiktok": "https://tiktok.com/@.../video/...",
    "instagram": "https://instagram.com/p/..."
  },
  "published_at": datetime
}
```

### 3.2 Module Database - Schema MySQL

```sql
-- Débats
CREATE TABLE debates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  topic VARCHAR(500) NOT NULL,
  position1_script LONGTEXT,
  position2_script LONGTEXT,
  moderator_script LONGTEXT,
  duration_target INT DEFAULT 12,
  moderation_style ENUM('neutral', 'humorous', 'socratic') DEFAULT 'neutral',
  status ENUM('draft', 'queued', 'generating', 'ready', 'published', 'failed') DEFAULT 'draft',
  scheduled_for DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Voix générées
CREATE TABLE audio_files (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  debate_id CHAR(36) NOT NULL,
  speaker ENUM('chatgpt', 'claude', 'perplexity'),
  file_path VARCHAR(255) NOT NULL,
  duration_seconds INT,
  size_bytes INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE,
  INDEX idx_debate_id (debate_id)
);

-- Vidéos générées
CREATE TABLE videos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  debate_id CHAR(36) NOT NULL,
  format ENUM('youtube_long', 'tiktok_short', 'instagram_reel') NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  thumbnail_path VARCHAR(255),
  duration_seconds INT,
  size_bytes BIGINT,
  resolution VARCHAR(20),     -- "1920x1080", "720x1280", etc
  status ENUM('processing', 'ready', 'failed') DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE,
  INDEX idx_debate_id (debate_id),
  INDEX idx_status (status)
);

-- Publications
CREATE TABLE publications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  video_id CHAR(36) NOT NULL,
  platform ENUM('youtube', 'tiktok', 'instagram', 'telegram') NOT NULL,
  platform_video_id VARCHAR(255),
  platform_url VARCHAR(500),
  title VARCHAR(500),
  description TEXT,
  tags JSON,
  scheduled_for DATETIME,
  published_at DATETIME,
  status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  last_synced_at DATETIME,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  INDEX idx_platform (platform),
  INDEX idx_status (status),
  INDEX idx_published_at (published_at)
);

-- Webhooks n8n
CREATE TABLE webhook_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  debate_id CHAR(36),
  event_type VARCHAR(100),
  payload JSON,
  status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE SET NULL,
  INDEX idx_debate_id (debate_id)
);
```

### 3.3 Configuration Environnement

```bash
# .env.local (Backend)

# Server
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=debate_user
DB_PASSWORD=secure_password_123
DB_NAME=ai_debate_db
DB_CONNECTION_POOL=10

# Redis (pour Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# APIs
OPENAI_API_KEY=sk_live_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
PERPLEXITY_API_KEY=pplx-xxx
GOOGLE_CLOUD_PROJECT=project-id
GOOGLE_TTS_API_KEY=key_xxx

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=api_key_xxx

# YouTube (Service Account)
YOUTUBE_SERVICE_ACCOUNT_EMAIL=xxx@developer.gserviceaccount.com
YOUTUBE_PRIVATE_KEY_PATH=./credentials/youtube-key.json

# TikTok (OAuth2)
TIKTOK_CLIENT_ID=xxx
TIKTOK_CLIENT_SECRET=xxx
TIKTOK_REDIRECT_URI=http://localhost:5000/auth/tiktok/callback

# Instagram
INSTAGRAM_ACCESS_TOKEN=xxx
INSTAGRAM_BUSINESS_ACCOUNT_ID=xxx

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=2000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Features
ENABLE_AUTO_PUBLISH=true
AUTO_PUBLISH_DELAY_HOURS=2
MAX_PARALLEL_JOBS=2
```

---

## 4. SPECIFICATIONS DES WORKFLOWS n8n

### 4.1 Workflow 1: Debate Generator

```
Trigger: Manual / Webhook POST /webhooks/n8n/debate-start
  ↓
1. Get Trending Topic (Perplexity API)
   └─ Input: empty (use Perplexity trending)
   └─ Output: topic string
  ↓
2. Generate Structure (ChatGPT)
   └─ Input: topic
   └─ Prompt: "Crée une structure de débat structuré avec introduction, position 1, position 2..."
   └─ Output: JSON {intro, pos1, pos2, conclusion}
  ↓
3. Generate Position 1 (ChatGPT)
   └─ Input: topic, structure.pos1_outline
   └─ Output: Full argument text
  ↓
4. Generate Position 2 (Claude API)
   └─ Input: topic, structure.pos2_outline
   └─ Output: Full argument text
  ↓
5. Generate Moderation (Perplexity)
   └─ Input: topic, pos1, pos2
   └─ Output: Transitions, questions, conclusions
  ↓
6. Save to Database
   └─ INSERT INTO debates (topic, position1_script, position2_script, status='ready')
   └─ Return debate_id
  ↓
7. Webhook Callback to Backend
   └─ POST http://localhost:5000/webhooks/n8n/debate-complete
   └─ Body: { debate_id, status: 'script_generated' }
```

### 4.2 Workflow 2: Audio Generator (Kokoro Local)

```
Trigger: Webhook from Backend
  ↓
1. Get Debate from DB
   └─ Input: debate_id
   └─ Output: position1_script, position2_script, moderator_script
  ↓
2. Call Local Kokoro TTS (Shell exec)
   └─ Command: python3 /path/to/kokoro_tts.py
            --text "${position1_script}"
            --voice "af_bella"
            --output /uploads/debates/${debate_id}/voice1.mp3
   └─ Output: /uploads/debates/{id}/voice1.mp3
  ↓
3. Call Kokoro for Position 2
   └─ Same but voice "af_alice"
   └─ Output: /uploads/debates/{id}/voice2.mp3
  ↓
4. Call Kokoro for Moderation
   └─ Same but voice "af_jessica"
   └─ Output: /uploads/debates/{id}/voice_mod.mp3
  ↓
5. Update Database
   └─ INSERT INTO audio_files (debate_id, speaker, file_path)
  ↓
6. Webhook Callback
   └─ POST http://localhost:5000/webhooks/n8n/audio-complete
```

### 4.3 Workflow 3: Video Generator (Google Veo 3 API)

```
Trigger: Webhook from Backend (audio ready)
  ↓
1. Get Audio Files
   └─ Input: debate_id
   └─ Output: audio file paths + scripts
  ↓
2. Call Google Veo 3 API
   └─ Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
   └─ Prompt: "Create professional debate video with two experts discussing [topic]. They are in a studio set, sitting across from each other, gesturing while speaking. High quality 4K video, natural lighting, professional setting."
   └─ Duration: 12 minutes
   └─ Output: video.mp4 (4K)
  ↓
3. Download Video from Google
   └─ Save to: /uploads/debates/{id}/video_raw.mp4
  ↓
4. Update Database
   └─ INSERT INTO videos (debate_id, format='youtube_long', file_path, status='raw')
  ↓
5. Webhook Callback
   └─ POST http://localhost:5000/webhooks/n8n/video-complete
```

### 4.4 Workflow 4: Video Editor (DaVinci Local)

```
Trigger: Webhook from Backend (video ready)
  ↓
1. Get Video File
   └─ Path: /uploads/debates/{id}/video_raw.mp4
  ↓
2. Apply DaVinci Workflow
   └─ Command: /opt/davinci-resolve/bin/resolve --nogui -script /scripts/davinci_edit.lua [debate_id]
   └─ Lua script actions:
       ├─ Import video_raw.mp4
       ├─ Generate captions (auto speech recognition)
       ├─ Add color grading (cinematic preset)
       ├─ Export 1080p → /uploads/debates/{id}/youtube_long.mp4
       └─ Export 3x segments 720p → /uploads/debates/{id}/shorts_*.mp4
  ↓
3. Generate Thumbnails
   └─ ffmpeg -i youtube_long.mp4 -ss 00:30 -s 1280x720 thumb.jpg
  ↓
4. Update Database
   └─ INSERT INTO videos (...) for each format (youtube_long, short1, short2, short3)
  ↓
5. Webhook Callback
   └─ POST http://localhost:5000/webhooks/n8n/editing-complete
```

### 4.5 Workflow 5: Publisher (DIY APIs)

```
Trigger: Manual from Frontend OR Scheduled
  ↓
1. Get Video and Metadata
   └─ Input: video_id, publish_params
  ↓
2. YouTube Shorts Upload
   └─ Auth: Service Account JWT
   └─ Endpoint: POST https://www.googleapis.com/youtube/v3/videos?part=snippet,processingDetails
   └─ Body:
        {
          "snippet": {
            "title": "ChatGPT vs Claude: [Topic]",
            "description": "...",
            "tags": ["ai", "debate", "chatgpt", "claude"],
            "categoryId": "28"  // Science & Tech
          }
        }
   └─ Upload: youtube_long.mp4
   └─ Output: youtubeVideoId
  ↓
3. TikTok Upload (3 shorts)
   └─ Auth: OAuth2 token
   └─ Endpoint: POST https://open.tiktok.com/v1/post/publish/video/init
   └─ Upload: shorts_1.mp4, shorts_2.mp4, shorts_3.mp4
   └─ Output: tiktok_video_ids (x3)
  ↓
4. Instagram Upload (3 reels)
   └─ Auth: Access token
   └─ Endpoint: POST /{ig-user-id}/media
   └─ Upload: shorts_1.mp4, shorts_2.mp4, shorts_3.mp4
  ↓
5. Save Publication Records
   └─ INSERT INTO publications (video_id, platform, platform_video_id, status='published')
  ↓
6. Notify via Telegram
   └─ POST https://api.telegram.org/botXXX/sendMessage
   └─ Message: "✅ Débat '[Topic]' publié! YouTube: [url] | TikTok: [url] | IG: [url]"
  ↓
7. Webhook Callback
   └─ POST http://localhost:5000/webhooks/n8n/publish-complete
```

---

## 5. INTÉGRATIONS EXTERNES

### 5.1 YouTube Data API

```javascript
// Configuration
const youtube = google.youtube({
  version: 'v3',
  auth: new google.auth.GoogleAuth({
    keyFile: './credentials/youtube-key.json',
    scopes: ['https://www.googleapis.com/auth/youtube.upload']
  })
});

// Upload Shorts
async function uploadYoutubeShorts(videoPath, metadata) {
  const fileSize = fs.statSync(videoPath).size;
  
  const request = youtube.videos.insert(
    {
      part: 'snippet,processingDetails,status',
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: '28'  // Science & Technology
        },
        status: {
          privacyStatus: 'public'
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    },
    {
      onUploadProgress: (evt) => {
        const progress = Math.round((evt.bytesProcessed / fileSize) * 100);
        console.log(`Upload progress: ${progress}%`);
      }
    }
  );
  
  const response = await request;
  return response.data.id;
}
```

### 5.2 TikTok Creator API

```javascript
// Configuration
const tiktokConfig = {
  clientId: process.env.TIKTOK_CLIENT_ID,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  accessToken: process.env.TIKTOK_ACCESS_TOKEN  // Obtained via OAuth
};

// Initialize upload
async function initTiktokUpload(videoPath, metadata) {
  const response = await axios.post(
    'https://open.tiktok.com/v1/post/publish/video/init',
    {
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: fs.statSync(videoPath).size,
        chunk_size: 5242880  // 5MB chunks
      },
      post_info: {
        title: metadata.title,
        description: metadata.description,
        privacy_level: 'PUBLIC_TO_ANYONE',
        comment_disabled: false,
        duet_disabled: false,
        stitch_disabled: false,
        video_cover_timestamp_ms: 1000
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${tiktokConfig.accessToken}`
      }
    }
  );
  
  return response.data.data.publish_id;
}
```

### 5.3 Instagram Graph API

```javascript
async function uploadInstagramReel(videoPath, metadata) {
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  
  // Create media container
  const containerResponse = await axios.post(
    `https://graph.instagram.com/${igUserId}/media`,
    {
      media_type: 'REELS',
      video_url: `file://${path.resolve(videoPath)}`,
      caption: metadata.description,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  );
  
  const containerId = containerResponse.data.id;
  
  // Publish
  const publishResponse = await axios.post(
    `https://graph.instagram.com/${igUserId}/media_publish`,
    {
      creation_id: containerId,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  );
  
  return publishResponse.data.id;
}
```

---

## 6. MÉTRIQUES & MONITORING

### 6.1 Métriques à Tracker

```sql
-- Dashboard metrics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_debates,
  AVG(TIMESTAMPDIFF(MINUTE, created_at, completed_at)) as avg_duration_min,
  SUM(CASE WHEN status='published' THEN 1 ELSE 0 END) as published_count
FROM debates
GROUP BY DATE(created_at);

-- Platform performance
SELECT 
  p.platform,
  COUNT(*) as total_publications,
  SUM(p.views) as total_views,
  SUM(p.likes) as total_likes,
  AVG(p.likes/p.views) as avg_engagement_rate
FROM publications p
WHERE published_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.platform;

-- Top performing debates
SELECT 
  d.topic,
  COUNT(p.id) as platforms_published,
  SUM(p.views) as total_views,
  SUM(p.likes) as total_likes
FROM debates d
LEFT JOIN videos v ON d.id = v.debate_id
LEFT JOIN publications p ON v.id = p.video_id
GROUP BY d.id, d.topic
ORDER BY total_views DESC
LIMIT 10;
```

### 6.2 Health Checks

```javascript
// Backend health endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      n8n: await checkN8n(),
      apis: {
        openai: await checkOpenAI(),
        anthropic: await checkAnthropic(),
        google: await checkGoogle()
      }
    }
  };
  
  res.json(health);
});
```

---

## 7. SÉCURITÉ

### 7.1 Authentication & Authorization

```javascript
// JWT middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 100  // 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 7.2 Data Validation

```javascript
// Debate creation validation
const debateSchema = {
  topic: Joi.string().min(10).max(500).required(),
  position1: Joi.string().min(20).max(2000).required(),
  position2: Joi.string().min(20).max(2000).required(),
  duration_target: Joi.number().min(5).max(30).required(),
  moderation_style: Joi.string().valid('neutral', 'humorous', 'socratic').required()
};

app.post('/api/debates', validateRequest(debateSchema), createDebate);
```

### 7.3 API Keys Management

```javascript
// Never commit .env files
// Use environment variables for all secrets
// Rotate API keys regularly
// Monitor API usage for anomalies

// Encrypt sensitive data at rest
const crypto = require('crypto');
const encrypted = crypto.encrypt(apiKey, process.env.ENCRYPTION_KEY);
```

---

## 8. PERFORMANCE & SCALABILITÉ

### 8.1 Caching Strategy

```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Cache debate status (5 min TTL)
app.get('/api/debates/:id/status', async (req, res) => {
  const cached = await client.get(`debate:${req.params.id}:status`);
  if (cached) return res.json(JSON.parse(cached));
  
  const status = await db.query('SELECT * FROM debates WHERE id = ?', [req.params.id]);
  await client.setex(`debate:${req.params.id}:status`, 300, JSON.stringify(status));
  res.json(status);
});
```

### 8.2 Job Queue (Bull + Redis)

```javascript
const Queue = require('bull');
const debateQueue = new Queue('debates', {
  redis: { host: 'localhost', port: 6379 }
});

// Queue a debate generation
debateQueue.add(
  {
    debate_id: '123',
    topic: 'AI ethics'
  },
  { priority: 10, delay: 0, removeOnComplete: true }
);

// Process queue
debateQueue.process(async (job) => {
  console.log(`Processing debate ${job.data.debate_id}`);
  // Trigger n8n workflow
  return await triggerN8nWorkflow(job.data);
});
```

### 8.3 Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_debates_status ON debates(status);
CREATE INDEX idx_debates_created ON debates(created_at);
CREATE INDEX idx_videos_debate_format ON videos(debate_id, format);
CREATE INDEX idx_publications_platform_published ON publications(platform, published_at);

-- Connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
```

---

## 9. TESTING & QA

### 9.1 Unit Tests

```javascript
// Jest tests
describe('Debate API', () => {
  test('should create a debate', async () => {
    const res = await request(app)
      .post('/api/debates')
      .send({
        topic: 'Test topic',
        position1: 'Argument 1',
        position2: 'Argument 2',
        duration_target: 12
      });
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

### 9.2 Integration Tests

```javascript
describe('Full Debate Workflow', () => {
  test('should generate, create, and publish debate', async () => {
    // 1. Create debate
    const debate = await createDebate({...});
    
    // 2. Trigger n8n workflow
    await triggerN8nWorkflow(debate.id);
    
    // 3. Wait for completion
    await sleep(5000);
    
    // 4. Check videos exist
    const videos = await getVideos(debate.id);
    expect(videos.length).toBeGreaterThan(0);
    
    // 5. Publish
    const publication = await publishVideo(videos[0].id);
    expect(publication.status).toBe('published');
  });
});
```

---

## 10. MAINTENANCE & MONITORING

### 10.1 Logging

```javascript
// Winston logger
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Usage
logger.info('Debate created', { debate_id: '123' });
logger.error('Video generation failed', { error, debate_id: '123' });
```

### 10.2 Monitoring & Alerts

```javascript
// Prometheus metrics
const prometheus = require('prom-client');

const debatesCreated = new prometheus.Counter({
  name: 'debates_created_total',
  help: 'Total debates created'
});

const videoGenerationDuration = new prometheus.Histogram({
  name: 'video_generation_duration_seconds',
  help: 'Time to generate a video',
  buckets: [60, 300, 600, 1800, 3600]
});

// Endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

---

## 11. DÉPLOIEMENT

### 11.1 Checklist Pre-Production

- [ ] All env vars configured
- [ ] MySQL database created & migrated
- [ ] n8n workflows imported & tested
- [ ] All APIs credentials validated
- [ ] SSL certificates installed (HTTPS)
- [ ] Backups configured
- [ ] Monitoring & logging active
- [ ] Security audit completed
- [ ] Performance tested under load
- [ ] Disaster recovery plan documented

### 11.2 CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm test
      - run: npm run lint
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - run: docker build -t debate-platform .
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: ssh user@server 'cd /app && git pull && npm install && npm run migrate && pm2 restart app'
```

