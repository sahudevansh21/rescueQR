import { createClient } from '@supabase/supabase-js';

// Read environmental variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isRealSupabase = !!(supabaseUrl && supabaseAnonKey);

// Define type schema for our profiles
export interface EmergencyProfile {
  id: string;
  full_name: string;
  profile_photo_url?: string;
  blood_group: string;
  date_of_birth: string;
  address: string;
  medical_conditions: string;
  allergies: string;
  current_medications: string;
  organ_donor: boolean;
  insurance_provider: string;
  insurance_policy_number: string;
  primary_doctor_name: string;
  primary_doctor_phone: string;
  is_premium: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  profile_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
}

export interface ScanLog {
  id: string;
  profile_id: string;
  scanned_at: string;
  latitude?: number;
  longitude?: number;
  ip_address?: string;
  user_agent?: string;
  location_name?: string;
}

// In-Memory Database for Mock Mode Server-Side, LocalStorage for Client-Side
class MockSupabaseClient {
  private getStorage(): {
    profiles: EmergencyProfile[];
    contacts: EmergencyContact[];
    scans: ScanLog[];
  } {
    if (typeof window === 'undefined') {
      // Server-side global mock db
      const globalAny = global as any;
      if (!globalAny.__mockDb) {
        globalAny.__mockDb = {
          profiles: [
            {
              id: 'aanya-verma',
              full_name: 'Aanya Verma',
              blood_group: 'O+',
              date_of_birth: '1995-04-12',
              address: '74, Park Street, Bengaluru, Karnataka, India',
              medical_conditions: 'Type 1 diabetes, carries insulin in bag.',
              allergies: 'Penicillin, Shellfish',
              current_medications: 'Humalog (Insulin Lyspro), Metformin',
              organ_donor: true,
              insurance_provider: 'Care Health Insurance',
              insurance_policy_number: 'CHI-99887722-A',
              primary_doctor_name: 'Dr. Ramesh Nair',
              primary_doctor_phone: '+91 98765 43210',
              is_premium: true,
              created_at: new Date().toISOString()
            }
          ],
          contacts: [
            {
              id: 'c1',
              profile_id: 'aanya-verma',
              name: 'Priya Verma (Mother)',
              relationship: 'Mother',
              phone_number: '+91 98888 77777',
              is_primary: true
            },
            {
              id: 'c2',
              profile_id: 'aanya-verma',
              name: 'Rahul Verma (Brother)',
              relationship: 'Brother',
              phone_number: '+91 96666 55555',
              is_primary: false
            }
          ],
          scans: [
            {
              id: 's1',
              profile_id: 'aanya-verma',
              scanned_at: new Date(Date.now() - 3600000).toISOString(),
              latitude: 12.9716,
              longitude: 77.5946,
              location_name: 'Near Cubbon Park, Bengaluru',
              ip_address: '103.241.12.9',
              user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
            }
          ]
        };
      }
      return globalAny.__mockDb;
    }

    // Client-side local storage
    const profilesStr = localStorage.getItem('vlink_profiles');
    const contactsStr = localStorage.getItem('vlink_contacts');
    const scansStr = localStorage.getItem('vlink_scans');

    const mockDb = {
      profiles: profilesStr ? JSON.parse(profilesStr) : [],
      contacts: contactsStr ? JSON.parse(contactsStr) : [],
      scans: scansStr ? JSON.parse(scansStr) : []
    };

    // Seed Aanya Verma on client-side if empty
    if (mockDb.profiles.length === 0) {
      mockDb.profiles.push({
        id: 'aanya-verma',
        full_name: 'Aanya Verma',
        blood_group: 'O+',
        date_of_birth: '1995-04-12',
        address: '74, Park Street, Bengaluru, Karnataka, India',
        medical_conditions: 'Type 1 diabetes, carries insulin in bag.',
        allergies: 'Penicillin, Shellfish',
        current_medications: 'Humalog (Insulin Lyspro), Metformin',
        organ_donor: true,
        insurance_provider: 'Care Health Insurance',
        insurance_policy_number: 'CHI-99887722-A',
        primary_doctor_name: 'Dr. Ramesh Nair',
        primary_doctor_phone: '+91 98765 43210',
        is_premium: true,
        created_at: new Date().toISOString()
      });
      mockDb.contacts.push(
        {
          id: 'c1',
          profile_id: 'aanya-verma',
          name: 'Priya Verma (Mother)',
          relationship: 'Mother',
          phone_number: '+91 98888 77777',
          is_primary: true
        },
        {
          id: 'c2',
          profile_id: 'aanya-verma',
          name: 'Rahul Verma (Brother)',
          relationship: 'Brother',
          phone_number: '+91 96666 55555',
          is_primary: false
        }
      );
      mockDb.scans.push({
        id: 's1',
        profile_id: 'aanya-verma',
        scanned_at: new Date(Date.now() - 3600000).toISOString(),
        latitude: 12.9716,
        longitude: 77.5946,
        location_name: 'Near Cubbon Park, Bengaluru',
        ip_address: '103.241.12.9',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      });
      this.saveStorage(mockDb);
    }

    return mockDb;
  }

