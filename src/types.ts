export interface User {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  avatar: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
  last_active: string;
  hasAccess?: boolean;
  accessSuffix?: string | null;
  onboarding?: {
    experience: string;
    mainPlatform: string;
    favoriteProduct: string;
    completed: boolean;
  };
}

export interface ProductConcept {
  id: string;
  title: string;
  headline: string;
  target_customer: string;
  product_type: string;
  design_angle: string;
  visual_direction: string;
  keywords: string[];
  why_interesting: string;
  risks: string;
  recommended_platforms: string[];
}

export interface RiskAnalysis {
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'NEEDS REVIEW';
  detected_evidence: string[];
  ai_inference: string;
  needs_human_review: boolean;
  trademark_flags: string[];
  copyright_flags: string[];
  celebrity_flags: string[];
  brand_flags: string[];
  marketplace_policy_notes: string;
  suggested_modifications: string[];
  disclaimer: string;
}

export interface OpportunityScoreBreakdown {
  search_demand: number;
  competition: number;
  trend_momentum: number;
  niche_specificity: number;
  commercial_intent: number;
  seasonality: number;
  profit_potential: number;
  ip_risk_rating: 'LOW' | 'MEDIUM' | 'HIGH';
  overall_score: number;
  disclaimer: string;
}

export interface DesignData {
  title: string;
  concept: string;
  image_prompt: string;
  negative_prompt: string;
  print_specifications: {
    resolution: string;
    color_profile: string;
    dpi: number;
    dimensions: string;
  };
  recommended_product: string;
  color_palette: string[];
  transparent_background: boolean;
  artwork_preview_svg?: string;
  generated_image_url?: string;
}

export interface MockupItem {
  id: number;
  type: string;
  title: string;
  purpose: string;
  scene: string;
  camera: string;
  lighting: string;
  composition: string;
  product_placement: string;
  model_instructions?: string;
  negative_prompt: string;
  preview_bg_color: string;
  badge: string;
  is_hero?: boolean;
}

export interface SeoListingData {
  seo_title: string;
  tags: string[];
  description: string;
  short_description: string;
  materials: string;
  personalization_instructions: string;
  alt_text: string;
  buyer_faq: { q: string; a: string }[];
  price_range: { min: number; max: number; currency: string };
  keyword_clusters: {
    primary: string;
    secondary: string[];
    long_tail: string[];
    buyer_intent: string[];
    seasonal: string[];
  };
}

export interface PinterestPin {
  pin_title: string;
  description: string;
  keywords: string[];
  cta: string;
  image_concept: string;
  destination_url: string;
  suggested_board: string;
}

export interface ProfitCalculation {
  product_cost: number;
  shipping: number;
  selling_price: number;
  marketplace_fee: number;
  payment_processing: number;
  ad_cost: number;
  other_costs: number;
  currency: string;
  gross_revenue: number;
  estimated_fees: number;
  estimated_cost: number;
  estimated_ad_cost: number;
  estimated_profit: number;
  profit_margin?: number;
  profitMargin?: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  product_type: string;
  niche: string;
  style: string;
  audience: string;
  concept_count: number;
  status: 'Research' | 'Concept' | 'Design' | 'Mockups' | 'Listing' | 'Ready' | 'Archived';
  opportunity_score: OpportunityScoreBreakdown | null;
  risk_analysis: RiskAnalysis | null;
  concepts: ProductConcept[];
  selected_concept: ProductConcept | null;
  design: DesignData | null;
  mockups: MockupItem[];
  seo_listing: SeoListingData | null;
  pinterest_pins: PinterestPin[];
  profit: ProfitCalculation | null;
  created_at: string;
  updated_at: string;
  is_sample?: boolean;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'AI' | 'MARKET_DATA' | 'IMAGE_GEN' | 'INTEGRATION';
  enabled: boolean;
  configured: boolean;
  status: 'Healthy' | 'Warning' | 'Unavailable';
  last_health_check: string;
  notes: string;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}
