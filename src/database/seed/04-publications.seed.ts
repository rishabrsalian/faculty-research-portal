import { PrismaClient, PublicationStatus } from '@prisma/client';

/**
 * Seeds 78 publications across 30 faculty members (2-3 each).
 * Includes journal articles, conference papers, book chapters.
 */
export async function seedPublications(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding publications...');

  const journalTypeId    = (await prisma.publicationType.findUnique({ where: { code: 'JOURNAL_ARTICLE' } }))!.id;
  const confTypeId       = (await prisma.publicationType.findUnique({ where: { code: 'CONFERENCE_PAPER' } }))!.id;
  const bookChapterId    = (await prisma.publicationType.findUnique({ where: { code: 'BOOK_CHAPTER' } }))!.id;
  const reviewArticleId  = (await prisma.publicationType.findUnique({ where: { code: 'REVIEW_ARTICLE' } }))!.id;

  const allFaculty = await prisma.facultyProfile.findMany({ include: { user: true } });
  const byEmail = Object.fromEntries(allFaculty.map(f => [f.user.email, f]));

  const publications: Array<{
    facultyEmail: string;
    data: {
      publicationTypeId: string;
      title: string; abstract?: string; year: number; month?: number;
      doi?: string; url?: string; referenceText?: string;
      volume?: string; issue?: string; pageStart?: number; pageEnd?: number;
      citationCount?: number; isScopusIndexed?: boolean; isWosIndexed?: boolean;
      isUgcListed?: boolean; status: PublicationStatus;
    };
  }> = [
    // ── EMP001 Dr. Arjun Mehta (CSE/ML) ──
    { facultyEmail: 'arjun.mehta@college.edu', data: { publicationTypeId: journalTypeId, title: 'Deep Learning Based Intrusion Detection System for IoT Networks Using Attention Mechanisms', abstract: 'This paper proposes a novel deep learning architecture integrating attention mechanisms for real-time intrusion detection in IoT networks.', year: 2023, month: 4, doi: '10.1109/TNNLS.2023.001234', citationCount: 18, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED, pageStart: 1234, pageEnd: 1248, volume: '34', issue: '3' } },
    { facultyEmail: 'arjun.mehta@college.edu', data: { publicationTypeId: journalTypeId, title: 'Federated Learning for Privacy-Preserving Medical Image Analysis: A Systematic Review', abstract: 'A comprehensive review of federated learning approaches applied to medical imaging datasets.', year: 2022, month: 9, doi: '10.1016/j.eswa.2022.118234', citationCount: 42, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED, pageStart: 1, pageEnd: 22 } },
    { facultyEmail: 'arjun.mehta@college.edu', data: { publicationTypeId: confTypeId, title: 'Transformer-Based Anomaly Detection in Time-Series Data for Industrial IoT', year: 2023, month: 6, citationCount: 5, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP002 Dr. Priya Nair (ECE/VLSI) ──
    { facultyEmail: 'priya.nair@college.edu', data: { publicationTypeId: journalTypeId, title: 'Low Power VLSI Design of Reconfigurable FIR Filter for Biomedical Signal Processing', abstract: 'A novel reconfigurable FIR filter architecture with 40% power reduction compared to conventional designs.', year: 2023, month: 2, doi: '10.1109/ACCESS.2023.0034512', citationCount: 11, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'priya.nair@college.edu', data: { publicationTypeId: journalTypeId, title: 'Implementation of Approximate Computing Architectures for Energy-Efficient Edge AI', year: 2022, month: 11, doi: '10.1016/j.compeleceng.2022.108156', citationCount: 27, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'priya.nair@college.edu', data: { publicationTypeId: bookChapterId, title: 'VLSI Architectures for Machine Learning Accelerators', year: 2022, status: PublicationStatus.PUBLISHED, citationCount: 8 } },

    // ── EMP003 Prof. Suresh Rao (ME/Thermal) ──
    { facultyEmail: 'suresh.rao@college.edu', data: { publicationTypeId: journalTypeId, title: 'Thermal Performance Enhancement of Microchannel Heat Sinks Using Hybrid Nanofluids: CFD Analysis', year: 2023, month: 3, doi: '10.1016/j.applthermaleng.2023.120145', citationCount: 9, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'suresh.rao@college.edu', data: { publicationTypeId: journalTypeId, title: 'Optimization of Solar Parabolic Trough Collector Using Taguchi Method and CFD Simulation', year: 2022, month: 7, doi: '10.1016/j.rser.2022.112890', citationCount: 35, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'suresh.rao@college.edu', data: { publicationTypeId: confTypeId, title: 'Heat Transfer Augmentation in Corrugated Channels with Vortex Generators', year: 2023, citationCount: 4, status: PublicationStatus.PUBLISHED } },

    // ── EMP004 Dr. Deepa Krishnan (CSE/Data Science) ──
    { facultyEmail: 'deepa.krishnan@college.edu', data: { publicationTypeId: journalTypeId, title: 'Scalable Real-Time Stream Processing Framework for Big Data Analytics in Smart Cities', year: 2023, month: 5, doi: '10.1016/j.future.2023.01.045', citationCount: 14, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'deepa.krishnan@college.edu', data: { publicationTypeId: confTypeId, title: 'Explainable AI for Predictive Maintenance in Industrial IoT Using SHAP Values', year: 2023, citationCount: 7, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'deepa.krishnan@college.edu', data: { publicationTypeId: journalTypeId, title: 'Comparative Study of NoSQL Databases for Real-Time Health Monitoring Applications', year: 2022, month: 8, citationCount: 19, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP005 Dr. Rajiv Sharma (EE/Power) ──
    { facultyEmail: 'rajiv.sharma@college.edu', data: { publicationTypeId: journalTypeId, title: 'Optimal Energy Management Strategy for Grid-Connected Microgrid with PV and Battery Storage', year: 2023, month: 1, doi: '10.1016/j.rser.2023.113401', citationCount: 22, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'rajiv.sharma@college.edu', data: { publicationTypeId: journalTypeId, title: 'Demand Response Management in Smart Grid Using Multi-Agent Reinforcement Learning', year: 2022, month: 10, doi: '10.1016/j.ijepes.2022.108654', citationCount: 31, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'rajiv.sharma@college.edu', data: { publicationTypeId: reviewArticleId, title: 'A Comprehensive Review of Solar Photovoltaic Integration Challenges in Distribution Networks', year: 2021, month: 5, citationCount: 58, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP006 Prof. Anita Desai (IT/Security) ──
    { facultyEmail: 'anita.desai@college.edu', data: { publicationTypeId: journalTypeId, title: 'Blockchain-Based Decentralized Identity Management for Healthcare Data Sharing', year: 2023, month: 6, doi: '10.1016/j.jnca.2023.103567', citationCount: 16, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'anita.desai@college.edu', data: { publicationTypeId: confTypeId, title: 'Zero-Trust Security Architecture for Enterprise IoT Deployments', year: 2023, citationCount: 9, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'anita.desai@college.edu', data: { publicationTypeId: journalTypeId, title: 'Machine Learning Based Detection of Advanced Persistent Threats in Enterprise Networks', year: 2022, citationCount: 24, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP007 Dr. Vikram Singh (Civil/Structural) ──
    { facultyEmail: 'vikram.singh@college.edu', data: { publicationTypeId: journalTypeId, title: 'Seismic Performance of RC Frame Buildings with Soft Story Irregularity: Nonlinear Analysis', year: 2023, month: 2, doi: '10.1016/j.engstruct.2023.115678', citationCount: 13, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'vikram.singh@college.edu', data: { publicationTypeId: journalTypeId, title: 'Behavior of GFRP Reinforced Concrete Columns Under Combined Loading Conditions', year: 2022, citationCount: 21, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'vikram.singh@college.edu', data: { publicationTypeId: confTypeId, title: 'Performance Based Seismic Design of Tall Buildings Using Incremental Dynamic Analysis', year: 2022, citationCount: 6, status: PublicationStatus.PUBLISHED } },

    // ── EMP008 Dr. Meena Iyer (ECE/5G) ──
    { facultyEmail: 'meena.iyer@college.edu', data: { publicationTypeId: journalTypeId, title: 'Massive MIMO Beamforming Optimization for 5G NR Using Deep Reinforcement Learning', year: 2023, month: 4, doi: '10.1109/ACCESS.2023.0056789', citationCount: 8, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'meena.iyer@college.edu', data: { publicationTypeId: confTypeId, title: 'Channel Estimation in OFDM Systems Using Sparse Bayesian Learning', year: 2023, citationCount: 5, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP009 Prof. Ashok Patel (ME/Manufacturing) ──
    { facultyEmail: 'ashok.patel@college.edu', data: { publicationTypeId: journalTypeId, title: 'Multi-Objective Optimization of CNC Turning Parameters for AISI 304 Stainless Steel', year: 2023, month: 3, doi: '10.1007/s00170-023-11234-5', citationCount: 15, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'ashok.patel@college.edu', data: { publicationTypeId: journalTypeId, title: 'Surface Integrity Analysis of Hard Turning with CBN Tools Under MQL Conditions', year: 2022, citationCount: 28, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'ashok.patel@college.edu', data: { publicationTypeId: bookChapterId, title: 'Advanced Manufacturing Processes: From Conventional to Sustainable Approaches', year: 2022, status: PublicationStatus.PUBLISHED, citationCount: 12 } },

    // ── EMP010 Dr. Lavanya Subramanian (CSE/AI) ──
    { facultyEmail: 'lavanya.subramanian@college.edu', data: { publicationTypeId: journalTypeId, title: 'Graph Neural Networks for Autonomous Robot Navigation in Dynamic Environments', year: 2023, month: 7, doi: '10.1016/j.robot.2023.104456', citationCount: 11, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'lavanya.subramanian@college.edu', data: { publicationTypeId: confTypeId, title: 'Sim-to-Real Transfer in Robotic Manipulation Using Domain Randomization and Adversarial Training', year: 2023, citationCount: 6, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'lavanya.subramanian@college.edu', data: { publicationTypeId: journalTypeId, title: 'Continual Learning for Object Recognition in Collaborative Robots', year: 2022, citationCount: 17, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP011 Dr. Ravi Varma (EE/Control) ──
    { facultyEmail: 'ravi.varma@college.edu', data: { publicationTypeId: journalTypeId, title: 'Model Predictive Control of HVAC Systems for Energy Optimization in Smart Buildings', year: 2023, month: 1, citationCount: 13, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'ravi.varma@college.edu', data: { publicationTypeId: journalTypeId, title: 'Adaptive Fuzzy Sliding Mode Control for DC Motor Drives with Variable Load', year: 2022, citationCount: 24, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP012 Prof. Sneha Gupta (IT/ML) ──
    { facultyEmail: 'sneha.gupta@college.edu', data: { publicationTypeId: journalTypeId, title: 'Aspect-Level Sentiment Analysis for Product Reviews Using Graph Attention Networks', year: 2023, month: 5, citationCount: 9, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'sneha.gupta@college.edu', data: { publicationTypeId: confTypeId, title: 'Zero-Shot Learning for Medical Text Classification Using Pre-trained Language Models', year: 2023, citationCount: 4, status: PublicationStatus.PUBLISHED } },

    // ── EMP013 Dr. Naresh Joshi (Civil/Env) ──
    { facultyEmail: 'naresh.joshi@college.edu', data: { publicationTypeId: journalTypeId, title: 'Adsorption of Heavy Metals from Wastewater Using Biochar Derived from Agricultural Waste', year: 2023, month: 2, doi: '10.1016/j.jclepro.2023.136789', citationCount: 20, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'naresh.joshi@college.edu', data: { publicationTypeId: journalTypeId, title: 'Constructed Wetlands for Greywater Treatment: Performance Evaluation and Optimization', year: 2022, citationCount: 32, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'naresh.joshi@college.edu', data: { publicationTypeId: reviewArticleId, title: 'Emerging Contaminants in Urban Stormwater: Sources, Fate, and Remediation Technologies', year: 2022, citationCount: 47, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP014 Dr. Kavita Reddy (ECE/Photonics) ──
    { facultyEmail: 'kavita.reddy@college.edu', data: { publicationTypeId: journalTypeId, title: 'Silicon Photonics Waveguide Design for Ultra-Low Loss Optical Interconnects', year: 2023, month: 6, doi: '10.1016/j.mee.2023.111987', citationCount: 10, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'kavita.reddy@college.edu', data: { publicationTypeId: journalTypeId, title: 'ZnO Nanostructures for High Sensitivity Gas Sensors: Synthesis and Characterization', year: 2022, citationCount: 26, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP015 Prof. Mohan Das (ME/Materials) ──
    { facultyEmail: 'mohan.das@college.edu', data: { publicationTypeId: journalTypeId, title: 'Mechanical Properties of Basalt Fiber Reinforced Polymer Composites at Elevated Temperatures', year: 2023, citationCount: 14, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'mohan.das@college.edu', data: { publicationTypeId: confTypeId, title: 'Tribological Behavior of Al6061-SiC-Graphite Hybrid Metal Matrix Composites', year: 2023, citationCount: 5, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'mohan.das@college.edu', data: { publicationTypeId: journalTypeId, title: 'Nano-Silica Modified Epoxy Composites: Thermal and Mechanical Characterization', year: 2021, citationCount: 38, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP016 Dr. Shantha Pillai (CSE/Distributed) ──
    { facultyEmail: 'shantha.pillai@college.edu', data: { publicationTypeId: journalTypeId, title: 'Energy-Aware Resource Scheduling in Heterogeneous Cloud Data Centers Using Metaheuristic Algorithms', year: 2023, month: 3, doi: '10.1016/j.future.2023.02.012', citationCount: 17, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'shantha.pillai@college.edu', data: { publicationTypeId: journalTypeId, title: 'Container Orchestration Optimization in Kubernetes Using Predictive Autoscaling', year: 2022, citationCount: 22, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP017 Dr. Arun Kumar (IT/IoT) ──
    { facultyEmail: 'arun.kumar@college.edu', data: { publicationTypeId: journalTypeId, title: 'Lightweight Federated Learning Framework for Edge Intelligence in Smart Agriculture', year: 2023, citationCount: 6, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'arun.kumar@college.edu', data: { publicationTypeId: confTypeId, title: 'Task Offloading Strategy in Mobile Edge Computing for Real-Time Applications', year: 2023, citationCount: 3, status: PublicationStatus.SUBMITTED } },

    // ── EMP018 Prof. Divya Menon (EE/EVs) ──
    { facultyEmail: 'divya.menon@college.edu', data: { publicationTypeId: journalTypeId, title: 'Bidirectional DC-DC Converter with Wide Voltage Range for EV Battery Management Systems', year: 2023, month: 4, doi: '10.1016/j.jpowsour.2023.233456', citationCount: 12, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'divya.menon@college.edu', data: { publicationTypeId: journalTypeId, title: 'State of Health Estimation for Lithium-Ion Batteries Using Incremental Capacity Analysis and Machine Learning', year: 2022, citationCount: 29, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP019 Dr. Sanjay Bhatt (Civil/Transport) ──
    { facultyEmail: 'sanjay.bhatt@college.edu', data: { publicationTypeId: journalTypeId, title: 'Rutting Performance of Crumb Rubber Modified Bituminous Mixes Under Accelerated Loading', year: 2023, citationCount: 10, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'sanjay.bhatt@college.edu', data: { publicationTypeId: journalTypeId, title: 'Pedestrian Level of Service Assessment at Urban Signalized Intersections Using Machine Learning', year: 2022, citationCount: 18, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'sanjay.bhatt@college.edu', data: { publicationTypeId: confTypeId, title: 'Traffic Flow Optimization in Urban Networks Using Adaptive Signal Control', year: 2022, citationCount: 7, status: PublicationStatus.PUBLISHED } },

    // ── EMP020 Dr. Rekha Pandey (CSE/Networks) ──
    { facultyEmail: 'rekha.pandey@college.edu', data: { publicationTypeId: journalTypeId, title: 'Software-Defined Networking Based Traffic Engineering for Multi-Path Routing Optimization', year: 2023, citationCount: 8, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'rekha.pandey@college.edu', data: { publicationTypeId: confTypeId, title: 'Intent-Based Networking for Automated Network Configuration and Management', year: 2023, citationCount: 4, status: PublicationStatus.PUBLISHED } },

    // ── EMP021 Prof. Girish Nanda (ME/Auto) ──
    { facultyEmail: 'girish.nanda@college.edu', data: { publicationTypeId: journalTypeId, title: 'Vibration Fatigue Analysis of Automotive Suspension Components Using Finite Element Method', year: 2023, month: 1, citationCount: 11, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'girish.nanda@college.edu', data: { publicationTypeId: journalTypeId, title: 'Multi-Body Dynamics Simulation of Double Wishbone Suspension System Under Road Excitation', year: 2022, citationCount: 19, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'girish.nanda@college.edu', data: { publicationTypeId: bookChapterId, title: 'Crashworthiness Design of Automotive Structures: From Steel to Composite', year: 2022, status: PublicationStatus.PUBLISHED, citationCount: 9 } },

    // ── EMP022 Dr. Usha Venkat (ECE/Biomedical) ──
    { facultyEmail: 'usha.venkat@college.edu', data: { publicationTypeId: journalTypeId, title: 'Deep CNN Architecture for Automated Detection of Diabetic Retinopathy from Fundus Images', year: 2023, month: 6, citationCount: 16, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'usha.venkat@college.edu', data: { publicationTypeId: journalTypeId, title: 'EEG-Based Motor Imagery Classification Using Riemannian Geometry and Transfer Learning', year: 2022, citationCount: 23, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP023 Dr. Pramod Hegde (IT/Database) ──
    { facultyEmail: 'pramod.hegde@college.edu', data: { publicationTypeId: journalTypeId, title: 'Query Optimization in Heterogeneous Database Environments Using Cost-Based Cardinality Estimation', year: 2023, citationCount: 7, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'pramod.hegde@college.edu', data: { publicationTypeId: journalTypeId, title: 'Benchmarking Graph Databases for Social Network Analysis: A Comparative Study', year: 2022, citationCount: 15, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'pramod.hegde@college.edu', data: { publicationTypeId: reviewArticleId, title: 'Evolution of Database Technologies: From Relational to NewSQL and Beyond', year: 2022, citationCount: 31, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP024 Prof. Leela Narayan (Civil/Geotech) ──
    { facultyEmail: 'leela.narayan@college.edu', data: { publicationTypeId: journalTypeId, title: 'Liquefaction Potential Assessment of Sand Using Machine Learning with Cone Penetration Test Data', year: 2023, citationCount: 12, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'leela.narayan@college.edu', data: { publicationTypeId: confTypeId, title: 'Geosynthetic Reinforced Retaining Wall Performance Under Static and Dynamic Loading', year: 2022, citationCount: 7, status: PublicationStatus.PUBLISHED } },

    // ── EMP025 Dr. Dilip Shetty (CSE/Quantum) ──
    { facultyEmail: 'dilip.shetty@college.edu', data: { publicationTypeId: journalTypeId, title: 'Quantum Key Distribution Protocol Simulation with Realistic Channel Noise Models', year: 2023, citationCount: 9, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'dilip.shetty@college.edu', data: { publicationTypeId: confTypeId, title: 'Post-Quantum Lattice-Based Cryptography Implementation on Resource-Constrained Devices', year: 2023, citationCount: 5, status: PublicationStatus.PUBLISHED } },

    // ── EMP026 Dr. Aarti Saxena (EE/HV) ──
    { facultyEmail: 'aarti.saxena@college.edu', data: { publicationTypeId: journalTypeId, title: 'Partial Discharge Detection in XLPE Cables Using Deep Learning and Time-Frequency Analysis', year: 2023, month: 3, citationCount: 10, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'aarti.saxena@college.edu', data: { publicationTypeId: journalTypeId, title: 'Condition Monitoring of Transformer Oil Using UV-Vis Spectroscopy and Machine Learning', year: 2022, citationCount: 21, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP027 Prof. Bhaskar Rao (ME/AM) ──
    { facultyEmail: 'bhaskar.rao@college.edu', data: { publicationTypeId: journalTypeId, title: 'Topology Optimization of Lattice Structures Fabricated by Selective Laser Melting', year: 2023, month: 2, citationCount: 13, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'bhaskar.rao@college.edu', data: { publicationTypeId: journalTypeId, title: 'Effect of Process Parameters on Microstructure and Mechanical Properties of Ti-6Al-4V Parts by DMLS', year: 2022, citationCount: 25, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'bhaskar.rao@college.edu', data: { publicationTypeId: confTypeId, title: 'Bio-Inspired Lattice Design for Bone Scaffold Applications in Additive Manufacturing', year: 2023, citationCount: 6, status: PublicationStatus.PUBLISHED } },

    // ── EMP028 Dr. Chitra Suresh (ECE/Antenna) ──
    { facultyEmail: 'chitra.suresh@college.edu', data: { publicationTypeId: journalTypeId, title: 'Wideband Circularly Polarized Microstrip Patch Antenna for 5G mm-Wave Applications', year: 2023, month: 5, citationCount: 11, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'chitra.suresh@college.edu', data: { publicationTypeId: journalTypeId, title: 'Reconfigurable Dual-Band MIMO Antenna for Cognitive Radio Networks', year: 2022, citationCount: 18, isScopusIndexed: true, isWosIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP029 Dr. Devraj Malhotra (CSE/SE) ──
    { facultyEmail: 'devraj.malhotra@college.edu', data: { publicationTypeId: journalTypeId, title: 'Technical Debt Quantification and Management in Microservices Architectures', year: 2023, citationCount: 8, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'devraj.malhotra@college.edu', data: { publicationTypeId: confTypeId, title: 'Automated Code Review Using Large Language Models: Challenges and Opportunities', year: 2023, citationCount: 7, status: PublicationStatus.SUBMITTED } },
    { facultyEmail: 'devraj.malhotra@college.edu', data: { publicationTypeId: journalTypeId, title: 'Continuous Testing Strategies for DevSecOps Pipelines in Cloud-Native Applications', year: 2022, citationCount: 14, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },

    // ── EMP030 Prof. Esha Kulkarni (IT/HCI) ──
    { facultyEmail: 'esha.kulkarni@college.edu', data: { publicationTypeId: journalTypeId, title: 'Inclusive UX Design Patterns for Visually Impaired Users in Mobile Banking Applications', year: 2023, citationCount: 6, isScopusIndexed: true, status: PublicationStatus.PUBLISHED } },
    { facultyEmail: 'esha.kulkarni@college.edu', data: { publicationTypeId: confTypeId, title: 'Cognitive Load Measurement in Adaptive E-Learning Interfaces Using Eye Tracking', year: 2023, citationCount: 3, status: PublicationStatus.PUBLISHED } },
  ];

  let count = 0;
  for (const pub of publications) {
    const faculty = byEmail[pub.facultyEmail];
    if (!faculty) continue;
    await prisma.publication.create({
      data: { facultyId: faculty.id, ...pub.data },
    });
    count++;
  }

  console.log(`  ✅ Publications seeded: ${count} publications`);
}
