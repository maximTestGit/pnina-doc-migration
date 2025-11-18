import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { listDocuments, parseDocument, saveToSheets, listFolders } from '../services/api';
import { exportStateToCSV, importStateFromCSV } from '../services/csvService';
import Header from './Header';
import FolderSelection from './FolderSelection';
import FoundDocumentsTable from './FoundDocumentsTable';
import ProcessedDocumentsTable from './ProcessedDocumentsTable';
import ErrorDocumentsTable from './ErrorDocumentsTable';
import './Dashboard.css';

const Dashboard = () => {
    const { user, token, logout } = useAuth();
    const [foundDocuments, setFoundDocuments] = useState([]);
    const [processedDocuments, setProcessedDocuments] = useState([]);
    const [errorDocuments, setErrorDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [activeTab, setActiveTab] = useState('found'); // found, processed, errors
    const fileInputRef = useRef(null);

    const handleFolderSelected = async (folderId) => {
        setLoading(true);
        try {
            const result = await listDocuments(token, folderId);
            setFoundDocuments(result.documents || []);
            setProcessedDocuments([]);
            setErrorDocuments([]);
            setSelectedDocuments([]);
            setActiveTab('found');
        } catch (error) {
            alert('Error loading documents: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessSelected = async () => {
        if (selectedDocuments.length === 0) {
            alert('Please select documents to process');
            return;
        }

        setLoading(true);
        const processed = [];
        const errors = [];

        for (const docId of selectedDocuments) {
            try {
                const result = await parseDocument(token, docId);
                const doc = foundDocuments.find(d => d.id === docId);
                const processedDoc = {
                    ...doc,
                    ...result,
                    status: result.missingFields?.length > 0 ? 'error' : 'success'
                };

                processed.push(processedDoc);

                if (result.missingFields?.length > 0 || result.errors?.length > 0) {
                    errors.push(processedDoc);
                }
            } catch (error) {
                const doc = foundDocuments.find(d => d.id === docId);
                const errorDoc = {
                    ...doc,
                    status: 'error',
                    errors: [error.message]
                };
                processed.push(errorDoc);
                errors.push(errorDoc);
            }
        }

        // Append to existing processed documents, avoiding duplicates
        setProcessedDocuments(prev => {
            const newDocs = processed.filter(newDoc =>
                !prev.some(existingDoc => existingDoc.id === newDoc.id)
            );
            return [...prev, ...newDocs];
        });

        // Append to existing error documents, avoiding duplicates
        setErrorDocuments(prev => {
            const newErrors = errors.filter(newDoc =>
                !prev.some(existingDoc => existingDoc.id === newDoc.id)
            );
            return [...prev, ...newErrors];
        });

        setActiveTab('processed');
        setLoading(false);
    };

    const handleSaveToExcel = (documentsToSave) => {
        if (documentsToSave.length === 0) {
            alert('Please select documents to save');
            return;
        }

        // Prepare data for Excel
        const excelData = documentsToSave.map(doc => ({
            'Item Name': `${doc.personName || ''} - ${doc.teudatZehut || ''} - ${doc.appointmentDate || ''}`,
            'Document ID': doc.id || '',
            'Document Name': doc.name || '',
            'Patient Name': doc.personName || '',
            'Patient ID': doc.teudatZehut || '',
            'Appointment Date': doc.appointmentDate || '',
            'Link': doc.url || '',
            'Tag': '#mass.import',
            'Status': doc.status || '',
            'Missing Fields': doc.missingFields?.join(', ') || '',
            'Errors': doc.errors?.join(', ') || '',
            'Created': doc.createdTime || doc.created || '',
            'Modified': doc.modifiedTime || doc.modified || ''
        }));

        // Convert to CSV
        const headers = Object.keys(excelData[0]);
        const csvContent = [
            headers.join(','),
            ...excelData.map(row =>
                headers.map(header => {
                    const value = row[header] || '';
                    // Escape commas and quotes
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.setAttribute('href', url);
        link.setAttribute('download', `processed_documents_${timestamp}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert(`Successfully exported ${documentsToSave.length} document(s) to CSV file`);
    };

    const handleDocumentUpdate = (updatedDoc) => {
        setProcessedDocuments(prev =>
            prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
        );

        // Update error documents as well
        const hasErrors = updatedDoc.missingFields?.length > 0 || updatedDoc.errors?.length > 0;
        if (hasErrors) {
            setErrorDocuments(prev => {
                const exists = prev.find(d => d.id === updatedDoc.id);
                if (exists) {
                    return prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc);
                } else {
                    return [...prev, updatedDoc];
                }
            });
        } else {
            setErrorDocuments(prev => prev.filter(doc => doc.id !== updatedDoc.id));
        }
    };

    const handleRemoveDocuments = (docIds) => {
        // Remove from processed documents
        setProcessedDocuments(prev => prev.filter(doc => !docIds.includes(doc.id)));

        // Remove from error documents
        setErrorDocuments(prev => prev.filter(doc => !docIds.includes(doc.id)));
    };

    const handleSaveState = () => {
        try {
            const count = exportStateToCSV(foundDocuments, processedDocuments, errorDocuments);
            alert(`Successfully saved ${count} document(s) to CSV file`);
        } catch (error) {
            alert('Error saving state: ' + error.message);
        }
    };

    const handleLoadState = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            const result = await importStateFromCSV(file);

            setFoundDocuments(result.foundDocuments);
            setProcessedDocuments(result.processedDocuments);
            setErrorDocuments(result.errorDocuments);
            setSelectedDocuments([]);

            // Set active tab to the first non-empty category
            if (result.foundDocuments.length > 0) {
                setActiveTab('found');
            } else if (result.processedDocuments.length > 0) {
                setActiveTab('processed');
            } else if (result.errorDocuments.length > 0) {
                setActiveTab('errors');
            }

            alert(`Successfully loaded ${result.totalCount} document(s) from CSV file`);
        } catch (error) {
            alert('Error loading state: ' + error.message);
        } finally {
            setLoading(false);
            // Reset file input
            e.target.value = '';
        }
    };

    return (
        <div className="dashboard">
            <Header user={user} onLogout={logout} />

            <div className="dashboard-content">
                <div className="state-management">
                    <button
                        onClick={handleSaveState}
                        disabled={foundDocuments.length === 0 && processedDocuments.length === 0 && errorDocuments.length === 0}
                        className="save-state-button"
                        title="Save current state to CSV file"
                    >
                        💾 Save State
                    </button>
                    <button
                        onClick={handleLoadState}
                        disabled={loading}
                        className="load-state-button"
                        title="Load state from CSV file"
                    >
                        📂 Load State
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelected}
                        style={{ display: 'none' }}
                    />
                </div>

                <FolderSelection
                    onFolderSelected={handleFolderSelected}
                    loading={loading}
                    token={token}
                    listFoldersApi={listFolders}
                />

                {foundDocuments.length > 0 && (
                    <div className="process-section">
                        <button
                            onClick={handleProcessSelected}
                            disabled={selectedDocuments.length === 0 || loading}
                            className="process-button"
                        >
                            {loading ? 'Processing...' : `Process Selected (${selectedDocuments.length})`}
                        </button>
                    </div>
                )}

                <div className="tabs">
                    {foundDocuments.length > 0 && (
                        <button
                            className={`tab ${activeTab === 'found' ? 'active' : ''}`}
                            onClick={() => setActiveTab('found')}
                        >
                            Found Documents ({foundDocuments.length})
                        </button>
                    )}
                    {processedDocuments.length > 0 && (
                        <button
                            className={`tab ${activeTab === 'processed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('processed')}
                        >
                            Processed Documents ({processedDocuments.length})
                        </button>
                    )}
                    {errorDocuments.length > 0 && (
                        <button
                            className={`tab ${activeTab === 'errors' ? 'active' : ''}`}
                            onClick={() => setActiveTab('errors')}
                        >
                            Error Documents ({errorDocuments.length})
                        </button>
                    )}
                </div>

                <div className="table-container">
                    {activeTab === 'found' && foundDocuments.length > 0 && (
                        <FoundDocumentsTable
                            documents={foundDocuments}
                            selectedDocuments={selectedDocuments}
                            onSelectionChange={setSelectedDocuments}
                        />
                    )}

                    {activeTab === 'processed' && processedDocuments.length > 0 && (
                        <ProcessedDocumentsTable
                            documents={processedDocuments}
                            onSaveToExcel={handleSaveToExcel}
                            onDocumentUpdate={handleDocumentUpdate}
                            onRemoveDocuments={handleRemoveDocuments}
                        />
                    )}

                    {activeTab === 'errors' && errorDocuments.length > 0 && (
                        <ErrorDocumentsTable
                            documents={errorDocuments}
                            onDocumentUpdate={handleDocumentUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
