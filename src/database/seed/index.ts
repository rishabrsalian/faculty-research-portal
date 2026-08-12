import { PrismaClient } from '@prisma/client';
import { seedUsers }                           from './01-users.seed';
import { seedFacultyProfiles }                 from './02-faculty-profiles.seed';
import { seedPublicationTypes, seedJournals, seedConferences } from './03-reference-data.seed';
import { seedPublications }                    from './04-publications.seed';
import { seedVenuesAndAuthors }               from './05-venues-authors.seed';
import { seedPatents }                         from './06-patents.seed';
import { seedProjects }                        from './07-projects.seed';
import { seedConferenceContributions, seedProfessionalContributions } from './08-contributions.seed';
import { seedNotifications }                   from './09-notifications.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Faculty Research Portal — Database Seeding Started');
  console.log('═'.repeat(60));

  // Phase 1: Users
  await seedUsers(prisma);

  // Phase 2: Faculty Profiles
  await seedFacultyProfiles(prisma);

  // Phase 3: Reference / Master Data
  await seedPublicationTypes(prisma);
  await seedJournals(prisma);
  await seedConferences(prisma);

  // Phase 4: Core Publications
  await seedPublications(prisma);

  // Phase 5: Venues & Authors
  await seedVenuesAndAuthors(prisma);

  // Phase 6: Patents
  await seedPatents(prisma);

  // Phase 7: Funded Projects
  await seedProjects(prisma);

  // Phase 8: Conference & Professional Contributions
  await seedConferenceContributions(prisma);
  await seedProfessionalContributions(prisma);

  // Phase 9: Notifications
  await seedNotifications(prisma);

  console.log('\n' + '═'.repeat(60));
  console.log('✅  Seeding completed successfully!');
  console.log('\n📊 Summary:');
  const [
    users, faculty, pubTypes, journals, confs,
    pubs, authors, venues, patents, projects,
    confContribs, profContribs, notifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.facultyProfile.count(),
    prisma.publicationType.count(),
    prisma.journal.count(),
    prisma.conference.count(),
    prisma.publication.count(),
    prisma.publicationAuthor.count(),
    prisma.publicationVenue.count(),
    prisma.patent.count(),
    prisma.project.count(),
    prisma.conferenceContribution.count(),
    prisma.professionalContribution.count(),
    prisma.notification.count(),
  ]);

  console.log(`  Users                   : ${users}`);
  console.log(`  Faculty Profiles        : ${faculty}`);
  console.log(`  Publication Types       : ${pubTypes}`);
  console.log(`  Journals                : ${journals}`);
  console.log(`  Conferences             : ${confs}`);
  console.log(`  Publications            : ${pubs}`);
  console.log(`  Publication Authors     : ${authors}`);
  console.log(`  Publication Venues      : ${venues}`);
  console.log(`  Patents                 : ${patents}`);
  console.log(`  Funded Projects         : ${projects}`);
  console.log(`  Conference Contributions: ${confContribs}`);
  console.log(`  Professional Contributions: ${profContribs}`);
  console.log(`  Notifications           : ${notifications}`);
  console.log('\n🔐 Default Credentials:');
  console.log('  Admin    : admin@college.edu     / Admin@123');
  console.log('  Faculty  : arjun.mehta@college.edu / Faculty@123');
  console.log('  (All 30 faculty accounts use password: Faculty@123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Failed to disconnect Prisma after seeding:', e);
    process.exitCode = 1;
  });
