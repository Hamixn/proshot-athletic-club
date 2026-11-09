export interface Member {
  id: number;
  wp_user_id?: number | null;
  external_id?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  mobile: string;
  mobile_normalized: string;
  national_code?: string | null;
  gender?: 'male' | 'female' | null;
  date_of_birth?: string | null;
  date_of_birth_jalali?: string | null;
  profile_image_url?: string | null;
  is_verified: boolean;
  created_at?: string | null;
}

export interface Membership {
  id: number;
  member_id: number;
  branch_id: number;
  external_id?: string | null;
  plan_name?: string | null;
  status: 'active' | 'expired' | 'frozen' | 'suspended' | 'cancelled';
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  starts_at_jalali?: string;
  expires_at_jalali?: string;
  days_remaining: number;
  days_remaining_persian?: string;
  freeze_starts_at?: string | null;
  freeze_ends_at?: string | null;
  freeze_reason?: string | null;
  branch?: {
    id: number;
    name: string;
    slug: string;
    gender_policy: string;
  } | null;
}

export interface MemberPlan {
  id: number;
  member_id: number;
  branch_id: number;
  trainer_id?: number | null;
  plan_type: 'workout' | 'diet' | 'both';
  title: string;
  valid_month: string;
  content?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  created_at?: string | null;
  created_at_jalali?: string | null;
  updated_at?: string | null;
}

export interface FeedbackItem {
  id: number;
  member_id: number;
  branch_id: number;
  category: 'facilities' | 'coaching' | 'cleanliness' | 'reception' | 'general';
  rating: number; // 1 to 5
  subject: string;
  message: string;
  status: 'pending' | 'reviewed' | 'responded';
  staff_response?: string | null;
  responded_by?: number | null;
  responded_at?: string | null;
  responded_at_jalali?: string | null;
  created_at?: string | null;
  created_at_jalali?: string | null;
  member_name?: string;
  member_mobile?: string;
}

