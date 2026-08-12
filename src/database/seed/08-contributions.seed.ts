import { PrismaClient, ConferenceContributionType, ProfessionalContributionType, ContributionLevel } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/** Prisma error code for a unique constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

export async function seedConferenceContributions(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding conference contributions...');

  const allFaculty  = await prisma.facultyProfile.findMany({ include: { user: true } });
  const conferences = await prisma.conference.findMany();
  const byEmail     = Object.fromEntries(allFaculty.map(f => [f.user.email, f]));
  const confByKey   = Object.fromEntries(conferences.map(c => [c.shortName, c]));

  const contributions = [
    { facultyEmail: 'arjun.mehta@college.edu',        confKey: 'ICML',      contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Transformer-Based Anomaly Detection in Time-Series Data for Industrial IoT' },
    { facultyEmail: 'arjun.mehta@college.edu',        confKey: 'ICCV',      contributionType: ConferenceContributionType.SESSION_CHAIR, paperTitle: null },
    { facultyEmail: 'priya.nair@college.edu',          confKey: 'VLSI-DA',   contributionType: ConferenceContributionType.KEYNOTE, paperTitle: 'Low Power VLSI Design Trends for Next Generation IoT' },
    { facultyEmail: 'priya.nair@college.edu',          confKey: 'ICACCS',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Approximate Computing for ML Inference at the Edge' },
    { facultyEmail: 'suresh.rao@college.edu',          confKey: 'ICACCS',    contributionType: ConferenceContributionType.INVITED_TALK, paperTitle: 'Recent Advances in Solar Thermal Energy Systems' },
    { facultyEmail: 'rajiv.sharma@college.edu',        confKey: 'PES-GM',    contributionType: ConferenceContributionType.SESSION_CHAIR, paperTitle: null },
    { facultyEmail: 'rajiv.sharma@college.edu',        confKey: 'ICACCS',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Multi-Agent RL for Demand Response in Smart Grid' },
    { facultyEmail: 'anita.desai@college.edu',         confKey: 'ICISS',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Zero-Trust Security Architecture for Enterprise IoT Deployments' },
    { facultyEmail: 'anita.desai@college.edu',         confKey: 'ICISS',     contributionType: ConferenceContributionType.ORGANIZER, paperTitle: null },
    { facultyEmail: 'vikram.singh@college.edu',        confKey: 'ICSEC',     contributionType: ConferenceContributionType.KEYNOTE, paperTitle: 'Seismic Risk Assessment of Indian RC Building Stock' },
    { facultyEmail: 'meena.iyer@college.edu',          confKey: 'ICC',       contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Deep RL Based Beamforming Optimization for Massive MIMO Systems' },
    { facultyEmail: 'meena.iyer@college.edu',          confKey: 'ICACCS',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Channel Estimation in OFDM Systems Using Sparse Bayesian Learning' },
    { facultyEmail: 'ashok.patel@college.edu',         confKey: 'ICAMT',     contributionType: ConferenceContributionType.KEYNOTE, paperTitle: 'Advances in Hard Turning of Difficult-to-Cut Materials' },
    { facultyEmail: 'lavanya.subramanian@college.edu', confKey: 'ICRA',      contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Sim-to-Real Transfer in Robotic Manipulation' },
    { facultyEmail: 'lavanya.subramanian@college.edu', confKey: 'ICRA',      contributionType: ConferenceContributionType.REVIEWER, paperTitle: null },
    { facultyEmail: 'naresh.joshi@college.edu',        confKey: 'ICACCS',    contributionType: ConferenceContributionType.INVITED_TALK, paperTitle: 'Sustainable Urban Drainage and Stormwater Management' },
    { facultyEmail: 'kavita.reddy@college.edu',        confKey: 'VLSI-DA',   contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Silicon Photonics Integration for High-Speed Data Interconnects' },
    { facultyEmail: 'mohan.das@college.edu',           confKey: 'ICAMT',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Tribological Behavior of Hybrid Metal Matrix Composites' },
    { facultyEmail: 'shantha.pillai@college.edu',      confKey: 'ICML',      contributionType: ConferenceContributionType.SESSION_CHAIR, paperTitle: null },
    { facultyEmail: 'arun.kumar@college.edu',          confKey: 'ICGCIoT',   contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Task Offloading Strategy in Mobile Edge Computing' },
    { facultyEmail: 'divya.menon@college.edu',         confKey: 'PES-GM',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'SiC-Based Bidirectional Converter for EV Fast Charging' },
    { facultyEmail: 'sanjay.bhatt@college.edu',        confKey: 'ICSEC',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Traffic Flow Optimization Using Adaptive Signal Control' },
    { facultyEmail: 'rekha.pandey@college.edu',        confKey: 'ICC',       contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Intent-Based Networking for Automated Network Management' },
    { facultyEmail: 'girish.nanda@college.edu',        confKey: 'ICAMT',     contributionType: ConferenceContributionType.INVITED_TALK, paperTitle: 'Multi-Body Dynamics in Automotive Suspension Design' },
    { facultyEmail: 'usha.venkat@college.edu',         confKey: 'ICACCS',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Deep Learning for Automated Retinal Disease Screening' },
    { facultyEmail: 'pramod.hegde@college.edu',        confKey: 'KDD',       contributionType: ConferenceContributionType.ATTENDEE, paperTitle: null },
    { facultyEmail: 'leela.narayan@college.edu',       confKey: 'ICSEC',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Geosynthetic Reinforced Retaining Wall Under Dynamic Loading' },
    { facultyEmail: 'dilip.shetty@college.edu',        confKey: 'ICISS',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Post-Quantum Cryptography for IoT Devices' },
    { facultyEmail: 'aarti.saxena@college.edu',        confKey: 'PES-GM',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Partial Discharge Diagnosis in HV Cable Systems' },
    { facultyEmail: 'bhaskar.rao@college.edu',         confKey: 'ICAMT',     contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Bio-Inspired Lattice Design for Bone Scaffold Applications' },
    { facultyEmail: 'chitra.suresh@college.edu',       confKey: 'ICC',       contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Reconfigurable MIMO Antenna for Cognitive Radio Networks' },
    { facultyEmail: 'devraj.malhotra@college.edu',     confKey: 'ICACCS',    contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Automated Code Review Using Large Language Models' },
    { facultyEmail: 'sneha.gupta@college.edu',         confKey: 'KDD',       contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Zero-Shot Medical Text Classification Using Pre-trained LMs' },
    { facultyEmail: 'esha.kulkarni@college.edu',       confKey: 'CHI',       contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Cognitive Load in Adaptive E-Learning Using Eye Tracking' },
    { facultyEmail: 'esha.kulkarni@college.edu',       confKey: 'CHI',       contributionType: ConferenceContributionType.REVIEWER, paperTitle: null },
    { facultyEmail: 'deepa.krishnan@college.edu',      confKey: 'ICGCIoT',   contributionType: ConferenceContributionType.PAPER_PRESENTER, paperTitle: 'Explainable AI for Predictive Maintenance in Industrial IoT' },
    { facultyEmail: 'ravi.varma@college.edu',          confKey: 'PES-GM',    contributionType: ConferenceContributionType.ATTENDEE, paperTitle: null },
    { facultyEmail: 'priya.nair@college.edu',          confKey: 'ICML',      contributionType: ConferenceContributionType.REVIEWER, paperTitle: null },
    { facultyEmail: 'arjun.mehta@college.edu',         confKey: 'KDD',       contributionType: ConferenceContributionType.REVIEWER, paperTitle: null },
  ];

  for (const c of contributions) {
    const faculty   = byEmail[c.facultyEmail];
    const conference = confByKey[c.confKey];
    if (!faculty || !conference) continue;
    try {
      await prisma.conferenceContribution.create({
        data: {
          facultyId: faculty.id,
          conferenceId: conference.id,
          contributionType: c.contributionType,
          paperTitle: c.paperTitle ?? undefined,
        },
      });
    } catch (error) {
      // Skip duplicates (same faculty+conf+type); surface anything else
      if (
        !(error instanceof PrismaClientKnownRequestError) ||
        error.code !== UNIQUE_VIOLATION
      ) {
        throw error;
      }
    }
  }

  console.log(`  ✅ Conference contributions seeded: ${contributions.length} entries`);
}

export async function seedProfessionalContributions(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding professional contributions...');

  const allFaculty = await prisma.facultyProfile.findMany({ include: { user: true } });
  const byEmail = Object.fromEntries(allFaculty.map(f => [f.user.email, f]));

  const contributions = [
    // Awards
    { email: 'arjun.mehta@college.edu',        contributionType: ProfessionalContributionType.AWARD,           title: 'Best Research Paper Award — IEEE TNNLS', organization: 'IEEE', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2023-07-15') },
    { email: 'rajiv.sharma@college.edu',        contributionType: ProfessionalContributionType.AWARD,           title: 'Young Scientist Award — Karnataka Science and Technology Academy', organization: 'KSTA', level: ContributionLevel.NATIONAL, dateFrom: new Date('2022-11-20') },
    { email: 'vikram.singh@college.edu',        contributionType: ProfessionalContributionType.AWARD,           title: 'Excellent Research Award — Institution of Engineers India', organization: 'IEI', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-02-28') },
    { email: 'kavita.reddy@college.edu',        contributionType: ProfessionalContributionType.AWARD,           title: 'Best Paper Award — IEEE SENSORS Conference', organization: 'IEEE', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2022-10-30') },
    { email: 'shantha.pillai@college.edu',      contributionType: ProfessionalContributionType.AWARD,           title: 'Outstanding Faculty Award — VTU', organization: 'VTU Belgaum', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-01-26') },
    { email: 'naresh.joshi@college.edu',        contributionType: ProfessionalContributionType.AWARD,           title: 'Young Water Professional Award — IWA Regional Office', organization: 'IWA India', level: ContributionLevel.NATIONAL, dateFrom: new Date('2022-09-05') },
    { email: 'usha.venkat@college.edu',         contributionType: ProfessionalContributionType.AWARD,           title: 'Biomedical Engineering Excellence Award — BMESI', organization: 'Biomedical Engineering Society of India', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-04-10') },

    // Consultancy
    { email: 'suresh.rao@college.edu',          contributionType: ProfessionalContributionType.CONSULTANCY,     title: 'Thermal Design Consultancy for KSRTC Electric Bus Fleet', organization: 'Karnataka State Road Transport Corporation', level: ContributionLevel.INSTITUTIONAL, dateFrom: new Date('2022-06-01'), dateTo: new Date('2022-12-31') },
    { email: 'anita.desai@college.edu',         contributionType: ProfessionalContributionType.CONSULTANCY,     title: 'Cybersecurity Audit and Penetration Testing', organization: 'Bank of Baroda Regional IT Centre', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-02-01'), dateTo: new Date('2023-04-30') },
    { email: 'sanjay.bhatt@college.edu',        contributionType: ProfessionalContributionType.CONSULTANCY,     title: 'Traffic Impact Assessment for New Commercial Complex', organization: 'Bangalore Development Authority', level: ContributionLevel.INSTITUTIONAL, dateFrom: new Date('2023-03-01'), dateTo: new Date('2023-06-30') },
    { email: 'pramod.hegde@college.edu',        contributionType: ProfessionalContributionType.CONSULTANCY,     title: 'Database Architecture Review and Optimization', organization: 'Infosys BPM Ltd', level: ContributionLevel.NATIONAL, dateFrom: new Date('2022-09-01'), dateTo: new Date('2022-11-30') },
    { email: 'girish.nanda@college.edu',        contributionType: ProfessionalContributionType.CONSULTANCY,     title: 'NVH Analysis of Two-Wheeler Chassis for TVS Motor Company', organization: 'TVS Motor Company', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-01-01'), dateTo: new Date('2023-03-31') },

    // Workshops Conducted
    { email: 'priya.nair@college.edu',          contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: '5-Day Workshop on VLSI Design Using Cadence Tools', organization: 'Our College of Engineering', level: ContributionLevel.INSTITUTIONAL, dateFrom: new Date('2023-01-16'), dateTo: new Date('2023-01-20') },
    { email: 'anita.desai@college.edu',         contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: 'Hands-On Ethical Hacking and Network Security Workshop', organization: 'VTU Regional Centre Belagavi', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-03-20'), dateTo: new Date('2023-03-22') },
    { email: 'arjun.mehta@college.edu',         contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: 'AICTE Approved STTP: Deep Learning Using TensorFlow and PyTorch', organization: 'Our College of Engineering (AICTE Sponsored)', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-06-12'), dateTo: new Date('2023-06-17') },
    { email: 'bhaskar.rao@college.edu',         contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: 'Workshop on Additive Manufacturing and Rapid Prototyping Technologies', organization: 'Our College of Engineering', level: ContributionLevel.INSTITUTIONAL, dateFrom: new Date('2023-02-10'), dateTo: new Date('2023-02-12') },
    { email: 'dilip.shetty@college.edu',        contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: 'Post-Quantum Cryptography and Cybersecurity Workshop', organization: 'NIT Surathkal', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-07-03'), dateTo: new Date('2023-07-05') },
    { email: 'esha.kulkarni@college.edu',       contributionType: ProfessionalContributionType.WORKSHOP_CONDUCTED, title: 'User Research Methods and Usability Testing Workshop', organization: 'Our College of Engineering', level: ContributionLevel.INSTITUTIONAL, dateFrom: new Date('2023-04-24'), dateTo: new Date('2023-04-25') },

    // FDP / Workshops Attended
    { email: 'deepa.krishnan@college.edu',      contributionType: ProfessionalContributionType.FDP,             title: 'AICTE Sponsored FDP on Cloud-Native Application Development', organization: 'IIT Madras', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-05-22'), dateTo: new Date('2023-05-27') },
    { email: 'sneha.gupta@college.edu',         contributionType: ProfessionalContributionType.FDP,             title: 'FDP on Large Language Models and Generative AI for Education', organization: 'IISc Bangalore', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-08-14'), dateTo: new Date('2023-08-19') },
    { email: 'arun.kumar@college.edu',          contributionType: ProfessionalContributionType.FDP,             title: 'AICTE FDP: IoT and Smart System Design', organization: 'NIT Warangal', level: ContributionLevel.NATIONAL, dateFrom: new Date('2022-12-05'), dateTo: new Date('2022-12-10') },
    { email: 'rekha.pandey@college.edu',        contributionType: ProfessionalContributionType.FDP,             title: 'NPTEL Certification Course: Computer Networks and Protocols', organization: 'IIT Kharagpur (NPTEL)', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-01-09'), dateTo: new Date('2023-04-10') },
    { email: 'leela.narayan@college.edu',       contributionType: ProfessionalContributionType.FDP,             title: 'AICTE ATAL FDP: Geosynthetics in Geotechnical Engineering', organization: 'NIT Rourkela', level: ContributionLevel.NATIONAL, dateFrom: new Date('2022-11-07'), dateTo: new Date('2022-11-12') },
    { email: 'devraj.malhotra@college.edu',     contributionType: ProfessionalContributionType.FDP,             title: 'FDP on DevSecOps and Secure Software Development Lifecycle', organization: 'IIT Bombay', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-07-17'), dateTo: new Date('2023-07-22') },

    // Guest Lectures
    { email: 'suresh.rao@college.edu',          contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: 'Renewable Energy Systems and Future of Energy Storage', organization: 'MIT Manipal', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-08-22') },
    { email: 'lavanya.subramanian@college.edu', contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: 'AI in Robotics: From Factory Floor to Healthcare', organization: 'PES University Bangalore', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-03-05') },
    { email: 'ravi.varma@college.edu',          contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: 'Industrial Automation and Industry 4.0', organization: 'BMS College of Engineering', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-04-18') },
    { email: 'mohan.das@college.edu',           contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: 'Future of Lightweight Composites in Automotive and Aerospace', organization: 'DSCE Bangalore', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-06-07') },
    { email: 'chitra.suresh@college.edu',       contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: '5G Antenna Systems: Design Challenges and Solutions', organization: 'NIE Mysore', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-09-15') },
    { email: 'aarti.saxena@college.edu',        contributionType: ProfessionalContributionType.GUEST_LECTURE,   title: 'High Voltage Engineering: Safety and Testing Standards', organization: 'UVCE Bangalore', level: ContributionLevel.NATIONAL, dateFrom: new Date('2023-02-10') },

    // Editorial Board
    { email: 'arjun.mehta@college.edu',         contributionType: ProfessionalContributionType.EDITORIAL_BOARD, title: 'Associate Editor — IEEE Transactions on Emerging Topics in Computational Intelligence', organization: 'IEEE', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2022-01-01') },
    { email: 'rajiv.sharma@college.edu',        contributionType: ProfessionalContributionType.EDITORIAL_BOARD, title: 'Editorial Board Member — Renewable Energy Journal (Elsevier)', organization: 'Elsevier', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2021-07-01') },
    { email: 'kavita.reddy@college.edu',        contributionType: ProfessionalContributionType.EDITORIAL_BOARD, title: 'Reviewer — IEEE Electron Device Letters', organization: 'IEEE', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2020-01-01') },
    { email: 'shantha.pillai@college.edu',      contributionType: ProfessionalContributionType.EDITORIAL_BOARD, title: 'Editorial Board — Future Generation Computer Systems (Elsevier)', organization: 'Elsevier', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2021-09-01') },

    // Professional Memberships
    { email: 'suresh.rao@college.edu',          contributionType: ProfessionalContributionType.PROFESSIONAL_MEMBERSHIP, title: 'Senior Member — ASME (American Society of Mechanical Engineers)', organization: 'ASME', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2010-01-01') },
    { email: 'vikram.singh@college.edu',        contributionType: ProfessionalContributionType.PROFESSIONAL_MEMBERSHIP, title: 'Fellow Member — Institution of Engineers India (FIE)', organization: 'IEI', level: ContributionLevel.NATIONAL, dateFrom: new Date('2015-06-01') },
    { email: 'priya.nair@college.edu',          contributionType: ProfessionalContributionType.PROFESSIONAL_MEMBERSHIP, title: 'Senior Member — IEEE (Institute of Electrical and Electronics Engineers)', organization: 'IEEE', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2018-01-01') },
    { email: 'anita.desai@college.edu',         contributionType: ProfessionalContributionType.PROFESSIONAL_MEMBERSHIP, title: 'Member — ACM (Association for Computing Machinery)', organization: 'ACM', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2019-03-01') },

    // Certifications
    { email: 'arun.kumar@college.edu',          contributionType: ProfessionalContributionType.CERTIFICATION,   title: 'AWS Certified Solutions Architect — Professional', organization: 'Amazon Web Services', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2023-06-20') },
    { email: 'devraj.malhotra@college.edu',     contributionType: ProfessionalContributionType.CERTIFICATION,   title: 'Certified Kubernetes Administrator (CKA)', organization: 'Linux Foundation', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2022-12-15') },
    { email: 'sneha.gupta@college.edu',         contributionType: ProfessionalContributionType.CERTIFICATION,   title: 'Google Professional Machine Learning Engineer', organization: 'Google Cloud', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2023-03-22') },
    { email: 'esha.kulkarni@college.edu',       contributionType: ProfessionalContributionType.CERTIFICATION,   title: 'Certified UX Professional (CUXP) — Nielsen Norman Group', organization: 'Nielsen Norman Group', level: ContributionLevel.INTERNATIONAL, dateFrom: new Date('2023-01-18') },
  ];

  for (const c of contributions) {
    const faculty = byEmail[c.email];
    if (!faculty) continue;
    const { email, ...rest } = c;
    await prisma.professionalContribution.create({ data: { facultyId: faculty.id, ...rest } });
  }

  console.log(`  ✅ Professional contributions seeded: ${contributions.length} entries`);
}
