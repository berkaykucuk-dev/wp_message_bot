import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '../pages/AuthPage.vue'
import AdminAuthPage from '../pages/AdminAuthPage.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useAppStore } from '../store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: AuthPage
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminAuthPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/AdminDashboardPage.vue')
      },
      {
        path: 'users/:id',
        name: 'AdminUserDetail',
        component: () => import('../pages/admin/AdminUserDetailPage.vue')
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('../pages/admin/AdminLogsPage.vue')
      },
      {
        path: 'server-logs',
        name: 'AdminServerLogs',
        component: () => import('../pages/admin/AdminServerLogsPage.vue')
      }
    ]
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Home',
        component: () => import('../pages/HomePage.vue')
      },
      {
        path: 'contacts',
        name: 'Contacts',
        component: () => import('../pages/ContactsPage.vue')
      },
      {
        path: 'campaigns',
        name: 'Campaigns',
        component: () => import('../pages/CampaignsPage.vue')
      },
      {
        path: 'templates',
        name: 'Templates',
        component: () => import('../pages/TemplatesPage.vue')
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('../pages/TagsPage.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/SettingsPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const store = useAppStore()
  
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    if (to.meta.requiresAdmin) {
      next({ name: 'AdminLogin' })
    } else {
      next({ name: 'Login' })
    }
  } else if ((to.name === 'Login' || to.name === 'AdminLogin') && store.isAuthenticated) {
    if (store.user?.role === 'superadmin') {
      next({ name: 'AdminDashboard' })
    } else {
      next({ name: 'Home' })
    }
  } else if (to.meta.requiresAdmin && store.user?.role !== 'superadmin') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
