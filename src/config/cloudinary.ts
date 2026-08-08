import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

/**
 * Cloudinary SDK Configuration
 *
 * Used by the upload service to store:
 * - Faculty avatars
 * - Publication evidence (PDFs, certificates)
 * - Patent and project documents
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS URLs
});

export { cloudinary };

/**
 * Cloudinary upload folder structure:
 * faculty-research-portal/
 *   ├── avatars/          ← faculty profile photos
 *   ├── evidence/         ← publication proof documents
 *   ├── patents/          ← patent documents
 *   ├── projects/         ← project sanction letters
 *   └── contributions/    ← other professional contribution docs
 */
export const CLOUDINARY_FOLDERS = {
  AVATARS: 'faculty-research-portal/avatars',
  EVIDENCE: 'faculty-research-portal/evidence',
  PATENTS: 'faculty-research-portal/patents',
  PROJECTS: 'faculty-research-portal/projects',
  CONTRIBUTIONS: 'faculty-research-portal/contributions',
} as const;
