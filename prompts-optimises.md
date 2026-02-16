# PROMPTS OPTIMISÉS - POUR GEMINI 3 PRO ET CHATGPT CODEX

## 🎯 PROMPT 1: DÉBAT GENERATOR (Script Generation)

### For Gemini 3 Pro (Texte + Format)

```
Tu es un expert en débats structurés et en communication persuasive. 

TÂCHE: Générer un débat professionnel et équilibré entre deux IA sur le sujet suivant: "{TOPIC}"

INSTRUCTIONS:
1. Structure le débat exactement ainsi:
   - INTRODUCTION (Perplexity): 2-3 phrases de contexte
   - POSITION 1 (ChatGPT): Arguments pragmatiques et optimistes (3-4 paragraphes)
   - POSITION 2 (Claude): Arguments nuancés et critiques (3-4 paragraphes)
   - REBOND: Chaque position répond aux objections (2 paragraphes chacun)
   - CONCLUSION: Consensus sur les vrais enjeux (2 paragraphes)

2. Ton et style:
   - Professionnel mais accessible
   - Pas de langage trop technique
   - Riche en exemples concrets
   - Équilibré (aucune position n'écrase l'autre)

3. Format de réponse JSON:
{
  "title": "[Titre accrocheur du débat]",
  "introduction": "[Texte introduction]",
  "position1": {
    "title": "[Titre position ChatGPT]",
    "arguments": "[Texte complet des arguments]"
  },
  "position2": {
    "title": "[Titre position Claude]",
    "arguments": "[Texte complet des arguments]"
  },
  "rebound1": "[Réponse ChatGPT aux objections]",
  "rebound2": "[Réponse Claude aux objections]",
  "conclusion": "[Conclusion équilibrée]",
  "duration_estimate_minutes": [nombre]
}

4. Recommandations:
   - Durée cible: 10-15 minutes (calculée à ~100 mots/minute)
   - Utilise des tirets/listes pour structure claire
   - Chaque section doit être lue facilement à haute voix
   - Ajoute des pauses naturelles (points de transition)

SUJET: {TOPIC}
DURÉE CIBLE: {DURATION} minutes

Réponds UNIQUEMENT en JSON valide, sans markdown, sans blabla.
```

### For ChatGPT Codex (Version Codex/API)

```
You are a debate structure expert. Generate a structured debate script.

TOPIC: {TOPIC}
DURATION_TARGET: {DURATION} minutes
FORMAT: JSON only

Required JSON structure:
{
  "metadata": {
    "topic": string,
    "generated_at": ISO8601_timestamp,
    "estimated_duration_minutes": number,
    "word_count": number
  },
  "introduction": {
    "speaker": "perplexity",
    "text": string,
    "reading_time_seconds": number
  },
  "position1": {
    "speaker": "chatgpt",
    "title": string,
    "text": string,
    "key_points": string[],
    "reading_time_seconds": number
  },
  "position2": {
    "speaker": "claude",
    "title": string,
    "text": string,
    "key_points": string[],
    "reading_time_seconds": number
  },
  "rebuttal1": {
    "speaker": "chatgpt",
    "text": string,
    "addresses_objections": string[]
  },
  "rebuttal2": {
    "speaker": "claude",
    "text": string,
    "addresses_objections": string[]
  },
  "conclusion": {
    "speaker": "perplexity",
    "text": string,
    "common_ground": string[]
  }
}

Guidelines:
- Position 1 (ChatGPT): Optimistic, pragmatic, forward-looking
- Position 2 (Claude): Nuanced, critical, comprehensive risk analysis
- Each section must be naturally readable aloud
- Include transition phrases
- Balance: Each position should feel equally strong
- Total word count: {DURATION} * 100 words approximately

Return ONLY valid JSON, no markdown, no extra text.
```

---

## 🎤 PROMPT 2: VOIX SYNTHESIS (Script to Voice Config)

### For Voice Generation Service

