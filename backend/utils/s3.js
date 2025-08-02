const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Debug: Log bucket name
console.log('S3 Bucket Name:', BUCKET_NAME);
console.log('AWS Region:', process.env.AWS_REGION);
console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');

// Upload image to S3
const uploadImage = async (file, folder = 'skyelectrotech') => {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    console.log('Uploading to S3:', {
      bucket: BUCKET_NAME,
      key: fileName,
      contentType: file.mimetype
    });

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    const result = await upload.done();

    return {
      public_id: fileName,
      url: result.Location,
      key: fileName,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Image upload failed');
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'skyelectrotech') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw new Error('Multiple image upload failed');
  }
};

// Delete image from S3
const deleteImage = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    return false;
  }
};

// Delete multiple images
const deleteMultipleImages = async (keys) => {
  try {
    const deletePromises = keys.map(key => deleteImage(key));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Multiple image delete error:', error);
    return false;
  }
};

// Generate presigned URL for private files (if needed)
const generatePresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    throw new Error('Failed to generate presigned URL');
  }
};

// Get file info from S3
const getFileInfo = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error) {
    console.error('Get file info error:', error);
    throw new Error('Failed to get file info');
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  generatePresignedUrl,
  getFileInfo,
}; 