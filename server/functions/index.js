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
        const { oauthToken, documentId } = req.body;

        // Validate required parameters
        if (!oauthToken) {
            return res.status(400).json({ error: 'Missing required parameter: oauthToken' });
        }

        if (!documentId) {
            return res.status(400).json({ error: 'Missing required parameter: documentId' });
        }

        // Initialize OAuth2 client with user token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: oauthToken });

        // Initialize Docs API
        const docs = google.docs({ version: 'v1', auth: oauth2Client });

        // Retrieve document content
        const docResponse = await docs.documents.get({
            documentId: documentId,
        });

        // Extract text from document
        const documentText = extractTextFromDocument(docResponse.data);

        // Parse the document for required fields
        const parsedData = parseDocumentFields(documentText);

        // Determine missing fields and errors
        const missingFields = [];
        const errors = [];

        if (!parsedData.personName || parsedData.personName.trim() === '') {
            missingFields.push('personName');
            errors.push('Person Name (שם) not found in document');
        }

        if (!parsedData.teudatZehut || parsedData.teudatZehut.trim() === '') {
            missingFields.push('teudatZehut');
            errors.push('Teudat Zehut (ת.ז.) not found in document');
        }

        // Validate Teudat Zehut format (should be 9 digits)
        if (parsedData.teudatZehut && !/^\d{9}$/.test(parsedData.teudatZehut.replace(/\s/g, ''))) {
            errors.push('Teudat Zehut format is invalid (should be 9 digits)');
        }

        // Return results
        res.status(200).json({
            success: true,
            documentId: documentId,
            personName: parsedData.personName || '',
            teudatZehut: parsedData.teudatZehut || '',
            missingFields: missingFields,
            errors: errors,
            hasErrors: errors.length > 0,
        });

    } catch (error) {
        console.error('Error parsing document:', error);

        // Handle specific error types
        if (error.code === 401) {
            return res.status(401).json({
                error: 'Unauthorized. Invalid or expired OAuth token.',
                details: error.message,
            });
        }

        if (error.code === 404) {
            return res.status(404).json({
                error: 'Document not found or not accessible.',
                details: error.message,
            });
        }

        if (error.code === 403) {
            return res.status(403).json({
                error: 'Permission denied. User does not have access to this document.',
                details: error.message,
            });
        }

        // Generic error
        res.status(500).json({
            error: 'Internal server error while parsing document.',
            details: error.message,
        });
    }
};

// Placeholder for Function 3
exports.saveToSheets = async (req, res) => {
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
        const { oauthToken, data } = req.body;

        // Validate required parameters
        if (!oauthToken) {
            return res.status(400).json({ error: 'Missing required parameter: oauthToken' });
        }

        if (!data) {
            return res.status(400).json({ error: 'Missing required parameter: data' });
        }

        // Get environment variables
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const sheetTabName = process.env.SHEET_TAB_NAME || 'ProcessedDocuments';

        if (!spreadsheetId) {
            return res.status(500).json({
                error: 'Server configuration error: GOOGLE_SHEETS_ID not set'
            });
        }

        // Initialize OAuth2 client with user token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: oauthToken });

        // Initialize Sheets API
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        // Prepare row data
        const timestamp = new Date().toISOString();
        const status = data.errors && data.errors.length > 0 ? 'Error' : 'Processed';
        const errorMessage = data.errors && data.errors.length > 0 ? data.errors.join('; ') : '';

        const rowData = [
            data.documentId || '',
            data.documentName || '',
            data.personName || '',
            data.teudatZehut || '',
            status,
            timestamp,
            errorMessage,
            data.documentUrl || '',
            data.createdTime || '',
            data.modifiedTime || '',
        ];

        // Check if document already exists in sheet
        const existingRowIndex = await findDocumentRow(sheets, spreadsheetId, sheetTabName, data.documentId);

        let result;
        if (existingRowIndex !== -1) {
            // Update existing row
            const range = `${sheetTabName}!A${existingRowIndex}:J${existingRowIndex}`;
            result = await sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [rowData],
                },
            });
        } else {
            // Append new row
            const range = `${sheetTabName}!A:J`;
            result = await sheets.spreadsheets.values.append({
                spreadsheetId: spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [rowData],
                },
            });
        }

        // Return success
        res.status(200).json({
            success: true,
            action: existingRowIndex !== -1 ? 'updated' : 'inserted',
            rowIndex: existingRowIndex !== -1 ? existingRowIndex : result.data.updates?.updatedRange,
            status: status,
            timestamp: timestamp,
        });

    } catch (error) {
        console.error('Error saving to sheets:', error);

        // Handle specific error types
        if (error.code === 401) {
            return res.status(401).json({
                error: 'Unauthorized. Invalid or expired OAuth token.',
                details: error.message,
            });
        }

        if (error.code === 404) {
            return res.status(404).json({
                error: 'Spreadsheet not found or not accessible.',
                details: error.message,
            });
        }

        if (error.code === 403) {
            return res.status(403).json({
                error: 'Permission denied. User does not have access to this spreadsheet.',
                details: error.message,
            });
        }

        // Generic error
        res.status(500).json({
            error: 'Internal server error while saving to sheets.',
            details: error.message,
        });
    }
};

/**
 * Helper function to extract text from Google Docs document structure
 */
function extractTextFromDocument(document) {
    let text = '';

    if (!document.body || !document.body.content) {
        return text;
    }

    for (const element of document.body.content) {
        if (element.paragraph) {
            for (const textElement of element.paragraph.elements || []) {
                if (textElement.textRun && textElement.textRun.content) {
                    text += textElement.textRun.content;
                }
            }
        } else if (element.table) {
            // Handle tables if needed
            for (const row of element.table.tableRows || []) {
                for (const cell of row.tableCells || []) {
                    for (const cellElement of cell.content || []) {
                        if (cellElement.paragraph) {
                            for (const textElement of cellElement.paragraph.elements || []) {
                                if (textElement.textRun && textElement.textRun.content) {
                                    text += textElement.textRun.content;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return text;
}

/**
 * Helper function to parse document fields
 * Looks for "שם:" and "ת.ז.:" patterns
 */
function parseDocumentFields(text) {
    const result = {
        personName: '',
        teudatZehut: '',
    };

    // Pattern to find "שם:" followed by the name
    const namePattern = /שם:\s*([^\n\r]+)/;
    const nameMatch = text.match(namePattern);
    if (nameMatch && nameMatch[1]) {
        result.personName = nameMatch[1].trim();
    }

    // Pattern to find "ת.ז.:" or "ת.ז:" followed by the ID number
    const teudatPattern = /ת\.ז\.?:\s*([0-9\s]+)/;
    const teudatMatch = text.match(teudatPattern);
    if (teudatMatch && teudatMatch[1]) {
        // Remove spaces from the ID number
        result.teudatZehut = teudatMatch[1].replace(/\s/g, '');
    }

    return result;
}

/**
 * Helper function to find a document row in the sheet by document ID
 * Returns the row index (1-based) or -1 if not found
 */
async function findDocumentRow(sheets, spreadsheetId, sheetTabName, documentId) {
    try {
        const range = `${sheetTabName}!A:A`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        });

        const rows = response.data.values || [];

        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] === documentId) {
                return i + 1; // Return 1-based row index
            }
        }

        return -1; // Not found
    } catch (error) {
        console.error('Error finding document row:', error);
        return -1; // Return -1 on error to trigger insert instead of update
    }
}
