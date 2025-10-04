import express from 'express';
import { getPresignedUrl, confirmFileUpload, getUserFiles } from '../controllers/handleFileUpload';
import { verifyCognitoToken } from '../middleware/cognitoAuth';

const router = express.Router();

// Route to get presigned URL for file upload
router.post('/presigned-url', verifyCognitoToken, async (req, res) => {
    console.log('🚀 === PRESIGNED URL REQUEST START ===');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User from token:', JSON.stringify(req.user, null, 2));
    console.log('🌍 Environment variables:');
    console.log('   - S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
    console.log('   - AWS_REGION:', process.env.AWS_REGION);
    
    try {
        const { fileName } = req.body;
        
        console.log('🔍 Validating input...');
        console.log('   - fileName:', fileName);
        console.log('   - fileName type:', typeof fileName);
        
        // Validate input
        if (!fileName) {
            console.log('❌ Validation failed: fileName is required');
            return res.status(400).json({ 
                error: 'fileName is required in request body' 
            });
        }

        // Get userId from Cognito user (sub is the user ID)
        const userId = req.user?.sub;
        console.log('👤 Extracted userId:', userId);
        
        if (!userId) {
            console.log('❌ No userId found in token');
            return res.status(400).json({ 
                error: 'User ID not found in token' 
            });
        }
        
        console.log('✅ Input validation passed, calling getPresignedUrl...');
        const result = await getPresignedUrl(userId, fileName);
        
        console.log('✅ getPresignedUrl completed successfully');
        const response = {
            success: true,
            data: result
        };
        
        console.log('📤 Sending response:', JSON.stringify(response, null, 2));
        console.log('🎉 === PRESIGNED URL REQUEST END ===');
        
        return res.json(response);
    } catch (error: any) {
        console.error('💥 === PRESIGNED URL REQUEST ERROR ===');
        console.error('❌ Error in presigned URL route:');
        console.error('   - Error type:', error?.constructor?.name || 'Unknown');
        console.error('   - Error message:', error?.message || 'No message');
        console.error('   - Error stack:', error?.stack || 'No stack');
        console.error('   - Request body:', JSON.stringify(req.body, null, 2));
        console.error('   - User:', JSON.stringify(req.user, null, 2));
        console.error('💥 === ERROR END ===');
        
        return res.status(500).json({ 
            error: 'Failed to generate upload URL',
            message: error instanceof Error ? error.message : 'Unknown error',
            debug: {
                errorType: error?.constructor?.name || 'Unknown',
                timestamp: new Date().toISOString()
            }
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