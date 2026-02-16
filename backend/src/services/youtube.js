const { google } = require('googleapis');

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth env: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN');
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

async function uploadVideo(filePath, { title, description, tags = [], privacyStatus = 'private' }) {
  const auth = getOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth });
  const fs = require('fs');

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: { title, description, tags },
      status: { privacyStatus }
    },
    media: { body: fs.createReadStream(filePath) }
  });
  const id = res.data?.id;
  return { id, url: id ? `https://www.youtube.com/watch?v=${id}` : null };
}

module.exports = { uploadVideo };
