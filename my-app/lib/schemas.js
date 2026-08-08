/**
 * Single source of truth for every collection in the system.
 * Used to (a) build Mongoose models when MongoDB is available and
 * (b) apply defaults / casting for the embedded JSON fallback store.
 *
 * type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'ref'
 */

const S = (def = '') => ({ type: 'string', default: def });
const N = (def = 0) => ({ type: 'number', default: def });
const B = (def = false) => ({ type: 'boolean', default: def });
const D = (def = null) => ({ type: 'date', default: def });
const A = (def = []) => ({ type: 'array', default: def });
const O = (def = {}) => ({ type: 'object', default: def });
const REF = (collection) => ({ type: 'ref', ref: collection, default: null });

const schemas = {
  /* ------------------------------------------------------------------ */
  /* Users, roles & security                                             */
  /* ------------------------------------------------------------------ */
  users: {
    fields: {
      name: S(),
      email: { type: 'string', default: '', lowercase: true, unique: true, index: true },
      username: { type: 'string', default: '', index: true },
      password: S(),
      role: S('viewer'), // slug of a role document
      avatar: S(),
      bio: S(),
      phone: S(),
      isActive: B(true),
      twoFactorEnabled: B(false),
      twoFactorSecret: S(),
      resetToken: S(),
      resetTokenExpires: D(),
      lastLogin: D(),
    },
    hidden: ['password', 'twoFactorSecret', 'resetToken', 'resetTokenExpires'],
  },

  roles: {
    fields: {
      name: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      description: S(),
      isSystem: B(false),
      permissions: O({}), // { moduleKey: { view, create, edit, delete, toggle } }
    },
  },

  activitylogs: {
    fields: {
      user: REF('users'),
      userName: S(),
      action: S(),
      module: S(),
      details: S(),
      ip: S(),
      userAgent: S(),
    },
  },

  loginlogs: {
    fields: {
      user: REF('users'),
      email: S(),
      status: S('success'), // success | failed
      reason: S(),
      ip: S(),
      browser: S(),
      os: S(),
      device: S(),
      userAgent: S(),
    },
  },

  blockedips: {
    fields: {
      ip: { type: 'string', default: '', index: true },
      reason: S(),
      permanent: B(false),
      expiresAt: D(),
      createdBy: S(),
    },
  },

  visits: {
    fields: {
      path: S('/'),
      referrer: S(),
      source: S('direct'), // direct | search | social | referral
      device: S('desktop'), // desktop | mobile | tablet
      browser: S(),
      os: S(),
      country: S(),
      ip: S(),
      sessionId: { type: 'string', default: '', index: true },
      duration: N(0),
      isBounce: B(true),
    },
  },

  notifications: {
    fields: {
      type: S('info'), // message | quote | application | comment | packageRequest | system
      title: S(),
      body: S(),
      link: S(),
      isRead: B(false),
      meta: O({}),
    },
  },

  backups: {
    fields: {
      filename: S(),
      size: N(0),
      type: S('manual'), // manual | auto
      collections: N(0),
      documents: N(0),
      note: S(),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Home page building blocks                                           */
  /* ------------------------------------------------------------------ */
  slides: {
    fields: {
      title: S(),
      titleEn: S(),
      subtitle: S(),
      subtitleEn: S(),
      image: S(),
      btn1Text: S(),
      btn1TextEn: S(),
      btn1Link: S('/quote'),
      btn2Text: S(),
      btn2TextEn: S(),
      btn2Link: S('/portfolio'),
      showBtn2: B(true),
      isActive: B(true),
      order: N(0),
    },
  },

  stats: {
    fields: {
      value: N(0),
      label: S(),
      labelEn: S(),
      icon: S('TrendingUp'),
      showPlus: B(true),
      suffix: S(''),
      isActive: B(true),
      order: N(0),
    },
  },

  sections: {
    fields: {
      key: { type: 'string', default: '', unique: true, index: true },
      label: S(),
      isVisible: B(true),
      order: N(0),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Services                                                            */
  /* ------------------------------------------------------------------ */
  services: {
    fields: {
      title: S(),
      titleEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      shortDesc: S(),
      shortDescEn: S(),
      description: S(),
      descriptionEn: S(),
      image: S(),
      bannerImage: S(),
      icon: S('Code'),
      features: A([]), // [{ text }]
      technologies: A([]), // [{ name, logo }]
      seoTitle: S(),
      seoDesc: S(),
      keywords: S(),
      status: S('published'), // published | draft
      isActive: B(true),
      isFeatured: B(false),
      order: N(0),
      views: N(0),
    },
  },

  technologies: {
    fields: { name: S(), logo: S(), order: N(0) },
  },

  /* ------------------------------------------------------------------ */
  /* Portfolio                                                           */
  /* ------------------------------------------------------------------ */
  projectcategories: {
    fields: {
      name: S(),
      nameEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      description: S(),
      icon: S('Folder'),
      isActive: B(true),
      order: N(0),
    },
  },

  projects: {
    fields: {
      title: S(),
      titleEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      category: REF('projectcategories'),
      client: S(),
      description: S(),
      descriptionEn: S(),
      challenge: S(),
      solution: S(),
      images: A([]), // [url]
      cover: S(),
      videoUrl: S(),
      technologies: A([]), // [name]
      liveUrl: S(),
      projectDate: D(),
      seoTitle: S(),
      seoDesc: S(),
      keywords: S(),
      status: S('published'),
      isActive: B(true),
      isFeatured: B(false),
      order: N(0),
      views: N(0),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Packages / pricing                                                  */
  /* ------------------------------------------------------------------ */
  packages: {
    fields: {
      name: S(),
      nameEn: S(),
      slug: { type: 'string', default: '', index: true },
      description: S(),
      monthlyPrice: N(0),
      yearlyPrice: N(0),
      currency: S('SAR'),
      features: A([]), // [{ text, included }]
      isPopular: B(false),
      isActive: B(true),
      showOnHome: B(true),
      buttonText: S('اطلب الآن'),
      buttonLink: S(''),
      order: N(0),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Blog                                                                */
  /* ------------------------------------------------------------------ */
  postcategories: {
    fields: {
      name: S(),
      nameEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      description: S(),
      isActive: B(true),
      order: N(0),
    },
  },

  tags: {
    fields: {
      name: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
    },
  },

  posts: {
    fields: {
      title: S(),
      titleEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      excerpt: S(),
      excerptEn: S(),
      content: S(),
      contentEn: S(),
      image: S(),
      categories: A([]), // [categoryId]
      tags: A([]), // [tagName]
      author: REF('users'),
      authorName: S(),
      status: S('published'), // published | draft | scheduled
      publishAt: D(),
      seoTitle: S(),
      seoDesc: S(),
      keywords: S(),
      readTime: N(3),
      views: N(0),
      isFeatured: B(false),
    },
  },

  comments: {
    fields: {
      post: REF('posts'),
      postTitle: S(),
      name: S(),
      email: S(),
      website: S(),
      content: S(),
      status: S('pending'), // pending | approved | rejected
      ip: S(),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Clients & partners                                                  */
  /* ------------------------------------------------------------------ */
  partners: {
    fields: {
      name: S(),
      logo: S(),
      url: S(),
      isActive: B(true),
      order: N(0),
    },
  },

  testimonials: {
    fields: {
      name: S(),
      position: S(),
      company: S(),
      avatar: S(),
      content: S(),
      rating: N(5),
      isActive: B(true),
      order: N(0),
    },
  },

  team: {
    fields: {
      name: S(),
      nameEn: S(),
      position: S(),
      positionEn: S(),
      bio: S(),
      avatar: S(),
      linkedin: S(),
      twitter: S(),
      email: S(),
      isActive: B(true),
      order: N(0),
    },
  },

  timeline: {
    fields: {
      year: S(),
      title: S(),
      titleEn: S(),
      description: S(),
      isActive: B(true),
      order: N(0),
    },
  },

  certificates: {
    fields: {
      title: S(),
      image: S(),
      issuer: S(),
      isActive: B(true),
      order: N(0),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Careers                                                             */
  /* ------------------------------------------------------------------ */
  jobdepartments: {
    fields: { name: S(), slug: S(), order: N(0) },
  },

  jobs: {
    fields: {
      title: S(),
      titleEn: S(),
      slug: { type: 'string', default: '', unique: true, index: true },
      department: S(),
      type: S('full-time'), // full-time | part-time | remote | contract
      location: S(),
      salaryRange: S(),
      description: S(),
      requirements: S(),
      skills: S(),
      benefits: S(),
      deadline: D(),
      isActive: B(true),
      applicationsCount: N(0),
      order: N(0),
    },
  },

  applications: {
    fields: {
      job: REF('jobs'),
      jobTitle: S(),
      name: S(),
      email: S(),
      phone: S(),
      coverLetter: S(),
      resume: S(),
      resumeName: S(),
      portfolioUrl: S(),
      status: S('new'), // new | reviewing | shortlisted | interview | accepted | rejected
      notes: S(),
      isRead: B(false),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Leads: messages, quotes, package requests                           */
  /* ------------------------------------------------------------------ */
  messages: {
    fields: {
      name: S(),
      email: S(),
      phone: S(),
      service: S(),
      subject: S(),
      message: S(),
      status: S('new'), // new | read | replied | archived
      isRead: B(false),
      notes: S(),
      ip: S(),
    },
  },

  quotes: {
    fields: {
      name: S(),
      company: S(),
      email: S(),
      phone: S(),
      projectType: S(),
      budget: S(),
      timeline: S(),
      description: S(),
      attachments: A([]), // [{ url, name }]
      status: S('new'), // new | reviewing | sent | rejected | completed
      notes: S(),
      isRead: B(false),
      ip: S(),
    },
  },

  packagerequests: {
    fields: {
      name: S(),
      email: S(),
      phone: S(),
      company: S(),
      packageId: S(),
      packageName: S(),
      billing: S('monthly'),
      message: S(),
      status: S('new'),
      notes: S(),
      isRead: B(false),
    },
  },

  /* ------------------------------------------------------------------ */
  /* FAQ                                                                 */
  /* ------------------------------------------------------------------ */
  faqcategories: {
    fields: {
      name: S(),
      slug: { type: 'string', default: '', index: true },
      isActive: B(true),
      order: N(0),
    },
  },

  faqs: {
    fields: {
      question: S(),
      questionEn: S(),
      answer: S(),
      answerEn: S(),
      category: REF('faqcategories'),
      showOnPricing: B(false),
      isActive: B(true),
      order: N(0),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Navigation & banners                                                */
  /* ------------------------------------------------------------------ */
  menus: {
    fields: {
      title: S(),
      titleEn: S(),
      url: S('/'),
      location: S('header'), // header | footer
      parent: { type: 'string', default: '' },
      target: S('_self'),
      isActive: B(true),
      order: N(0),
    },
  },

  banners: {
    fields: {
      page: { type: 'string', default: '', unique: true, index: true },
      label: S(),
      title: S(),
      titleEn: S(),
      subtitle: S(),
      image: S(),
      isActive: B(true),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Editable static pages (about / privacy / terms / 404 / forms)       */
  /* ------------------------------------------------------------------ */
  pages: {
    fields: {
      key: { type: 'string', default: '', unique: true, index: true },
      title: S(),
      content: S(),
      contentEn: S(),
      data: O({}),
      updatedBy: S(),
    },
  },

  /* ------------------------------------------------------------------ */
  /* Global settings (singleton)                                         */
  /* ------------------------------------------------------------------ */
  settings: {
    fields: {
      // Company
      siteName: S('شركتي للحلول البرمجية'),
      siteNameEn: S('My Company'),
      logo: S(),
      logoLight: S(),
      favicon: S(),
      description: S(),
      descriptionEn: S(),
      foundedYear: S('2015'),
      copyrightText: S(),
      companyProfile: S(),
      // Contact
      phone: S(),
      phone2: S(),
      whatsapp: S(),
      email: S(),
      email2: S(),
      address: S(),
      addressEn: S(),
      workingHours: S(),
      mapEmbed: S(),
      showMap: B(true),
      // Bars
      topBarEnabled: B(true),
      // Social
      socials: O({}),
      // SEO
      seo: O({}),
      // SMTP
      smtp: O({}),
      // Whatsapp button
      whatsappSettings: O({}),
      // Maintenance
      maintenance: O({}),
      // Languages
      languages: O({}),
      // Security
      security: O({}),
      // Notifications
      notifications: O({}),
      // Backup
      backup: O({}),
      // Home tuning
      home: O({}),
    },
  },
};

/** Default values for object-typed settings sub documents. */
const settingsDefaults = {
  socials: {
    facebook: '', twitter: '', instagram: '', linkedin: '',
    youtube: '', tiktok: '', snapchat: '', pinterest: '', github: '',
  },
  seo: {
    title: '', description: '', keywords: '', ogImage: '',
    ga: '', gtm: '', pixel: '',
    robots: 'User-agent: *\nAllow: /\nDisallow: /Akramadmin',
  },
  smtp: { host: '', port: 587, user: '', pass: '', encryption: 'tls', fromName: '', fromEmail: '' },
  whatsappSettings: {
    enabled: true, number: '', welcomeMessage: 'مرحباً، أود الاستفسار عن خدماتكم',
    tooltip: 'تحتاج مساعدة؟', showTooltip: true, position: 'left',
  },
  maintenance: { enabled: false, title: 'الموقع تحت الصيانة', message: 'نعمل على تحسين الموقع، سنعود قريباً.', image: '', returnDate: null },
  languages: { bilingual: false, defaultLang: 'ar' },
  security: { recaptchaEnabled: false, siteKey: '', secretKey: '', maxAttempts: 5, blockDuration: 30, twoFactor: false },
  notifications: { onMessage: true, onQuote: true, onPackage: true, onApplication: true, onComment: true, emailCopy: false, email: '' },
  backup: { autoEnabled: false, frequency: 'weekly', keep: 10 },
  home: { servicesCount: 6, projectsCount: 6, postsCount: 3, showPricingToggle: true },
};

module.exports = { schemas, settingsDefaults };
