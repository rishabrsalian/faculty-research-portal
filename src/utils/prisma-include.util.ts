/**
 * Prisma `include`/`select` fragments reused across services.
 */

/** Minimal user fields exposed with a faculty profile. */
export const userSummarySelect = {
  select: { id: true, name: true, email: true },
} as const;

/** Faculty owner of a resource, with only the user's display name. */
export const facultyWithUserNameInclude = {
  faculty: { include: { user: { select: { name: true } } } },
} as const;

/** Everything a full faculty profile response embeds. */
export const facultyProfileInclude = {
  user: userSummarySelect,
  publications: true,
  patents: true,
  projects: true,
  conferenceContributions: true,
  professionalContributions: true,
} as const;
