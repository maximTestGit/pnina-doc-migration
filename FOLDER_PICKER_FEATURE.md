# Google Drive Folder Picker Feature

## Overview

The Google Drive Folder Picker dialog allows users to browse and select folders from their Google Drive instead of manually entering folder IDs. This provides a more user-friendly interface for selecting the folder to process.

## Features

- **Browse Google Drive**: Navigate through your Google Drive folder hierarchy
- **Breadcrumb Navigation**: Easy navigation with breadcrumb trail showing current path
- **Visual Folder List**: Clear display of available folders with folder icons
- **Manual Entry Option**: Still supports manual folder ID entry for advanced users
- **Current Folder Selection**: Can select any folder in the navigation path
- **Error Handling**: Clear error messages if folder loading fails

## Implementation Details

### Frontend Components

#### 1. FolderPickerDialog Component
**File**: `client/src/components/FolderPickerDialog.jsx`

A modal dialog that provides the folder browsing interface:
- Displays folders in the current directory
- Supports breadcrumb navigation
- Handles folder selection
- Manages loading and error states

**Props**:
- `isOpen`: Boolean to control dialog visibility
- `onClose`: Callback when dialog is closed
- `onSelectFolder`: Callback when a folder is selected (receives folderId and folderName)
- `token`: OAuth token for API authentication
- `listFoldersApi`: API function to fetch folders

#### 2. Updated FolderSelection Component
**File**: `client/src/components/FolderSelection.jsx`

Enhanced to include:
- Browse button to open the folder picker dialog
- Displays selected folder name
- Still supports manual folder ID entry

#### 3. API Service
**File**: `client/src/services/api.js`

New function added:
```javascript
export const listFolders = async (token, parentFolderId = 'root')
```

Lists folders within a parent folder. Defaults to 'root' (My Drive).

### Backend Function

#### listFolders Cloud Function
**File**: `server/functions/index.js`

New Cloud Function that:
- Lists folders in a Google Drive folder
- Supports pagination for large folder lists
- Returns folders sorted by name
- Handles authentication and error cases

**Input**:
```json
{
  "oauthToken": "user-oauth-token",
  "parentFolderId": "folder-id-or-root"
}
```

**Output**:
```json
{
  "success": true,
  "count": 5,
  "folders": [
    {
      "id": "abc123",
      "name": "My Folder"
    }
  ]
}
```

## Setup Instructions

### 1. Environment Configuration

Add the new function URL to your `.env` file:

```env
VITE_FUNCTION_LIST_FOLDERS_URL=https://your-region-your-project.cloudfunctions.net/listFolders
```

**Example** (update with your actual URL after deployment):
```env
VITE_FUNCTION_LIST_FOLDERS_URL=https://us-central1-pnina-doc-migration-2025.cloudfunctions.net/listFolders
```

### 2. Deploy the Cloud Function

The `listFolders` function is now included in the deployment script.

Run the deployment script:
```powershell
cd server
.\deploy-functions.ps1
```

This will deploy all functions including the new `listFolders` function.

After deployment, copy the URL for `listFolders` and update your `.env` file.

### 3. Install Dependencies

No additional dependencies are required. The feature uses existing dependencies:
- `axios` for API calls (already in use)
- React hooks for state management
- CSS for styling

### 4. Start the Development Server

```powershell
cd client
npm run dev
```

## Usage

### For End Users

1. **Navigate to the Dashboard**: Log in to the application
2. **Click the Browse Button**: In the folder selection area, click the "📁 Browse" button
3. **Navigate Folders**: 
   - Click on any folder to open it
   - Use the breadcrumb trail to go back to parent folders
4. **Select Folder**: Click the "Select" button at the bottom to choose the current folder
5. **Process Documents**: The selected folder ID will be used to search for documents

### Alternative: Manual Entry

Users can still manually paste a folder ID:
1. Get the folder ID from the Google Drive URL
2. Paste it into the input field
3. Click "Search Documents"

## Architecture

```
User clicks Browse
       ↓
FolderPickerDialog opens
       ↓
Calls listFolders API with parentFolderId='root'
       ↓
Backend Cloud Function queries Google Drive API
       ↓
Returns list of folders
       ↓
User navigates through folders
       ↓
User selects a folder
       ↓
Selected folder ID is used to list documents
```

## API Flow

