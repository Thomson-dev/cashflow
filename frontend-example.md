# Frontend File Upload Implementation Guide

## Overview
This guide shows how to implement file upload to S3 using presigned URLs from your frontend.

## API Endpoints

### 1. Get Presigned URL
```
POST /api/file-upload/presigned-url
Headers: Authorization: Bearer <token>
Body: { "fileName": "document.pdf" }
```

### 2. Confirm Upload
```
POST /api/file-upload/confirm-upload
Headers: Authorization: Bearer <token>
Body: { "fileId": "file_id_from_step_1", "fileSize": 1024000 }
```

### 3. Get User Files
```
GET /api/file-upload/files
Headers: Authorization: Bearer <token>
```

## Frontend Implementation Examples

### React/JavaScript Example

```javascript
// File upload component
const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Step 1: Get presigned URL
      const response = await fetch('/api/file-upload/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fileName: file.name })
      });

      const { data } = await response.json();
      const { uploadUrl, fileId } = data;

      // Step 2: Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        },
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Step 3: Confirm upload
      await fetch('/api/file-upload/confirm-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          fileId, 
          fileSize: file.size 
        })
      });

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.csv"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) uploadFile(file);
        }}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <p>Uploading... {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}
    </div>
  );
};
```

### Using Axios (with progress tracking)

```javascript
import axios from 'axios';

const uploadFileWithAxios = async (file) => {
  try {
    // Step 1: Get presigned URL
    const { data } = await axios.post('/api/file-upload/presigned-url', 
      { fileName: file.name },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const { uploadUrl, fileId } = data.data;

    // Step 2: Upload to S3 with progress tracking
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${progress}%`);
      }
    });

    // Step 3: Confirm upload
    await axios.post('/api/file-upload/confirm-upload', 
      { fileId, fileSize: file.size },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    console.log('File uploaded successfully!');
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
```

### Drag & Drop Component

```javascript
const DragDropUpload = () => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type === 'application/pdf' || file.type === 'text/csv') {
        uploadFile(file);
      } else {
        alert('Only PDF and CSV files are allowed');
      }
    });
  };

  return (
    <div
      className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <p>Drag & drop PDF or CSV files here, or click to select</p>
      <input
        type="file"
        accept=".pdf,.csv"
        multiple
        onChange={(e) => {
          Array.from(e.target.files).forEach(uploadFile);
        }}
      />
    </div>
  );
};
```

## File Validation

### Client-side validation
```javascript
const validateFile = (file) => {
  const allowedTypes = ['application/pdf', 'text/csv'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF and CSV files are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  return true;
};
```

## Error Handling

```javascript
const handleUploadError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 400) {
    alert('Invalid file or request');
  } else if (error.response?.status === 500) {
    alert('Server error. Please try again later.');
  } else {
    alert('Upload failed: ' + error.message);
  }
};
```

## Security Considerations

1. **File Type Validation**: Always validate file types on both client and server
2. **File Size Limits**: Implement reasonable file size limits
3. **Authentication**: Ensure all requests are authenticated
4. **CORS**: Configure CORS properly for your domain
5. **Rate Limiting**: Consider implementing rate limiting for upload endpoints

## Best Practices

1. **Progress Tracking**: Always show upload progress to users
2. **Error Handling**: Provide clear error messages
3. **File Validation**: Validate files before uploading
4. **Cleanup**: Handle failed uploads and cleanup incomplete files
5. **User Feedback**: Show success/failure messages clearly
