# PLAN D'ACTION DÉTAILLÉ - SEMAINE PAR SEMAINE

## PHASE 0: PRÉPARATION (Jour 1 - 2h)

### Jour 1 - Matin (1h)
```
1. Installer dépendances système
   ├─ Node.js 18+ (LTS)
   ├─ MySQL 8.0
   ├─ Redis (optionnel mais recommandé)
   ├─ Git
   └─ Python 3.10+

2. Cloner/créer repo GitHub
   git init ai-debate-platform
   git remote add origin https://github.com/[user]/ai-debate-platform

3. Obtenir clés APIs
   ├─ OpenAI: https://platform.openai.com/api-keys
   ├─ Anthropic: https://console.anthropic.com
   ├─ Perplexity: https://www.perplexity.ai/api
   ├─ Google Cloud: https://console.cloud.google.com
   └─ TikTok Creator: https://developer.tiktok.com
```

### Jour 1 - Après-midi (1h)
```
4. Installer n8n locally
   npm install -g n8n
   n8n start
   # Access: http://localhost:5678

5. Créer MySQL database
   mysql -u root -p
   CREATE DATABASE ai_debate_db DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'debate_user'@'localhost' IDENTIFIED BY 'secure_password_123';
   GRANT ALL PRIVILEGES ON ai_debate_db.* TO 'debate_user'@'localhost';
   FLUSH PRIVILEGES;

6. Setup folders
   mkdir -p uploads/{debates,videos,thumbnails}
   mkdir -p logs
   mkdir -p credentials
   mkdir -p n8n/{workflows,backups}
   mkdir -p local-tools/{scripts,outputs}
```

---

## SEMAINE 1: BACKEND + DATABASE (40h)

### Lundi - Backend Setup (8h)

```
TÂCHE 1: Project Initialization (2h)
├─ npm init
├─ npm install express cors dotenv mysql2 bull redis winston joi
├─ npm install -D nodemon jest @types/node typescript
├─ Créer structure dossiers (src/api, src/db, src/middleware, etc)
└─ git commit "initial backend setup"

TÂCHE 2: Database Connection (2h)
├─ Créer src/db/connection.js
│  └─ Pool MySQL avec gestion reconnection
├─ Créer src/db/schema.sql
│  └─ Tous les CREATE TABLE du cahier des charges
├─ Exécuter migrations: mysql -u debate_user -p ai_debate_db < src/db/schema.sql
├─ Créer src/db/queries.js (helper functions)
└─ Test: console.log(await db.query('SELECT 1'))

TÂCHE 3: Express Server (2h)
├─ Créer src/server.js
├─ Setup middleware (cors, bodyParser, errorHandler, logging)
├─ Routes de base (GET / pour health check)
├─ WebSocket setup (socket.io)
├─ Écouter sur port 5000
└─ Test: curl http://localhost:5000
```

### Mardi - API Endpoints (8h)

```
TÂCHE 4: Debates API (4h)
├─ POST /api/debates (créer débat)
│  └─ Validation input avec Joi
│  └─ Insert in DB
│  └─ Return ID + webhook URL
├─ GET /api/debates (list all)
├─ GET /api/debates/:id (détails)
├─ PUT /api/debates/:id (update status)
└─ Tests avec Postman/curl

TÂCHE 5: Videos API (2h)
├─ GET /api/debates/:id/videos (list videos d'un débat)
├─ POST /api/videos/:id/status (update status)
└─ GET /api/videos/:id/download (streamer vidéo)

TÂCHE 6: Webhooks n8n (2h)
├─ POST /webhooks/n8n/debate-complete
├─ POST /webhooks/n8n/audio-complete
├─ POST /webhooks/n8n/video-complete
└─ POST /webhooks/n8n/publish-complete
```

### Mercredi - Database + Queue (8h)

