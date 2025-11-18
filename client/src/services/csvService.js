// CSV Service for saving and loading application state

/**
 * Export the current state to a CSV file
 */
export const exportStateToCSV = (foundDocuments, processedDocuments, errorDocuments, hiddenDocuments = []) => {
    const allDocuments = [];

    // Add found documents
    foundDocuments.forEach(doc => {
        allDocuments.push({
            documentType: 'found',
            id: doc.id || '',
            name: doc.name || '',
            url: doc.url || '',
            created: doc.created || '',
            modified: doc.modified || '',
            personName: '',
            teudatZehut: '',
            appointmentDate: '',
            status: '',
            missingFields: '',
            errors: ''
        });
    });

    // Add processed documents
    processedDocuments.forEach(doc => {
        allDocuments.push({
            documentType: 'processed',
            id: doc.id || '',
            name: doc.name || '',
            url: doc.url || '',
            created: doc.created || doc.createdTime || '',
            modified: doc.modified || doc.modifiedTime || '',
            personName: doc.personName || '',
            teudatZehut: doc.teudatZehut || '',
            appointmentDate: doc.appointmentDate || '',
            status: doc.status || '',
            missingFields: doc.missingFields?.join(';') || '',
            errors: doc.errors?.join(';') || ''
        });
    });

    // Add error documents (if not already in processed)
    const processedIds = new Set(processedDocuments.map(d => d.id));
    errorDocuments.forEach(doc => {
        if (!processedIds.has(doc.id)) {
            allDocuments.push({
                documentType: 'error',
                id: doc.id || '',
                name: doc.name || '',
                url: doc.url || '',
                created: doc.created || doc.createdTime || '',
                modified: doc.modified || doc.modifiedTime || '',
                personName: doc.personName || '',
                teudatZehut: doc.teudatZehut || '',
                appointmentDate: doc.appointmentDate || '',
                status: doc.status || 'error',
                missingFields: doc.missingFields?.join(';') || '',
                errors: doc.errors?.join(';') || ''
            });
        }
    });

    // Add hidden documents
    hiddenDocuments.forEach(doc => {
        allDocuments.push({
            documentType: 'hidden',
            id: doc.id || '',
            name: doc.name || '',
            url: doc.url || '',
            created: doc.created || '',
            modified: doc.modified || '',
            personName: '',
            teudatZehut: '',
            appointmentDate: '',
            status: '',
            missingFields: '',
            errors: ''
        });
    });

    // Convert to CSV
    const headers = ['documentType', 'id', 'name', 'url', 'created', 'modified', 'personName', 'teudatZehut', 'appointmentDate', 'status', 'missingFields', 'errors'];
    const csvContent = [
        headers.join(','),
        ...allDocuments.map(row =>
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
    link.setAttribute('download', `app_state_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return allDocuments.length;
};

/**
 * Import state from a CSV file
 */
export const importStateFromCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');

                if (lines.length < 2) {
                    reject(new Error('CSV file is empty or invalid'));
                    return;
                }

                // Parse header
                const headers = parseCSVLine(lines[0]);

                // Validate headers
                const requiredHeaders = ['documentType', 'id', 'name'];
                const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
                if (!hasRequiredHeaders) {
                    reject(new Error('CSV file is missing required headers'));
                    return;
                }

                // Parse data
                const foundDocuments = [];
                const processedDocuments = [];
                const errorDocuments = [];
                const hiddenDocuments = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const values = parseCSVLine(line);
                    if (values.length !== headers.length) continue;

                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index];
                    });

                    const doc = {
                        id: row.id,
                        name: row.name,
                        url: row.url,
                        created: row.created,
                        modified: row.modified,
                        personName: row.personName,
                        teudatZehut: row.teudatZehut,
                        appointmentDate: row.appointmentDate,
                        status: row.status,
                        missingFields: row.missingFields ? row.missingFields.split(';').filter(f => f) : [],
                        errors: row.errors ? row.errors.split(';').filter(e => e) : []
                    };

                    if (row.documentType === 'found') {
                        foundDocuments.push({
                            id: doc.id,
                            name: doc.name,
                            url: doc.url,
                            created: doc.created,
                            modified: doc.modified
                        });
                    } else if (row.documentType === 'processed') {
                        processedDocuments.push(doc);
                        // Also add to error documents if it has errors or missing fields
                        if (doc.missingFields?.length > 0 || doc.errors?.length > 0 || doc.status === 'error') {
                            errorDocuments.push(doc);
                        }
                    } else if (row.documentType === 'error') {
                        errorDocuments.push(doc);
                    } else if (row.documentType === 'hidden') {
                        hiddenDocuments.push({
                            id: doc.id,
                            name: doc.name,
                            url: doc.url,
                            created: doc.created,
                            modified: doc.modified
                        });
                    }
                }

                resolve({
                    foundDocuments,
                    processedDocuments,
                    errorDocuments,
                    hiddenDocuments,
                    totalCount: foundDocuments.length + processedDocuments.length + errorDocuments.length + hiddenDocuments.length
                });

            } catch (error) {
                reject(new Error('Failed to parse CSV file: ' + error.message));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
};

/**
 * Parse a CSV line handling quoted values
 */
const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    values.push(current);

    return values;
};
