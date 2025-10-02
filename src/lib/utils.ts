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

// Resolver nombres de pasajeros a partir de las claves de referencia
export function resolvePassengerNames(passengers: any[] | undefined, keys?: string[]) {
  if (!keys || !Array.isArray(keys) || !passengers) return (keys ?? []).map(String);
  return keys.map((k) => {
    const p = passengers.find((pp) => pp.id === k || pp.raw?.passenger_reference_key === k);
    if (!p) return k;
    return `${p.givenName ?? ""} ${p.surname ?? ""}`.trim() || k;
  });
}