
export interface ScanResult {
  id: string;
  name: string;
  category: 'food' | 'beverage' | 'body' | 'other';
  calories?: number;
  description: string;
  nutrition?: {
    protein?: string;
    carbs?: string;
    fat?: string;
    sugar?: string;
    fiber?: string;
  };
  bodyMetrics?: {
    status?: string;
    strengths?: string;
    weaknesses?: string;
    missing?: string;
    recommendations?: string[];
  };
  timestamp: number;
  imageUrl: string;
}

export interface ApiResponse {
  name: string;
  category: 'food' | 'beverage' | 'body' | 'other';
  calories?: number;
  description: string;
  nutrition?: {
    protein?: string;
    carbs?: string;
    fat?: string;
    sugar?: string;
    fiber?: string;
  };
  bodyMetrics?: {
    status?: string;
    strengths?: string;
    weaknesses?: string;
    missing?: string;
    recommendations?: string[];
  };
}