  private saveStorage(db: {
    profiles: EmergencyProfile[];
    contacts: EmergencyContact[];
    scans: ScanLog[];
  }) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vlink_profiles', JSON.stringify(db.profiles));
      localStorage.setItem('vlink_contacts', JSON.stringify(db.contacts));
      localStorage.setItem('vlink_scans', JSON.stringify(db.scans));
    } else {
      const globalAny = global as any;
      globalAny.__mockDb = db;
    }
  }

  public from(table: string) {
    const db = this.getStorage();
    const self = this;

    return {
      select: (fields: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            return {
              single: async () => {
                if (table === 'profiles') {
                  const item = db.profiles.find((p: any) => p[field] === value);
                  if (!item) return { data: null, error: { message: 'Not Found' } };
                  return { data: item, error: null };
                }
                return { data: null, error: { message: 'Not Found' } };
              },
              maybeSingle: async () => {
                if (table === 'profiles') {
                  const item = db.profiles.find((p: any) => p[field] === value);
                  return { data: item || null, error: null };
                }
                return { data: null, error: null };
              },
              order: (orderField: string, options?: { ascending?: boolean }) => {
                let filtered: any[] = [];
                if (table === 'scan_logs' || table === 'scans') {
                  filtered = db.scans.filter((s: any) => s[field] === value);
                } else if (table === 'emergency_contacts') {
                  filtered = db.contacts.filter((c: any) => c[field] === value);
                }
                
                filtered.sort((a: any, b: any) => {
                  const valA = a[orderField];
                  const valB = b[orderField];
                  if (options?.ascending) {
                    return valA > valB ? 1 : -1;
                  }
                  return valA < valB ? 1 : -1;
                });
                return {
                  then: (resolve: any) => resolve({ data: filtered, error: null })
                };
              },
              then: (resolve: any) => {
                if (table === 'emergency_contacts') {
                  const items = db.contacts.filter((c: any) => c[field] === value);
                  resolve({ data: items, error: null });
                } else if (table === 'scan_logs') {
                  const items = db.scans.filter((s: any) => s[field] === value);
                  resolve({ data: items, error: null });
                } else {
                  resolve({ data: [], error: null });
                }
              }
            };
          },
          order: (orderField: string, options?: { ascending?: boolean }) => {
            let items: any[] = [];
            if (table === 'profiles') items = [...db.profiles];
            else if (table === 'scan_logs') items = [...db.scans];
            else if (table === 'emergency_contacts') items = [...db.contacts];

            items.sort((a: any, b: any) => {
              const valA = a[orderField];
              const valB = b[orderField];
              if (options?.ascending) {
                return valA > valB ? 1 : -1;
              }
              return valA < valB ? 1 : -1;
            });
            return {
              then: (resolve: any) => resolve({ data: items, error: null })
            };
          },
          then: (resolve: any) => {
            if (table === 'profiles') resolve({ data: db.profiles, error: null });
            else if (table === 'emergency_contacts') resolve({ data: db.contacts, error: null });
            else if (table === 'scan_logs') resolve({ data: db.scans, error: null });
            else resolve({ data: [], error: null });
          }
        };
      },
      insert: (record: any) => {
        return {
          select: () => {
            return {
              single: async () => {
                const copy = { ...record };
                if (!copy.id) copy.id = Math.random().toString(36).substr(2, 9);
                copy.created_at = new Date().toISOString();

                if (table === 'profiles') {
                  db.profiles.push(copy);
                } else if (table === 'emergency_contacts') {
                  db.contacts.push(copy);
                } else if (table === 'scan_logs') {
                  db.scans.push(copy);
                }
                self.saveStorage(db);
                return { data: copy, error: null };
              },
              then: (resolve: any) => {
                const copy = { ...record };
                if (!copy.id) copy.id = Math.random().toString(36).substr(2, 9);
                copy.created_at = new Date().toISOString();

                if (table === 'profiles') db.profiles.push(copy);
                else if (table === 'emergency_contacts') db.contacts.push(copy);
                else if (table === 'scan_logs') db.scans.push(copy);

                self.saveStorage(db);
                resolve({ data: [copy], error: null });
              }
            };
          },
          then: (resolve: any) => {
            const records = Array.isArray(record) ? record : [record];
            const inserted: any[] = [];
            for (const r of records) {
              const copy = { ...r };
              if (!copy.id) copy.id = Math.random().toString(36).substr(2, 9);
              copy.created_at = new Date().toISOString();
              
              if (table === 'profiles') db.profiles.push(copy);
              else if (table === 'emergency_contacts') db.contacts.push(copy);
              else if (table === 'scan_logs') db.scans.push(copy);
              
              inserted.push(copy);
            }
            self.saveStorage(db);
            resolve({ data: inserted, error: null });
          }
        };
      },
      update: (record: any) => {
        return {
          eq: (field: string, value: any) => {
            return {
              then: (resolve: any) => {
                let updated: any[] = [];
                if (table === 'profiles') {
                  db.profiles = db.profiles.map(p => {
                    if ((p as any)[field] === value) {
                      const item = { ...p, ...record, updated_at: new Date().toISOString() };
                      updated.push(item);
                      return item;
                    }
                    return p;
                  });
                } else if (table === 'emergency_contacts') {
                  db.contacts = db.contacts.map(c => {
                    if ((c as any)[field] === value) {
                      const item = { ...c, ...record };
                      updated.push(item);
                      return item;
                    }
                    return c;
                  });
                }
                self.saveStorage(db);
                resolve({ data: updated, error: null });
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            return {
              then: (resolve: any) => {
                if (table === 'profiles') {
                  db.profiles = db.profiles.filter(p => (p as any)[field] !== value);
                } else if (table === 'emergency_contacts') {
                  db.contacts = db.contacts.filter(c => (c as any)[field] !== value);
                } else if (table === 'scan_logs') {
                  db.scans = db.scans.filter(s => (s as any)[field] !== value);
                }
                self.saveStorage(db);
                resolve({ data: null, error: null });
              }
            };
          }
        };
      }
    };
  }
}

// Export either real Supabase or our Mock client
export const supabase = isRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as any);
