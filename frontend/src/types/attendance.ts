export interface Branch {
  id: number;
  name: string;
  slug: string;
  gender_policy: 'men' | 'women' | 'mixed';
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
}

export interface AttendanceRecord {
  id: number;
  member_id: number;
  branch_id: number;
  checked_in_at: string;
  check_date: string;
  date_jalali?: string;
  time?: string;
  method: 'qr' | 'search' | 'kiosk' | 'manual';
  result: 'approved' | 'denied_expired' | 'denied_frozen' | 'denied_suspended' | 'denied_branch' | 'denied_invalid_qr' | 'denied_duplicate' | 'override';
  override_reason?: string | null;
  member?: {
    id: number;
    first_name: string;
    last_name: string;
    mobile: string;
    profile_image_url?: string | null;
  };
  branch?: {
    id: number;
    name: string;
    slug: string;
  };
}
