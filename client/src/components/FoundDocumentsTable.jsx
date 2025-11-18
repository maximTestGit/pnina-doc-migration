import React, { useState, useMemo } from 'react';
import './FoundDocumentsTable.css';

const FoundDocumentsTable = ({ documents, selectedDocuments, onSelectionChange, processedDocumentIds = [] }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filterText, setFilterText] = useState('');
    const [showUnprocessedOnly, setShowUnprocessedOnly] = useState(false);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectionChange(filteredAndSorted.map(doc => doc.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectOne = (docId) => {
        if (selectedDocuments.includes(docId)) {
            onSelectionChange(selectedDocuments.filter(id => id !== docId));
        } else {
            onSelectionChange([...selectedDocuments, docId]);
        }
    };

    const filteredAndSorted = useMemo(() => {
        let filtered = documents;

        // Apply unprocessed filter
        if (showUnprocessedOnly) {
            filtered = filtered.filter(doc => !processedDocumentIds.includes(doc.id));
        }

        // Apply text filter
        if (filterText) {
            filtered = filtered.filter(doc =>
                doc.name?.toLowerCase().includes(filterText.toLowerCase()) ||
                doc.id?.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        // Apply sort
        if (sortConfig.key) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (sortConfig.key === 'created' || sortConfig.key === 'modified') {
                    return sortConfig.direction === 'asc'
                        ? new Date(aVal) - new Date(bVal)
                        : new Date(bVal) - new Date(aVal);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [documents, filterText, sortConfig, showUnprocessedOnly, processedDocumentIds]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('he-IL');
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="found-documents-table">
            <div className="table-header">
                <h3>Found Documents</h3>
                <div className="table-controls">
                    <label className="unprocessed-filter">
                        <input
                            type="checkbox"
                            checked={showUnprocessedOnly}
                            onChange={(e) => setShowUnprocessedOnly(e.target.checked)}
                        />
                        <span>Show unprocessed only</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Filter by name or ID..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={selectedDocuments.length === filteredAndSorted.length && filteredAndSorted.length > 0}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => handleSort('id')} className="sortable">
                                ID {getSortIcon('id')}
                            </th>
                            <th onClick={() => handleSort('created')} className="sortable">
                                Created {getSortIcon('created')}
                            </th>
                            <th onClick={() => handleSort('modified')} className="sortable">
                                Modified {getSortIcon('modified')}
                            </th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSorted.map((doc) => (
                            <tr key={doc.id}>
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocuments.includes(doc.id)}
                                        onChange={() => handleSelectOne(doc.id)}
                                    />
                                </td>
                                <td>{doc.name}</td>
                                <td className="id-col">{doc.id}</td>
                                <td>{formatDate(doc.created)}</td>
                                <td>{formatDate(doc.modified)}</td>
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
                {selectedDocuments.length > 0 && ` • ${selectedDocuments.length} selected`}
            </div>
        </div>
    );
};

export default FoundDocumentsTable;