```
Vous êtes un expert en synthèse vocale et en prosody.

TÂCHE: Générer une configuration de voix naturelle pour le texte suivant.

TEXTE: "{SCRIPT_TEXT}"

Retournez un JSON avec:
{
  "voice_config": {
    "speaker": "chatgpt|claude|perplexity",
    "model": "kokoro",  // ou autre TTS model
    "voice_id": "af_bella|af_alice|af_jessica",  // ou autre
    "parameters": {
      "speed": 0.95,  // 0.5-1.5, avec pauses naturelles
      "pitch": 1.0,   // 0.8-1.2
      "energy": 1.0,  // 0.8-1.2, variation naturelle
      "speaking_style": "professional|conversational",
      "emotions": ["confident", "thoughtful"],  // Si applicable
      "pauses": [
        {
          "after_word": "word_number_here",
          "duration_ms": 500-1000
        }
      ]
    },
    "prosody_notes": "[Notes sur intonation, emphase, etc]"
  },
  "segments": [
    {
      "segment_number": 1,
      "text": "[Segment du texte]",
      "duration_estimate_seconds": number,
      "pause_after_ms": number
    }
  ]
}

Détails import:
- ChatGPT voice: Confiante, optimiste, tempo rapide (0.95-1.0)
- Claude voice: Réfléchie, nuancée, tempo mesuré (0.85-0.95)
- Perplexity voice: Modératrice, claire, tempo normal (0.9-1.0)
- Ajoute des pauses naturelles après:
  - Phrases complètes (500ms)
  - Changement de section (1000ms)
  - Questions rhétoriques (800ms)

TEXTE À TRAITER: "{SCRIPT_TEXT}"

Retournez UNIQUEMENT le JSON valide.
```

---

## 🎥 PROMPT 3: GOOGLE VEO 3 - VIDEO GENERATION

### For Video Generation

```
Tu es un prompt expert pour la génération vidéo IA.

TÂCHE: Générer un prompt pour créer une vidéo de débat professionnel.

CONTEXTE:
- Topic: {TOPIC}
- Durée cible: {DURATION} minutes
- Format: Debate entre deux experts IA
- Style: Professionnel, studio setting
- Quality: 4K, cinematic

Génère un prompt détaillé pour Google Veo 3:

PROMPT POUR GOOGLE VEO 3:
"""
Create a professional debate video for YouTube Shorts. 

Settings:
- Modern professional studio with sleek design
- Two expert panelists sitting across a desk
- Professional lighting: key light, fill light, subtle background
- High-quality 4K video, 16:9 aspect ratio
- Duration: {DURATION} minutes

Visual style:
- Cinematic color grading with warm tones
- Soft focus background with subtle depth
- Professional graphics/titles appear for key points
- Camera occasionally zooms for emphasis
- Smooth, natural camera movements
- Dynamic but professional editing

Speakers appearance:
- Expert 1 (ChatGPT character): Confident body language, gestures while speaking
- Expert 2 (Claude character): Thoughtful posture, references notes, nodding
- Both wear business casual attire
- Genuine, natural expressions and reactions

Content flow:
- Opening titles with topic name
- Introduction of speakers and topic
- Balanced dialogue with both speakers having equal airtime
- Visual cuts between speakers
- Occasional insert graphics or B-roll for examples mentioned
- Concluding summary
- End cards with social media handles

Mood: Intellectually engaging, respectful disagreement, professional
Tone: Serious but approachable, educational

Quality focus: Sharp dialogue audio, clear visuals, no artifacts
"""

Retourne UNIQUEMENT le prompt verbatim, sans modification.

TOPIC: {TOPIC}
DURATION: {DURATION}
"""

### Exemple complet

```
TOPIC: "L'IA remplacera-t-elle les développeurs?"
DURATION: 12 minutes

PROMPT RESULTAT:
"""
Create a professional debate video for YouTube Shorts. 

Settings:
- Modern professional studio with sleek glass and wood design
- Two expert panelists sitting at a curved desk facing each other
- Three-point lighting: key light, fill light, rim light
- 4K video, 16:9 aspect ratio
- Duration: 12 minutes

Visual style:
- Cinematic color grading with cool professional tones
- Blurred background shows bookshelves and tech equipment
- Key points appear as animated overlays
- Camera gently pushes in during important statements
- Smooth transitions between speakers
- Lower thirds with speaker names and expertise

Speakers:
- Speaker 1 (ChatGPT): Optimistic tech expert, gestures dynamically, forward-leaning posture
- Speaker 2 (Claude): Thoughtful analyst, hand on chin while thinking, references documents
- Both in navy blazers, professional but relaxed
- Natural facial expressions, genuine reactions

Pacing:
- 30 second intro with animated titles
- 3 minutes per initial position
- 2.5 minutes per rebuttal
- 2 minutes for conclusion and final thoughts
- Graphical transitions between segments

Quality: Crisp audio, vibrant colors, no video artifacts, professional grade
"""
```

---

## 📊 PROMPT 4: DAVINCI RESOLVE - VIDEO EDITING

### For Automated DaVinci Resolve Workflow

```
Tu génères un script Lua pour DaVinci Resolve qui automatise le montage.

