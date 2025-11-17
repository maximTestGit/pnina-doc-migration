# DOCUMENT 3 -- FRONTEND REQUIREMENTS

## 1. Overview

The frontend is a browser application. It uses Google Authentication
Provider, obtains the OAuth token, and communicates with backend Cloud
Functions Gen2.

## 2. Authentication

-   User logs in via Google OAuth.
-   Token is stored temporarily and passed to backend for processing.

## 3. Folder Selection

-   User enters Folder ID or selects via dialog.
-   Frontend calls Function 1.
-   Display results in "Found Documents" table with:
    -   ID
    -   Name
    -   URL
    -   Created
    -   Modified
    -   Checkbox
-   Sorting and filtering must be supported.

## 4. Document Processing

-   User selects documents and clicks "Process Selected".
-   Function 2 is called per document.
-   Display output in "Processed Documents" table.
-   Highlight missing fields.
-   Support:
    -   Sorting
    -   Filtering (only errors)
    -   Manual editing
    -   Opening document via link

## 5. Error Documents Table

-   Show documents with errors.
-   Highlight error fields.
-   Support sorting and filtering.

## 6. Save to Sheets

-   User selects records to save.
-   Frontend calls Function 3.

## 7. Table Requirements

All tables support: - Sorting by any column - Filtering - Highlighting
missing/incorrect fields - Opening document links - Editable fields in
Processed table
