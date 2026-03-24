import { lazy } from 'react';

export const LazyHomePage = lazy(async () => ({
  default: (await import('./HomePage')).HomePage,
}));

export const LazyPropertiesPage = lazy(async () => ({
  default: (await import('./PropertiesPage')).PropertiesPage,
}));

export const LazyPropertyDetailsPage = lazy(async () => ({
  default: (await import('./PropertyDetailsPage')).PropertyDetailsPage,
}));

export const LazyFavoritesPage = lazy(async () => ({
  default: (await import('./FavoritesPage')).FavoritesPage,
}));

export const LazyDashboardOverviewPage = lazy(async () => ({
  default: (await import('./admin/DashboardOverviewPage')).DashboardOverviewPage,
}));

export const LazyManageInquiriesPage = lazy(async () => ({
  default: (await import('./admin/ManageInquiriesPage')).ManageInquiriesPage,
}));

export const LazyManagePropertiesPage = lazy(async () => ({
  default: (await import('./admin/ManagePropertiesPage')).ManagePropertiesPage,
}));

export const LazyManageUsersPage = lazy(async () => ({
  default: (await import('./admin/ManageUsersPage')).ManageUsersPage,
}));
