import React, { useState } from 'react';
import './FolderSelection.css';

const FolderSelection = ({ onFolderSelected, loading }) => {
    const [folderId, setFolderId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderId.trim()) {
            onFolderSelected(folderId.trim());
        }
    };

    return (
        <div className="folder-selection">
            <h2>Select Google Drive Folder</h2>
            <form onSubmit={handleSubmit} className="folder-form">
                <input
                    type="text"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    placeholder="Enter Folder ID"
                    className="folder-input"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !folderId.trim()} className="search-button">
                    {loading ? 'Loading...' : 'Search Documents'}
                </button>
            </form>
            <p className="folder-hint">
                Paste the Folder ID from Google Drive URL (e.g., https://drive.google.com/drive/folders/FOLDER_ID)
            </p>
        </div>
    );
};

export default FolderSelection;
