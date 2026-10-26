export interface StorageDriver {
  /** Persists a file and returns a reference string to store in resumes.file_url */
  save(buffer: Buffer, originalName: string): Promise<string>;
  remove(ref: string): Promise<void>;
}
