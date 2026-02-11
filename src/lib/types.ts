export type Deceased = {
  id: number;
  name: string;
  companion_text: string;
  country: string;
  country_code: string | null;
  language: string;
  created_by_name: string;
  created_by_email: string | null;
  created_by_phone: string | null;
  status: "pending" | "approved" | "rejected";
  visits: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
};

export type AudioFile = {
  id: number;
  file_name: string;
  reciter_ar: string | null;
  reciter_en: string | null;
  surah_name_ar: string | null;
  surah_name_en: string | null;
  surah_number: number | null;
  duration_seconds: number | null;
  is_active: boolean;
};

export type StatsOverview = {
  total_approved: number;
  total_pending: number;
  total_visits: number;
  total_countries: number;
  today_registrations: number;
};
