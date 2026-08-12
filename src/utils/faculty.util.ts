import { prisma } from '../config/database';

/**
 * Resolves the faculty profile id owned by a user, if any.
 */
export async function getFacultyIdFromUserId(userId: string): Promise<string | undefined> {
  const profile = await prisma.facultyProfile.findUnique({ where: { userId } });
  return profile?.id;
}
