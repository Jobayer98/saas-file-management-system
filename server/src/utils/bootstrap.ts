import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import logger from '@/lib/logger';

export async function bootstrapAdmin() {
  try {
    // Check if any admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (adminExists) {
      logger.info('✅ Admin user already exists');
      return;
    }

    // Default admin configuration from environment or defaults
    const adminConfig = {
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(adminConfig.password, 10);

    // Create default admin user
    const admin = await prisma.user.create({
      data: {
        name: adminConfig.name,
        email: adminConfig.email.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
        isEmailVerified: true,
      },
    });

    logger.info('='.repeat(60));
    logger.info('🎉 Default admin user created successfully!');
    logger.info('='.repeat(60));
    logger.info(`📧 Email: ${admin.email}`);
    logger.info(`🔑 Password: ${adminConfig.password}`);
    logger.info('='.repeat(60));
    logger.warn('⚠️  IMPORTANT: Change the default password after first login!');
    logger.info('💡 TIP: Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in .env');
    logger.info('='.repeat(60));
  } catch (error) {
    logger.error('❌ Error creating default admin user:', error);
    // Don't throw error to prevent app from crashing
  }
}
