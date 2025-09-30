/**
 * Transformador de PNR
 * Convierte el payload original (con objetos indexados por claves) a una estructura
 * normalizada y amigable para la UI: arrays, camelCase, masking de números,
 * campos derivados (age, expiresInDays, expired, expiresSoon) y advertencias.
 */

type RawMap<T> = { [key: string]: T };

export type PointOfSale = {
  user?: string;
  kiuDeviceId?: string;
  agentId?: string;
  country?: string;
  saleChannel?: string;
  officeIssueCode?: string;
  [k: string]: any;
};

export type FOID = {
  id: string;
  type?: string;
  documentNumberMasked?: string | null;
  raw?: any;
};

export type TravelDocument = {
  id: string;
  type?: string | null; // e.g. PASSPORT, DOC
  code?: string | null; // e.g. P
  numberMasked?: string | null;
  issuingPlace?: string | null;
  expiryDate?: string | null; // ISO
  expired?: boolean;
  expiresInDays?: number | null;
  expiresSoon?: boolean;
  raw?: any;
};

export type Address = {
  id?: string;
  type?: string | null;
  country?: string | null;
  details?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  raw?: any;
};

export type Passenger = {
  id: string;
  order?: number | null;
  surname?: string | null;
  givenName?: string | null;
  gender?: string | null; // M/F/MALE etc.
  dateOfBirth?: string | null; // ISO
  age?: number | null;
  passengerType?: string | null;
  infantAssociated?: boolean;
  nationality?: string | null;
  foids: FOID[];
  travelDocuments: TravelDocument[];
  addresses: Address[];
  raw?: any;
};

export type WarningItem = {
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: any;
};

export type TransformedPNR = {
  recordLocator?: string | null;
  pointOfSale?: PointOfSale | null;
  passengers: Passenger[];
  warnings?: WarningItem[];
  raw?: any;
};

/** Helpers */
const now = () => new Date();

function parseDateSafe(d?: string | null): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

function daysBetween(dateIso?: string | null): number | null {
  const d = parseDateSafe(dateIso);
  if (!d) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((d.getTime() - now().getTime()) / msPerDay);
}

