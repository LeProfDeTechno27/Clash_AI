## 0.1.0 - 2026-01-28

### Fixed
- Frontend: removed UTF-8 BOM in rontend/package.json and 	sconfig.json to fix Vite startup.
- Frontend: repaired src/App.tsx (WS URL, API routes, progress bar, publish/download actions).
- Backend: replaced problematic LIMIT ? with sanitized integer in debates list to resolve MySQL ER_WRONG_ARGUMENTS.
- Worker: corrected service import paths; job processor now starts.

### Changed
- docker-compose: added 
8n-webhook service and pointed API/Worker to it via N8N_BASE_URL.
- Scripts: improved n8n import/check scripts to support Public API and legacy /rest, plus execution-policy bypass hints.
- Webhook verification: dev mode accepts missing header when WEBHOOK_SECRET=changeme.

### Added
- n8n: imported and published workflows (Debate Pipeline, audio/video/publisher) via container CLI; fixed UTF-8 BOM in JSONs.

---# Changelog

## [0.1.0] - 2026-01-27
### Added
- Dockerized stack: api, worker, db (MySQL 8), redis, n8n, tts, web (Vite), web-prod (Nginx).
- Backend API (Express) avec endpoints débats/vidéos/analytics, webhooks n8n sécurisés.
- Worker Bull (queues debates/publish) et intégration n8n (webhook `debate-start`).
- Outils de génération locale (ffmpeg): TTS batch, génération vidéo long + segmentation shorts.
- Publication YouTube (OAuth2 refresh token) + simulations TikTok/Instagram.
- Observabilité: `/health`, `/metrics` (Prometheus), histogramme `http_request_duration_seconds`.
- Sécurité & perf: `helmet`, rate-limit, compression, CORS configurable, `x-request-id`.
- Frontend React/Vite: création débat, liste/détails, téléchargement, publication, temps réel (Socket.IO), Dashboard, filtres & progression.
- Workflows n8n JSON (pipeline, audio/video/editor/publisher) + scripts d'import.
- Tests E2E (outils et avec n8n) + checklist PowerShell.

### Changed
- Cache Redis pour statut débats (300s) et analytics (3600s).
- Dockerfile API: ajout ffmpeg et police ttf.

### Security
- Webhooks protégés par `x-webhook-secret` (+ option signature HMAC côté backend).

