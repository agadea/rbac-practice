import { PrismaClient, Action } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function ensureModule(name: string, description?: string) {
  let m = await prisma.module.findUnique({ where: { name } });
  if (!m) m = await prisma.module.create({ data: { name, description } });
  return m;
}

async function ensureSubmodule(moduleId: string, slug: string, name: string) {
  let s = await prisma.submodule.findFirst({
    where: { moduleId, slug },
  });
  if (!s) s = await prisma.submodule.create({ data: { moduleId, slug, name } });
  return s;
}

async function ensurePermission(submoduleId: string, action: Action, name?: string) {
  let p = await prisma.permission.findFirst({
    where: { submoduleId, action },
  });
  if (!p) {
    p = await prisma.permission.create({
      data: {
        submoduleId,
        action,
        name: name ?? `${submoduleId}:${action}`,
      },
    });
  }
  return p;
}

async function ensureRole(roleName: string, description?: string) {
  // upsert es atómico e idempotente si `name` es @unique en el schema
  const r = await prisma.role.upsert({
    where: { name: roleName },
    update: { description: description ?? undefined },
    create: { name: roleName, description, createdBy: "seed", status: true },
  });
  return r;
}

async function linkRolePermission(roleId: string, permissionId: string) {
  const exists = await prisma.rolePermission.findFirst({
    where: { roleId, permissionId },
  });
  if (!exists) {
    await prisma.rolePermission.create({ data: { roleId, permissionId } });
  }
}

async function ensureUser(email: string, firstName = "Pedro", lastName = "Test", plainPassword = "changeme") {
  const hashed = await bcrypt.hash(plainPassword, 10);
  let u = await prisma.user.findUnique({ where: { email } });
  if (!u) {
    u = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashed,
        status: true,
        createdBy: "seed",
      },
    });
  }
  return u;
}

async function assignRoleToUser(userId: string, roleId: string) {
  const exists = await prisma.userRole.findFirst({ where: { userId, roleId } });
  if (!exists) {
    await prisma.userRole.create({ data: { userId, roleId } });
  }
}

async function main() {
  console.log("Seeding RBAC baseline...");

  // 1) Module + Submodule
  const modCH = await ensureModule("Capital Humano", "Módulo de RRHH");
  const subEmpleados = await ensureSubmodule(modCH.id, "empleados", "Empleados");
  const subCargos = await ensureSubmodule(modCH.id, "cargos", "Cargos");

  // 2) Permissions for Empleados (CREATE, READ, UPDATE)
  const permEmpCreate = await ensurePermission(subEmpleados.id, Action.CREATE, "capitalhumano.empleados.CREATE");
  const permEmpRead = await ensurePermission(subEmpleados.id, Action.READ, "capitalhumano.empleados.READ");
  const permEmpUpdate = await ensurePermission(subEmpleados.id, Action.UPDATE, "capitalhumano.empleados.UPDATE");

  // 3) Permissions for Cargos (no permissions for RRHH in your example, but create baseline)
  const permCargosRead = await ensurePermission(subCargos.id, Action.READ, "capitalhumano.cargos.READ");

  // 4) Role RRHH and link permisos (only empleados permissions)
  const roleRRHH = await ensureRole("RRHH", "Responsable de capital humano");
  await linkRolePermission(roleRRHH.id, permEmpCreate.id);
  await linkRolePermission(roleRRHH.id, permEmpRead.id);
  await linkRolePermission(roleRRHH.id, permEmpUpdate.id);
  // note: do not link cargos permissions to RRHH

  // 5) Create test user Pedro and assign RRHH
  const pedro = await ensureUser("pedro@example.com", "Pedro", "González", "changeme");
  await assignRoleToUser(pedro.id, roleRRHH.id);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });