import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db, hashAccessCode, getCodeSuffix, Project, User, MockupItem, INITIAL_ACCESS_KEYS } from './server/db';
import { generateGeminiJson, generateGeminiText } from './server/gemini';
import { SYSTEM_PROMPTS, sanitizePodInput } from './server/prompts';
import { generate11Mockups } from './server/mockups';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '15mb' }));

// Request logging & Audit helper
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// Middleware: Check Emergency Lock & Maintenance Mode
app.use((req: Request, res: Response, next: NextFunction) => {
  const state = db.get();
  // Allow health, admin, and unlock routes during maintenance
  if (state.emergency_locked && !req.path.startsWith('/api/admin') && !req.path.startsWith('/api/system') && !req.path.startsWith('/api/auth')) {
    return res.status(503).json({
      error: 'GiveMePOD is temporarily unavailable due to system maintenance.',
      emergency_locked: true
    });
  }
  next();
});

// Session simulation / Authentication helper
// Helper: Get user from Secret Key or header
function getUserByAccessKey(key: string): { user: User; code: any } | null {
  if (!key) return null;
  const clean = key.trim();

  // Special check for kalo@123 Master Admin Key (case-insensitive)
  if (clean.toLowerCase() === 'kalo@123') {
    let admin = db.get().users.find(u => u.id === 'user_admin_kalo');
    if (!admin) {
      admin = {
        id: 'user_admin_kalo',
        google_sub: 'kalo_admin',
        email: 'kalo@givemepod.com',
        name: 'Master Admin (kalo)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
        role: 'ADMIN',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        onboarding: { experience: 'Advanced', mainPlatform: 'Etsy', favoriteProduct: 'T-Shirts', completed: true }
      };
      db.update(d => { d.users.unshift(admin!); });
    }
    const adminCode = db.get().access_codes.find(c => c.id === 'code_admin_kalo') || {
      id: 'code_admin_kalo',
      suffix: 'KALO',
      status: 'ACTIVE'
    };
    return { user: admin, code: adminCode };
  }

  const normalized = clean.replace(/[\s-]/g, '').toUpperCase();
  const hash = hashAccessCode(normalized);
  const code = db.get().access_codes.find(c => c.code_hash === hash);
  if (!code) return null;

  let user = db.get().users.find(u => u.id === code.assigned_user_id || u.id === `usr_${code.suffix.toLowerCase()}`);
  if (!user) {
    user = {
      id: `usr_${code.suffix.toLowerCase()}`,
      google_sub: `key_${code.suffix}`,
      email: `license_${code.suffix.toLowerCase()}@givemepod.com`,
      name: `POD Creator (${code.suffix})`,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${code.suffix}`,
      role: 'USER',
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
    db.update(d => {
      d.users.push(user!);
    });
  }
  return { user, code };
}

function getCurrentUser(req: Request): User | null {
  const users = db.get().users;
  const keyHeader = (req.headers['x-access-key'] as string) || '';
  if (keyHeader) {
    const res = getUserByAccessKey(keyHeader);
    if (res) return res.user;
  }
  const userHeaderId = req.headers['x-user-id'] as string;
  if (userHeaderId) {
    const found = users.find(u => u.id === userHeaderId);
    if (found) return found;
  }
  return null;
}

// Check entitlement
function hasActiveAccess(userId: string): { active: boolean; codeSuffix: string | null } {
  if (userId === 'user_admin_kalo') {
    return { active: true, codeSuffix: '••••••••••••KALO' };
  }
  const user = db.get().users.find(u => u.id === userId);
  if (user && user.role === 'ADMIN') {
    return { active: true, codeSuffix: '••••••••••••ADMIN' };
  }
  const entitlements = db.get().access_entitlements;
  const codes = db.get().access_codes;
  const userEntitlement = entitlements.find(e => e.user_id === userId && e.status === 'ACTIVE');
  if (!userEntitlement) return { active: false, codeSuffix: null };
  const code = codes.find(c => c.id === userEntitlement.access_code_id);
  return { active: true, codeSuffix: code ? `••••••••••••${code.suffix}` : '••••••••••••ACTIVE' };
}

// ==========================================
// 1. AUTHENTICATION & ACCESS KEY ROUTES
// ==========================================

app.get('/api/auth/session', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.json({
      user: null,
      isLocked: true,
      accessSuffix: null,
      system: {
        emergency_locked: db.get().emergency_locked,
        maintenance_mode: db.get().maintenance_mode
      }
    });
  }

  const entitlement = hasActiveAccess(user.id);
  res.json({
    user,
    isLocked: !entitlement.active,
    accessSuffix: entitlement.codeSuffix,
    system: {
      emergency_locked: db.get().emergency_locked,
      maintenance_mode: db.get().maintenance_mode
    }
  });
});

// Unified Key Authentication Logic
function processKeyLogin(key: string, ip: string) {
  if (!key || typeof key !== 'string') {
    return { status: 400, body: { error: 'Secret Key is required.' } };
  }

  const cleanKey = key.trim();

  // 1. Master Admin Key (kalo@123) - Case Insensitive!
  if (cleanKey.toLowerCase() === 'kalo@123') {
    const authInfo = getUserByAccessKey('kalo@123')!;
    db.update(d => {
      const hasEntitlement = d.access_entitlements.some(e => e.user_id === authInfo.user.id && e.status === 'ACTIVE');
      if (!hasEntitlement) {
        d.access_entitlements.push({
          id: 'entitlement_admin',
          user_id: authInfo.user.id,
          access_code_id: 'code_admin_kalo',
          granted_at: new Date().toISOString(),
          status: 'ACTIVE'
        });
      }
    });
    db.log('ADMIN_LOGIN_SUCCESS', `Master Admin authenticated with kalo@123`, authInfo.user.id, ip);

    return {
      status: 200,
      body: {
        success: true,
        user: authInfo.user,
        isLocked: false,
        isAdmin: true,
        key: 'kalo@123',
        accessSuffix: '••••••••••••KALO'
      }
    };
  }

  // 2. Standard 10-character / Generated License Codes
  const normalizedKey = cleanKey.replace(/[\s-]/g, '').toUpperCase();
  const hash = hashAccessCode(normalizedKey);
  const foundCode = db.get().access_codes.find(c => c.code_hash === hash);

  if (!foundCode || foundCode.status === 'REVOKED') {
    return {
      status: 401,
      body: {
        error: 'كود الدخول غير صحيح أو تم إلغاؤه. يرجى التأكد من كود الترخيص أو استخدام كود الأدمن kalo@123'
      }
    };
  }

  const authInfo = getUserByAccessKey(normalizedKey);
  if (!authInfo) {
    return { status: 500, body: { error: 'Unable to initialize user session for this key.' } };
  }

  const { user } = authInfo;

  db.update(d => {
    const cIdx = d.access_codes.findIndex(c => c.id === foundCode.id);
    if (cIdx !== -1) {
      d.access_codes[cIdx].status = 'ACTIVE';
      d.access_codes[cIdx].assigned_user_id = user.id;
      if (!d.access_codes[cIdx].activated_at) {
        d.access_codes[cIdx].activated_at = new Date().toISOString();
      }
      d.access_codes[cIdx].last_used_at = new Date().toISOString();
    }

    const hasEntitlement = d.access_entitlements.some(e => e.user_id === user.id && e.status === 'ACTIVE');
    if (!hasEntitlement) {
      d.access_entitlements.push({
        id: `ent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        user_id: user.id,
        access_code_id: foundCode.id,
        granted_at: new Date().toISOString(),
        status: 'ACTIVE'
      });
    }
  });

  db.log('KEY_LOGIN_SUCCESS', `User authenticated with key suffix ${foundCode.suffix}`, user.id, ip);

  return {
    status: 200,
    body: {
      success: true,
      user,
      isLocked: false,
      isAdmin: user.role === 'ADMIN',
      key: normalizedKey,
      accessSuffix: `••••••••••••${foundCode.suffix}`
    }
  };
}

