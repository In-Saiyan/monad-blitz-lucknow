import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'aryan.singh.iiitl@gmail.com' },
    update: {
      role: 'ADMIN'
    },
    create: {
      email: 'aryan.singh.iiitl@gmail.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      totalScore: 0
    }
  });

  console.log('Admin user created:', admin);

  // Create some demo events
  const demoEvent = await prisma.cTFEvent.create({
    data: {
      name: 'Demo Web3 Security CTF',
      description: 'A demonstration CTF event showcasing Web3 security challenges',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      organizerId: admin.id,
      isActive: true
    }
  });

  // Create demo challenges
  await prisma.challenge.createMany({
    data: [
      {
        title: 'Smart Contract Vulnerability',
        description: 'Find the vulnerability in this smart contract and extract the flag.',
        category: 'Web3',
        difficulty: 'Medium',
        flag: 'ctnft{sm4rt_c0ntr4ct_vuln}',
        initialPoints: 500,
        minPoints: 100,
        decayFactor: 50,
        eventId: demoEvent.id
      },
      {
        title: 'Private Key Recovery',
        description: 'Recover the private key from the leaked information.',
        category: 'Cryptography',
        difficulty: 'Hard',
        flag: 'ctnft{pr1v4t3_k3y_l34k}',
        initialPoints: 800,
        minPoints: 200,
        decayFactor: 75,
        eventId: demoEvent.id
      },
      {
        title: 'Web3 Authentication Bypass',
        description: 'Bypass the Web3 authentication mechanism.',
        category: 'Web',
        difficulty: 'Easy',
        flag: 'ctnft{w3b3_4uth_byp4ss}',
        initialPoints: 300,
        minPoints: 50,
        decayFactor: 25,
        eventId: demoEvent.id
      }
    ]
  });

  console.log('Demo event and challenges created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
