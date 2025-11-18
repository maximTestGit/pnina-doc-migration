import React, { useState, useMemo } from 'react';
import './ErrorDocumentsTable.css';

const ErrorDocumentsTable = ({ documents, onDocumentUpdate, onRemoveFromErrors, onHideDocuments }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterText, setFilterText] = useState('');
    const [editingCell, setEditingCell] = useState(null);
    const [selectedDocs, setSelectedDocs] = useState([]);

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

    const handleRemoveSelected = () => {
        if (selectedDocs.length === 0) {
            return;
        }

        if (window.confirm(`Remove ${selectedDocs.length} document(s) from error list? They will remain in processed documents with any changes you made.`)) {
            onRemoveFromErrors(selectedDocs);
            setSelectedDocs([]);
        }
    };

    const handleHideSelected = () => {
        if (selectedDocs.length === 0) {
            return;
        }

        if (window.confirm(`Hide ${selectedDocs.length} document(s)? They will be removed from all lists and moved to hidden documents.`)) {
            onHideDocuments(selectedDocs);
            setSelectedDocs([]);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let filtered = documents;

        // Apply text filter
        if (filterText) {
            filtered = documents.filter(doc =>
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
    }, [documents, filterText, sortConfig]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const isMissingField = (doc, field) => {
        return doc.missingFields?.includes(field);
    };

    return (
        <div className="error-documents-table">
            <div className="table-header">
                <h3>Error Documents</h3>
                <div className="table-controls">
                    <button
                        onClick={handleHideSelected}
                        disabled={selectedDocs.length === 0}
                        className="hide-button"
                    >
                        Hide Selected ({selectedDocs.length})
                    </button>
                    <button
                        onClick={handleRemoveSelected}
                        disabled={selectedDocs.length === 0}
                        className="remove-from-errors-button"
                    >
                        Remove Selected from Errors ({selectedDocs.length})
                    </button>
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            <div className="alert-info">
                <strong>⚠️ Documents with Missing or Incorrect Fields</strong>
                <p>Click on any highlighted field to edit it. Fields with yellow background are missing.</p>
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
                            <th onClick={() => handleSort('personName')} className="sortable">
                                Patient Name {getSortIcon('personName')}
                            </th>
                            <th onClick={() => handleSort('teudatZehut')} className="sortable">
                                Patient ID {getSortIcon('teudatZehut')}
                            </th>
                            <th onClick={() => handleSort('appointmentDate')} className="sortable">
                                Appointment Date {getSortIcon('appointmentDate')}
                            </th>
                            <th>Missing Fields</th>
                            <th>Errors</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSorted.map((doc) => (
                            <tr key={doc.id} className="error-row">
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc.id)}
                                        onChange={() => handleSelectOne(doc.id)}
                                    />
                                </td>
                                <td>{doc.name}</td>
                                <td
                                    className={`editable ${isMissingField(doc, 'personName') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'personName' })}
                                    title={isMissingField(doc, 'personName') ? 'Missing - Click to edit' : 'Click to edit'}
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
                                                if (e.key === 'Escape') {
                                                    setEditingCell(null);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        <span className="cell-content">
                                            {doc.personName || '-'}
                                            {isMissingField(doc, 'personName') && <span className="edit-hint">✏️</span>}
                                        </span>
                                    )}
                                </td>
                                <td
                                    className={`editable ${isMissingField(doc, 'teudatZehut') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'teudatZehut' })}
                                    title={isMissingField(doc, 'teudatZehut') ? 'Missing - Click to edit' : 'Click to edit'}
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
                                                if (e.key === 'Escape') {
                                                    setEditingCell(null);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        <span className="cell-content">
                                            {doc.teudatZehut || '-'}
                                            {isMissingField(doc, 'teudatZehut') && <span className="edit-hint">✏️</span>}
                                        </span>
                                    )}
                                </td>
                                <td
                                    className={`editable ${isMissingField(doc, 'appointmentDate') ? 'missing-field' : ''}`}
                                    onClick={() => setEditingCell({ docId: doc.id, field: 'appointmentDate' })}
                                    title={isMissingField(doc, 'appointmentDate') ? 'Missing - Click to edit' : 'Click to edit'}
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
                                                if (e.key === 'Escape') {
                                                    setEditingCell(null);
                                                }
                                            }}
                                            className="cell-input"
                                        />
                                    ) : (
                                        <span className="cell-content">
                                            {doc.appointmentDate || '-'}
                                            {isMissingField(doc, 'appointmentDate') && <span className="edit-hint">✏️</span>}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {doc.missingFields?.length > 0 ? (
                                        <div className="missing-fields-list">
                                            {doc.missingFields.map((field, idx) => (
                                                <span key={idx} className="field-badge missing">
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    {doc.errors?.length > 0 ? (
                                        <div className="errors-list">
                                            {doc.errors.map((error, idx) => (
                                                <div key={idx} className="error-item">
                                                    {error}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">
                                        Open Document
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                Showing {filteredAndSorted.length} error document(s)
                {selectedDocs.length > 0 && ` • ${selectedDocs.length} selected`}
            </div>
        </div>
    );
};

export default ErrorDocumentsTable;
