import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const pipelineService = {
    /**
     * Uploads a file for full pipeline processing.
     * @param {File} file - The file to upload.
     * @param {Function} onProgress - Callback for upload progress.
     * @returns {Promise<Object>} - The JSON response from the backend.
     */
    processFullPipeline: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/process/full`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });
            return response.data;
        } catch (error) {
            console.error("Pipeline Error:", error);
            throw error;
        }
    },

    /**
     * Checks backend health
     */
    checkHealth: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.status === 200;
        } catch (e) {
            return false;
        }
    }
};
