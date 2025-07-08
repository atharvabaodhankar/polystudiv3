require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Allow both local dev and production frontend
const prodOrigin = process.env.CORS_ORIGIN;
let allowedOrigins;
if (prodOrigin) {
  allowedOrigins = [prodOrigin, 'http://localhost:5173'];
} else {
  allowedOrigins = '*';
}

app.use(cors({
  origin: allowedOrigins,
}));

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

// Helper: Find or create a folder by name under a parent
async function getOrCreateFolder(name, parentId = null) {
  // Search for folder
  const q = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    parentId ? `'${parentId}' in parents` : "'root' in parents"
  ].join(' and ');
  const res = await drive.files.list({
    q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }
  // Create folder
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined,
  };
  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });
  return folder.data.id;
}

async function uploadFileToFolder(filePath, fileName, mimeType, classCode, type) {
  // Find or create class folder
  const classFolderId = await getOrCreateFolder(classCode);
  // Find or create type subfolder
  const typeFolderId = await getOrCreateFolder(type, classFolderId);
  // Upload file to type subfolder
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: mimeType,
      parents: [typeFolderId],
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });
  return response.data.id;
}

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
    // Get title, class_code, and type from form data
    let fileName = req.file.originalname;
    if (req.body && req.body.title) {
      const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '';
      fileName = req.body.title + ext;
    }
    const classCode = req.body.class_code;
    const type = req.body.type;
    let fileId;
    if (classCode && type) {
      fileId = await uploadFileToFolder(req.file.path, fileName, req.file.mimetype, classCode, type);
    } else {
      fileId = await uploadFile(req.file.path, fileName, req.file.mimetype);
    }
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