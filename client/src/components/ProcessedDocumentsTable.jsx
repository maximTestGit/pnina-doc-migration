import React, { useState, useMemo } from 'react';
import './ProcessedDocumentsTable.css';

const ProcessedDocumentsTable = ({ documents, onSaveToExcel, onDocumentUpdate, onRemoveDocuments }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterText, setFilterText] = useState('');
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [editingCell, setEditingCell] = useState(null);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleCellEdit = (docId, field, value) => {
        const doc = documents.find(d => d.id === docId);
        const updatedDoc = { ...doc, [field]: value };

        // Recalculate missing fields
        const missingFields = [];
        if (!updatedDoc.personName) missingFields.push('personName');
        if (!updatedDoc.teudatZehut) missingFields.push('teudatZehut');
        if (!updatedDoc.appointmentDate) missingFields.push('appointmentDate');
        updatedDoc.missingFields = missingFields;

        onDocumentUpdate(updatedDoc);
        setEditingCell(null);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDocs(filteredAndSorted.map(doc => doc.id));
        } else {
            setSelectedDocs([]);
        }
    };

    const handleSelectOne = (docId) => {
        if (selectedDocs.includes(docId)) {
            setSelectedDocs(selectedDocs.filter(id => id !== docId));
        } else {
            setSelectedDocs([...selectedDocs, docId]);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let filtered = documents;

        // Apply error filter
        if (showOnlyErrors) {
            filtered = documents.filter(doc =>
                doc.status === 'error' ||
                doc.missingFields?.length > 0 ||
                doc.errors?.length > 0
            );
        }

        // Apply text filter
        if (filterText) {
            filtered = filtered.filter(doc =>
                doc.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                doc.personName?.toLowerCase().includes(filterText.toLowerCase()) ||
                doc.teudatZehut?.toLowerCase().includes(filterText.toLowerCase()) ||
                doc.appointmentDate?.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        // Apply sort
        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [documents, filterText, showOnlyErrors, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const isMissingField = (doc, field) => {
        return doc.missingFields?.includes(field);
    };

    const handleSaveSelected = () => {
        const docsToSave = documents.filter(doc => selectedDocs.includes(doc.id));
        onSaveToExcel(docsToSave);
    };

    const handleRemoveSelected = () => {
        if (selectedDocs.length === 0) {
            return;
        }

        if (window.confirm(`Are you sure you want to remove ${selectedDocs.length} selected document(s)?`)) {
            onRemoveDocuments(selectedDocs);
            setSelectedDocs([]);
        }
    };

    return (
        <div className="processed-documents-table">
            <div className="table-header">
                <h3>Processed Documents</h3>
                <div className="table-controls">
                    <label className="error-filter">
                        <input
                            type="checkbox"
                            checked={showOnlyErrors}
                            onChange={(e) => setShowOnlyErrors(e.target.checked)}
                        />
                        <span>Show only errors</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filter-input"
                    />
                    <button
                        onClick={handleRemoveSelected}
                        disabled={selectedDocs.length === 0}
                        className="remove-button"
                    >
                        Remove Selected ({selectedDocs.length})
                    </button>
                    <button
                        onClick={handleSaveSelected}
                        disabled={selectedDocs.length === 0}
                        className="save-button"
                    >
                        Export Selected to Excel ({selectedDocs.length})
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={selectedDocs.length === filteredAndSorted.length && filteredAndSorted.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('itemName')} className="sortable">
                                Item Name {getSortIcon('itemName')}
                            </th>
                            <th onClick={() => handleSort('personName')} className="sortable">
                                Patient Name {getSortIcon('personName')}
                            </th>
                            <th onClick={() => handleSort('teudatZehut')} className="sortable">
                                Patient ID {getSortIcon('teudatZehut')}
                            </th>
                            <th onClick={() => handleSort('appointmentDate')} className="sortable">
                                Appointment Date {getSortIcon('appointmentDate')}
                            </th>
                            <th onClick={() => handleSort('status')} className="sortable">
                                Status {getSortIcon('status')}
                            </th>
                            <th>Missing Fields</th>
                            <th>Errors</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSorted.map((doc) => (
                            <tr key={doc.id} className={doc.status === 'error' ? 'error-row' : ''}>
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc.id)}
                                        onChange={() => handleSelectOne(doc.id)}
                                    />
                                </td>
                                <td>{doc.name}</td>
                                <td className="item-name-col">
                                    {doc.personName || ''} - {doc.teudatZehut || ''} - {doc.appointmentDate || ''}
                                </td>
                                <td
                                    className={`editable ${isMissingField(doc, 'personName') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'personName' })}
                                >
                                    {editingCell?.docId === doc.id && editingCell?.field === 'personName' ? (
                                        <input
                                            type="text"
                                            defaultValue={doc.personName || ''}
                                            autoFocus
                                            onBlur={(e) => handleCellEdit(doc.id, 'personName', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleCellEdit(doc.id, 'personName', e.target.value);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        doc.personName || '-'
                                    )}
                                </td>
                                <td
                                    className={`editable ${isMissingField(doc, 'teudatZehut') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'teudatZehut' })}
                                >
                                    {editingCell?.docId === doc.id && editingCell?.field === 'teudatZehut' ? (
                                        <input
                                            type="text"
                                            defaultValue={doc.teudatZehut || ''}
                                            autoFocus
                                            onBlur={(e) => handleCellEdit(doc.id, 'teudatZehut', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleCellEdit(doc.id, 'teudatZehut', e.target.value);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        doc.teudatZehut || '-'
                                    )}
                                </td>
                                <td
                                    className={`editable ${isMissingField(doc, 'appointmentDate') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'appointmentDate' })}
                                >
                                    {editingCell?.docId === doc.id && editingCell?.field === 'appointmentDate' ? (
                                        <input
                                            type="text"
                                            defaultValue={doc.appointmentDate || ''}
                                            autoFocus
                                            onBlur={(e) => handleCellEdit(doc.id, 'appointmentDate', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleCellEdit(doc.id, 'appointmentDate', e.target.value);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        doc.appointmentDate || '-'
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge ${doc.status}`}>
                                        {doc.status === 'success' ? 'Success' : 'Error'}
                                    </span>
                                </td>
                                <td>
                                    {doc.missingFields?.length > 0 ? (
                                        <span className="missing-fields">{doc.missingFields.join(', ')}</span>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    {doc.errors?.length > 0 ? (
                                        <span className="error-text">{doc.errors.join(', ')}</span>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">
                                        Open
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                Showing {filteredAndSorted.length} of {documents.length} documents
                {selectedDocs.length > 0 && ` • ${selectedDocs.length} selected`}
            </div>
        </div>
    );
};

export default ProcessedDocumentsTable;
