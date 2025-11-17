/**
 * Google Cloud Functions (Gen 2) - Entry Point
 * Pnina Document Migration
 */

const { google } = require('googleapis');

/**
 * Function 1: List Documents in Folder
 * 
 * Scans a Google Drive folder recursively and returns all Google Docs documents.
 * 
 * Input (POST JSON):
 *   - oauthToken: User's OAuth access token
 *   - folderId: Google Drive folder ID to scan
 * 
 * Output:
 *   - documents: Array of document objects with:
 *     - id: Document ID
 *     - name: Document name
 *     - url: Direct URL to document
 *     - createdTime: ISO timestamp
 *     - modifiedTime: ISO timestamp
 */
exports.listDocuments = async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    try {
        // Validate request method
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed. Use POST.' });
        }

        // Extract parameters
        const { oauthToken, folderId } = req.body;

        // Validate required parameters
        if (!oauthToken) {
            return res.status(400).json({ error: 'Missing required parameter: oauthToken' });
        }

        if (!folderId) {
            return res.status(400).json({ error: 'Missing required parameter: folderId' });
        }

        // Initialize OAuth2 client with user token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: oauthToken });

        // Initialize Drive API
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Recursively scan folder for Google Docs
        const documents = [];
        const foldersToScan = [folderId];
        const scannedFolders = new Set();

        while (foldersToScan.length > 0) {
            const currentFolderId = foldersToScan.pop();

            // Avoid infinite loops
            if (scannedFolders.has(currentFolderId)) {
                continue;
            }
            scannedFolders.add(currentFolderId);

            // Query for all items in current folder
            let pageToken = null;

            do {
                const response = await drive.files.list({
                    q: `'${currentFolderId}' in parents and trashed = false`,
                    fields: 'nextPageToken, files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
                    pageSize: 100,
                    pageToken: pageToken,
                });

                const files = response.data.files || [];

                for (const file of files) {
                    if (file.mimeType === 'application/vnd.google-apps.document') {
                        // This is a Google Doc
                        documents.push({
                            id: file.id,
                            name: file.name,
                            url: file.webViewLink,
                            createdTime: file.createdTime,
                            modifiedTime: file.modifiedTime,
                        });
                    } else if (file.mimeType === 'application/vnd.google-apps.folder') {
                        // This is a subfolder - add to scan queue
                        foldersToScan.push(file.id);
                    }
                }

                pageToken = response.data.nextPageToken;
            } while (pageToken);
        }

        // Return results
        res.status(200).json({
            success: true,
            count: documents.length,
            documents: documents,
        });

    } catch (error) {
        console.error('Error listing documents:', error);

        // Handle specific error types
        if (error.code === 401) {
            return res.status(401).json({
                error: 'Unauthorized. Invalid or expired OAuth token.',
                details: error.message,
            });
        }

        if (error.code === 404) {
            return res.status(404).json({
                error: 'Folder not found or not accessible.',
                details: error.message,
            });
        }

        if (error.code === 403) {
            return res.status(403).json({
                error: 'Permission denied. User does not have access to this folder.',
                details: error.message,
            });
        }

        // Generic error
        res.status(500).json({
            error: 'Internal server error while listing documents.',
            details: error.message,
        });
    }
};

// Placeholder for Function 2
exports.parseDocument = async (req, res) => {
    // TODO: Implement Function 2 - Parse Document
    res.status(501).json({ error: 'Not implemented yet' });
};

// Placeholder for Function 3
exports.saveToSheets = async (req, res) => {
    // TODO: Implement Function 3 - Save to Sheets
    res.status(501).json({ error: 'Not implemented yet' });
};