```
TÂCHE 7: Queue Setup (4h)
├─ Installer Bull + Redis
├─ Créer job queues:
│  ├─ debateQueue (génération)
│  ├─ videoQueue (création vidéo)
│  └─ publishQueue (publication)
├─ Setup job processors
└─ Test: Ajouter job, vérifier dans Redis

TÂCHE 8: N8n Integration Service (2h)
├─ Créer src/services/n8nService.js
├─ Fonction: triggerN8nWorkflow(workflow_id, payload)
├─ Fonction: getN8nStatus(execution_id)
└─ Error handling + retries

TÂCHE 9: Logging Setup (2h)
├─ Configurer Winston
├─ Logs by level: info, warn, error
├─ Separate files: combined.log, error.log
└─ Console logging in development
```

### Jeudi - YouTube Integration (8h)

```
TÂCHE 10: YouTube Service (4h)
├─ Créer src/services/youtubeService.js
├─ Setup Google Auth (Service Account)
├─ Fonction: uploadVideo(videoPath, metadata)
│  └─ File upload resumable
│  └─ Handle progress
│  └─ Return video ID
├─ Fonction: getVideoStats(videoId)
└─ Error handling

TÂCHE 11: TikTok + Instagram (3h)
├─ Créer src/services/tikTokService.js
├─ Créer src/services/instagramService.js
├─ OAuth2 setup for each
├─ Upload functions
└─ Test uploads avec videos de test

TÂCHE 12: Testing (1h)
├─ npm test
├─ Coverage > 80%
└─ git commit "Complete API + Services"
```

### Vendredi - Refinement (8h)

```
TÂCHE 13: Error Handling (2h)
├─ Global error middleware
├─ Validation error responses
├─ API rate limiting
├─ Retry logic for failed operations

TÂCHE 14: Documentation (2h)
├─ API documentation (Swagger/OpenAPI)
├─ README.md avec setup instructions
├─ Database schema documentation
└─ Troubleshooting guide

TÂCHE 15: Performance (2h)
├─ Database indexing optimization
├─ Query performance analysis
├─ Caching strategy (Redis)
└─ Load testing with Apache Bench

TÂCHE 16: Code Review (2h)
├─ Code cleanup
├─ Linting (ESLint)
├─ Format (Prettier)
└─ git commit "Backend complete & tested"
```

**Milestone Semaine 1**: API complète fonctionnelle, peut recevoir webhooks n8n ✅

---

## SEMAINE 2: n8n WORKFLOWS (30h)

### Lundi - Debate Generator (8h)

```
TÂCHE 17: n8n Workflow 1 - Debate Script Generator (8h)
├─ Créer workflow "debate-generator" dans n8n UI
├─ Node 1: Manual Trigger
├─ Node 2: HTTP Request → Perplexity (get trending topic)
├─ Node 3: HTTP Request → OpenAI (generate structure)
├─ Node 4: HTTP Request → OpenAI (position 1 full text)
├─ Node 5: HTTP Request → Anthropic (position 2 full text)
├─ Node 6: HTTP Request → Perplexity (moderation)
├─ Node 7: HTTP Request → Backend webhook (notify)
├─ Export workflow → n8n/workflows/debate-generator.json
└─ TEST: Trigger manually, check backend logs
```

### Mardi - Audio Generator (8h)

```
TÂCHE 18: Kokoro TTS Setup (3h)
├─ pip install kokoro-onnx
├─ Créer local-tools/kokoro_tts.py
│  └─ CLI: python kokoro_tts.py --text "..." --voice "af_bella" --output "..."
├─ Test with: python kokoro_tts.py --text "Hello world" --voice "af_bella" --output test.mp3
└─ Verify audio file exists

TÂCHE 19: n8n Workflow 2 - Audio Generator (5h)
├─ Créer workflow "audio-generator"
├─ Node 1: Webhook trigger (debate ready)
├─ Node 2: Get debate from DB
├─ Node 3-5: Shell execute kokoro (3x speakers)
│  └─ Command: python /path/to/kokoro_tts.py --text "..." --voice "..."
├─ Node 6: Update DB (audio files paths)
├─ Node 7: Webhook to backend
└─ Export → n8n/workflows/audio-generator.json
```

