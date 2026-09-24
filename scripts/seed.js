const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding complete Cyber Sentinel database for all 5 roles...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Registered User
  const registeredUser = await prisma.user.upsert({
    where: { email: 'user@sentinel.com' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Alex Johnson',
      email: 'user@sentinel.com',
      phone: '+1-555-0144',
      passwordHash: defaultPasswordHash,
      role: 'registered_user',
      status: 'ACTIVE',
      account: {
        create: {
          bio: 'Cybersecurity Enthusiast & Tech Blogger',
          institution: 'Tech Corp Security Team',
        },
      },
    },
  });

  // 2. Student User
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@sentinel.com' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Jordan Lee',
      email: 'student@sentinel.com',
      phone: '+1-555-0988',
      passwordHash: defaultPasswordHash,
      role: 'student_user',
      status: 'ACTIVE',
      account: {
        create: {
          bio: 'Computer Science Undergraduate',
          institution: 'State University',
          department: 'Computer Science & Cybersecurity',
        },
      },
    },
  });

  // 3. Senior Citizen User
  const seniorUser = await prisma.user.upsert({
    where: { email: 'senior@sentinel.com' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Robert Vance',
      email: 'senior@sentinel.com',
      phone: '+1-555-0321',
      passwordHash: defaultPasswordHash,
      role: 'senior_citizen',
      status: 'ACTIVE',
      account: {
        create: {
          bio: 'Retired Educator',
          institution: 'Senior Community Center',
        },
      },
    },
  });

  // 4. Cybersecurity Analyst
  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@sentinel.com' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Sarah Connor',
      email: 'analyst@sentinel.com',
      phone: '+1-555-0872',
      passwordHash: defaultPasswordHash,
      role: 'cybersecurity_analyst',
      status: 'ACTIVE',
      account: {
        create: {
          bio: 'Certified SOC Analyst & Threat Hunter (CISSP, CEH)',
          institution: 'Cyber Sentinel Security Operations Center',
          department: 'Digital Forensics & Incident Response',
        },
      },
    },
  });

  // 5. System Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sentinel.com' },
    update: { status: 'ACTIVE' },
    create: {
      name: 'Marcus Holloway',
      email: 'admin@sentinel.com',
      phone: '+1-555-0999',
      passwordHash: defaultPasswordHash,
      role: 'administrator',
      status: 'ACTIVE',
      account: {
        create: {
          bio: 'Chief Information Security Officer & System Administrator',
          institution: 'Cyber Sentinel Platform Directorate',
        },
      },
    },
  });

  // Seed Emergency Contacts for Senior Citizen
  await prisma.emergencyContact.deleteMany({ where: { userId: seniorUser.id } });
  await prisma.emergencyContact.createMany({
    data: [
      {
        userId: seniorUser.id,
        name: 'Michael Vance (Son)',
        phone: '+1-555-0455',
        email: 'michael.vance@example.com',
        relationship: 'CHILD',
        notifyOnCritical: true,
      },
      {
        userId: seniorUser.id,
        name: 'Dr. Evelyn Reed (Caregiver)',
        phone: '+1-555-0677',
        email: 'dr.reed@careclinic.org',
        relationship: 'CAREGIVER',
        notifyOnCritical: true,
      },
    ],
  });

  // Seed PhoneCallCheck for Senior Citizen
  await prisma.phoneCallCheck.deleteMany({ where: { userId: seniorUser.id } });
  const sampleCall = await prisma.phoneCallCheck.create({
    data: {
      userId: seniorUser.id,
      callerNumber: '+1 (800) 477-0199',
      callerName: 'IRS Legal Enforcement Officer',
      transcript: 'This is Officer Smith from the IRS. You have a criminal warrant for unpaid federal taxes. A sheriff unit is coming to arrest you unless you purchase $1,000 in Target gift cards right now.',
      riskLevel: 'CRITICAL',
      confidenceScore: 96.5,
      threatType: 'CONFIRMED_PHONE_FRAUD_SCAM',
      indicators: JSON.stringify([
        {
          type: 'GOVERNMENT_IMPERSONATION_THREAT',
          title: 'Government / Law Enforcement Impersonation',
          description: 'Caller falsely claimed to be an IRS officer threatening immediate arrest.',
          severity: 'critical',
        },
        {
          type: 'UNTRACEABLE_PAYMENT_DEMAND',
          title: 'Gift Card Payment Demand',
          description: 'Demanded payment via Target gift cards.',
          severity: 'critical',
        },
      ]),
      explanation: 'DANGEROUS SCAM CALL DETECTED: This call exhibits severe indicators of elder financial extortion.',
      recommendation: 'HANG UP THE PHONE IMMEDIATELY. Do not provide any gift cards or banking details.',
      familyAlertSent: true,
    },
  });

  // Seed Reported Incidents and Cases
  await prisma.investigationNote.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.reportedIncident.deleteMany({});

  const incident1 = await prisma.reportedIncident.create({
    data: {
      userId: seniorUser.id,
      title: 'Predatory IRS Extortion Call Threatening Arrest',
      description: 'Received an aggressive call from +1 (800) 477-0199 claiming my Social Security is frozen and demanding $1,000 in gift cards.',
      incidentType: 'PHONE_SCAM',
      evidence: 'Caller ID: +1-800-477-0199, requested Target gift card codes.',
      riskLevel: 'CRITICAL',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedToId: analystUser.id,
    },
  });

  const case1 = await prisma.case.create({
    data: {
      incidentId: incident1.id,
      analystId: analystUser.id,
      title: 'Forensic Triage: IRS Impersonation Robocall Campaign',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      notes: 'Initial triage complete. Number traced to spoofed VOIP provider.',
    },
  });

  await prisma.investigationNote.create({
    data: {
      caseId: case1.id,
      incidentId: incident1.id,
      analystId: analystUser.id,
      note: 'Verified spoofed toll-free VOIP origin. Senior user successfully disconnected before transferring funds. Family alert confirmed.',
    },
  });

  const incident2 = await prisma.reportedIncident.create({
    data: {
      userId: studentUser.id,
      title: 'Fake Remote Data Entry Job Requiring $200 Deposit',
      description: 'Received job offer from recruiter.globaltech@gmail.com promising $150/hr and requesting $200 wire transfer for laptop setup.',
      incidentType: 'JOB_SCAM',
      evidence: 'Email: recruiter.globaltech@gmail.com, Telegram: @recruiter_sarah',
      riskLevel: 'HIGH',
      priority: 'HIGH',
      status: 'OPEN',
    },
  });

  await prisma.case.create({
    data: {
      incidentId: incident2.id,
      title: 'Investigation: Global Remote Tech Employment Scam',
      status: 'OPEN',
      priority: 'HIGH',
      notes: 'Pending analyst assignment.',
    },
  });

  // Seed Audit Logs
  await prisma.auditLog.deleteMany({});
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        role: 'administrator',
        action: 'SYSTEM_INITIALIZED',
        details: 'Cyber Sentinel AI System initialized with 5 specialized user roles.',
      },
      {
        userId: seniorUser.id,
        role: 'senior_citizen',
        action: 'FAMILY_ALERT_DISPATCHED',
        details: 'Family alert dispatched to Michael Vance and Dr. Evelyn Reed regarding call from +1 (800) 477-0199.',
      },
      {
        userId: analystUser.id,
        role: 'cybersecurity_analyst',
        action: 'CASE_CLAIMED',
        details: `Analyst Sarah Connor claimed Case #${case1.id.slice(0, 8)} for active forensic investigation.`,
      },
    ],
  });

  console.log('✅ Database successfully seeded for all 5 roles:');
  console.log('1. Registered User:       user@sentinel.com       / password123');
  console.log('2. Student User:          student@sentinel.com    / password123');
  console.log('3. Senior Citizen:        senior@sentinel.com     / password123');
  console.log('4. Cybersecurity Analyst: analyst@sentinel.com    / password123');
  console.log('5. Administrator:         admin@sentinel.com      / password123');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