TÂCHE: Créer un script Lua complet pour:
1. Import vidéo brute
2. Auto-captions
3. Segmentation en 3 shorts (2 min chacun)
4. Color grading cinématique
5. Export en multiple formats

Génère un script Lua complet:

\`\`\`lua
-- AI Debate Video Editor for DaVinci Resolve
-- Auto-edits and segments debate videos

local function main()
  -- Initialize
  local project = GetCurrentProject()
  local timeline = GetCurrentTimeline()
  
  -- Configuration
  local INPUT_VIDEO = "{INPUT_PATH}"
  local OUTPUT_DIR = "{OUTPUT_DIR}"
  local DEBATE_ID = "{DEBATE_ID}"
  
  -- 1. Import video
  print("Importing video: " .. INPUT_VIDEO)
  local mediaPool = project:GetMediaPool()
  local clip = mediaPool:ImportMedia(INPUT_VIDEO)
  
  -- 2. Add to timeline
  timeline:InsertClip(clip)
  
  -- 3. Generate captions (speech-to-text)
  print("Generating captions...")
  local captions = timeline:GenerateCaptions({
    language = "fr-FR",
    model = "medium"
  })
  
  -- 4. Apply color grading (cinematic preset)
  print("Applying color grading...")
  local fusionComp = timeline:GetFusionCompByIndex(1)
  if fusionComp then
    fusionComp:SetLUT("cinematic_warm")
    fusionComp:SetSaturation(1.1)
    fusionComp:SetContrast(1.05)
  end
  
  -- 5. Export full version (YouTube)
  print("Exporting YouTube version...")
  local youtubeSettings = {
    codec = "h.264",
    bitrate = "15000k",
    resolution = "1920x1080",
    frame_rate = "30",
    output_path = OUTPUT_DIR .. "youtube_long_" .. DEBATE_ID .. ".mp4"
  }
  timeline:Export(youtubeSettings)
  
  -- 6. Segment for shorts (2 minutes each)
  print("Creating shorts segments...")
  local totalFrames = timeline:GetDuration()
  local shortDuration = 120 * 30  -- 120 seconds at 30fps
  
  for i = 1, 3 do
    local startFrame = (i - 1) * shortDuration
    local endFrame = math.min(startFrame + shortDuration, totalFrames)
    
    -- Create new timeline for segment
    local segmentTimeline = project:CreateTimeline("short_" .. i)
    segmentTimeline:InsertClip(clip, startFrame, endFrame)
    
    -- Resize for vertical format (720x1280)
    print("Resizing for TikTok format...")
    segmentTimeline:SetProperty("width", 720)
    segmentTimeline:SetProperty("height", 1280)
    
    -- Export
    local shortSettings = {
      codec = "h.264",
      bitrate = "8000k",
      resolution = "720x1280",
      frame_rate = "30",
      output_path = OUTPUT_DIR .. "short_" .. i .. "_" .. DEBATE_ID .. ".mp4"
    }
    segmentTimeline:Export(shortSettings)
  end
  
  -- 7. Generate thumbnails
  print("Generating thumbnails...")
  local thumbFrame = math.floor(totalFrames / 3)
  timeline:SetPlayheadPosition(thumbFrame)
  timeline:ExportFrame({
    output_path = OUTPUT_DIR .. "thumbnail_" .. DEBATE_ID .. ".jpg",
    width = 1280,
    height = 720,
    quality = 95
  })
  
  print("✅ Editing complete!")
  return true
end

-- Execute
main()
\`\`\`

Points critiques:
- Remplacer {INPUT_PATH}, {OUTPUT_DIR}, {DEBATE_ID}
- Adapter résolutions/bitrates selon tes besoins
- Ajouter error handling
- Tester avec une vidéo sample
"""

---

## 🔗 PROMPT 5: YouTube API - UPLOAD AUTOMATION

### For YouTube Video Upload

```
Tu génères du code Node.js pour uploader automatiquement sur YouTube.

