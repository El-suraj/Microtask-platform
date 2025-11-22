import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashed = await bcrypt.hash("Admin123!", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@example.com",
        password: hashed,
        role: "ADMIN",
      },
    });

    console.log("Admin created:", admin);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
