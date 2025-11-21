
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

//get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        walletBalance: true,
        createdAt: true,
        role: true,
      },
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
//update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name,
        phone,
        profileImage,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
