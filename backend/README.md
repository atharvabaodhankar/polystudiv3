# PolyStudi Backend

This backend handles file uploads to Google Drive and returns a public link for use in the PolyStudi app.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in this folder with the following variables:
   ```env
   GOOGLE_DRIVE_CLIENT_ID=your_client_id
   GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
   GOOGLE_DRIVE_REDIRECT_URI=your_redirect_uri
   GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token
   CORS_ORIGIN=http://localhost:5173 # or your deployed frontend URL
   ```
   - Use the Google Cloud Console to create OAuth credentials.
   - Use the `getRefreshToken.js` script from the old gdrive-converter to generate a refresh token if needed.
   - Set `CORS_ORIGIN` to your frontend's URL for deployment, or leave it blank for local development (defaults to '*').

3. Start the server:
   ```bash
   npm start
   ```

## API

### POST /api/upload
- Form field: `file` (the file to upload, max 50MB)
- Returns: `{ webViewLink, webContentLink }` (Google Drive public links)

## Notes
- This backend is intended to be called from your frontend upload form.
- After receiving the public link, store it in Supabase as the file URL. 