TÂCHE: Code complet pour upload vidéo YouTube avec:
- Service Account auth
- Resumable upload (gère interruptions)
- Metadata (titre, description, tags, catégorie)
- Erreur handling + retries

Génère le code JavaScript complet:

\`\`\`javascript
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { googleAuth } = require('google-auth-library');

const youtube = google.youtube({
  version: 'v3',
  auth: new googleAuth.GoogleAuth({
    keyFile: process.env.YOUTUBE_KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/youtube.upload']
  })
});

async function uploadToYouTube(videoConfig) {
  const {
    videoPath,
    title,
    description,
    tags,
    categoryId = '28',  // Science & Technology
    privacyStatus = 'public',
    maxRetries = 3
  } = videoConfig;

  const fileSize = fs.statSync(videoPath).size;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(\`Uploading: \${title}\`);

      const request = youtube.videos.insert(
        {
          part: 'snippet,processingDetails,status',
          requestBody: {
            snippet: {
              title,
              description,
              tags,
              categoryId,
              defaultLanguage: 'fr',
              localized: {
                title,
                description
              }
            },
            status: {
              privacyStatus,
              selfDeclaredMadeForKids: false
            }
          },
          media: {
            body: fs.createReadStream(videoPath)
          }
        },
        {
          onUploadProgress: (evt) => {
            const progress = Math.round((evt.bytesProcessed / fileSize) * 100);
            console.log(\`Upload progress: \${progress}%\`);
          }
        }
      );

      const response = await request;
      
      console.log(\`✅ Video uploaded: \${response.data.id}\`);
      console.log(\`Watch: https://www.youtube.com/watch?v=\${response.data.id}\`);
      
      return {
        success: true,
        videoId: response.data.id,
        url: \`https://www.youtube.com/watch?v=\${response.data.id}\`
      };

    } catch (error) {
      retries++;
      console.error(\`Upload failed (attempt \${retries}/\${maxRetries}): \${error.message}\`);
      
      if (retries < maxRetries) {
        const waitTime = Math.pow(2, retries) * 1000;  // Exponential backoff
        console.log(\`Retrying in \${waitTime}ms...\`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw new Error(\`Upload failed after \${maxRetries} attempts\`);
      }
    }
  }
}

// Utilisation
const videoConfig = {
  videoPath: '/uploads/debates/123/youtube_long.mp4',
  title: 'ChatGPT vs Claude: {TOPIC}',
  description: 'Un débat fascinant entre deux IA sur {TOPIC}...\\n\\nSuscrivez-vous pour plus!',
  tags: ['ai', 'debate', 'chatgpt', 'claude', 'perplexity'],
  categoryId: '28'
};

uploadToYouTube(videoConfig)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Failed:', error));
\`\`\`

Notes:
- Remplacer {TOPIC} par le sujet réel
- Adapter description avec liens réseaux sociaux
- Gérer les erreurs d'authentification
- Logguer tous les uploads pour suivi
"""

---

## 🌐 PROMPT 6: TIKTOK/INSTAGRAM API - UPLOAD

### For TikTok Upload

```
Tu génères le code pour uploader sur TikTok via Creator API.

TÂCHE: Upload sécurisé avec:
- Chunked upload (5MB chunks)
- OAuth2 authentication
- Retry logic
- Metadata handling

Code JavaScript:

