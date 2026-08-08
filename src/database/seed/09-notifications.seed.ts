import { PrismaClient, NotificationType } from '@prisma/client';

export async function seedNotifications(prisma: PrismaClient): Promise<void> {
  console.log('  🌱 Seeding notifications...');

  const allUsers = await prisma.user.findMany({
    include: { facultyProfile: true },
    where: { role: 'FACULTY' },
  });

  const systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

  // System-wide announcement
  for (const user of allUsers) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to the Faculty Research Portal',
        message: 'Your research and publication portal is now active. Please complete your profile and add your publications, patents, and projects.',
        type: NotificationType.ANNOUNCEMENT,
        isRead: false,
      },
    });
  }

  // Publication-related notifications for some faculty
  const notifs = [
    { email: 'arjun.mehta@college.edu',        title: 'Publication Verified', message: 'Your publication "Deep Learning Based Intrusion Detection System" has been verified by admin.', type: NotificationType.PUBLICATION_VERIFIED },
    { email: 'priya.nair@college.edu',          title: 'Publication Verified', message: 'Your publication "Low Power VLSI Design of Reconfigurable FIR Filter" has been verified.', type: NotificationType.PUBLICATION_VERIFIED },
    { email: 'rajiv.sharma@college.edu',        title: 'Patent Approved',      message: 'Your patent "Intelligent Energy Management System" has been approved and grant recorded.', type: NotificationType.PATENT_APPROVED },
    { email: 'vikram.singh@college.edu',        title: 'Patent Approved',      message: 'Your patent "Fiber Reinforced Polymer Composite Rebar" has been granted by IPO.', type: NotificationType.PATENT_APPROVED },
    { email: 'shantha.pillai@college.edu',      title: 'Project Approved',     message: 'Your DST project on Green Cloud Data Centers has been sanctioned. Please update the project details.', type: NotificationType.PROJECT_APPROVED },
    { email: 'kavita.reddy@college.edu',        title: 'Project Approved',     message: 'Your SERB project on Metal Oxide Nanowire Arrays has been sanctioned.', type: NotificationType.PROJECT_APPROVED },
    { email: 'arjun.mehta@college.edu',        title: 'Annual Report Due',    message: 'Please submit your annual research report for the academic year 2023-24 by March 31, 2024.', type: NotificationType.REPORT_DUE },
    { email: 'naresh.joshi@college.edu',        title: 'Annual Report Due',    message: 'Annual research report submission deadline is approaching. Complete your submissions by March 31, 2024.', type: NotificationType.REPORT_DUE },
    { email: 'divya.menon@college.edu',         title: 'Project Approved',     message: 'Your DST NEMMP project on EV Charger has been sanctioned with ₹48 lakhs.', type: NotificationType.PROJECT_APPROVED },
    { email: 'usha.venkat@college.edu',         title: 'Patent Approved',      message: 'Your patent on Continuous Glucose Monitoring System has been granted.', type: NotificationType.PATENT_APPROVED },
  ];

  for (const n of notifs) {
    const user = await prisma.user.findUnique({ where: { email: n.email } });
    if (!user) continue;
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: Math.random() > 0.5,
      },
    });
  }

  if (systemUser) {
    // Admin gets a summary notification
    await prisma.notification.create({
      data: {
        userId: systemUser.id,
        title: 'System: Seeding Complete',
        message: '30 faculty accounts have been created with publications, patents, and project data.',
        type: NotificationType.SYSTEM,
        isRead: false,
      },
    });
  }

  console.log('  ✅ Notifications seeded');
}