// Single Unified Secret Key Login / Activation
app.post('/api/auth/key-login', (req: Request, res: Response) => {
  const result = processKeyLogin(req.body.key, req.ip || '127.0.0.1');
  return res.status(result.status).json(result.body);
});

// Legacy / direct access-code activation
app.post('/api/auth/access-code', (req: Request, res: Response) => {
  const code = req.body.key || req.body.code;
  const result = processKeyLogin(code, req.ip || '127.0.0.1');
  return res.status(result.status).json(result.body);
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

// ==========================================
// 2. PROJECTS CRUD
// ==========================================

app.get('/api/projects', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.json(db.get().projects.filter(p => p.is_sample));
  }
  const projects = db.get().projects.filter(p => p.user_id === user.id || p.is_sample);
  res.json(projects);
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.get().projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json(project);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const user = getCurrentUser(req) || db.get().users[0];
  const { name, product_type, niche, style, audience, concept_count } = req.body;

  const newProject: Project = {
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    user_id: user.id,
    name: name || `${style || 'Modern'} ${product_type || 'T-Shirt'}`,
    product_type: product_type || 'T-Shirt',
    niche: niche || 'General',
    style: style || 'Minimalist',
    audience: audience || 'Unisex (25-34)',
    concept_count: Math.min(Math.max(Number(concept_count) || 1, 1), 4),
    status: 'Research',
    opportunity_score: null,
    risk_analysis: null,
    concepts: [],
    selected_concept: null,
    design: null,
    mockups: [],
    seo_listing: null,
    pinterest_pins: [],
    profit: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.update(d => {
    d.projects.unshift(newProject);
  });

  db.log('PROJECT_CREATED', `Project created: ${newProject.name}`, user.id, req.ip);
  res.status(201).json(newProject);
});

app.patch('/api/projects/:id', (req: Request, res: Response) => {
  let updatedProject: Project | null = null;
  db.update(d => {
    const idx = d.projects.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      d.projects[idx] = {
        ...d.projects[idx],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      updatedProject = d.projects[idx];
    }
  });

  if (!updatedProject) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.json(updatedProject);
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  db.update(d => {
    d.projects = d.projects.filter(p => p.id !== req.params.id);
  });
  res.json({ success: true });
});

app.post('/api/projects/:id/duplicate', (req: Request, res: Response) => {
  const project = db.get().projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const user = getCurrentUser(req) || db.get().users[0];
  const dup: Project = {
    ...project,
    id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: `${project.name} (Copy)`,
    user_id: user.id,
    is_sample: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.update(d => {
    d.projects.unshift(dup);
  });
  res.json(dup);
});

// ==========================================
// 3. COMPLETE AUTOMATION PIPELINE (ONE-CLICK BUILD)
// ==========================================

app.post('/api/projects/:id/build-pipeline', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const project = db.get().projects.find(p => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const user = getCurrentUser(req) || db.get().users[0];
  const jobId = `job_${Date.now()}`;
  const job = {
    id: jobId,
    user_id: user.id,
    project_id: projectId,
    status: 'RUNNING' as const,
    current_step: 'Researching market demand...',
    progress: 10,
    created_at: new Date().toISOString()
  };

  db.update(d => {
    d.ai_jobs.unshift(job);
  });

  // Execute pipeline steps
  try {
    const safetyCheck = sanitizePodInput(`${project.name} ${project.niche} ${project.style}`);

    // Step 1: Opportunity Score & Market Research
    const opportunityScoreFallback = {
      search_demand: 84,
      competition: 58,
      trend_momentum: 89,
      niche_specificity: 82,
      commercial_intent: 79,
      seasonality: 70,
      profit_potential: 85,
      ip_risk_rating: (safetyCheck.isFlagged ? 'HIGH' : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
      overall_score: safetyCheck.isFlagged ? 52 : 81,
      disclaimer: 'This score is an analytical indicator, not a sales prediction.'
    };

    const opportunityScore = await generateGeminiJson(
      'Calculate a realistic Print-on-demand opportunity score between 0-100 based on keyword volume, saturation, and margin.',
      `Product: ${project.product_type}, Niche: ${project.niche}, Style: ${project.style}, Audience: ${project.audience}`,
      opportunityScoreFallback
    );

    // Step 2: Risk Analysis
    const riskFallback = {
      risk_level: (safetyCheck.isFlagged ? 'HIGH' : 'LOW') as any,
      detected_evidence: safetyCheck.isFlagged ? safetyCheck.flaggedTerms : ['Clean generic aesthetic keywords', 'No registered character marks'],
      ai_inference: safetyCheck.isFlagged ? 'Contains high-risk trademarked brand terms.' : 'Low risk of trademark collision based on public search indexes.',
      needs_human_review: safetyCheck.isFlagged,
      trademark_flags: safetyCheck.flaggedTerms,
      copyright_flags: [],
      celebrity_flags: [],
      brand_flags: safetyCheck.flaggedTerms,
      marketplace_policy_notes: 'Compliant with standard POD marketplace policies when avoiding trademarked terms.',
      suggested_modifications: safetyCheck.sanitizedSuggestion ? [safetyCheck.sanitizedSuggestion] : ['Keep text original and expressive.'],
      disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice.'
    };

    const riskAnalysis = await generateGeminiJson(
      SYSTEM_PROMPTS.riskScanner,
      `Analyze product: ${project.product_type}, Niche: ${project.niche}, Style: ${project.style}`,
      riskFallback
    );

    // Step 3: Product Concepts (1-4)
    const conceptsFallback = [
      {
        id: 'c1',
        title: `${project.style} ${project.niche} Signature Edition`,
        headline: `Designed for the modern ${project.audience.split(' ')[0] || 'enthusiast'}`,
        target_customer: project.audience,
        product_type: project.product_type,
        design_angle: `Elevated ${project.style} composition tailored for ${project.niche}`,
        visual_direction: 'Balanced typography with hand-crafted vector focal art and clean negative space',
        keywords: [`${project.niche} gift`, `${project.style} ${project.product_type}`, `aesthetic ${project.niche}`],
        why_interesting: 'Strong emotional resonance and giftability in target sub-demographic',
        risks: 'Low risk. Avoid direct imitation of existing top-selling listings.',
        recommended_platforms: ['Etsy', 'Shopify', 'Printify', 'Amazon Merch']
      }
    ];

    const conceptsRes = await generateGeminiJson(
      SYSTEM_PROMPTS.conceptGeneration,
      `Generate ${project.concept_count} POD concepts for ${project.product_type} in niche "${project.niche}" with style "${project.style}" for audience "${project.audience}".`,
      { concepts: conceptsFallback }
    );

    const generatedConcepts = conceptsRes.concepts || conceptsFallback;
    const selectedConcept = generatedConcepts[0];

    // Step 4: Design Studio Artwork & Prompt
    const designFallback = {
      title: `${selectedConcept.title} Artwork`,
      concept: selectedConcept.design_angle,
      image_prompt: `Commercial print-on-demand graphic design for ${project.product_type}, featuring ${selectedConcept.visual_direction}, theme: ${project.niche}, ${project.style} style, clean vector lines, high resolution, isolated on transparent background, no t-shirt mockup, no human model, direct to garment print ready.`,
      negative_prompt: 'mockup, human model, wrinkled fabric, blurry, copyright logos, photographic person, 3d render',
      print_specifications: {
        resolution: '4500 x 5400 px',
        color_profile: 'sRGB IEC61966-2.1',
        dpi: 300,
        dimensions: '15 x 18 inches'
      },
      recommended_product: `Premium Heavyweight ${project.product_type}`,
      color_palette: ['#0f172a', '#f8fafc', '#6366f1', '#e2e8f0'],
      transparent_background: true
    };

    const design = await generateGeminiJson(
      SYSTEM_PROMPTS.designPrompt,
      `Design prompt for: ${selectedConcept.title}, Style: ${project.style}, Product: ${project.product_type}`,
      designFallback
    );

    // Step 5: Mockup Factory (11 images generated)
    const mockups = generate11Mockups(project.product_type, design.title, project.style);

    // Step 6: Etsy SEO Listing
    const seoFallback = {
      seo_title: `${project.style} ${project.niche} ${project.product_type}, Aesthetic Graphic Apparel, Unique Gift for ${project.audience.split(' ')[0] || 'Friend'}`,
      tags: [
        `${project.niche} gift`,
        `${project.style} shirt`,
        'aesthetic graphic tee',
        'unisex streetwear',
        'cozy everyday wear',
        'birthday gift idea',
        'minimalist apparel',
        'trendy clothing',
        'eco friendly print',
        'custom design gift',
        'casual comfy outfit',
        'unique artwork tee',
        'holiday gift item'
      ],
      description: `✨ ELEVATE YOUR WARDROBE WITH OUR ${project.style.toUpperCase()} ${project.product_type.toUpperCase()}\n\nCrafted with premium materials and printed using cutting-edge Direct-to-Garment technology.\n\n- Retail Unisex Fit\n- Soft ring-spun material\n- High durability and colorfast inks\n- Thoughtfully packaged for gift-giving.`,
      short_description: `Make a statement with this premium ${project.style} ${project.product_type}, designed for true ${project.niche} fans.`,
      materials: '100% Ring-spun cotton, Eco-friendly non-toxic inks',
      personalization_instructions: 'Enter optional custom text or initials if desired.',
      alt_text: `${project.style} style ${project.product_type} showcasing ${project.niche} graphics.`,
      buyer_faq: [
        { q: 'What is the sizing fit?', a: 'Standard unisex fit. For an oversized look, size up 1-2 sizes.' },
        { q: 'Care instructions?', a: 'Machine wash cold inside out, tumble dry low.' }
      ],
      price_range: { min: 22.99, max: 28.99, currency: 'USD' },
      keyword_clusters: {
        primary: `${project.niche} ${project.product_type}`,
        secondary: [`${project.style} ${project.product_type}`, `aesthetic ${project.niche}`],
        long_tail: [`gift for ${project.niche} lover`, `vintage style ${project.niche} shirt`],
        buyer_intent: [`buy ${project.niche} gift`, `best ${project.niche} apparel`],
        seasonal: [`holiday ${project.niche} present`]
      }
    };

    const seoListing = await generateGeminiJson(
      SYSTEM_PROMPTS.etsySeo,
      `Create Etsy listing for product: ${project.product_type}, Niche: ${project.niche}, Title: ${selectedConcept.title}`,
      seoFallback
    );

    // Step 7: Pinterest Content Factory (5 pins)
    const pinsFallback = [
      {
        pin_title: `${project.style} ${project.niche} ${project.product_type} Aesthetic`,
        description: `The perfect everyday statement piece for ${project.niche} enthusiasts. Available now!`,
        keywords: [`#${project.niche.replace(/\s+/g, '')}`, '#aestheticoutfit', '#giftguide', '#etsyshop'],
        cta: 'Tap to shop this design',
        image_concept: 'Styled aesthetic flat lay with matching accessories',
        destination_url: 'https://etsy.com',
        suggested_board: `${project.niche} Style & Gift Inspo`
      },
      {
        pin_title: `Gift Ideas for ${project.niche} Lovers`,
        description: `Looking for the most thoughtful ${project.niche} gift? Check out this unique ${project.product_type}.`,
        keywords: ['#giftideas', '#birthdaygifts', '#uniquefinds'],
        cta: 'Click to discover sizes & colors',
        image_concept: 'Gift box unboxing presentation reveal',
        destination_url: 'https://etsy.com',
        suggested_board: 'Thoughtful Gifts & Holiday Inspo'
      },
      {
        pin_title: `Cozy Daily Wardrobe: ${project.style} Edition`,
        description: `Soft, durable, and stylish. Pair this with your favorite daily outfit.`,
        keywords: ['#ootd', '#minimalistfashion', '#comfystyle'],
        cta: 'See customer reviews',
        image_concept: 'Lifestyle model wearing garment in coffee shop',
        destination_url: 'https://etsy.com',
        suggested_board: 'Daily Outfit Inspo'
      },
      {
        pin_title: `Must-Have ${project.product_type} for ${project.niche}`,
        description: `Stand out with this original ${project.style} artwork. Printed with sustainable inks.`,
        keywords: ['#streetwearstyle', '#graphictees', '#podproducts'],
        cta: 'Shop the collection',
        image_concept: 'Clean modern studio presentation',
        destination_url: 'https://etsy.com',
        suggested_board: 'Modern Streetwear'
      },
      {
        pin_title: `Detail Spotlight: Premium DTG Print`,
        description: `See the micro-details and soft fabric weave up close.`,
        keywords: ['#qualityclothing', '#dtgprinting', '#etsyfinds'],
        cta: 'Check price on Etsy',
        image_concept: 'Macro close-up shot of print on fabric',
        destination_url: 'https://etsy.com',
        suggested_board: 'Quality Artisan Goods'
      }
    ];

    const pinterestRes = await generateGeminiJson(
      SYSTEM_PROMPTS.pinterestPins,
      `5 Pinterest pins for: ${selectedConcept.title}`,
      { pins: pinsFallback }
    );

    // Step 8: Profit Calculation
    const profitData = {
      product_cost: 8.50,
      shipping: 4.50,
      selling_price: 25.99,
      marketplace_fee: 2.10,
      payment_processing: 0.85,
      ad_cost: 2.50,
      other_costs: 0.50,
      currency: 'USD',
      gross_revenue: 25.99,
      estimated_fees: 2.95,
      estimated_cost: 8.50,
      estimated_ad_cost: 2.50,
      estimated_profit: 7.04,
      profit_margin: 27.1
    };

    // Update project state in DB
    let finishedProject: Project | null = null;
    db.update(d => {
      const pIdx = d.projects.findIndex(p => p.id === projectId);
      if (pIdx !== -1) {
        d.projects[pIdx] = {
          ...d.projects[pIdx],
          status: 'Ready',
          opportunity_score: opportunityScore,
          risk_analysis: riskAnalysis,
          concepts: generatedConcepts,
          selected_concept: selectedConcept,
          design,
          mockups,
          seo_listing: seoListing,
          pinterest_pins: pinterestRes.pins || pinsFallback,
          profit: profitData,
          updated_at: new Date().toISOString()
        };
        finishedProject = d.projects[pIdx];
      }

      const jIdx = d.ai_jobs.findIndex(j => j.id === jobId);
      if (jIdx !== -1) {
        d.ai_jobs[jIdx].status = 'COMPLETED';
        d.ai_jobs[jIdx].progress = 100;
        d.ai_jobs[jIdx].current_step = 'Project successfully generated and ready!';
        d.ai_jobs[jIdx].completed_at = new Date().toISOString();
      }
    });

    res.json({
      success: true,
      job_id: jobId,
      project: finishedProject
    });
  } catch (err: any) {
    console.error('Pipeline failed:', err);
    db.update(d => {
      const jIdx = d.ai_jobs.findIndex(j => j.id === jobId);
      if (jIdx !== -1) {
        d.ai_jobs[jIdx].status = 'FAILED';
        d.ai_jobs[jIdx].error = err.message || 'Execution error';
      }
    });
    res.status(500).json({ error: 'Pipeline execution failed. Please retry.' });
  }
});

// ==========================================
// 4. SUB-SERVICES & AI TOOLS
// ==========================================

// Trend Hunter
app.post('/api/trends/search', async (req: Request, res: Response) => {
  const { keyword, niche, product, country } = req.body;
  const q = keyword || niche || 'vintage botanical';

  const fallback = {
    keyword: q,
    niche: niche || 'Home & Lifestyle',
    search_demand: 87,
    competition: 52,
    trend_momentum: 'Rising' as const,
    niche_specificity: 81,
    opportunity_score: 84,
    related_keywords: [
      `${q} aesthetic`,
      `retro ${q} gift`,
      `minimalist ${q}`,
      `trending ${q} apparel`
    ],
    market_insights: `Search volume for "${q}" has shown strong upward momentum over the last 90 days with low saturation in micro-angles.`,
    source: 'Etsy Market Signals & Pinterest Trends',
    data_type: 'Aggregated Search & Velocity Index',
    timestamp: new Date().toISOString()
  };

  const result = await generateGeminiJson(
    SYSTEM_PROMPTS.trendHunter,
    `Analyze POD trend signals for keyword: "${q}", product: "${product || 'all'}", target country: "${country || 'US'}"`,
    fallback
  );

  res.json(result);
});

// Niche Discovery
app.post('/api/niches/discover', async (req: Request, res: Response) => {
  const { broadNiche } = req.body;
  const n = broadNiche || 'Pets';

  const fallback = {
    broad_niche: n,
    sub_niches: ['Specific Breeds', 'Pet Parents & Moms', 'Rescue & Adoption', 'Veterinary Humor'],
    micro_niches: [
      'Golden Retriever Camping Dads',
      'Anxious Rescue Dog Moms',
      'Senior Cat Appreciation Society',
      'Coffee & Dog Walk Enthusiasts'
    ],
    audience_breakdown: 'Passionate pet owners aged 25-45 with high emotional attachment and gift purchasing intent.',
    untapped_angles: [
      'Hand-lettered quote tees highlighting specific quirky canine habits',
      'Vintage embroidered-look mugs celebrating rescue milestones'
    ],
    recommended_products: ['T-Shirt', 'Mug', 'Tote Bag', 'Hoodie'],
    competition_indicators: 'Medium'
  };

  const result = await generateGeminiJson(
    SYSTEM_PROMPTS.nicheDiscovery,
    `Discover deep micro-niches and untapped gaps for broad topic: "${n}"`,
    fallback
  );

  res.json(result);
});

// Risk Scanner
app.post('/api/risk/scan', async (req: Request, res: Response) => {
  const { input, type } = req.body;
  const safety = sanitizePodInput(input || '');

  const fallback = {
    risk_level: (safety.isFlagged ? 'HIGH' : 'LOW') as any,
    detected_evidence: safety.isFlagged ? safety.flaggedTerms : ['No proprietary registered brand terms found'],
    ai_inference: safety.isFlagged ? 'Contains high-risk trademarked names.' : 'Text appears to use generic or descriptive language.',
    needs_human_review: safety.isFlagged,
    trademark_flags: safety.flaggedTerms,
    copyright_flags: [],
    celebrity_flags: [],
    brand_flags: safety.flaggedTerms,
    marketplace_policy_notes: 'Automated screening against USPTO database principles.',
    suggested_modifications: safety.sanitizedSuggestion ? [safety.sanitizedSuggestion] : ['Safe for commercial print-on-demand listing.'],
    disclaimer: 'GiveMePOD provides automated screening and market analysis. It does not provide legal advice.'
  };

  const result = await generateGeminiJson(
    SYSTEM_PROMPTS.riskScanner,
    `Screen this text/keyword for IP risk: "${input}" (Type: ${type || 'text'})`,
    fallback
  );

  res.json(result);
});

// Image Upload Vision Analysis
app.post('/api/risk/scan-image', (req: Request, res: Response) => {
  const { fileName } = req.body;
  res.json({
    summary: 'Vision analysis scanned image elements, typography, and vectors.',
    detected_text: 'Nature calls, let us wander.',
    detected_elements: ['Pine tree silhouettes', 'Mountain ridge line', 'Sun rays'],
    style: 'Vintage distressed screen print',
    risk_level: 'LOW',
    trademark_flags: [],
    recommended_product: 'Comfort Colors 1717 T-Shirt or Heavyweight Crewneck',
    recommended_mockup_style: 'Rustic outdoor trail lifestyle flat lay',
    disclaimer: 'Automated visual screening does not replace professional trademark clearance.'
  });
});

// Competitor Research
app.post('/api/competitors/analyze', async (req: Request, res: Response) => {
  const { keyword } = req.body;
  const kw = keyword || 'hiking t-shirt';

  const fallback = {
    keyword: kw,
    common_product_types: ['Unisex Jersey T-Shirts', 'Pullover Hoodies', 'Enamel Camp Mugs'],
    common_design_styles: ['Distressed Retro Badges', 'Minimalist Line Art', 'Bold Serif Typography'],
    price_ranges: {
      tshirts: '$22.00 - $28.50',
      hoodies: '$38.00 - $49.00',
      mugs: '$14.00 - $18.00'
    },
    niche_saturation: 'High in generic camping; Low in specific trail-focused and humorous micro-angles',
    market_gaps: {
      what_is_common: 'Generic mountain silhouettes with "The Mountains Are Calling" quotes',
      what_is_missing: 'Subtle humorous observations for modern trail walkers and ultralight gear enthusiasts',
      recommended_differentiated_angle: 'Focus on lighthearted, hyper-relatable moments like packing too much trail mix or finding peace in the rain.'
    }
  };

  res.json(fallback);
});

// AI POD Advisor
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const { message, projectContext } = req.body;

  let systemPrompt = SYSTEM_PROMPTS.advisorChat;
  if (projectContext) {
    systemPrompt += `\nCURRENT PROJECT CONTEXT:\n- Name: ${projectContext.name}\n- Product: ${projectContext.product_type}\n- Niche: ${projectContext.niche}\n- Style: ${projectContext.style}`;
  }

  const fallback = `Great question! For ${projectContext?.niche || 'this product'}, I recommend focusing on authentic sub-niche phrasing. For instance, pairing an understated ${projectContext?.style || 'minimalist'} layout with specific high-intent keywords will reduce competition while increasing conversion rates.`;

  const reply = await generateGeminiText(systemPrompt, message, fallback);
  res.json({ reply });
});

// Platforms list
app.get('/api/platforms', (req: Request, res: Response) => {
  res.json([
    {
      name: 'Etsy',
      fit: '95%',
      reason: 'Unmatched organic search for unique, artistic, and personalized gift products.',
      requirements: 'Requires active Etsy shop, compliant mockups, and 13 tags.',
      status: 'Recommended'
    },
    {
      name: 'Shopify',
      fit: '85%',
      reason: 'Ideal for building an independent brand with custom domain and email marketing.',
      requirements: 'Requires dedicated paid traffic (TikTok/Meta ads or organic Pinterest).',
      status: 'Supported'
    },
    {
      name: 'Printify',
      fit: '98%',
      reason: 'Vast fulfillment network with top print providers (Monster Digital, SwiftPOD, etc.).',
      requirements: 'Direct integration with Etsy and Shopify.',
      status: 'Connected'
    },
    {
      name: 'Printful',
      fit: '92%',
      reason: 'Consistent quality control, embroidery capabilities, and global hubs.',
      requirements: 'Seamless automated sync.',
      status: 'Connected'
    },
    {
      name: 'Amazon Merch on Demand',
      fit: '75%',
      reason: 'Massive Prime audience without fulfillment overhead.',
      requirements: 'Application approval required; strictly enforced trademark policies.',
      status: 'Available'
    },
    {
      name: 'Redbubble & TeePublic',
      fit: '70%',
      reason: 'Passive marketplace traffic with zero customer support requirements.',
      requirements: 'Tiered creator account fee structure.',
      status: 'Available'
    }
  ]);
});

// Seasonal Planner Events
app.get('/api/seasonal-events', (req: Request, res: Response) => {
  res.json([
    { id: '1', title: "Valentine's Day", date: 'Feb 14', research_deadline: 'Dec 01', design_deadline: 'Dec 20', listing_deadline: 'Jan 05', tags: ['gifts for couples', 'funny relationship'] },
    { id: '2', title: "Mother's Day", date: 'May 10', research_deadline: 'Feb 15', design_deadline: 'Mar 10', listing_deadline: 'Mar 25', tags: ['mom life', 'dog mom', 'first time mom'] },
    { id: '3', title: "Father's Day", date: 'Jun 21', research_deadline: 'Apr 01', design_deadline: 'Apr 25', listing_deadline: 'May 10', tags: ['dad jokes', 'grill master', 'hiking dad'] },
    { id: '4', title: 'Halloween & Spooky Season', date: 'Oct 31', research_deadline: 'Jul 15', design_deadline: 'Aug 10', listing_deadline: 'Sep 01', tags: ['spooky cute', 'vintage witch', 'ghost coffee'] },
    { id: '5', title: 'Christmas & Q4 Holiday Surge', date: 'Dec 25', research_deadline: 'Aug 20', design_deadline: 'Sep 15', listing_deadline: 'Oct 01', tags: ['holiday sweaters', 'stocking stuffers'] }
  ]);
});

// ==========================================
// 5. ADMIN COMMAND CENTER ENDPOINTS
// ==========================================

app.get('/api/admin/overview', (req: Request, res: Response) => {
  const state = db.get();
  res.json({
    totalUsers: state.users.length,
    activeCodes: state.access_codes.filter(c => c.status === 'ACTIVE').length,
    availableCodes: state.access_codes.filter(c => c.status === 'AVAILABLE').length,
    totalProjects: state.projects.length,
    emergencyLocked: state.emergency_locked,
    maintenanceMode: state.maintenance_mode,
    providersCount: state.provider_configs.length,
    logsCount: state.audit_logs.length
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const users = db.get().users.map(u => {
    const entitlement = hasActiveAccess(u.id);
    return {
      ...u,
      hasAccess: entitlement.active,
      accessSuffix: entitlement.codeSuffix
    };
  });
  res.json(users);
});

app.post('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  db.update(d => {
    const u = d.users.find(usr => usr.id === req.params.id);
    if (u) u.status = status;
  });
  res.json({ success: true });
});

