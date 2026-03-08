import { User, PrismaClient } from '@prisma/client';

export class ProfileRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isEmailVerified: true,
        isSuspended: true,
        suspensionReason: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as any;
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateProfile(id: string, data: { name?: string; email?: string }): Promise<Omit<User, 'password'>> {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) {
      updateData.email = data.email;
      updateData.isEmailVerified = false; // Reset email verification if email changes
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isEmailVerified: true,
        isSuspended: true,
        suspensionReason: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as any;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async deleteAccount(id: string): Promise<void> {
    // Delete user and all related data (cascade will handle most relations)
    await this.prisma.user.delete({
      where: { id },
    });
  }
}