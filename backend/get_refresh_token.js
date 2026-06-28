const { google } = require('googleapis');
const http = require('http');
const url = require('url');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  'http://localhost:3000/oauth2callback'
);

const scopes = ['https://www.googleapis.com/auth/drive'];

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    const parsedUrl = url.parse(req.url, true);
    const code = parsedUrl.query.code;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Success! You can close this tab now and check the terminal.');
    
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('\n==================================================');
      console.log('COPY THIS REFRESH TOKEN:');
      console.log(tokens.refresh_token);
      console.log('==================================================\n');
      process.exit(0);
    } catch (err) {
      console.error('Error exchanging code:', err.message);
      process.exit(1);
    }
  }
});

server.listen(3000, () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  console.log('\n==================================================');
  console.log('1. First, add "http://localhost:3000/oauth2callback" to your Google Console "Authorized redirect URIs".');
  console.log('2. Then, copy and open this URL in your browser to sign in:');
  console.log(authUrl);
  console.log('==================================================\n');
});
