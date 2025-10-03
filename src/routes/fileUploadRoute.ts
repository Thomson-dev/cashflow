import express from 'express';
import { getPresignedUrl, confirmFileUpload, getUserFiles } from '../controllers/handleFileUpload';
import { verifyCognitoToken } from '../middleware/cognitoAuth';

const router = express.Router();

// Route to get presigned URL for file upload
router.post('/presigned-url', verifyCognitoToken, async (req, res) => {
    try {
        const { fileName } = req.body;
        
        // Validate input
        if (!fileName) {
            return res.status(400).json({ 
                error: 'fileName is required in request body' 
            });
        }

        // Get userId from Cognito user (sub is the user ID)
        const userId = req.user.sub;
        
        const result = await getPresignedUrl(userId, fileName);
        
        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error in presigned URL route:', error);
        return res.status(500).json({ 
            error: 'Failed to generate upload URL',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to confirm file upload
router.post('/confirm-upload', verifyCognitoToken, async (req, res) => {
    try {
        const { fileId, fileSize } = req.body;
        
        if (!fileId) {
            return res.status(400).json({ 
                error: 'fileId is required' 
            });
        }
        
        const result = await confirmFileUpload(fileId, fileSize);
        
        return res.json({
            success: true,
            message: 'File upload confirmed',
            data: result
        });
    } catch (error) {
        console.error('Error confirming upload:', error);
        return res.status(500).json({ 
            error: 'Failed to confirm upload',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to get user's uploaded files
router.get('/files', verifyCognitoToken, async (req, res) => {
    try {
        const userId = req.user.sub;
        const files = await getUserFiles(userId);
        
        return res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('Error fetching user files:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch files',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;