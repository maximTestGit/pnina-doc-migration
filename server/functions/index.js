/**
 * Google Cloud Functions (Gen 2) - Entry Point
 * Pnina Document Migration
 */

const { google } = require('googleapis');

/**
 * Function: List Folders
 * 
 * Lists folders in Google Drive within a parent folder.
 * 
 * Input (POST JSON):
 *   - oauthToken: User's OAuth access token
 *   - parentFolderId: Parent folder ID ('root' for My Drive)
 * 
 * Output:
 *   - folders: Array of folder objects with:
 *     - id: Folder ID
 *     - name: Folder name
 */
exports.listFolders = async (req, res) => {
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
        const { oauthToken, parentFolderId } = req.body;

        // Validate required parameters
        if (!oauthToken) {
            return res.status(400).json({ error: 'Missing required parameter: oauthToken' });
        }

        const folderId = parentFolderId || 'root';

        // Initialize OAuth2 client with user token
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: oauthToken });

        // Initialize Drive API
        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Query for folders in the parent folder
        const folders = [];
        let pageToken = null;

        do {
            const response = await drive.files.list({
                q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
                fields: 'nextPageToken, files(id, name)',
                pageSize: 100,
                pageToken: pageToken,
                orderBy: 'name',
            });

            const files = response.data.files || [];
            folders.push(...files);

            pageToken = response.data.nextPageToken;
        } while (pageToken);

        // Return results
        res.status(200).json({
            success: true,
            count: folders.length,
            folders: folders,
        });

    } catch (error) {
        console.error('Error listing folders:', error);

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
            error: 'Internal server error while listing folders.',
            details: error.message,
        });
    }
};

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
            appointmentDate: parsedData.appointmentDate || '',
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
        // Columns: Document ID, Document Name, Patient Name, Patient ID, Link, Status
        const status = 'New';

        const rowData = [
            data.documentId || '',
            data.documentName || '',
            data.personName || '',
            data.teudatZehut || '',
            data.documentUrl || '',
            status,
        ];

        // Check if document already exists in sheet
        const existingRowIndex = await findDocumentRow(sheets, spreadsheetId, sheetTabName, data.documentId);

        let result;
        if (existingRowIndex !== -1) {
            // Update existing row
            const range = `${sheetTabName}!A${existingRowIndex}:F${existingRowIndex}`;
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
            const range = `${sheetTabName}!A:F`;
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
            status: 'New',
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
 * Looks for "שם:", "ת.ז.:", and "תאריך ביקור:" patterns
 */
function parseDocumentFields(text) {
    const result = {
        personName: '',
        teudatZehut: '',
        appointmentDate: '',
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

    // Pattern to find "תאריך ביקור:" followed by the date
    // Supports formats: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
    const appointmentPattern = /תאריך\s*ביקור\s*:\s*([0-9]{1,2}[\/.\\-][0-9]{1,2}[\/.\\-][0-9]{2,4})/;
    const appointmentMatch = text.match(appointmentPattern);
    if (appointmentMatch && appointmentMatch[1]) {
        const rawDate = appointmentMatch[1].trim();
        // Convert to dd MMM yyyy format
        result.appointmentDate = formatDateToDdMmmYyyy(rawDate);
    }

    return result;
}

/**
 * Helper function to convert date string to dd MMM yyyy format
 * @param {string} dateStr - Date in format dd/mm/yyyy, dd-mm-yyyy, or dd.mm.yyyy
 * @returns {string} Date in format dd MMM yyyy (e.g., "17 Nov 2025")
 */
function formatDateToDdMmmYyyy(dateStr) {
    try {
        // Split by common separators
        const parts = dateStr.split(/[\/.\\-]/);
        if (parts.length !== 3) {
            return dateStr; // Return original if can't parse
        }

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
        const year = parseInt(parts[2], 10);

        // Handle 2-digit years
        const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year;

        // Create date object
        const date = new Date(fullYear, month, day);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateStr; // Return original if invalid
        }

        // Month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Format as dd MMM yyyy
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = monthNames[month];
        const formattedYear = fullYear;

        return `${formattedDay} ${formattedMonth} ${formattedYear}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateStr; // Return original on error
    }
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
