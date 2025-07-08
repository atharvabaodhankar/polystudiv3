require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadFile(filePath, fileName, mimeType) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    });
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error.message);
    throw error;
  }
}

async function setFilePublic(fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });
    return result.data;
  } catch (error) {
    console.error('Error setting file public:', error.message);
    throw error;
  }
}

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const fileId = await uploadFile(req.file.path, req.file.originalname, req.file.mimetype);
    if (!fileId) {
      return res.status(500).json({ error: 'Failed to upload file to Google Drive.' });
    }

    const publicUrl = await setFilePublic(fileId);
    if (!publicUrl) {
      return res.status(500).json({ error: 'Failed to set file public.' });
    }

    // Clean up uploaded file from server
    fs.unlink(req.file.path, () => {});

    res.json(publicUrl);
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 50MB limit.' });
    }
    res.status(500).json({ error: 'Internal server error during file upload.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
}); 