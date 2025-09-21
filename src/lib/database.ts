import { PrismaClient } from "../../generated/prisma";

/**
 * Prisma Client Singleton
 * 
 * Evita instancias multiples de PrismaClient en entornos de desarrollo (HMR)
 */

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismaClient;

export default prismaClient;