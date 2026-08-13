import { prisma } from "./config/prisma";
import { hashPassword } from "./utils/password";

async function main() {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
  const passwordHash = await hashPassword("ChangeMe123!");

  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash, roleId: role.id, status: "ACTIVE" },
    create: { username: "admin", passwordHash, roleId: role.id, status: "ACTIVE" },
  });

  console.log("Seeded user:", user);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });