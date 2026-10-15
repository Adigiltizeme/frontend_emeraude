import { Banknote, Download, FileBarChart, Gift, HelpCircle, Inbox, LayoutDashboard, Megaphone, MessageSquare, Newspaper, ScrollText, Settings, User, Users } from 'lucide-react';
import type { TourDemoData } from '../components/billing/tourDemo';

type TourRoutes = TourDemoData['__routes'];

export interface AdminMenuItem {
  path: string;
  icon: JSX.Element;
  labelKey: string;
  /** Permission exigée (src/auth/permissions.ts côté API) ; null = tout administrateur. */
  permission: string | null;
  /**
   * Étape de la visite guidée (textes : tour.steps.<key>), avec ses sous-écrans éventuels.
   * Obligatoire : une nouvelle rubrique entre dans la visite (ou en est exclue explicitement par null).
   * Contrôlé au build par scripts/check-tour.mjs (textes FR et EN présents).
   */
  tour: { key: string; children?: { key: string; route: (r: TourRoutes) => string }[] } | null;
}

/** Menu du back-office : source unique du menu latéral (AdminRoute) et des étapes « administration » de la visite. */
export const ADMIN_MENU: AdminMenuItem[] = [
  { path: '/admin', icon: <LayoutDashboard size={20} />, labelKey: 'admin.nav.overview', permission: 'dashboard', tour: { key: 'dashboard' } },
  { path: '/admin/investments', icon: <Banknote size={20} />, labelKey: 'admin.nav.investments', permission: 'investments', tour: { key: 'investments' } },
  {
    path: '/admin/projects', icon: <LayoutDashboard size={20} />, labelKey: 'admin.nav.projects', permission: 'projects',
    tour: {
      key: 'projects',
      children: [
        { key: 'dossier', route: (r) => `/admin/projects/${r.dossier}/dossier` },
        { key: 'distributions', route: (r) => `/admin/projects/${r.distributions}/distributions` },
      ],
    },
  },
  { path: '/admin/referrals', icon: <Gift size={20} />, labelKey: 'admin.nav.referrals', permission: 'distributions', tour: { key: 'referrals' } },
  { path: '/admin/users', icon: <Users size={20} />, labelKey: 'admin.nav.users', permission: 'users', tour: { key: 'users' } },
  { path: '/admin/leads', icon: <Inbox size={20} />, labelKey: 'admin.nav.leads', permission: 'leads', tour: { key: 'leads' } },
  { path: '/admin/posts', icon: <Newspaper size={20} />, labelKey: 'admin.nav.posts', permission: 'posts', tour: { key: 'content' } },
  { path: '/admin/faq', icon: <HelpCircle size={20} />, labelKey: 'admin.nav.faq', permission: 'posts', tour: { key: 'faq' } },
  { path: '/admin/support', icon: <MessageSquare size={20} />, labelKey: 'admin.nav.support', permission: 'support', tour: { key: 'support' } },
  { path: '/admin/messages', icon: <Megaphone size={20} />, labelKey: 'admin.nav.broadcasts', permission: 'broadcasts', tour: { key: 'broadcasts' } },
  { path: '/admin/reports', icon: <FileBarChart size={20} />, labelKey: 'admin.nav.reports', permission: 'dashboard', tour: { key: 'reports' } },
  { path: '/admin/exports', icon: <Download size={20} />, labelKey: 'admin.nav.exports', permission: 'exports', tour: { key: 'exports' } },
  { path: '/admin/audit', icon: <ScrollText size={20} />, labelKey: 'admin.nav.audit', permission: 'audit', tour: { key: 'security' } },
  { path: '/admin/settings', icon: <Settings size={20} />, labelKey: 'admin.nav.settings', permission: 'settings', tour: { key: 'settings' } },
  // Profil personnel de l'administrateur : rien à présenter.
  { path: '/admin/profile', icon: <User size={20} />, labelKey: 'admin.nav.profile', permission: null, tour: null },
];
