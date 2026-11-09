export interface Branch {
  id: number;
  name: string;
  slug: string;
  gender_policy: 'men' | 'women' | 'mixed';
  address?: string | null;
  phone?: string | null;
  is_active: boolean;
}
