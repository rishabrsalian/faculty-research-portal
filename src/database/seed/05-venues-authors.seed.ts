import { PrismaClient } from '@prisma/client';

/**
 * Seeds publication venues linking publications to journals/conferences
 * and adds publication authors for each paper.
 */
export async function seedVenuesAndAuthors(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding publication venues & authors...');

  const allPublications = await prisma.publication.findMany({
    include: { publicationType: true, faculty: { include: { user: true } } },
  });

  // Preload journal and conference IDs
  const journals   = await prisma.journal.findMany();
  const conferences = await prisma.conference.findMany();

  const journalMap  = Object.fromEntries(journals.map(j   => [j.shortName, j.id]));
  const confMap     = Object.fromEntries(conferences.map(c => [c.shortName, c.id]));

  // Map from title keywords → journal/conference
  const venueRules: Array<{keyword: string; journalKey?: string; confKey?: string}> = [
    { keyword: 'IoT Networks Using Attention',     journalKey: 'IEEE TNNLS' },
    { keyword: 'Federated Learning for Privacy',   journalKey: 'ESWA' },
    { keyword: 'Transformer-Based Anomaly',        confKey: 'ICML' },
    { keyword: 'Low Power VLSI',                   journalKey: 'IEEE Access' },
    { keyword: 'Approximate Computing',            journalKey: 'CEE' },
    { keyword: 'Thermal Performance Enhancement',  journalKey: 'RSER' },
    { keyword: 'Solar Parabolic',                  journalKey: 'RSER' },
    { keyword: 'Scalable Real-Time Stream',        journalKey: 'FGCS' },
    { keyword: 'Explainable AI for Predictive',    confKey: 'ICGCIoT' },
    { keyword: 'Optimal Energy Management',        journalKey: 'RSER' },
    { keyword: 'Demand Response Management',       journalKey: 'IJEPES' },
    { keyword: 'Comprehensive Review of Solar',    journalKey: 'RSER' },
    { keyword: 'Blockchain-Based Decentralized',   journalKey: 'JNCA' },
    { keyword: 'Zero-Trust Security',              confKey: 'ICISS' },
    { keyword: 'Seismic Performance of RC',        journalKey: 'ES' },
    { keyword: 'Massive MIMO Beamforming',         journalKey: 'IEEE Access' },
    { keyword: 'Channel Estimation in OFDM',       confKey: 'ICACCS' },
    { keyword: 'Multi-Objective Optimization of CNC', journalKey: 'IJAMT' },
    { keyword: 'Graph Neural Networks for Autonomous', journalKey: 'ESWA' },
    { keyword: 'Model Predictive Control of HVAC', journalKey: 'IJEPES' },
    { keyword: 'Adsorption of Heavy Metals',       journalKey: 'JCP' },
    { keyword: 'Silicon Photonics',                journalKey: 'MEE' },
    { keyword: 'Energy-Aware Resource Scheduling', journalKey: 'FGCS' },
    { keyword: 'Container Orchestration',          journalKey: 'FGCS' },
    { keyword: 'Liquefaction Potential',           journalKey: 'CBM' },
    { keyword: 'Bidirectional DC-DC Converter',    journalKey: 'JPS' },
    { keyword: 'State of Health Estimation',       journalKey: 'JPS' },
    { keyword: 'Rutting Performance',              journalKey: 'CBM' },
    { keyword: 'Partial Discharge Detection',      journalKey: 'IJEPES' },
    { keyword: 'Topology Optimization of Lattice', journalKey: 'IJAMT' },
    { keyword: 'Effect of Process Parameters',     journalKey: 'IJAMT' },
    { keyword: 'Wideband Circularly Polarized',    journalKey: 'IEEE Access' },
    { keyword: 'Reconfigurable Dual-Band',         journalKey: 'IEEE Access' },
    { keyword: 'Aspect-Level Sentiment',           journalKey: 'ASC' },
    { keyword: 'Deep CNN Architecture for Automated', journalKey: 'ESWA' },
    { keyword: 'EEG-Based Motor Imagery',          journalKey: 'ASC' },
    { keyword: 'Vibration Fatigue Analysis',       journalKey: 'IJAMT' },
    { keyword: 'Multi-Body Dynamics',              journalKey: 'IJAMT' },
  ];

  let venueCount = 0;
  for (const pub of allPublications) {
    // Match venue
    const rule = venueRules.find(r => pub.title.includes(r.keyword.substring(0, 20)));
    if (rule) {
      const journalId   = rule.journalKey   ? journalMap[rule.journalKey]   : null;
      const conferenceId = rule.confKey     ? confMap[rule.confKey]          : null;

      if (journalId || conferenceId) {
        await prisma.publicationVenue.upsert({
          where: { publicationId: pub.id },
          update: {},
          create: { publicationId: pub.id, journalId, conferenceId },
        });
        venueCount++;
      }
    }

    // Add corresponding author (the faculty who published it)
    const existingAuthor = await prisma.publicationAuthor.findFirst({
      where: { publicationId: pub.id, facultyId: pub.facultyId },
    });

    if (!existingAuthor) {
      await prisma.publicationAuthor.create({
        data: {
          publicationId: pub.id,
          facultyId: pub.facultyId,
          authorName: pub.faculty.user.name,
          affiliation: `${pub.faculty.department ?? 'Engineering'}, Our College of Engineering`,
          authorOrder: 1,
          isCorresponding: true,
          isExternal: false,
        },
      });
    }

    // Add a few external co-authors for some papers
    if (Math.random() > 0.5) {
      const externalAuthors = [
        { authorName: 'Dr. Sunil Kumar', affiliation: 'IIT Bombay', authorOrder: 2 },
        { authorName: 'Prof. Meera Singh', affiliation: 'NIT Calicut', authorOrder: 2 },
        { authorName: 'Dr. Ajay Verma', affiliation: 'BITS Pilani', authorOrder: 2 },
        { authorName: 'Ms. Pooja Shah', affiliation: 'IIT Delhi', authorOrder: 2 },
        { authorName: 'Dr. Raghunath Iyer', affiliation: 'IISc Bangalore', authorOrder: 2 },
      ];
      const chosen = externalAuthors[Math.floor(Math.random() * externalAuthors.length)];
      const existingExt = await prisma.publicationAuthor.findFirst({
        where: { publicationId: pub.id, authorOrder: 2 },
      });
      if (!existingExt) {
        await prisma.publicationAuthor.create({
          data: {
            publicationId: pub.id,
            authorName: chosen.authorName,
            affiliation: chosen.affiliation,
            authorOrder: 2,
            isExternal: true,
            isCorresponding: false,
          },
        });
      }
    }
  }

  console.log(`  ✅ Venues & authors seeded: ${venueCount} venues, ${allPublications.length}+ authors`);
}
