import { prisma } from "./config/prisma";

const ROLES = ["ADMIN", "EVALUATOR", "SUPERVISOR_AUDITOR"];

const PERMISSIONS = [
  { key: "MANAGE_USERS", description: "Create, suspend, and reassign roles for accounts" },
  { key: "CREATE_ASSESSMENT", description: "Create synthetic patients, visits, and assessments" },
  { key: "VIEW_OWN_HISTORY", description: "View one's own assessment history" },
  { key: "VIEW_AUDIT_LOG", description: "Read-only access to the audit log" },
];

// role -> which permission keys it holds
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["MANAGE_USERS", "CREATE_ASSESSMENT", "VIEW_OWN_HISTORY", "VIEW_AUDIT_LOG"],
  EVALUATOR: ["CREATE_ASSESSMENT", "VIEW_OWN_HISTORY"],
  SUPERVISOR_AUDITOR: ["VIEW_AUDIT_LOG"],
};

async function main() {
  for (const name of ROLES) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { description: perm.description },
      create: perm,
    });
  }

  for (const [roleName, permKeys] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    for (const key of permKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log("Seeded roles, permissions, and role-permission mappings.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });