# Pnina Document Migration - Frontend

React-based frontend application for migrating Google Docs documents. This application uses Google OAuth for authentication and communicates with Google Cloud Functions Gen2 backend.

## Features

- **Google OAuth Authentication**: Secure login with Google account
- **Folder Selection**: Browse and select Google Drive folders
- **Document Discovery**: Automatically find all Google Docs in selected folder
- **Document Processing**: Parse documents to extract person name and Teudat Zehut
- **Interactive Tables**: 
  - Found Documents with selection
  - Processed Documents with inline editing
  - Error Documents with field highlighting
- **Data Export**: Save processed documents to Google Sheets
- **Advanced Features**:
  - Sorting on all columns
  - Filtering and search
  - Error highlighting
  - Manual field editing
  - Direct document links

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google Cloud Project with OAuth configured
- Backend Cloud Functions deployed

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_FUNCTION_LIST_DOX_URL=https://your-region-your-project.cloudfunctions.net/listDocuments
   VITE_FUNCTION_PARSE_DOC_URL=https://your-region-your-project.cloudfunctions.net/parseDocument
   VITE_FUNCTION_REGISTER_DOC_URL=https://your-region-your-project.cloudfunctions.net/saveToSheets
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main application layout
│   │   ├── Header.jsx              # Header with user info
│   │   ├── Login.jsx               # Google OAuth login
│   │   ├── FolderSelection.jsx    # Folder ID input
│   │   ├── FoundDocumentsTable.jsx        # Document list with selection
│   │   ├── ProcessedDocumentsTable.jsx    # Processed docs with editing
│   │   └── ErrorDocumentsTable.jsx        # Error docs with highlights
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── services/
│   │   └── api.js                 # Backend API calls
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Application entry point
│   └── index.css                  # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Usage

1. **Login**: Click "Login with Google" and authorize the application
2. **Select Folder**: Enter a Google Drive folder ID
3. **View Documents**: Review found documents in the table
4. **Select & Process**: Choose documents and click "Process Selected"
5. **Review Results**: Check processed documents and errors
6. **Edit Fields**: Click on any editable field to modify
7. **Save to Sheets**: Select documents and save to Google Sheets

## Features by Table

### Found Documents Table
- Checkbox selection (individual and select all)
- Sortable columns (Name, ID, Created, Modified)
- Filter by name or ID
- Direct links to open documents
- Selection count display

### Processed Documents Table
- All features from Found Documents
- Inline editing for Person Name and Teudat Zehut
- Yellow highlighting for missing fields
- Error status badges
- Filter to show only errors
- Save selected to Google Sheets

### Error Documents Table
- Focus on documents with issues
- Edit hints on missing fields
- Detailed error messages
- Field-specific highlighting
- Direct access to fix problems

## Technologies

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **@react-oauth/google**: Google OAuth integration
- **Axios**: HTTP client for API calls
- **CSS3**: Styling with custom design

## OAuth Scopes Required

The application requests the following Google OAuth scopes:
- `https://www.googleapis.com/auth/drive.readonly` - Read Google Drive files
- `https://www.googleapis.com/auth/documents.readonly` - Read Google Docs
- `https://www.googleapis.com/auth/spreadsheets` - Read/write Google Sheets

## Development

- **Hot Reload**: Development server supports hot module replacement
- **RTL Support**: Full right-to-left language support
- **Responsive**: Mobile-friendly design
- **Error Handling**: Comprehensive error messages and UI feedback

## Troubleshooting

- **OAuth Error**: Verify Client ID and authorized redirect URIs in Google Cloud Console
- **API Errors**: Check that backend Cloud Functions are deployed and URLs are correct
- **Missing Data**: Ensure proper OAuth scopes are granted
- **CORS Issues**: Verify Cloud Functions allow requests from your domain

## License

Private project - All rights reserved