### Mercredi - Video Generator (8h)

```
TÂCHE 20: Google Veo 3 API Setup (2h)
├─ Register for Google Veo 3 access
├─ Get API credentials
├─ Créer src/services/googleVeoService.js
│  └─ function: generateVideo(prompt, duration, outputPath)
└─ Test with sample prompt

TÂCHE 21: n8n Workflow 3 - Video Generator (6h)
├─ Créer workflow "video-generator"
├─ Node 1: Webhook trigger (audio ready)
├─ Node 2: Get audio + scripts from DB
├─ Node 3: Prepare prompt for Google Veo 3
│  └─ Include topic, duration, visual descriptions
├─ Node 4: HTTP Request → Google Veo 3 API
│  └─ Wait for async completion (polling)
├─ Node 5: Download video to uploads/
├─ Node 6: Generate thumbnail (ffmpeg)
├─ Node 7: Update DB
├─ Node 8: Webhook to backend
└─ Export → n8n/workflows/video-generator.json
```

### Jeudi - Video Editor (6h)

```
TÂCHE 22: DaVinci Resolve Setup (2h)
├─ Download DaVinci Resolve (free version)
├─ Install locally
├─ Create Lua script: local-tools/davinci_edit.lua
│  └─ Auto-imports video, generates captions, exports segments
└─ Test with sample video

TÂCHE 23: n8n Workflow 4 - Video Editor (4h)
├─ Créer workflow "video-editor"
├─ Node 1: Webhook trigger (video ready)
├─ Node 2-4: Shell execute (DaVinci export x3 formats)
│  ├─ Format 1: YouTube Shorts 1080p
│  ├─ Format 2-4: TikTok/Instagram Reels 720p x3 segments
│  └─ Command: /opt/davinci-resolve/bin/resolve --nogui -script davinci_edit.lua [id]
├─ Node 5: Generate thumbnails (ffmpeg)
├─ Node 6: Update DB with video paths
├─ Node 7: Webhook to backend
└─ Export → n8n/workflows/video-editor.json
```

### Vendredi - Publisher (8h)

```
TÂCHE 24: n8n Workflow 5 - Publisher (8h)
├─ Créer workflow "publisher"
├─ Node 1: Webhook or Scheduled trigger
├─ Node 2: Get video + metadata from DB
├─ Node 3: HTTP Request → YouTube API (upload long)
├─ Node 4: HTTP Request → TikTok API (upload short x3)
├─ Node 5: HTTP Request → Instagram API (upload short x3)
├─ Node 6: Save publication records in DB
├─ Node 7: Send Telegram notification
├─ Node 8: Update analytics cache
├─ Export → n8n/workflows/publisher.json

TEST FULL PIPELINE:
├─ Manual trigger debate-generator
├─ Wait for audio-generator webhook
├─ Wait for video-generator webhook  
├─ Wait for video-editor webhook
├─ Wait for publisher webhook
├─ Check backend logs
└─ Verify videos uploaded to YouTube/TikTok
```

**Milestone Semaine 2**: n8n pipelines complètement fonctionnels, e2e test successful ✅

---

## SEMAINE 3: FRONTEND (40h)

### Lundi - Setup + Components (8h)

```
TÂCHE 25: Frontend Initialization (3h)
├─ npm create vite@latest frontend -- --template react-ts
├─ cd frontend && npm install
├─ npm install axios zustand tailwindcss
├─ Setup Tailwind CSS
├─ Create folder structure:
│  ├─ src/components/
│  ├─ src/pages/
│  ├─ src/hooks/
│  ├─ src/services/api.ts
│  └─ src/stores/
└─ git commit "Frontend setup"

TÂCHE 26: API Client Service (2h)
├─ Créer src/services/api.ts
├─ Setup Axios instance with base URL
├─ Error handling + interceptors
├─ CRUD functions: createDebate, getDebate, etc

TÂCHE 27: Dashboard Component (3h)
├─ Créer src/pages/Dashboard.tsx
├─ Display stats (total debates, videos, views)
├─ Recent debates list
├─ Quick action buttons
├─ Connect to backend API
└─ Test with mock data
```