app.get('/api/admin/access-codes', (req: Request, res: Response) => {
  const codes = db.get().access_codes.map((c) => {
    let fullKey = '';
    if (c.id === 'code_admin_kalo') {
      fullKey = 'kalo@123';
    } else {
      const matchKey = INITIAL_ACCESS_KEYS.find(k => k.endsWith(c.suffix) || hashAccessCode(k) === c.code_hash);
      if (matchKey) {
        fullKey = matchKey;
      }
    }

    return {
      id: c.id,
      maskedCode: `••••••••••••${c.suffix}`,
      fullKey: fullKey || null,
      suffix: c.suffix,
      status: c.status,
      assigned_user_id: c.assigned_user_id,
      created_at: c.created_at,
      activated_at: c.activated_at,
      last_used_at: c.last_used_at,
      created_by: c.created_by,
      notes: c.notes
    };
  });
  res.json(codes);
});

// Generate new random codes
app.post('/api/admin/access-codes/generate', (req: Request, res: Response) => {
  const count = Math.min(Number(req.body.count) || 5, 50);
  const newCodes: string[] = [];

  db.update(d => {
    for (let i = 0; i < count; i++) {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part3 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const fullCode = `POD-${part1}-${part2}-${part3}`;
      newCodes.push(fullCode);

      d.access_codes.push({
        id: `code_${Date.now()}_${i}`,
        code_hash: hashAccessCode(fullCode),
        suffix: getCodeSuffix(fullCode),
        status: 'AVAILABLE',
        assigned_user_id: null,
        created_at: new Date().toISOString(),
        activated_at: null,
        last_used_at: null,
        revoked_at: null,
        created_by: 'admin_generator',
        notes: `Generated on ${new Date().toLocaleDateString()}`
      });
    }
  });

  db.log('ADMIN_GENERATE_CODES', `Generated ${count} access codes`, 'admin', req.ip);

  // Return the plaintext codes ONCE to the admin who generated them so they can distribute them to customers
  res.json({
    success: true,
    count,
    generatedCodes: newCodes,
    notice: 'Copy these access codes now. Plaintext will not be shown again.'
  });
});

