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
  ticketNumber?: string | null;
  foids: FOID[];
  travelDocuments: TravelDocument[];
  addresses: Address[];
  raw?: any;
};

export type Contact = {
  id?: string;
  order?: number | null;
  type?: string | null;
  value?: string | null; // prefer description or value
  associationKeys?: string[]; // passenger reference keys if present
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
  tickets?: Ticket[];
  contacts?: Contact[];
  warnings?: WarningItem[];
  raw?: any;
};

export type Ticket = {
  ticketNumber: string;
  passengerRefs?: string[]; // passenger ids
  order?: number | null;
  transaction?: string | null;
  ssrEntries?: Array<{ couponNumber?: string | null; flightSegmentRef?: string | null; raw?: any }>;
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

  // Normalizar contacts_list si existe en el raw
  try {
    const rawContacts = raw.contacts_list || raw.contacts || null;
    const contactsArr = toArray(rawContacts as any);
    if (contactsArr.length > 0) {
      out.contacts = contactsArr.map((c: any, idx: number) => {
        const associationKeys: string[] = [];
        if (Array.isArray(c.association_list)) {
          for (const a of c.association_list) {
            if (!a) continue;
            const prs = a.passenger_reference_keys ?? a.passenger_reference_key ?? a.passenger_keys ?? null;
            if (Array.isArray(prs)) associationKeys.push(...prs.map(String));
            else if (prs) associationKeys.push(String(prs));
          }
        }

        return {
          id: c.contact_reference_key ?? (c.id ? String(c.id) : `__c_${idx}`),
          order: c.order ?? null,
          type: c.type ?? c.contact_type ?? c.kind ?? null,
          value: c.description ?? c.value ?? c.contact_value ?? c.contact ?? null,
          associationKeys: associationKeys.length ? associationKeys : undefined,
          raw: c,
        } as Contact;
      });
    }
  } catch (e) {
    // no crash on malformed contacts
  }

  // Normalizar tickets: combinar tickets_list (entrada plana) con ssr_tkne_information (coupons)
  try {
    const ticketsArr = toArray(raw.tickets_list || raw.tickets || null) as any[];
    const ssrArr = toArray(raw.ssr_tkne_information || raw.ssr_tk_ne_information || raw.ssr_tkne || null) as any[];

    const ticketsMap: Record<string, Ticket> = {};

    // Primero, procesar tickets_list como fuente primaria de ticketNumber
    for (const t of ticketsArr) {
      const tn = t.ticket_number ?? t.ticketNumber ?? t.number ?? null;
      if (!tn) continue;
      const key = String(tn);
      ticketsMap[key] = ticketsMap[key] || { ticketNumber: key, passengerRefs: [], order: t.order ?? null, transaction: (t.transaction_details?.source ?? t.transaction) ?? null, ssrEntries: [], raw: t };
      // passenger association may be present. accept multiple naming conventions including passenger_reference_associated
      const prs =
        t.passenger_reference_keys ??
        t.passenger_reference_key ??
        t.passenger_keys ??
        t.passengerRef ??
        t.passenger_reference_associated ??
        t.passenger_reference_associated_key ??
        null;
      if (prs) {
        if (Array.isArray(prs)) ticketsMap[key].passengerRefs!.push(...prs.map(String));
        else ticketsMap[key].passengerRefs!.push(String(prs));
      }
    }

    // Luego enriquecer con ssr entries (puede venir como array de entries o como objeto { passengerRef: [entries] })
    const rawSsr = raw.ssr_tkne_information || raw.ssr_tk_ne_information || raw.ssr_tkne || null;
    if (rawSsr) {
      if (Array.isArray(rawSsr)) {
        for (const s of rawSsr) {
          const coupon = s.coupon_number ?? s.coupon ?? s.couponNumber ?? null;
          const ticketRef = s.ticket_number ?? s.ticketNumber ?? s.ticket ?? null;
          const passengerRef = s.passenger_reference_keys ?? s.passenger_reference_key ?? s.passenger_reference_associated ?? s.associated_passenger_keys ?? null;
          const tnKey = ticketRef ? String(ticketRef) : coupon ? String(coupon) : null;
          const key = tnKey || `__coupon_${coupon ?? Math.random().toString(36).slice(2, 8)}`;
          ticketsMap[key] = ticketsMap[key] || { ticketNumber: key, passengerRefs: [], ssrEntries: [], raw: null };
          ticketsMap[key].ssrEntries = ticketsMap[key].ssrEntries || [];
          ticketsMap[key].ssrEntries!.push({ couponNumber: String(coupon ?? ''), flightSegmentRef: s.flight_segment_reference_key ?? s.flightSegmentReferenceKey ?? null, raw: s });
          if (passengerRef) {
            if (Array.isArray(passengerRef)) ticketsMap[key].passengerRefs!.push(...passengerRef.map(String));
            else ticketsMap[key].passengerRefs!.push(String(passengerRef));
          }
        }
      } else if (typeof rawSsr === 'object') {
        // rawSsr often is an object keyed by passenger reference, with each value an array of entries
        for (const [pRef, entries] of Object.entries(rawSsr as RawMap<any>)) {
          for (const s of toArray(entries)) {
            const _s = s as any;
            const coupon = _s.coupon_number ?? _s.coupon ?? _s.couponNumber ?? null;
            const ticketRef = _s.ticket_number ?? _s.ticketNumber ?? _s.ticket ?? null;
            const passengerRef = pRef || _s.passenger_reference_key ?? _s.passenger_reference_keys ?? _s.passenger_reference_associated ?? null;
            const tnKey = ticketRef ? String(ticketRef) : coupon ? String(coupon) : null;
            const key = tnKey || `__coupon_${coupon ?? Math.random().toString(36).slice(2, 8)}`;
            ticketsMap[key] = ticketsMap[key] || { ticketNumber: key, passengerRefs: [], ssrEntries: [], raw: null };
            ticketsMap[key].ssrEntries = ticketsMap[key].ssrEntries || [];
            ticketsMap[key].ssrEntries!.push({ couponNumber: String(coupon ?? ''), flightSegmentRef: _s.flight_segment_reference_key ?? _s.flightSegmentReferenceKey ?? null, raw: _s });
            if (passengerRef) {
              if (Array.isArray(passengerRef)) ticketsMap[key].passengerRefs!.push(...(passengerRef as any).map(String));
              else ticketsMap[key].passengerRefs!.push(String(passengerRef));
            }
          }
        }
      }
    }

    const finalTickets = Object.values(ticketsMap).map((t) => ({ ...t }));
    if (finalTickets.length > 0) {
      out.tickets = finalTickets;
      // Assign ticketNumber to passengers where a passengerRef matches
      for (const p of out.passengers) {
        // find a ticket that references this passenger
        const found = finalTickets.find((tk) => (tk.passengerRefs || []).includes(p.id));
        if (found) {
          p.ticketNumber = found.ticketNumber;
        } else {
          // fallback: try to find by passenger order matching ticket order
          const byOrder = finalTickets.find((tk) => typeof tk.order === 'number' && typeof p.order === 'number' && tk.order === p.order);
          if (byOrder) p.ticketNumber = byOrder.ticketNumber;
        }
      }
    }
  } catch (e) {
    // ignore ticket normalization failures
  }

  return out;
}

export default transformPnr;