\`\`\`javascript
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TikTokUploader {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://open.tiktok.com/v1';
    this.headers = {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    };
  }

  async uploadVideo(videoConfig) {
    const {
      videoPath,
      title,
      description,
      hashtags = [],
      disableComment = false,
      disableDuet = false,
      disableStitch = false
    } = videoConfig;

    try {
      // Step 1: Initialize upload
      console.log('Initializing TikTok upload...');
      const fileSize = fs.statSync(videoPath).size;
      
      const initResponse = await axios.post(
        \`\${this.baseURL}/post/publish/video/init\`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: fileSize,
            chunk_size: 5242880  // 5MB
          },
          post_info: {
            title: title.substring(0, 150),
            description: description.substring(0, 2200),
            privacy_level: 'PUBLIC_TO_ANYONE',
            comment_disabled: disableComment,
            duet_disabled: disableDuet,
            stitch_disabled: disableStitch
          }
        },
        { headers: this.headers }
      );

      const publishId = initResponse.data.data.publish_id;
      console.log('Upload session created:', publishId);

      // Step 2: Upload video chunks
      console.log('Uploading video chunks...');
      const chunkSize = 5242880;  // 5MB
      let uploadedBytes = 0;

      const fileStream = fs.createReadStream(videoPath, { 
        highWaterMark: chunkSize 
      });

      let chunkIndex = 0;
      
      for await (const chunk of fileStream) {
        chunkIndex++;
        const totalChunks = Math.ceil(fileSize / chunkSize);
        
        console.log(\`Uploading chunk \${chunkIndex}/\${totalChunks}...\`);

        await axios.post(
          \`\${this.baseURL}/post/publish/video/chunk/upload\`,
          {
            publish_id: publishId,
            chunk_index: chunkIndex - 1,
            total_chunks: totalChunks,
            chunk_size: chunk.length,
            bytes: chunk.toString('base64')
          },
          { headers: this.headers }
        );

        uploadedBytes += chunk.length;
        const progress = Math.round((uploadedBytes / fileSize) * 100);
        console.log(\`Progress: \${progress}%\`);
      }

      // Step 3: Complete upload
      console.log('Finalizing upload...');
      const completeResponse = await axios.post(
        \`\${this.baseURL}/post/publish/video/status/fetch\`,
        { publish_id: publishId },
        { headers: this.headers }
      );

      const videoId = completeResponse.data.data.video_id;
      const videoUrl = \`https://www.tiktok.com/@myprofile/video/\${videoId}\`;

      console.log('✅ Video uploaded to TikTok!');
      console.log('URL:', videoUrl);

      return {
        success: true,
        videoId,
        url: videoUrl,
        publishId
      };

    } catch (error) {
      console.error('TikTok upload failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Utilisation
const uploader = new TikTokUploader(process.env.TIKTOK_ACCESS_TOKEN);

const config = {
  videoPath: '/uploads/debates/123/short_1.mp4',
  title: 'ChatGPT vs Claude: {TOPIC} 🤖',
  description: 'Débat fascinant! Qui a raison? #AI #DebatIA #ChatGPT #Claude',
  hashtags: ['#AI', '#Debate', '#ChatGPT', '#Claude']
};

uploader.uploadVideo(config)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Failed:', error));
\`\`\`

Points clés:
- Gérer les interruptions de upload
- Chunked upload pour fichiers larges
- Validation des limites TikTok (2200 chars description)
- Exponential backoff pour retries
"""

---

## 💡 UTILISATION DES PROMPTS

### Option A: Direct ChatGPT/Claude
```bash
# Copier-coller le prompt dans ChatGPT/Claude
# Remplacer les placeholders {TOPIC}, {DURATION}, etc
# Obtenir le résultat directement utilisable
```

### Option B: Intégration dans n8n
```json
{
  "type": "http_request",
  "url": "https://api.openai.com/v1/chat/completions",
  "method": "POST",
  "body": {
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "PROMPT_1_COMPLET"
      }
    ]
  }
}
```

### Option C: API directe (Node.js)
```javascript
const { Configuration, OpenAIApi } = require("openai");

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

const response = await openai.createChatCompletion({
  model: "gpt-4",
  messages: [{
    role: "user",
    content: "PROMPT_1"
  }]
});

console.log(response.data.choices[0].message.content);
```

---

## 🔄 FLUX COMPLET DES PROMPTS

```
1. PROMPT 1 (Débat Generator)
   Input: Topic + Duration
   Output: Script JSON
   ↓
2. PROMPT 2 (Voice Configuration)
   Input: Script JSON
   Output: Voice config + segments
   ↓
3. [Kokoro TTS Local Execution]
   Input: Voice config
   Output: 3x MP3 files
   ↓
4. PROMPT 3 (Video Generation)
   Input: Topic + Audio info
   Output: Video prompt
   ↓
5. [Google Veo 3 API Call]
   Input: Video prompt
   Output: Raw video 4K
   ↓
6. PROMPT 4 (DaVinci Script)
   Input: Video path
   Output: Lua script
   ↓
7. [DaVinci Resolve Execution]
   Input: Lua script
   Output: 4x videos (1 long + 3 shorts)
   ↓
8. PROMPT 5 + 6 (Upload Code)
   Input: Video files + metadata
   Output: Published on YouTube/TikTok/Instagram
```

