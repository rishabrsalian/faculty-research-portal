import { PrismaClient, Role, Gender } from '@prisma/client';
import { hashPassword } from '../../utils/password.util';

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding users...');

  const facultyPassword = await hashPassword('Faculty@123');
  const adminPassword   = await hashPassword('Admin@123');

  // ─── 2 Admin Accounts ────────────────────────────────────────
  const adminUsers = [
    { email: 'admin@college.edu',    name: 'Dr. Ramesh Kumar',     role: Role.ADMIN },
    { email: 'principal@college.edu',name: 'Dr. Sunita Sharma',    role: Role.ADMIN },
  ];

  for (const u of adminUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, password: adminPassword, isActive: true },
    });
  }

  // ─── 30 Faculty Accounts ─────────────────────────────────────
  const facultyUsers = [
    { email: 'arjun.mehta@college.edu',         name: 'Dr. Arjun Mehta' },
    { email: 'priya.nair@college.edu',           name: 'Dr. Priya Nair' },
    { email: 'suresh.rao@college.edu',           name: 'Prof. Suresh Rao' },
    { email: 'deepa.krishnan@college.edu',       name: 'Dr. Deepa Krishnan' },
    { email: 'rajiv.sharma@college.edu',         name: 'Dr. Rajiv Sharma' },
    { email: 'anita.desai@college.edu',          name: 'Prof. Anita Desai' },
    { email: 'vikram.singh@college.edu',         name: 'Dr. Vikram Singh' },
    { email: 'meena.iyer@college.edu',           name: 'Dr. Meena Iyer' },
    { email: 'ashok.patel@college.edu',          name: 'Prof. Ashok Patel' },
    { email: 'lavanya.subramanian@college.edu',  name: 'Dr. Lavanya Subramanian' },
    { email: 'ravi.varma@college.edu',           name: 'Dr. Ravi Varma' },
    { email: 'sneha.gupta@college.edu',          name: 'Prof. Sneha Gupta' },
    { email: 'naresh.joshi@college.edu',         name: 'Dr. Naresh Joshi' },
    { email: 'kavita.reddy@college.edu',         name: 'Dr. Kavita Reddy' },
    { email: 'mohan.das@college.edu',            name: 'Prof. Mohan Das' },
    { email: 'shantha.pillai@college.edu',       name: 'Dr. Shantha Pillai' },
    { email: 'arun.kumar@college.edu',           name: 'Dr. Arun Kumar' },
    { email: 'divya.menon@college.edu',          name: 'Prof. Divya Menon' },
    { email: 'sanjay.bhatt@college.edu',         name: 'Dr. Sanjay Bhatt' },
    { email: 'rekha.pandey@college.edu',         name: 'Dr. Rekha Pandey' },
    { email: 'girish.nanda@college.edu',         name: 'Prof. Girish Nanda' },
    { email: 'usha.venkat@college.edu',          name: 'Dr. Usha Venkat' },
    { email: 'pramod.hegde@college.edu',         name: 'Dr. Pramod Hegde' },
    { email: 'leela.narayan@college.edu',        name: 'Prof. Leela Narayan' },
    { email: 'dilip.shetty@college.edu',         name: 'Dr. Dilip Shetty' },
    { email: 'aarti.saxena@college.edu',         name: 'Dr. Aarti Saxena' },
    { email: 'bhaskar.rao@college.edu',          name: 'Prof. Bhaskar Rao' },
    { email: 'chitra.suresh@college.edu',        name: 'Dr. Chitra Suresh' },
    { email: 'devraj.malhotra@college.edu',      name: 'Dr. Devraj Malhotra' },
    { email: 'esha.kulkarni@college.edu',        name: 'Prof. Esha Kulkarni' },
  ];

  for (const u of facultyUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, role: Role.FACULTY, password: facultyPassword, isActive: true },
    });
  }

  console.log('  ✅ Users seeded: 2 admins + 30 faculty');
}
