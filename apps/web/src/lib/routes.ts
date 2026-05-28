/**
 * Centralized route constants for the application.
 * All internal links should use these constants.
 */
export const ROUTES = {
  // Public pages
  home: "/",
  map: "/map",
  understand: "/understand",
  contact: "/contact",
  about: "/about",
  charter: "/charter",
  institutions: "/institutions",

  // Auth
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: (token: string) => `/reset-password/${token}`,
  verifyEmail: (token: string) => `/verify-email/${token}`,

  // User account
  account: "/account",

  // Reports
  newReport: "/reports/new",
  report: (id: string) => `/reports/${id}`,

  // Legal
  terms: "/legal/terms",
  privacy: "/legal/privacy",

  // Admin
  admin: "/admin",
  adminReports: "/admin/reports",
  adminReport: (id: string) => `/admin/reports/${id}`,
  adminDeclarations: "/admin/declarations",
  adminDeclaration: (id: string) => `/admin/declarations/${id}`,
  adminUsers: "/admin/users",
  adminUser: (id: string) => `/admin/users/${id}`,
  adminAudit: "/admin/audit",
  adminReferentials: "/admin/referentials",

  // Moderation
  moderation: "/moderation",
  moderationReport: (id: string) => `/moderation/reports/${id}`,
  moderationDeclaration: (id: string) => `/moderation/declarations/${id}`,

  // API
  api: {
    signup: "/api/signup",
    forgotPassword: "/api/forgot-password",
    resetPassword: (token: string) => `/api/reset-password/${token}`,
    reports: "/api/reports",
    report: (id: string) => `/api/reports/${id}`,
    zones: "/api/zones",
    molecules: "/api/molecules",
    geocodeCities: "/api/geocode/cities",
    declarationsEffects: "/api/declarations-effects",
    adminCounts: "/api/admin/counts",
    moderationReportAction: (id: string) => `/api/moderation/reports/${id}/action`,
    moderationDeclarationAction: (id: string) => `/api/moderation/declarations/${id}/action`,
  },
} as const;