```
Client (React)
    ↓
    | HTTP POST
    ↓
Cloud Function (listFolders)
    ↓
    | OAuth Token
    ↓
Google Drive API
    ↓
    | Returns folder list
    ↓
Cloud Function
    ↓
    | JSON Response
    ↓
Client (React)
```

## Error Handling

The folder picker handles several error scenarios:

1. **Invalid/Expired Token**: Shows error message, prompts re-authentication
2. **Folder Not Found**: Displays "Folder not found" error
3. **Permission Denied**: Shows "Permission denied" message
4. **Network Errors**: Displays connection error message
5. **Empty Folders**: Shows "No folders found" when a folder has no subfolders

## Styling

The folder picker dialog uses a modern, clean design:
- Modal overlay with semi-transparent background
- Card-style dialog with rounded corners and shadow
- Hover effects on folders and buttons
- Responsive design that works on different screen sizes
- Accessible close button
- Color-coded elements (blue for navigation, green for success actions)

## Security Considerations

- **OAuth Token**: User's OAuth token is used for authentication
- **No Server-Side Storage**: Tokens are not stored on the server
- **CORS Enabled**: Cloud Function allows cross-origin requests from the frontend
- **User Scopes**: Only accesses folders/files the authenticated user has permission to view
- **No Unauthenticated Access**: All API calls require valid OAuth tokens

## Testing

### Manual Testing Checklist

- [ ] Open folder picker dialog
- [ ] Navigate into a subfolder
- [ ] Navigate back using breadcrumbs
- [ ] Select a folder
- [ ] Verify folder ID is populated
- [ ] Process documents from selected folder
- [ ] Test with empty folders
- [ ] Test error handling (invalid token, network error)
- [ ] Test manual folder ID entry
- [ ] Test cancel button

### Test Scenarios

1. **Normal Flow**: Browse → Select → Process
2. **Deep Navigation**: Navigate several levels deep
3. **Breadcrumb Navigation**: Use breadcrumbs to go back
4. **Mixed Usage**: Combine browsing and manual entry
5. **Error Recovery**: Handle errors gracefully

## Future Enhancements

Potential improvements for future versions:

1. **Search Functionality**: Add search box to find folders by name
2. **Recent Folders**: Remember and display recently used folders
3. **Favorites**: Allow users to bookmark frequently used folders
4. **Folder Metadata**: Display folder creation date, owner, etc.
5. **Multi-select**: Select multiple folders to process
6. **Shared Drives Support**: Include shared drives in the browser
7. **Folder Preview**: Show number of documents in each folder
8. **Keyboard Navigation**: Arrow key support for folder navigation

## Troubleshooting

### Dialog Not Opening
- Check console for JavaScript errors
- Verify `listFoldersApi` prop is passed correctly
- Ensure token is valid

### Folders Not Loading
- Check network tab for failed API calls
- Verify Cloud Function is deployed
- Check environment variable `VITE_FUNCTION_LIST_FOLDERS_URL`
- Verify OAuth token has necessary permissions

### Permission Errors
- Ensure OAuth scopes include `https://www.googleapis.com/auth/drive.readonly`
- Check user has access to the folders
- Verify Google Drive API is enabled in the project

### Styling Issues
- Check that CSS file is imported
- Verify no conflicting CSS rules
- Check browser console for CSS errors

## Files Modified/Created

### New Files
- `client/src/components/FolderPickerDialog.jsx` - Dialog component
- `client/src/components/FolderPickerDialog.css` - Dialog styles
- `FOLDER_PICKER_FEATURE.md` - This documentation

### Modified Files
- `client/src/services/api.js` - Added `listFolders` function
- `client/src/components/FolderSelection.jsx` - Added browse button and dialog integration
- `client/src/components/FolderSelection.css` - Updated styles for new layout
- `client/src/components/Dashboard.jsx` - Pass token and API function to FolderSelection
- `client/.env.example` - Added `VITE_FUNCTION_LIST_FOLDERS_URL`
- `server/functions/index.js` - Added `listFolders` Cloud Function
- `server/deploy-functions.ps1` - Added deployment for `listFolders` function

## Support

For issues or questions:
1. Check this documentation
2. Review console errors in browser DevTools
3. Check Cloud Function logs in Google Cloud Console
4. Verify environment configuration

---

**Version**: 1.0  
**Date**: November 17, 2025  
**Author**: Development Team
