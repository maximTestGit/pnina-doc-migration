import React, { useState } from 'react';
import FolderPickerDialog from './FolderPickerDialog';
import './FolderSelection.css';

const FolderSelection = ({ onFolderSelected, loading, token, listFoldersApi }) => {
    const [folderId, setFolderId] = useState('');
    const [folderName, setFolderName] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (folderId.trim()) {
            onFolderSelected(folderId.trim());
        }
    };

    const handleOpenPicker = () => {
        setIsPickerOpen(true);
    };

    const handleSelectFolder = (selectedFolderId, selectedFolderName) => {
        setFolderId(selectedFolderId);
        setFolderName(selectedFolderName);
        onFolderSelected(selectedFolderId);
    };

    return (
        <div className="folder-selection">
            <h2>Select Google Drive Folder</h2>
            <form onSubmit={handleSubmit} className="folder-form">
                <div className="folder-input-group">
                    <input
                        type="text"
                        value={folderName || folderId}
                        onChange={(e) => {
                            setFolderId(e.target.value);
                            setFolderName('');
                        }}
                        placeholder="Enter Folder ID or use Browse"
                        className="folder-input"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={handleOpenPicker}
                        disabled={loading}
                        className="browse-button"
                    >
                        📁 Browse
                    </button>
                </div>
                <button type="submit" disabled={loading || !folderId.trim()} className="search-button">
                    {loading ? 'Loading...' : 'Search Documents'}
                </button>
            </form>
            <p className="folder-hint">
                Browse folders or paste the Folder ID from Google Drive URL (e.g., https://drive.google.com/drive/folders/FOLDER_ID)
            </p>

            <FolderPickerDialog
                isOpen={isPickerOpen}
                onClose={() => setIsPickerOpen(false)}
                onSelectFolder={handleSelectFolder}
                token={token}
                listFoldersApi={listFoldersApi}
            />
        </div>
    );
};

export default FolderSelection;
