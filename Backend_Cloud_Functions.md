# DOCUMENT 2 -- BACKEND REQUIREMENTS (GOOGLE CLOUD FUNCTIONS GEN2)

## 1. Overview

The backend consists of three Google Cloud Functions Gen2 running on
Node.js 20, each exposed via HTTP and authenticated via Google OAuth
token passed from the frontend.

## 2. Function 1 -- List Documents in Folder

**Input:** - OAuth token - Folder ID

**Actions:** - Authorize user - Scan folder recursively - Return list of
Google Docs documents: - Document ID - Name - URL - Created Time -
Modified Time

## 3. Function 2 -- Parse Document

**Input:** - OAuth token - Document ID

**Actions:** - Retrieve document text via Google Docs API - Extract: -
Person Name (after "שם:") - Teudat Zehut (after "ת.ז.:") - Return
extracted fields + missing fields + errors

## 4. Function 3 -- Save Data to Google Sheets

**Input:** - OAuth token - Parsed data - Document ID

**Actions:** - Insert or update row in Google Sheet - Save status
(Processed / Error) - Save timestamp and error message if applicable

## 5. General Requirements

All functions: - Must be Gen2 - Must use Node.js 20 - Must use OAuth
token - Must use Google Drive, Docs, Sheets APIs
