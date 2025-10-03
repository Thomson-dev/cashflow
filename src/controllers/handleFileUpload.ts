import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from '../config/dynamodb';
import { FileUpload } from '../models/FileUpload';
import { randomUUID } from 'crypto';

// Create an S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'pdf': 'application/pdf',
  'csv': 'text/csv'
};

// Function to get content type from file extension
function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return ALLOWED_FILE_TYPES[extension as keyof typeof ALLOWED_FILE_TYPES] || 'application/octet-stream';
}

// Function to validate file
function validateFile(fileName: string): { isValid: boolean; error?: string; fileType?: string } {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return { isValid: false, error: 'File must have an extension' };
  }
  
  if (!ALLOWED_FILE_TYPES[extension as keyof typeof ALLOWED_FILE_TYPES]) {
    return { isValid: false, error: 'Only PDF and CSV files are allowed' };
  }
  
  return { isValid: true, fileType: extension };
}

// Function to create presigned URL
export async function getPresignedUrl(userId: string, fileName: string) {
  try {
    // Validate file
    const validation = validateFile(fileName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate unique file name to prevent conflicts
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const s3Key = `users/${userId}/uploads/${uniqueFileName}`;
    const fileId = randomUUID();
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: getContentType(fileName),
      Metadata: {
        'original-name': fileName,
        'uploaded-by': userId,
        'upload-timestamp': timestamp.toString()
      }
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 minutes
    
    // Create database record
    const now = new Date().toISOString();
    const fileUpload: FileUpload = {
      fileId,
      userId,
      originalName: fileName,
      fileName: uniqueFileName,
      s3Key,
      fileType: validation.fileType as 'pdf' | 'csv',
      uploadedAt: now,
      status: 'pending',
      metadata: {
        contentType: getContentType(fileName)
      },
      createdAt: now,
      updatedAt: now
    };
    
    await dynamoDb.send(new PutCommand({
      TableName: TABLES.FILE_UPLOADS,
      Item: fileUpload
    }));
    
    return {
      uploadUrl: url,
      fileName: uniqueFileName,
      originalName: fileName,
      s3Key,
      fileId
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// Function to confirm file upload
export async function confirmFileUpload(fileId: string, fileSize?: number) {
  try {
    const now = new Date().toISOString();
    
    await dynamoDb.send(new UpdateCommand({
      TableName: TABLES.FILE_UPLOADS,
      Key: { fileId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt' + (fileSize ? ', fileSize = :fileSize' : ''),
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'uploaded',
        ':updatedAt': now,
        ...(fileSize && { ':fileSize': fileSize })
      },
      ConditionExpression: 'attribute_exists(fileId)'
    }));

    // Get updated record
    const result = await dynamoDb.send(new GetCommand({
      TableName: TABLES.FILE_UPLOADS,
      Key: { fileId }
    }));

    return result.Item;
  } catch (error) {
    console.error('Error confirming file upload:', error);
    throw error;
  }
}

// Function to get user's uploaded files
export async function getUserFiles(userId: string) {
  try {
    const result = await dynamoDb.send(new QueryCommand({
      TableName: TABLES.FILE_UPLOADS,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Most recent first
    }));
    
    return result.Items || [];
  } catch (error) {
    console.error('Error fetching user files:', error);
    throw error;
  }
}
