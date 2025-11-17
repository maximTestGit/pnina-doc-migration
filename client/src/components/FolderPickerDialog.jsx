import React, { useState, useEffect } from 'react';
import './FolderPickerDialog.css';

const FolderPickerDialog = ({ isOpen, onClose, onSelectFolder, token, listFoldersApi }) => {
    const [folders, setFolders] = useState([]);
    const [currentPath, setCurrentPath] = useState([{ id: 'root', name: 'My Drive' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadFolders('root');
        }
    }, [isOpen]);

    const loadFolders = async (folderId) => {
        setLoading(true);
        setError(null);
        try {
            const result = await listFoldersApi(token, folderId);
            setFolders(result.folders || []);
        } catch (err) {
            setError(err.message || 'Failed to load folders');
            setFolders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder) => {
        setCurrentPath([...currentPath, folder]);
        loadFolders(folder.id);
    };

    const handleBreadcrumbClick = (index) => {
        const newPath = currentPath.slice(0, index + 1);
        setCurrentPath(newPath);
        loadFolders(newPath[newPath.length - 1].id);
    };

    const handleSelectCurrentFolder = () => {
        const currentFolder = currentPath[currentPath.length - 1];
        onSelectFolder(currentFolder.id, currentFolder.name);
        handleClose();
    };

    const handleClose = () => {
        setCurrentPath([{ id: 'root', name: 'My Drive' }]);
        setFolders([]);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="folder-picker-overlay" onClick={handleClose}>
            <div className="folder-picker-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="folder-picker-header">
                    <h2>Select Google Drive Folder</h2>
                    <button className="close-button" onClick={handleClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="folder-picker-breadcrumb">
                    {currentPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <button
                                className="breadcrumb-item"
                                onClick={() => handleBreadcrumbClick(index)}
                            >
                                {folder.name}
                            </button>
                            {index < currentPath.length - 1 && (
                                <span className="breadcrumb-separator">/</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="folder-picker-error">
                        {error}
                    </div>
                )}

                <div className="folder-picker-content">
                    {loading ? (
                        <div className="folder-picker-loading">Loading folders...</div>
                    ) : folders.length === 0 ? (
                        <div className="folder-picker-empty">No folders found</div>
                    ) : (
                        <div className="folder-list">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className="folder-item"
                                    onClick={() => handleFolderClick(folder)}
                                >
                                    <span className="folder-icon">📁</span>
                                    <span className="folder-name">{folder.name}</span>
                                    <span className="folder-arrow">›</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="folder-picker-footer">
                    <button className="cancel-button" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className="select-button"
                        onClick={handleSelectCurrentFolder}
                        disabled={loading}
                    >
                        Select "{currentPath[currentPath.length - 1].name}"
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FolderPickerDialog;