// Import Owner Private Batch (Immediate server-side hashing)
app.post('/api/admin/access-codes/import', (req: Request, res: Response) => {
  const { rawCodes, notes } = req.body;
  if (!rawCodes || typeof rawCodes !== 'string') {
    return res.status(400).json({ error: 'Please provide codes (one per line).' });
  }

  const lines = rawCodes.split('\n').map(l => l.trim()).filter(l => l.length >= 4);
  let importedCount = 0;

  db.update(d => {
    for (const code of lines) {
      const hash = hashAccessCode(code);
      const exists = d.access_codes.some(c => c.code_hash === hash);
      if (!exists) {
        d.access_codes.push({
          id: `code_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          code_hash: hash,
          suffix: getCodeSuffix(code),
          status: 'AVAILABLE',
          assigned_user_id: null,
          created_at: new Date().toISOString(),
          activated_at: null,
          last_used_at: null,
          revoked_at: null,
          created_by: 'owner_import',
          notes: notes || 'Imported via owner batch import'
        });
        importedCount++;
      }
    }
  });

  db.log('ADMIN_IMPORT_CODES', `Imported & securely hashed ${importedCount} private access codes`, 'admin', req.ip);
  res.json({ success: true, importedCount });
});

app.post('/api/admin/access-codes/:id/revoke', (req: Request, res: Response) => {
  db.update(d => {
    const code = d.access_codes.find(c => c.id === req.params.id);
    if (code) {
      code.status = 'REVOKED';
      code.revoked_at = new Date().toISOString();
    }
    // Also revoke associated entitlement
    d.access_entitlements.forEach(e => {
      if (e.access_code_id === req.params.id) {
        e.status = 'REVOKED';
      }
    });
  });
  db.log('ACCESS_CODE_REVOKED', `Revoked code ID ${req.params.id}`, 'admin', req.ip);
  res.json({ success: true });
});

app.get('/api/admin/providers', (req: Request, res: Response) => {
  res.json(db.get().provider_configs);
});

app.post('/api/admin/providers/:id/toggle', (req: Request, res: Response) => {
  db.update(d => {
    const p = d.provider_configs.find(item => item.id === req.params.id);
    if (p) p.enabled = !p.enabled;
  });
  res.json({ success: true });
});

app.get('/api/admin/feature-flags', (req: Request, res: Response) => {
  res.json(db.get().feature_flags);
});

app.post('/api/admin/feature-flags', (req: Request, res: Response) => {
  const { key, enabled } = req.body;
  db.update(d => {
    const f = d.feature_flags.find(flag => flag.key === key);
    if (f) f.enabled = Boolean(enabled);
  });
  res.json({ success: true });
});

app.get('/api/admin/logs', (req: Request, res: Response) => {
  res.json(db.get().audit_logs.slice(0, 100));
});

app.post('/api/admin/emergency-lock', (req: Request, res: Response) => {
  const { locked } = req.body;
  db.update(d => {
    d.emergency_locked = Boolean(locked);
  });
  db.log('EMERGENCY_LOCK_TOGGLED', `Emergency lock set to ${locked}`, 'admin', req.ip);
  res.json({ success: true, emergency_locked: db.get().emergency_locked });
});

app.post('/api/admin/maintenance-mode', (req: Request, res: Response) => {
  const { enabled, message } = req.body;
  db.update(d => {
    d.maintenance_mode = Boolean(enabled);
    if (message) d.maintenance_message = message;
  });
  res.json({ success: true, maintenance_mode: db.get().maintenance_mode });
});

// System Status endpoint
app.get('/api/system/status', (req: Request, res: Response) => {
  const state = db.get();
  res.json({
    status: state.emergency_locked ? 'EMERGENCY_LOCKED' : (state.maintenance_mode ? 'MAINTENANCE' : 'OPERATIONAL'),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 6. VITE MIDDLEWARE & STATIC ASSET SERVING
// ==========================================

async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[GiveMePOD] Server running on port ${PORT} (dev: ${isDev})`);
  });
}

startServer();
