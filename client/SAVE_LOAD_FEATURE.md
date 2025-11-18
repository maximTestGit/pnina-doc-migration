# Save and Load State Feature

## Overview
The application now supports saving and loading your work progress using CSV files. This allows you to:
- Save your current state at any time
- Continue working on the same data later
- Share progress with colleagues
- Keep backups of your work

## How to Use

### Saving State
1. Click the **💾 Save State** button in the top-right corner of the Dashboard
2. A CSV file will be automatically downloaded with a timestamp (e.g., `app_state_2025-11-18T14-30-45.csv`)
3. The file contains all documents from:
   - Found Documents
   - Processed Documents
   - Error Documents

### Loading State
1. Click the **📂 Load State** button in the top-right corner of the Dashboard
2. Select a previously saved CSV file from your computer
3. The application will restore:
   - All found documents
   - All processed documents with their parsed data
   - All error documents with missing fields and errors
4. You can continue working exactly where you left off

## CSV File Format

The CSV file contains the following columns:
- `documentType`: Type of document (found, processed, error)
- `id`: Document ID
- `name`: Document name
- `url`: Document URL
- `created`: Creation timestamp
- `modified`: Modification timestamp
- `personName`: Patient name (for processed documents)
- `teudatZehut`: Patient ID (for processed documents)
- `appointmentDate`: Appointment date (for processed documents)
- `status`: Processing status (success/error)
- `missingFields`: Semicolon-separated list of missing fields
- `errors`: Semicolon-separated list of errors

## Benefits

1. **Resume Work**: Stop and continue your work anytime without losing progress
2. **Backup**: Create regular backups of your work
3. **Collaboration**: Share CSV files with team members
4. **Audit Trail**: Keep records of processed documents
5. **Data Recovery**: Restore data if the browser session is lost

## Tips

- Save your state regularly, especially before processing large batches
- The Save State button is disabled when there are no documents
- Loading a state will replace your current work (save first if needed)
- CSV files can be opened in Excel for manual review or editing