### Mardi - Debate Creator (8h)

```
TÂCHE 28: Create Debate Form (4h)
├─ Créer src/components/CreateDebateForm.tsx
├─ Form fields:
│  ├─ Topic (text input)
│  ├─ Position 1 (textarea)
│  ├─ Position 2 (textarea)
│  ├─ Duration target (slider 5-30 min)
│  ├─ Moderation style (dropdown)
│  └─ Schedule (datetime picker)
├─ Form validation
├─ Submit to backend POST /api/debates
└─ Show success/error messages

TÂCHE 29: Progress Tracker (4h)
├─ Créer src/components/ProgressTracker.tsx
├─ WebSocket connection to backend
│  └─ real-time status updates
├─ Progress bar per stage
├─ Timeline visualization
├─ Display logs from n8n
└─ Handle completion
```

### Mercredi - Video Manager (8h)

```
TÂCHE 30: Video List Component (3h)
├─ Créer src/components/VideoList.tsx
├─ Fetch videos from backend
├─ Display in table/grid:
│  ├─ Debate title
│  ├─ Duration
│  ├─ Format (YouTube/Short)
│  ├─ Status
│  └─ Actions (preview, download, delete)
├─ Pagination
└─ Sorting/filtering

TÂCHE 31: Video Preview (3h)
├─ Créer src/components/VideoPreview.tsx
├─ HTML5 video player
├─ Show metadata
├─ Download button (fetch from backend)
├─ Delete with confirmation
└─ Embed in modal

TÂCHE 32: Upload Handler (2h)
├─ Allow manual video uploads (for testing)
├─ Drag & drop support
├─ Progress indicator
└─ Backend integration
```

### Jeudi - Publisher + Analytics (8h)

```
TÂCHE 33: Publish Manager (4h)
├─ Créer src/components/PublishManager.tsx
├─ Select video to publish
├─ Checkboxes for platforms:
│  ├─ YouTube Shorts
│  ├─ TikTok
│  └─ Instagram Reels
├─ Title + description editor
├─ Schedule or publish immediately
├─ Submit to backend POST /api/videos/publish
└─ Show results (links to published videos)

TÂCHE 34: Analytics Dashboard (4h)
├─ Créer src/components/Analytics.tsx
├─ Fetch stats from backend
├─ Charts:
│  ├─ Total views over time
│  ├─ Engagement by platform
│  ├─ Top performing debates
│  └─ Subscriber growth
├─ Update every 5 minutes (polling)
└─ Export data button
```

### Vendredi - Refinement + Testing (8h)

```
TÂCHE 35: UI Polish (2h)
├─ Responsive design (mobile/tablet/desktop)
├─ Dark mode toggle
├─ Improve color scheme
├─ Add icons (Font Awesome or similar)
└─ Better button states (hover, active, disabled)

TÂCHE 36: Settings Page (2h)
├─ Créer src/pages/Settings.tsx
├─ API keys management (hide/show toggle)
├─ Platform credentials (YouTube, TikTok, Instagram)
├─ Notification preferences
├─ Save to backend

TÂCHE 37: Testing (2h)
├─ Component testing with Jest/React Testing Library
├─ Integration tests (form submission)
├─ E2E tests if applicable
└─ Coverage > 60%

TÂCHE 38: Build + Deploy (2h)
├─ npm run build
├─ Optimize bundle size
├─ Test production build locally
├─ Deploy to local server (serve static from express)
└─ git commit "Frontend complete"
```

**Milestone Semaine 3**: Frontend complète et intégrée au backend ✅

---