function calculateAge(dob?: string | null): number | null {
  const d = parseDateSafe(dob);
  if (!d) return null;
  const today = now();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function maskNumber(n?: string | null, keepLast = 4): string | null {
  if (!n) return null;
  const s = String(n);
  if (s.length <= keepLast) return s.replace(/./g, '*');
  const visible = s.slice(-keepLast);
  const masked = s.slice(0, Math.max(0, s.length - keepLast)).replace(/./g, '*');
  return masked + visible;
}

function toArray<T>(maybeMap?: RawMap<T> | T[] | null): T[] {
  if (!maybeMap) return [];
  if (Array.isArray(maybeMap)) return maybeMap;
  return Object.values(maybeMap as RawMap<T>);
}

function safeGet<T = any>(o: any, ...keys: string[]): T | undefined {
  let cur = o;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur as T | undefined;
}

/** Main transformer */
export function transformPnr(raw: any): TransformedPNR {
  const out: TransformedPNR = {
    recordLocator:
      raw.recordLocator || raw['Record locator'] || raw.record_locator || raw.recordLocator || null,
    pointOfSale: null,
    passengers: [],
    warnings: [],
    raw,
  };

  // Point of sale: try multiple key styles
  const pos = raw.pointOfSale || raw.PointOfSale || raw['Point of sale'] || raw.point_of_sale || null;
  if (pos) {
    out.pointOfSale = {
      user: safeGet(pos, 'user') || safeGet(pos, 'User') || undefined,
      kiuDeviceId: safeGet(pos, 'kiu_device_id') || safeGet(pos, 'kiuDeviceId') || undefined,
      agentId: safeGet(pos, 'agent_id') || safeGet(pos, 'agentId') || undefined,
      country: safeGet(pos, 'country') || undefined,
      saleChannel: safeGet(pos, 'sale_channel') || safeGet(pos, 'saleChannel') || undefined,
      officeIssueCode:
        safeGet(pos, 'office_issue_code') || safeGet(pos, 'officeIssueCode') || undefined,
      raw: pos,
    } as PointOfSale;
  }

  // Build a global travel documents index if present at top-level to assist dedup
  const globalTravelDocsMap: Record<string, any> = {};
  const globalTD = raw.travel_documents || raw['Travel documents'] || null;
  if (globalTD && typeof globalTD === 'object') {
    for (const [pid, docs] of Object.entries(globalTD)) {
      if (docs && typeof docs === 'object') {
        for (const [tdid, td] of Object.entries(docs as RawMap<any>)) {
          globalTravelDocsMap[String(tdid)] = td;
        }
      }
    }
  }

  const passengersObj = raw.passengers || raw['Passengers information'] || raw.passenger || raw.passengers_information || raw.passengerInformation || {};

  for (const [pid, pRaw] of Object.entries(passengersObj as RawMap<any>)) {
    const p = pRaw as any;
    const passenger: Passenger = {
      id: String(pid),
      order: p.order ?? p.Order ?? null,
      surname: p.surname ?? p.SURNAME ?? null,
      givenName:
        p.name ?? safeGet(p, 'travel_document_information', Object.keys(p.travel_document_information || {})[0], 'travel_document_first_given_name') ?? null,
      gender: p.gender ?? p.GENDER ?? null,
      dateOfBirth: p.date_of_birth ?? p.dateOfBirth ?? null,
      age: calculateAge(p.date_of_birth ?? p.dateOfBirth ?? null),
      passengerType: p.passenger_type ?? p.passengerType ?? null,
      infantAssociated: p.infant_associated_indicator ?? p.infantAssociated ?? false,
      nationality: p.passenger_nationality_reference_id ?? p.nationality ?? null,
      foids: [],
      travelDocuments: [],
      addresses: [],
      raw: p,
    };

    // FOID information (map)
    const foidInfo = p.foid_information || p.FOID_information || p.foids || null;
    if (foidInfo && typeof foidInfo === 'object') {
      for (const [fid, f] of Object.entries(foidInfo as RawMap<any>)) {
        passenger.foids.push({
          id: String(fid),
          type: f.foid_type_reference_id ?? f.type ?? null,
          documentNumberMasked: maskNumber(f.foid_id ?? f.foidId ?? f.documentNumber ?? null),
          raw: f,
        });
      }
    }

    // Travel documents - prefer passenger.travel_document_information, fall back to global map
    const tdInfo = p.travel_document_information || p.travelDocumentInformation || p.travel_documents || null;
    if (tdInfo && (Array.isArray(tdInfo) || typeof tdInfo === 'object')) {
      for (const [tid, t] of Object.entries(tdInfo as RawMap<any>)) {
        const tdRaw = t || globalTravelDocsMap[tid] || null;
        if (!tdRaw) continue;
        const expiresInDays = daysBetween(tdRaw.travel_document_expiry_date ?? tdRaw.expiryDate ?? null);
        const expired = expiresInDays !== null && expiresInDays < 0;
        const expiresSoon = expiresInDays !== null && expiresInDays >= 0 && expiresInDays <= 180;
        passenger.travelDocuments.push({
          id: String(tid),
          type: tdRaw.travel_document_name ?? tdRaw.type ?? null,
          code: tdRaw.travel_document_code ?? tdRaw.code ?? null,
          numberMasked: maskNumber(tdRaw.travel_document_number ?? tdRaw.number ?? null),
          issuingPlace: tdRaw.travel_document_issuing_place ?? tdRaw.issuingPlace ?? null,
          expiryDate: tdRaw.travel_document_expiry_date ?? tdRaw.expiryDate ?? null,
          expired,
          expiresInDays,
          expiresSoon,
          raw: tdRaw,
        });

        if (expired) {
          out.warnings!.push({ level: 'warning', message: `Document ${tid} for passenger ${pid} is expired`, context: { passengerId: pid, documentId: tid } });
        } else if (expiresSoon) {
          out.warnings!.push({ level: 'info', message: `Document ${tid} for passenger ${pid} expires soon`, context: { passengerId: pid, documentId: tid } });
        }
      }
    } else {
      out.warnings!.push({ level: 'info', message: `Passenger ${pid} has no travel documents found`, context: { passengerId: pid } });
    }

    // Addresses
    const addrInfo = p.travel_address_information || p.travelAddressInformation || p.addresses || null;
    if (addrInfo && typeof addrInfo === 'object') {
      for (const [aid, a] of Object.entries(addrInfo as RawMap<any>)) {
        const address: Address = {
          id: String(aid),
          type: a.type_of_address ?? a.type ?? null,
          country: a.country ?? null,
          details: a.address_details ?? a.details ?? null,
          city: a.city ?? null,
          state: a.state ?? null,
          zipCode: a.zip_code ?? a.zipCode ?? null,
          raw: a,
        };
        if (!address.city) {
          out.warnings!.push({ level: 'info', message: `Address ${aid} for passenger ${pid} missing city`, context: { passengerId: pid, addressId: aid } });
        }
        passenger.addresses.push(address);
      }
    }

    out.passengers.push(passenger);
  }

  // Deduplicate warnings (simple approach)
  if (out.warnings && out.warnings.length > 0) {
    const uniq = new Map<string, WarningItem>();
    for (const w of out.warnings) {
      const k = `${w.level}:${w.message}`;
      if (!uniq.has(k)) uniq.set(k, w);
    }
    out.warnings = Array.from(uniq.values());
  }

  return out;
}

export default transformPnr;
