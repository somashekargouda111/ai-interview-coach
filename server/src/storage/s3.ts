import type { StorageDriver } from './types';

// Production stub. Implement with @aws-sdk/client-s3 (PutObjectCommand / DeleteObjectCommand),
// store `s3:<key>` in file_url, and serve downloads through short-lived signed URLs.
export const s3Driver: StorageDriver = {
  async save() {
    throw new Error('S3 storage driver is not implemented yet');
  },
  async remove() {
    throw new Error('S3 storage driver is not implemented yet');
  },
};
