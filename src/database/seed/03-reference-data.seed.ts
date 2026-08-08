import { PrismaClient } from '@prisma/client';

export async function seedPublicationTypes(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding publication types...');

  const types = [
    { name: 'Journal Article',      code: 'JOURNAL_ARTICLE',   description: 'Peer-reviewed article published in an academic journal' },
    { name: 'Conference Paper',     code: 'CONFERENCE_PAPER',  description: 'Paper presented and published in conference proceedings' },
    { name: 'Book Chapter',         code: 'BOOK_CHAPTER',      description: 'A chapter contributed to an edited academic book' },
    { name: 'Book',                 code: 'BOOK',              description: 'A full academic or technical book authored or co-authored' },
    { name: 'Thesis / Dissertation',code: 'THESIS',            description: 'PhD thesis or Masters dissertation' },
    { name: 'Technical Report',     code: 'TECHNICAL_REPORT',  description: 'Institutional or government technical report' },
    { name: 'Working Paper',        code: 'WORKING_PAPER',     description: 'Preliminary research report or preprint' },
    { name: 'Review Article',       code: 'REVIEW_ARTICLE',    description: 'Systematic or literature review article' },
  ];

  for (const type of types) {
    await prisma.publicationType.upsert({
      where: { code: type.code },
      update: {},
      create: { ...type, isActive: true },
    });
  }

  console.log('  ✅ Publication types seeded: 8 types');
}

