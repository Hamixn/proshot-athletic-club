declare global {
  interface Window {
    proshotMC?: {
      apiBase: string;
      nonce: string;
      isLoggedIn: boolean;
      currentUserId: number;
      branches?: number[];
      locale: string;
      timezone: string;
      isMock?: boolean;
    };
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
