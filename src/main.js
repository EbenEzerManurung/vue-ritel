import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// Import semua komponen
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import Customers from './views/Customers.vue'
import Products from './views/Products.vue'
import Transaction from './views/Transaction.vue'
import History from './views/History.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/customers', name: 'Customers', component: Customers, meta: { requiresAuth: true } },
  { path: '/products', name: 'Products', component: Products, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/transaction', name: 'Transaction', component: Transaction, meta: { requiresAuth: true } },
  { path: '/history', name: 'History', component: History, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role === 'admin' && userRole !== 'admin') {
    next('/dashboard')
  } else {
    next()
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
