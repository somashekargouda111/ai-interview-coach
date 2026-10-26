import { env } from '../config/env';
import { localDriver } from './local';
import { s3Driver } from './s3';

export const storage = env.STORAGE_DRIVER === 's3' ? s3Driver : localDriver;
