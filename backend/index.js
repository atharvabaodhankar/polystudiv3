require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Multi-origin CORS support from env (comma-separated)
let allowedOrigins = [];
if (process.env.CORS_ORIGIN) {
  allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

// Helper: Extract Google Drive file ID from file_url
function extractDriveFileId(fileUrl) {
  // Handles URLs like https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // and https://drive.google.com/uc?id=FILE_ID&export=download
  const fileIdMatch = fileUrl.match(/\/d\/([\w-]+)/) || fileUrl.match(/[?&]id=([\w-]+)/);
  return fileIdMatch ? fileIdMatch[1] : null;
}

// Endpoint to delete a file from Google Drive by file_url
app.post('/api/delete-drive-file', express.json(), async (req, res) => {
  const { file_url } = req.body;
  console.log('[DELETE] Received file_url:', file_url);
  if (!file_url) {
    console.log('[DELETE] file_url missing');
    return res.status(400).json({ error: 'file_url is required' });
  }
  const fileId = extractDriveFileId(file_url);
  console.log('[DELETE] Extracted fileId:', fileId);
  if (!fileId) {
    console.log('[DELETE] Could not extract fileId from file_url');
    return res.status(400).json({ error: 'Invalid file_url, could not extract file ID' });
  }
  try {
    await drive.files.delete({ fileId });
    console.log('[DELETE] Successfully deleted file from Google Drive:', fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('[DELETE] Error deleting file from Google Drive:', error.message);
    res.status(500).json({ error: 'Failed to delete file from Google Drive.' });
  }
});

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