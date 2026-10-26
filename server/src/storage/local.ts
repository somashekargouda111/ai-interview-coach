import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import type { StorageDriver } from './types';

const dir = path.resolve(env.UPLOAD_DIR);

// Files are intentionally NOT served statically: resumes are private.
export const localDriver: StorageDriver = {
  async save(buffer, originalName) {
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(originalName).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const name = `${randomUUID()}${ext}`;
    await fs.writeFile(path.join(dir, name), buffer);
    return `local:${name}`;
  },
  async remove(ref) {
    if (!ref.startsWith('local:')) return;
    await fs.rm(path.join(dir, path.basename(ref.slice(6))), { force: true });
  },
};
