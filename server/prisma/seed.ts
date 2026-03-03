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
      name: 'free',
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
      name: 'basic',
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
      name: 'pro',
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
      name: 'enterprise',
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

  // Create sample users with different packages
  const sampleUsers = [
    {
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
      packageName: 'free',
    },
    {
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice',
      packageName: 'basic',
    },
    {
      email: 'bob@example.com',
      password: 'password123',
      name: 'Bob',
      packageName: 'pro',
    },
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          isAdmin: false,
          isEmailVerified: true,
        },
      });

      // Find the package for this user
      const userPackage = await prisma.package.findUnique({
        where: { name: userData.packageName },
      });

      if (userPackage) {
        // Create subscription for the user
        await prisma.subscription.create({
          data: {
            userId: user.id,
            packageId: userPackage.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            isActive: true,
          },
        });

        // Create sample folders for each user
        const rootFolder = await prisma.folder.create({
          data: {
            name: 'Documents',
            userId: user.id,
            parentId: null,
            path: '/Documents',
            level: 1,
          },
        });

        const subFolder1 = await prisma.folder.create({
          data: {
            name: 'Projects',
            userId: user.id,
            parentId: rootFolder.id,
            path: '/Documents/Projects',
            level: 2,
          },
        });

        const subFolder2 = await prisma.folder.create({
          data: {
            name: 'Images',
            userId: user.id,
            parentId: rootFolder.id,
            path: '/Documents/Images',
            level: 2,
          },
        });

        // Create sample files
        const sampleFiles = [
          {
            name: `${user.id}_project_proposal_${Date.now()}.pdf`,
            originalName: 'project-proposal.pdf',
            mimeType: 'application/pdf',
            size: BigInt(2 * 1024 * 1024), // 2MB
            path: `files/${user.id}/project_proposal_${Date.now()}.pdf`,
            folderId: subFolder1.id,
          },
          {
            name: `${user.id}_meeting_notes_${Date.now()}.pdf`,
            originalName: 'meeting-notes.pdf',
            mimeType: 'application/pdf',
            size: BigInt(1024 * 1024), // 1MB
            path: `files/${user.id}/meeting_notes_${Date.now()}.pdf`,
            folderId: subFolder1.id,
          },
          {
            name: `${user.id}_profile_photo_${Date.now()}.jpg`,
            originalName: 'profile-photo.jpg',
            mimeType: 'image/jpeg',
            size: BigInt(500 * 1024), // 500KB
            path: `files/${user.id}/profile_photo_${Date.now()}.jpg`,
            folderId: subFolder2.id,
          },
          {
            name: `${user.id}_company_logo_${Date.now()}.png`,
            originalName: 'company-logo.png',
            mimeType: 'image/png',
            size: BigInt(300 * 1024), // 300KB
            path: `files/${user.id}/company_logo_${Date.now()}.png`,
            folderId: subFolder2.id,
          },
          {
            name: `${user.id}_readme_${Date.now()}.pdf`,
            originalName: 'readme.pdf',
            mimeType: 'application/pdf',
            size: BigInt(800 * 1024), // 800KB
            path: `files/${user.id}/readme_${Date.now()}.pdf`,
            folderId: rootFolder.id,
          },
        ];

        for (const fileData of sampleFiles) {
          await prisma.file.create({
            data: {
              ...fileData,
              userId: user.id,
              isFavorite: Math.random() > 0.7, // 30% chance of being favorite
            },
          });
        }

        console.log(`✅ User created: ${user.email} (${userData.packageName} package) with sample data`);
      }
    } else {
      console.log(`ℹ️  User already exists: ${userData.email}`);
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
