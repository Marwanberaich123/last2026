import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
  onboarding?: {
    experience: string;
    mainPlatform: string;
    favoriteProduct: string;
    completed: boolean;
  };
}

export interface AccessCode {
  id: string;
  code_hash: string;
  suffix: string; // Last 4 characters for safe masked display (e.g. ••••••••••••K2L8)
  status: 'AVAILABLE' | 'ACTIVE' | 'REVOKED';
  assigned_user_id: string | null;
  created_at: string;
  activated_at: string | null;
  last_used_at: string | null;
  revoked_at: string | null;
  created_by: string;
  notes: string;
}

export interface AccessEntitlement {
  id: string;
  user_id: string;
  access_code_id: string;
  granted_at: string;
  status: 'ACTIVE' | 'REVOKED';
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
  tags: string[]; // Exactly 13 tags
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
  profit_margin: number;
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
  competitor_insights?: any;
  trend_data?: any;
  created_at: string;
  updated_at: string;
  is_sample?: boolean;
}

export interface AIJob {
  id: string;
  user_id: string;
  project_id: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  current_step: string;
  progress: number;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  ip?: string;
  details: string;
  timestamp: string;
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

// In-Memory & File-backed Store
const DATA_FILE = path.join(process.cwd(), 'data', 'givemepod_db.json');

interface DatabaseSchema {
  users: User[];
  access_codes: AccessCode[];
  access_entitlements: AccessEntitlement[];
  projects: Project[];
  ai_jobs: AIJob[];
  audit_logs: AuditLog[];
  provider_configs: ProviderConfig[];
  feature_flags: FeatureFlag[];
  failed_attempts: Record<string, { count: number; lockedUntil?: number }>;
  emergency_locked: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export function hashAccessCode(code: string): string {
  // Normalize whitespace & uppercase
  const normalized = code.trim().toUpperCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function getCodeSuffix(code: string): string {
  const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.slice(-4) || 'XXXX';
}

export const ADMIN_MASTER_KEY = 'kalo@123';

export const INITIAL_ACCESS_KEYS = [
  'A3F9K2L8Z1', 'M7X4V0C5B9', 'Q1W6E8R3T5', 'Y2U9I4O7P0', 'A5S2D8F1G6',
  'H9J3K6L0Z4', 'X8C1V7B2N5', 'M3Q0W6E9R4', 'T1Y8U2I5O7', 'P6A3S9D0F2',
  'G5H1J8K4L7', 'Z2X9C0V3B6', 'N4M8Q1W5E7', 'R0T3Y6U9I2', 'O5P1A7S4D8',
  'F2G9H0J3K5', 'L1Z8X4C7V9', 'B3N6M0Q2W8', 'E5R1T7Y4U9', 'I0O3P6A2S8',
  'D1F7G4H0J6', 'K9L2Z5X8C3', 'V0B4N7M1Q9', 'W6E2R5T8Y0', 'U3I7O1P4A9',
  'S5D0F3G8H2', 'J7K1L9Z4X6', 'C2V5B8N0M3', 'Q7W4E1R9T6', 'Y2U0I5O8P3',
  'A6S1D9F4G7', 'H3J0K8L5Z2', 'X9C4V1B7N0', 'M5Q2W8E3R6', 'T9Y1U4I0O7',
  'P2A8S5D1F9', 'G0H6J4K7L3', 'Z8X2C9V5B1', 'N6M0Q3W7E4', 'R1T8Y5U2I9',
  'O4P0A3S7D2', 'F8G5H1J9K6', 'L4Z0X7C3V8', 'B2N9M5Q1W6', 'E0R7T4Y8U3',
  'I6O2P9A4S0', 'D5F1G8H3J7', 'K0L6Z2X9C4', 'V1B7N3M8Q5', 'W9E4R0T6Y2',
  'U8I5O1P7A3', 'S9D4F0G6H2', 'J5K1L8Z4X0', 'C7V3B9N6M2', 'Q0W5E1R8T4',
  'Y7U3I9O5P1', 'A8S2D6F0G4', 'H9J5K1L7Z3', 'X6C0V4B8N2', 'M9Q4W1E7R0',
  'T5Y2U8I4O9', 'P3A0S6D1F7', 'G2H8J4K9L5', 'Z1X7C3V0B6', 'N4M0Q5W9E2',
  'R8T3Y7U1I6', 'O0P5A9S4D2', 'F6G1H7J3K8', 'L4Z0X5C9V2', 'B7N3M8Q4W1',
  'E9R5T0Y6U2', 'I7O3P8A4S1', 'D0F5G9H2J6', 'K1L7Z4X8C3', 'V9B5N0M6Q2',
  'W7E3R8T4Y0', 'U6I1O9P5A2', 'S8D3F7G0H4', 'J9K5L2Z6X1', 'C4V8B3N7M0',
  'Q1W6E2R9T5', 'Y0U4I8O3P7', 'A6S1D9F4G2', 'H7J3K0L8Z5', 'X2C6V1B9N4',
  'M8Q3W7E0R5', 'T1Y6U2I9O4', 'P0A5S8D3F7', 'G1H6J2K9L4', 'Z0X7C5V8B3',
  'N9M4Q1W6E2', 'R8T3Y7U0I5', 'O2P6A9S4D1', 'F5G0H8J3K7', 'L2Z9X4C1V6',
  'B8N5M0Q4W9', 'E3R7T1Y6U2', 'I4O0P8A5S3', 'D9F2G7H1J6', 'K0L4Z8X5C9'
];

// Initial DB state with sample projects and private initial access codes
function initializeDatabase(): DatabaseSchema {
  const adminCode: AccessCode = {
    id: 'code_admin_kalo',
    code_hash: hashAccessCode(ADMIN_MASTER_KEY),
    suffix: 'KALO',
    status: 'ACTIVE',
    assigned_user_id: 'user_admin_kalo',
    created_at: new Date().toISOString(),
    activated_at: new Date().toISOString(),
    last_used_at: new Date().toISOString(),
    revoked_at: null,
    created_by: 'system_root',
    notes: 'Master Administrator Key (kalo@123)'
  };

  const initialHashedCodes: AccessCode[] = [
    adminCode,
    ...INITIAL_ACCESS_KEYS.map((code, idx) => ({
      id: `code_${idx + 1}`,
      code_hash: hashAccessCode(code),
      suffix: getCodeSuffix(code),
      status: 'AVAILABLE' as const,
      assigned_user_id: null,
      created_at: new Date().toISOString(),
      activated_at: null,
      last_used_at: null,
      revoked_at: null,
      created_by: 'owner_master_pool',
      notes: `Official Database License #${idx + 1}`
    }))
  ];

  const defaultAdminUser: User = {
    id: 'user_admin_kalo',
    google_sub: 'kalo_admin',
    email: 'kalo@givemepod.com',
    name: 'Admin Merwane (kalo)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    onboarding: {
      experience: 'Advanced',
      mainPlatform: 'Etsy',
      favoriteProduct: 'T-Shirts',
      completed: true
    }
  };

  const defaultEntitlement: AccessEntitlement = {
    id: 'entitlement_admin',
    user_id: defaultAdminUser.id,
    access_code_id: adminCode.id,
    granted_at: new Date().toISOString(),
    status: 'ACTIVE'
  };

  const sampleProjects: Project[] = [
    {
      id: 'proj_sample_1',
      user_id: defaultAdminUser.id,
      name: 'Vintage Retro Hiking Club T-Shirt',
      product_type: 'T-Shirt',
      niche: 'Outdoor & Hiking',
      style: 'Vintage / Distressed',
      audience: 'Nature lovers, weekend hikers, camp enthusiasts (25-45)',
      concept_count: 3,
      status: 'Ready',
      is_sample: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      opportunity_score: {
        search_demand: 86,
        competition: 54,
        trend_momentum: 92,
        niche_specificity: 88,
        commercial_intent: 84,
        seasonality: 72,
        profit_potential: 80,
        ip_risk_rating: 'LOW',
        overall_score: 83,
        disclaimer: 'This score is an analytical indicator, not a sales prediction.'
      },
      risk_analysis: {
        risk_level: 'LOW',
        detected_evidence: ['General outdoor typography', 'Fictitious "Wanderer Trail Society" badge'],
        ai_inference: 'No registered brand trademarks or national park proprietary logos detected.',
        needs_human_review: false,
        trademark_flags: [],
        copyright_flags: [],
        celebrity_flags: [],
        brand_flags: [],
        marketplace_policy_notes: 'Complies with Etsy & Amazon Merch policies. Avoid using trademarked hiking gear brands.',
        suggested_modifications: ['Keep mountains stylized and non-specific to avoid landmark proprietary designs.'],
        disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice.'
      },
      concepts: [
        {
          id: 'c1',
          title: 'Lost in the Pines — Vintage Camp Society',
          headline: 'Lost in the Pines / Found in the Wilderness',
          target_customer: 'Solo hikers & trail backpackers',
          product_type: 'T-Shirt',
          design_angle: '1970s Pacific Northwest retro badge with muted pines and vintage sunburst.',
          visual_direction: 'Arch typography, distressed line art mountain silhouette, aged cream & forest green palette.',
          keywords: ['vintage hiking shirt', 'lost in the pines', 'retro national park tee', 'outdoorsman gift'],
          why_interesting: 'Strong evergreen gift potential with high gifting intent during spring and autumn.',
          risks: 'Low risk. Ensure no similarity to official National Park Service logos.',
          recommended_platforms: ['Etsy', 'Shopify', 'Amazon Merch']
        }
      ],
      selected_concept: {
        id: 'c1',
        title: 'Lost in the Pines — Vintage Camp Society',
        headline: 'Lost in the Pines / Found in the Wilderness',
        target_customer: 'Solo hikers & trail backpackers',
        product_type: 'T-Shirt',
        design_angle: '1970s Pacific Northwest retro badge with muted pines and vintage sunburst.',
        visual_direction: 'Arch typography, distressed line art mountain silhouette, aged cream & forest green palette.',
        keywords: ['vintage hiking shirt', 'lost in the pines', 'retro national park tee', 'outdoorsman gift'],
        why_interesting: 'Strong evergreen gift potential with high gifting intent during spring and autumn.',
        risks: 'Low risk. Ensure no similarity to official National Park Service logos.',
        recommended_platforms: ['Etsy', 'Shopify', 'Amazon Merch']
      },
      design: {
        title: 'Lost in the Pines Vintage Badge',
        concept: 'Retro weathered circular badge featuring dual pines, mountain ridge, and sun ray gradient.',
        image_prompt: 'Commercial POD t-shirt graphic artwork, vintage 1970s national park inspired emblem with pine trees, stylized sunburst behind alpine mountains, text "LOST IN THE PINES" curved along top arc, distressed screen print texture, clean vector edges, isolated on transparent background, no t-shirt mockup, no human model.',
        negative_prompt: 'photograph, realistic person, t-shirt folds, mannequin, blurry, trademarked logos, low resolution, 3d render',
        print_specifications: {
          resolution: '4500 x 5400 px',
          color_profile: 'sRGB IEC61966-2.1',
          dpi: 300,
          dimensions: '15 x 18 inches'
        },
        recommended_product: 'Bella+Canvas 3001 or Comfort Colors 1717',
        color_palette: ['#1B3B2B', '#E8D8B0', '#C86D51', '#2C3539'],
        transparent_background: true
      },
      mockups: [
        {
          id: 1,
          type: 'hero',
          is_hero: true,
          title: 'Main Etsy Hero Mockup',
          purpose: 'Primary search thumbnail & hero presentation',
          scene: 'Clean modern aesthetic studio display with subtle wooden floor accent',
          camera: 'Front 90-degree flat overhead view, crisp 50mm lens',
          lighting: 'Soft diffused natural morning window light',
          composition: 'Garment perfectly centered, 15% negative margin',
          product_placement: 'Apparel laid flat with natural soft folds, artwork centered across chest at exact 1:1 scale',
          negative_prompt: 'distorted hands, blur, text watermark, fake badge, cluttered backdrop',
          preview_bg_color: '#1a1b23',
          badge: 'HERO 01'
        },
        {
          id: 2,
          type: 'lifestyle',
          title: 'Outdoor Lifestyle',
          purpose: 'Show product in genuine context of use',
          scene: 'Mountain trail lookout overlooking pine forest ridge at golden hour',
          camera: 'Medium waist-up portrait shot, f/2.8 shallow depth of field',
          lighting: 'Warm golden backlight highlighting fabric texture',
          composition: 'Subject slightly off-center (rule of thirds), chest graphic sharply in focus',
          product_placement: 'Worn comfortably by outdoor enthusiast holding hiking map',
          negative_prompt: 'ugly hands, oversaturated, unnatural pose',
          preview_bg_color: '#1f2421',
          badge: 'LIFESTYLE 02'
        },
        {
          id: 3,
          type: 'closeup',
          title: 'Fabric & Print Detail',
          purpose: 'Proof of print quality and direct-to-garment detail',
          scene: 'Macro studio shot highlighting vintage distressed texture and cotton weave',
          camera: '100mm macro lens at 45-degree angle',
          lighting: 'Directional raking light revealing tactile garment texture',
          composition: 'Close crop on typography and mountain line-art',
          product_placement: 'Taut fabric showing crisp micro-details without cracking',
          negative_prompt: 'pixelated, blurry, digital noise',
          preview_bg_color: '#181920',
          badge: 'DETAIL 03'
        },
        {
          id: 4,
          type: 'flatlay',
          title: 'Styled Flat Lay',
          purpose: 'Aesthetic outfit pairing inspiration',
          scene: 'Rustic reclaimed oak table with trail compass, leather boots, and ceramic camp mug',
          camera: 'Top-down bird-eye view',
          lighting: 'Even overhead ambient lighting',
          composition: 'T-shirt flanked symmetrically with outdoor accessories',
          product_placement: 'Folded aesthetic lay with full chest print unobstructed',
          negative_prompt: 'cluttered, overlapping items over artwork',
          preview_bg_color: '#211d19',
          badge: 'FLAT LAY 04'
        },
        {
          id: 5,
          type: 'studio',
          title: 'Clean Minimalist Studio',
          purpose: 'High-contrast product showcase',
          scene: 'Seamless neutral warm-gray paper sweep backdrop',
          camera: 'Eye-level studio portrait, 85mm lens',
          lighting: 'Dual softbox studio lighting, neutral reflections',
          composition: 'Centered hanger display with gentle shadow drop',
          product_placement: 'Wooden hanger holding crisp unworn t-shirt',
          negative_prompt: 'wrinkled garment, harsh specular reflections',
          preview_bg_color: '#22232a',
          badge: 'STUDIO 05'
        },
        {
          id: 6,
          type: 'outdoor',
          title: 'Woodland Forest Walk',
          purpose: 'Casual outdoor lifestyle context',
          scene: 'Sunlit redwood or pine forest path with dappled sunlight',
          camera: 'Walking motion capture, natural action',
          lighting: 'Sunbeams breaking through tree canopy',
          composition: 'Torso frame showing movement and drape',
          product_placement: 'Garment moving naturally with model steps',
          negative_prompt: 'unnatural posture, washed out colors',
          preview_bg_color: '#16221c',
          badge: 'OUTDOOR 06'
        },
        {
          id: 7,
          type: 'desk',
          title: 'Camp Gear & Workstation',
          purpose: 'Indoor preparation lifestyle',
          scene: 'Timber work table with adventure journal and coffee flask',
          camera: '35mm angle shot',
          lighting: 'Warm tungsten lamp alongside window glow',
          composition: 'Partial fold displaying main artwork clearly',
          product_placement: 'Neatly folded ready for packing',
          negative_prompt: 'dark shadow over print, out of focus graphic',
          preview_bg_color: '#201b1a',
          badge: 'GEAR 07'
        },
        {
          id: 8,
          type: 'home',
          title: 'Cozy Cabin Atmosphere',
          purpose: 'Casual comfortable living context',
          scene: 'Rustic log cabin interior with stone hearth in blurred background',
          camera: 'Eye level relaxed sitting pose',
          lighting: 'Warm ambient fireplace glow',
          composition: 'Medium shot focused on chest graphic',
          product_placement: 'Soft cotton relaxed fit on subject',
          negative_prompt: 'flash glare, unnatural skin tone',
          preview_bg_color: '#2a1e17',
          badge: 'HOME 08'
        },
        {
          id: 9,
          type: 'gift',
          title: 'Unboxing & Gift Presentation',
          purpose: 'Gift-giving appeal for holidays and birthdays',
          scene: 'Eco-friendly kraft gift box with natural twine ribbon and gift tag',
          camera: '45-degree angle unboxing reveal',
          lighting: 'Soft bright studio lighting',
          composition: 'Box open with rolled t-shirt exposing the vintage emblem',
          product_placement: 'Carefully packaged with tissue paper tuck',
          negative_prompt: 'cheap plastic packaging, crumpled paper',
          preview_bg_color: '#26201b',
          badge: 'GIFT 09'
        },
        {
          id: 10,
          type: 'model',
          title: 'Modern Streetwear Model',
          purpose: 'Show fit and contemporary styling',
          scene: 'Urban park boundary with brick wall and green ivy',
          camera: 'Front 3/4 fashion portrait, 50mm f/1.8',
          lighting: 'Open shade with silver reflector fill',
          composition: 'Full upper-body frame paired with denim',
          product_placement: 'Tucked casual styling showcasing full print placement',
          negative_prompt: 'distorted anatomy, extra limbs, artificial smile',
          preview_bg_color: '#1e2126',
          badge: 'MODEL 10'
        },
        {
          id: 11,
          type: 'detail',
          title: 'Sizing & Quality Guide',
          purpose: 'Conversion optimization and buyer confidence',
          scene: 'Crisp high-resolution measurement overlay and collar tag detail',
          camera: 'High angle flat reference view',
          lighting: 'Neutral 5500K clinical product lighting',
          composition: 'Includes subtle measurement guide indicators',
          product_placement: 'Ribbed collar, double-needle stitching visible',
          negative_prompt: 'confusing charts, low resolution text',
          preview_bg_color: '#1a1c22',
          badge: 'SPECS 11'
        }
      ],
      seo_listing: {
        seo_title: 'Vintage Hiking Shirt, Lost In The Pines Mountain T-Shirt, Retro Camp Graphic Tee, Outdoorsy Nature Gift, Forest Wanderer Apparel',
        tags: [
          'vintage hiking shirt',
          'mountain graphic tee',
          'retro camp tshirt',
          'lost in the pines',
          'outdoorsman gift',
          'nature lover apparel',
          'camping clothes',
          'pacific northwest',
          'pine tree shirt',
          'national park gift',
          'hiker birthday gift',
          'adventure clothing',
          'distressed graphic'
        ],
        short_description: 'Embrace the trail with our vintage "Lost in the Pines" graphic tee — crafted on ultra-soft ring-spun cotton with an authentic distressed 70s outdoorsy badge.',
        description: '🌲 ESCAPE INTO THE WILDERNESS WITH OUR VINTAGE HIKING SHIRT\n\nWhether you are summiting peaks or daydreaming of mountain air from home, our "Lost in the Pines" tee delivers effortless vintage style and all-day comfort.\n\n✨ PRODUCT HIGHLIGHTS:\n- 100% Airlume combed and ring-spun cotton (Bella+Canvas 3001)\n- Direct-to-Garment (DTG) premium printing with soft, breathable finish\n- Retail unisex fit that runs true to size\n- Pre-shrunk fabric that holds its shape wash after wash\n\n🎁 THE PERFECT GIFT FOR:\n- Hikers, backpackers, and trail runners\n- National park lovers & campers\n- Father’s Day, birthdays, and holiday stocking stuffers\n\n🧺 CARE INSTRUCTIONS:\nMachine wash cold inside-out with like colors. Tumble dry low or hang dry for longevity.',
        materials: '100% Airlume combed and ring-spun cotton, Eco-friendly water-based inks, Tear-away label',
        personalization_instructions: 'Standard design. For custom trail names on back collar, please add your custom text in the notes (up to 15 characters).',
        alt_text: 'Vintage green hiking t-shirt featuring Lost In The Pines circular mountain badge and distressed pine tree artwork.',
        buyer_faq: [
          { q: 'How does the sizing run?', a: 'This tee features a modern unisex retail fit. For a relaxed or oversized streetwear look, we recommend sizing up one size.' },
          { q: 'How long does production and shipping take?', a: 'Each shirt is custom printed within 2-4 business days. Standard US shipping takes 3-5 business days.' }
        ],
        price_range: { min: 24.99, max: 29.99, currency: 'USD' },
        keyword_clusters: {
          primary: 'vintage hiking shirt',
          secondary: ['mountain graphic tee', 'retro camp tshirt', 'pine tree shirt'],
          long_tail: ['lost in the pines outdoorsy tee', 'national park wanderer shirt gift'],
          buyer_intent: ['hiking shirt birthday gift', 'retro camp shirt for women men'],
          seasonal: ['autumn camp trail clothing', 'spring outdoor backpacker tee']
        }
      },
      pinterest_pins: [
        {
          pin_title: 'Vintage Hiking Shirt | Lost In The Pines Retro Tee',
          description: 'The ultimate vintage aesthetic t-shirt for mountain wanderers and campfire souls. Made with super soft combed cotton.',
          keywords: ['#hikingshirt', '#vintageclothing', '#outdoorsy', '#campaesthetic', '#etsyfinds'],
          cta: 'Shop the retro trail collection now',
          image_concept: 'Close-up flat lay with camp mug and rugged compass',
          destination_url: 'https://etsy.com/shop/yourshop',
          suggested_board: 'Outdoor Aesthetic & Hiking Outfits'
        },
        {
          pin_title: 'Cozy Cabin Style: Retro Pine Tree Graphic Tee',
          description: 'Elevate your weekend trail wardrobe with this 70s-inspired national park emblem shirt.',
          keywords: ['#cabinlife', '#cottagecore', '#campingoutfit', '#naturetees'],
          cta: 'Tap to see available colors',
          image_concept: 'Model sitting on cabin porch holding coffee',
          destination_url: 'https://etsy.com/shop/yourshop',
          suggested_board: 'Casual Weekend Wardrobe'
        },
        {
          pin_title: 'Gift Guide for Nature Lovers & Hikers',
          description: 'Looking for a thoughtful gift for the trail lover in your life? This distressed outdoor tee is a guaranteed favorite.',
          keywords: ['#giftsforhim', '#giftsforher', '#hikergifts', '#birthdaygift'],
          cta: 'Find their size today',
          image_concept: 'Styled gift box unboxing with craft twine',
          destination_url: 'https://etsy.com/shop/yourshop',
          suggested_board: 'Unique Gift Ideas'
        },
        {
          pin_title: 'Minimalist Outdoor Streetwear Inspo',
          description: 'Pair this vintage mountain graphic tee with distressed denim and boots for an effortless earthy look.',
          keywords: ['#streetwear', '#earthyvibes', '#sustainablefashion', '#outfitideas'],
          cta: 'Discover the full look',
          image_concept: 'Waist-up fashion portrait with ivy background',
          destination_url: 'https://etsy.com/shop/yourshop',
          suggested_board: 'Streetwear & Everyday Style'
        },
        {
          pin_title: '1970s National Park Aesthetic T-Shirt',
          description: 'Sunbursts, evergreen pines, and weathered lettering. The nostalgic camp tee you will wear every weekend.',
          keywords: ['#70svintage', '#nationalparks', '#wanderlust', '#graphictees'],
          cta: 'Check price and reviews on Etsy',
          image_concept: 'Macro view of screen-printed distressed badge detail',
          destination_url: 'https://etsy.com/shop/yourshop',
          suggested_board: 'Vintage Graphic Tees'
        }
      ],
      profit: {
        product_cost: 8.50,
        shipping: 4.25,
        selling_price: 26.99,
        marketplace_fee: 2.15,
        payment_processing: 0.85,
        ad_cost: 2.50,
        other_costs: 0.50,
        currency: 'USD',
        gross_revenue: 26.99,
        estimated_fees: 3.00,
        estimated_cost: 8.50,
        estimated_ad_cost: 2.50,
        estimated_profit: 8.74,
        profit_margin: 32.4,
        profitMargin: 32.4
      }
    }
  ];

  const defaultProviders: ProviderConfig[] = [
    {
      id: 'p_gemini',
      name: 'Google Gemini 3.8 Flash (AI Logic & Reasoning)',
      type: 'AI',
      enabled: true,
      configured: true,
      status: 'Healthy',
      last_health_check: new Date().toISOString(),
      notes: 'Server-side Gemini 3.8 Flash model via @google/genai'
    },
    {
      id: 'p_imagen',
      name: 'Gemini Visual Studio (Mockups & Artwork)',
      type: 'IMAGE_GEN',
      enabled: true,
      configured: true,
      status: 'Healthy',
      last_health_check: new Date().toISOString(),
      notes: 'Prompt-first commercial engine with SVG/Canvas and Image generator fallback'
    },
    {
      id: 'p_etsy',
      name: 'Etsy Seller API',
      type: 'INTEGRATION',
      enabled: true,
      configured: false,
      status: 'Warning',
      last_health_check: new Date().toISOString(),
      notes: 'GiveMePOD is an independent application. Connect credentials in Settings.'
    },
    {
      id: 'p_pinterest',
      name: 'Pinterest API OAuth',
      type: 'INTEGRATION',
      enabled: true,
      configured: false,
      status: 'Warning',
      last_health_check: new Date().toISOString(),
      notes: 'Pinterest OAuth client ready for user authorization.'
    },
    {
      id: 'p_trends',
      name: 'POD Market Signal Streamer',
      type: 'MARKET_DATA',
      enabled: true,
      configured: true,
      status: 'Healthy',
      last_health_check: new Date().toISOString(),
      notes: 'Aggregated velocity signals from Etsy, Pinterest, and Google Trends'
    }
  ];

  const defaultFeatureFlags: FeatureFlag[] = [
    { key: 'trend_hunter', name: 'Trend Hunter', description: 'Enable market trend exploration and keyword signals', enabled: true },
    { key: 'design_studio', name: 'AI Design Studio', description: 'Enable AI artwork and prompt engineering', enabled: true },
    { key: 'mockup_factory', name: 'Mockup Factory (11 Images)', description: 'Generate 11 high-converting listing mockups', enabled: true },
    { key: 'risk_scanner', name: 'IP / Trademark Risk Scanner', description: 'Screen phrases and concepts for trademark infringement', enabled: true },
    { key: 'etsy_seo', name: 'Etsy Listing & Tag Generator', description: 'Generate high-ranking titles and 13 tags', enabled: true },
    { key: 'pinterest_factory', name: 'Pinterest Content Factory', description: 'Generate 5 high-converting Pinterest pin packages', enabled: true },
    { key: 'profit_calc', name: 'Profit & Margin Calculator', description: 'Compute net unit margins across 6 currencies', enabled: true },
    { key: 'seasonal_planner', name: 'Seasonal Planner', description: 'Timeline calendar for POD retail holidays', enabled: true },
    { key: 'ai_advisor', name: 'AI POD Advisor', description: 'Contextual AI copilot in the workspace', enabled: true }
  ];

  return {
    users: [defaultAdminUser],
    access_codes: initialHashedCodes,
    access_entitlements: [defaultEntitlement],
    projects: sampleProjects,
    ai_jobs: [],
    audit_logs: [
      {
        id: 'log_1',
        action: 'SYSTEM_BOOT',
        details: 'GiveMePOD server-side initialized with secure hash table and sample workspace.',
        timestamp: new Date().toISOString()
      }
    ],
    provider_configs: defaultProviders,
    feature_flags: defaultFeatureFlags,
    failed_attempts: {},
    emergency_locked: false,
    maintenance_mode: false,
    maintenance_message: 'GiveMePOD is temporarily performing scheduled maintenance. Please check back shortly.'
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Ensure Admin Master Key (kalo@123) is present
        const adminHash = hashAccessCode(ADMIN_MASTER_KEY);
        if (!parsed.access_codes.some(c => c.code_hash === adminHash)) {
          parsed.access_codes.unshift({
            id: 'code_admin_kalo',
            code_hash: adminHash,
            suffix: 'KALO',
            status: 'ACTIVE',
            assigned_user_id: 'user_admin_kalo',
            created_at: new Date().toISOString(),
            activated_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            revoked_at: null,
            created_by: 'system_root',
            notes: 'Master Administrator Key (kalo@123)'
          });
        }
        if (!parsed.users.some(u => u.id === 'user_admin_kalo')) {
          parsed.users.unshift({
            id: 'user_admin_kalo',
            google_sub: 'kalo_admin',
            email: 'kalo@givemepod.com',
            name: 'Admin Merwane (kalo)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
            role: 'ADMIN',
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            onboarding: { experience: 'Advanced', mainPlatform: 'Etsy', favoriteProduct: 'T-Shirts', completed: true }
          });
        }
        if (!parsed.access_entitlements.some(e => e.user_id === 'user_admin_kalo')) {
          parsed.access_entitlements.unshift({
            id: 'entitlement_admin',
            user_id: 'user_admin_kalo',
            access_code_id: 'code_admin_kalo',
            granted_at: new Date().toISOString(),
            status: 'ACTIVE'
          });
        }

        // Ensure all 100 initial access keys are populated in access_codes
        INITIAL_ACCESS_KEYS.forEach((code, idx) => {
          const hash = hashAccessCode(code);
          const exists = parsed.access_codes.some(c => c.code_hash === hash);
          if (!exists) {
            parsed.access_codes.push({
              id: `code_${idx + 1}`,
              code_hash: hash,
              suffix: getCodeSuffix(code),
              status: 'AVAILABLE',
              assigned_user_id: null,
              created_at: new Date().toISOString(),
              activated_at: null,
              last_used_at: null,
              revoked_at: null,
              created_by: 'owner_master_pool',
              notes: `Official Database License #${idx + 1}`
            });
          }
        });
        this.save(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read db file, initializing new database state:', e);
    }
    const fresh = initializeDatabase();
    this.save(fresh);
    return fresh;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(fn: (draft: DatabaseSchema) => void) {
    fn(this.data);
    this.save();
  }

  public log(action: string, details: string, userId?: string, ip?: string) {
    this.data.audit_logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      details,
      user_id: userId,
      ip,
      timestamp: new Date().toISOString()
    });
    // Keep max 500 logs
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs.pop();
    }
    this.save();
  }
}

export const db = new Database();
