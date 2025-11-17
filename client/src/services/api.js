import axios from 'axios';

const FUNCTION_LIST_DOX_URL = import.meta.env.VITE_FUNCTION_LIST_DOX_URL;
const FUNCTION_PARSE_DOC_URL = import.meta.env.VITE_FUNCTION_PARSE_DOC_URL;
const FUNCTION_REGISTER_DOC_URL = import.meta.env.VITE_FUNCTION_REGISTER_DOC_URL;

/**
 * Function 1 - List Documents in Folder
 */
export const listDocuments = async (token, folderId) => {
    try {
        const response = await axios.post(
            FUNCTION_LIST_DOX_URL,
            {
                oauthToken: token,
                folderId
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error listing documents:', error);
        throw error;
    }
};

/**
 * Function 2 - Parse Document
 */
export const parseDocument = async (token, documentId) => {
    try {
        const response = await axios.post(
            FUNCTION_PARSE_DOC_URL,
            {
                oauthToken: token,
                documentId
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error parsing document:', error);
        throw error;
    }
};

/**
 * Function 3 - Save to Google Sheets
 */
export const saveToSheets = async (token, data) => {
    try {
        const response = await axios.post(
            FUNCTION_REGISTER_DOC_URL,
            {
                oauthToken: token,
                data
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error saving to sheets:', error);
        throw error;
    }
};
