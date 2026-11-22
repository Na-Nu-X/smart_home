import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: '',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'riesenia',
    title: 'Riešenia a technológie',
    loadComponent: () => import('./pages/solutions/solutions.page').then((m) => m.SolutionsPage),
  },
  {
    path: 'riesenia/:slug',
    title: 'Detail riešenia',
    loadComponent: () =>
      import('./pages/solution-detail/solution-detail.page').then((m) => m.SolutionDetailPage),
  },
  {
    path: 'realizacie',
    title: 'Realizácie a referencie',
    loadComponent: () => import('./pages/references/references.page').then((m) => m.ReferencesPage),
  },
  {
    path: 'realizacie/:slug',
    title: 'Detail realizácie',
    loadComponent: () =>
      import('./pages/reference-detail/reference-detail.page').then((m) => m.ReferenceDetailPage),
  },
  {
    path: 'showroom-a-proces',
    title: 'Showroom & Ako prebieha realizácia',
    loadComponent: () => import('./pages/showroom/showroom.page').then((m) => m.ShowroomPage),
  },
  {
    path: 'pre-architektov',
    title: 'Pre architektov a developerov',
    loadComponent: () => import('./pages/architects/architects.page').then((m) => m.ArchitectsPage),
  },
  {
    path: 'kalkulacka',
    title: 'Kalkulačka ceny Smart Home',
    loadComponent: () => import('./pages/calculator/calculator.page').then((m) => m.CalculatorPage),
  },
  {
    path: 'konzultacia',
    title: 'Nezáväzná ponuka & Návšteva showroomu',
    loadComponent: () => import('./pages/consultation/consultation.page').then((m) => m.ConsultationPage),
  },
  {
    path: 'ochrana-osobnych-udajov',
    title: 'Ochrana osobných údajov',
    loadComponent: () => import('./pages/privacy/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: '**',
    title: 'Stránka sa nenašla',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
