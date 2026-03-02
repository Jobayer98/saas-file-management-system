import bcrypt from 'bcryptjs';

import prisma from "../src/lib/prisma"

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123456';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        isAdmin: true,
        isEmailVerified: true,
      },
    });

    console.log('✅ Admin user created:', {
      email: admin.email,
      password: adminPassword,
    });
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create default packages
  const packages = [
    {
      name: 'Free',
      description: 'Basic package for personal use',
      maxFolders: 10,
      maxNestingLevel: 3,
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxFileSize: BigInt(10 * 1024 * 1024), // 10MB
      totalFileLimit: BigInt(100 * 1024 * 1024), // 100MB
      filesPerFolder: 20,
      price: 0,
    },
    {
      name: 'Basic',
      description: 'Perfect for small teams',
      maxFolders: 50,
      maxNestingLevel: 5,
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'audio/mpeg'],
      maxFileSize: BigInt(50 * 1024 * 1024), // 50MB
      totalFileLimit: BigInt(1024 * 1024 * 1024), // 1GB
      filesPerFolder: 100,
      price: 9.99,
    },
    {
      name: 'Pro',
      description: 'For growing businesses',
      maxFolders: 200,
      maxNestingLevel: 10,
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'audio/mpeg', 'application/zip'],
      maxFileSize: BigInt(100 * 1024 * 1024), // 100MB
      totalFileLimit: BigInt(10 * 1024 * 1024 * 1024), // 10GB
      filesPerFolder: 500,
      price: 29.99,
    },
    {
      name: 'Enterprise',
      description: 'Unlimited for large organizations',
      maxFolders: 1000,
      maxNestingLevel: 20,
      allowedFileTypes: ['*'],
      maxFileSize: BigInt(500 * 1024 * 1024), // 500MB
      totalFileLimit: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      filesPerFolder: 2000,
      price: 99.99,
    },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findUnique({
      where: { name: pkg.name },
    });

    if (!existing) {
      await prisma.package.create({ data: pkg });
      console.log(`✅ Package created: ${pkg.name}`);
    } else {
      console.log(`ℹ️  Package already exists: ${pkg.name}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
