import prismaClient from "./database";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Action } from "../../generated/prisma";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function userHasPermission(userId: string, submoduleId: string, action: Action) {
  const rp = await prismaClient.rolePermission.findFirst({
    where: {
      permission: { submoduleId, action },
      role: { userRoles: { some: { userId } } }
    },
    select: { id: true }
  });
  return !!rp;
}