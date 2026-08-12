import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '../../../src/config/cloudinary';

jest.mock('cloudinary', () => ({
  v2: { config: jest.fn() },
}));

describe('cloudinary config', () => {
  it('configures the SDK from the environment and forces HTTPS urls', () => {
    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: process.env['CLOUDINARY_CLOUD_NAME'],
      api_key: process.env['CLOUDINARY_API_KEY'],
      api_secret: process.env['CLOUDINARY_API_SECRET'],
      secure: true,
    });
  });

  it('namespaces every upload folder under the app root', () => {
    expect(Object.values(CLOUDINARY_FOLDERS)).toHaveLength(5);
    for (const folder of Object.values(CLOUDINARY_FOLDERS)) {
      expect(folder).toMatch(/^faculty-research-portal\/[a-z]+$/);
    }
  });
});