export async function seedJournals(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding journals...');

  const journals = [
    { name: 'IEEE Transactions on Neural Networks and Learning Systems', shortName: 'IEEE TNNLS', issnOnline: '2162-2388', publisher: 'IEEE', impactFactor: 14.255, isScopus: true, isWos: true, country: 'USA' },
    { name: 'Expert Systems with Applications', shortName: 'ESWA', issnPrint: '0957-4174', publisher: 'Elsevier', impactFactor: 8.665, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Applied Soft Computing', shortName: 'ASC', issnPrint: '1568-4946', publisher: 'Elsevier', impactFactor: 8.263, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Journal of Cleaner Production', shortName: 'JCP', issnPrint: '0959-6526', publisher: 'Elsevier', impactFactor: 11.072, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Renewable and Sustainable Energy Reviews', shortName: 'RSER', issnPrint: '1364-0321', publisher: 'Elsevier', impactFactor: 16.799, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'IEEE Access', shortName: 'IEEE Access', issnOnline: '2169-3536', publisher: 'IEEE', impactFactor: 3.476, isScopus: true, isWos: true, country: 'USA' },
    { name: 'Computers & Electrical Engineering', shortName: 'CEE', issnPrint: '0045-7906', publisher: 'Elsevier', impactFactor: 4.152, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Journal of Network and Computer Applications', shortName: 'JNCA', issnPrint: '1084-8045', publisher: 'Elsevier', impactFactor: 7.574, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'International Journal of Advanced Manufacturing Technology', shortName: 'IJAMT', issnPrint: '0268-3768', publisher: 'Springer', impactFactor: 3.563, isScopus: true, isWos: true, country: 'Germany' },
    { name: 'Construction and Building Materials', shortName: 'CBM', issnPrint: '0950-0618', publisher: 'Elsevier', impactFactor: 7.693, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Engineering Structures', shortName: 'ES', issnPrint: '0141-0296', publisher: 'Elsevier', impactFactor: 5.582, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Sensors and Actuators A: Physical', shortName: 'SAA', issnPrint: '0924-4247', publisher: 'Elsevier', impactFactor: 4.291, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Future Generation Computer Systems', shortName: 'FGCS', issnPrint: '0167-739X', publisher: 'Elsevier', impactFactor: 7.307, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Pattern Recognition Letters', shortName: 'PRL', issnPrint: '0167-8655', publisher: 'Elsevier', impactFactor: 4.757, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Journal of Power Sources', shortName: 'JPS', issnPrint: '0378-7753', publisher: 'Elsevier', impactFactor: 9.127, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Thin-Walled Structures', shortName: 'TWS', issnPrint: '0263-8231', publisher: 'Elsevier', impactFactor: 5.881, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'International Journal of Electrical Power & Energy Systems', shortName: 'IJEPES', issnPrint: '0142-0615', publisher: 'Elsevier', impactFactor: 5.659, isScopus: true, isWos: true, country: 'Netherlands' },
    { name: 'Microelectronic Engineering', shortName: 'MEE', issnPrint: '0167-9317', publisher: 'Elsevier', impactFactor: 2.862, isScopus: true, country: 'Netherlands' },
    { name: 'International Journal of Computer Applications', shortName: 'IJCA', issnOnline: '0975-8887', publisher: 'Foundation of Computer Science', isScopus: false, isUgc: true, country: 'India' },
    { name: 'Indian Journal of Science and Technology', shortName: 'IJST', issnOnline: '0974-6846', publisher: 'Sciencein Publishing Group', isScopus: false, isUgc: true, country: 'India' },
  ];

  for (const journal of journals) {
    await prisma.journal.upsert({
      where: { id: `journal-${journal.shortName?.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `journal-${journal.shortName?.replace(/\s/g, '-').toLowerCase()}`,
        ...journal,
        impactFactor: journal.impactFactor ? journal.impactFactor : undefined,
      },
    });
  }

  console.log('  ✅ Journals seeded: 20 journals');
}

export async function seedConferences(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding conferences...');

  const conferences = [
    { name: 'International Conference on Machine Learning (ICML)', shortName: 'ICML', year: 2023, location: 'Honolulu, Hawaii', country: 'USA', isInternational: true, isIeee: false, isAcm: false },
    { name: 'IEEE International Conference on Computer Vision (ICCV)', shortName: 'ICCV', year: 2023, location: 'Paris', country: 'France', isInternational: true, isIeee: true },
    { name: 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining', shortName: 'KDD', year: 2023, location: 'Long Beach', country: 'USA', isInternational: true, isAcm: true },
    { name: 'IEEE International Conference on Communications (ICC)', shortName: 'ICC', year: 2023, location: 'Rome', country: 'Italy', isInternational: true, isIeee: true },
    { name: 'International Conference on Advanced Computing and Communication Systems', shortName: 'ICACCS', year: 2023, location: 'Coimbatore', country: 'India', isInternational: true, isIeee: true },
    { name: 'National Conference on Recent Trends in Engineering and Technology', shortName: 'NCRTET', year: 2023, location: 'Chennai', country: 'India', isInternational: false },
    { name: 'IEEE Power & Energy Society General Meeting', shortName: 'PES-GM', year: 2023, location: 'Orlando', country: 'USA', isInternational: true, isIeee: true },
    { name: 'International Symposium on VLSI Design Automation', shortName: 'VLSI-DA', year: 2023, location: 'Bangalore', country: 'India', isInternational: true, isIeee: true },
    { name: 'International Conference on Structural Engineering and Construction', shortName: 'ICSEC', year: 2022, location: 'Dubai', country: 'UAE', isInternational: true },
    { name: 'IEEE International Conference on Robotics and Automation (ICRA)', shortName: 'ICRA', year: 2023, location: 'London', country: 'UK', isInternational: true, isIeee: true },
    { name: 'International Conference on Advances in Manufacturing Technology', shortName: 'ICAMT', year: 2023, location: 'Pune', country: 'India', isInternational: true },
    { name: 'ACM CHI Conference on Human Factors in Computing Systems', shortName: 'CHI', year: 2023, location: 'Hamburg', country: 'Germany', isInternational: true, isAcm: true },
    { name: 'International Conference on Information Systems Security', shortName: 'ICISS', year: 2022, location: 'Tirupati', country: 'India', isInternational: true },
    { name: 'IEEE International Conference on Green Computing and Internet of Things', shortName: 'ICGCIoT', year: 2023, location: 'Noida', country: 'India', isInternational: true, isIeee: true },
    { name: 'International Conference on Emerging Technologies in Data Mining', shortName: 'ICETDM', year: 2022, location: 'Kolkata', country: 'India', isInternational: true },
  ];

  for (const conf of conferences) {
    await prisma.conference.upsert({
      where: { id: `conf-${conf.shortName.toLowerCase()}` },
      update: {},
      create: {
        id: `conf-${conf.shortName.toLowerCase()}`,
        ...conf,
      },
    });
  }

  console.log('  ✅ Conferences seeded: 15 conferences');
}
