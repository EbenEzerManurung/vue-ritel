<template>
  <aside class="w-64 bg-white shadow-lg">
    <div className="p-4 border-b flex flex-col items-center text-center">
  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
    <span className="text-white text-xl font-bold">R</span>
  </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Vue Ritel</h1>
          <p className="text-xs text-gray-500">Ritel App</p>
        </div>
      </div>
    <div class="p-4 border-b">
      <p class="text-sm text-gray-600">Role: <span class="font-semibold capitalize">{{ userRole }}</span></p>
    </div>
    <nav class="p-4 space-y-2">
      <router-link to="/dashboard" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100" active-class="bg-blue-600 text-white">
        <HomeIcon class="h-5 w-5" /><span>Dashboard</span>
      </router-link>
      <router-link to="/customers" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100" active-class="bg-blue-600 text-white">
        <UsersIcon class="h-5 w-5" /><span>Customer</span>
      </router-link>
      <router-link v-if="userRole === 'admin'" to="/products" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100" active-class="bg-blue-600 text-white">
        <ShoppingBagIcon class="h-5 w-5" /><span>Produk</span>
      </router-link>
      <router-link to="/transaction" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100" active-class="bg-blue-600 text-white">
        <CurrencyDollarIcon class="h-5 w-5" /><span>Transaksi Baru</span>
      </router-link>
      <router-link to="/history" class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100" active-class="bg-blue-600 text-white">
        <ClockIcon class="h-5 w-5" /><span>Riwayat</span>
      </router-link>
      <button @click="handleLogout" class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4">
        <ArrowLeftOnRectangleIcon class="h-5 w-5" /><span>Logout</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeIcon, UsersIcon, ShoppingBagIcon, CurrencyDollarIcon, ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/vue/24/outline'

const props = defineProps(['userRole'])
const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userName')
  router.push('/login')
}
</script>