## SEMAINE 4: TESTING + OPTIMIZATION (20h)

### Lundi - End-to-End Testing (6h)

```
TÂCHE 39: Full Pipeline Test (3h)
├─ Create test debate via frontend
├─ Monitor progress in real-time
├─ Check all videos generated
├─ Verify files in uploads/
├─ Check database records

TÂCHE 40: Publication Testing (3h)
├─ Publish video to YouTube (test account)
├─ Publish to TikTok (test account)
├─ Publish to Instagram (test account)
├─ Verify links work
├─ Check metadata is correct
```

### Mardi - Performance Optimization (6h)

```
TÂCHE 41: Database Optimization (2h)
├─ Analyze query performance
├─ Add missing indexes
├─ Test load with 1000+ records
├─ Optimize slow queries

TÂCHE 42: API Caching (2h)
├─ Implement Redis caching
├─ Cache debate status (5 min TTL)
├─ Cache analytics (1 hour TTL)
├─ Test cache invalidation

TÂCHE 43: Frontend Performance (2h)
├─ Lazy load components
├─ Code splitting
├─ Optimize images
├─ Check Lighthouse score > 80
```

### Mercredi - Security & Hardening (4h)

```
TÂCHE 44: Security Review (2h)
├─ Check for SQL injection vulnerabilities
├─ Validate all inputs
├─ Use prepared statements
├─ Sanitize outputs

TÂCHE 45: API Keys Management (2h)
├─ Ensure no keys in git history
├─ Use environment variables only
├─ Add API key rotation docs
├─ Test with real API keys (rotate after)
```

### Jeudi - Documentation (2h)

```
TÂCHE 46: Write Deployment Guide
├─ Installation steps
├─ Configuration requirements
├─ Troubleshooting section
├─ Backup/restore procedures
```

### Vendredi - Launch Prep (2h)

```
TÂCHE 47: Final Checklist
├─ All endpoints tested
├─ All workflows tested
├─ UI fully functional
├─ Error messages clear
├─ Logging working
├─ Monitoring in place
├─ Ready for production!
```

---

## TIMELINE RÉSUMÉ

```
Phase 0: Préparation              2h     Total: 2h
Semaine 1: Backend                40h    Total: 42h
Semaine 2: n8n Workflows          30h    Total: 72h
Semaine 3: Frontend                40h    Total: 112h
Semaine 4: Testing + Optimization 20h    Total: 132h
────────────────────────────────────────────────────
EFFORT TOTAL:                     132h (3.3 semaines)
Avec équipe 2 devs:               66h (1.5-2 semaines)
```

**Timeline réaliste (solo): 3-4 semaines**

---

## CHECKLIST HEBDOMADAIRE

### Semaine 1
- [ ] MySQL database créée et connectée
- [ ] Tous les endpoints API testés
- [ ] Webhooks reçoivent les payloads n8n
- [ ] YouTube/TikTok/Instagram auth configurés
- [ ] n8n peut se connecter au backend

### Semaine 2
- [ ] Kokoro TTS génère audio naturelle
- [ ] Workflow debate-generator fonctionne end-to-end
- [ ] Workflow audio-generator génère 3 voix
- [ ] Workflow video-generator crée vidéos 4K
- [ ] Workflow video-editor segmente en shorts
- [ ] Workflow publisher upload sur 3 plateformes

### Semaine 3
- [ ] Dashboard affiche stats corrects
- [ ] Formulaire crée débats en DB
- [ ] Progress tracker suit génération en temps réel
- [ ] Liste vidéos affiche tous les fichiers
- [ ] Publish manager permet sélection plateformes
- [ ] Analytics montre vues/likes/engagement

### Semaine 4
- [ ] Pipeline complet fonctionne sans erreurs
- [ ] 5+ débats test publiés avec succès
- [ ] Performance acceptable (<3s API response)
- [ ] Aucune fuite de données sensibles
- [ ] Documentation complète
- [ ] Prêt pour production

