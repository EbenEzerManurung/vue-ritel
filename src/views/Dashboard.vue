<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar :userRole="userRole" />
    <main class="flex-1 overflow-y-auto p-8">
      <h2 class="text-2xl font-bold mb-6">Dashboard</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-gray-600 text-sm">Total Customer</p><p class="text-2xl font-bold mt-1">{{ stats.customers }}</p></div>
            <UsersIcon class="h-10 w-10 text-blue-500" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-gray-600 text-sm">Total Produk</p><p class="text-2xl font-bold mt-1">{{ stats.products }}</p></div>
            <ShoppingBagIcon class="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-gray-600 text-sm">Total Transaksi</p><p class="text-2xl font-bold mt-1">{{ stats.transactions }}</p></div>
            <CurrencyDollarIcon class="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div><p class="text-gray-600 text-sm">Total Pendapatan</p><p class="text-2xl font-bold mt-1">Rp {{ stats.revenue.toLocaleString('id-ID') }}</p></div>
            <ClockIcon class="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { UsersIcon, ShoppingBagIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/vue/24/outline'
import Sidebar from '../components/Sidebar.vue'

const userRole = ref(localStorage.getItem('userRole') || '')
const stats = ref({ customers: 0, products: 0, transactions: 0, revenue: 0 })

const fetchStats = async () => {
  try {
    const role = localStorage.getItem('userRole')
    const [customersRes, productsRes, transactionsRes] = await Promise.all([
      axios.get('http://localhost:8080/api/customers?page=1&limit=1', { headers: { 'X-User-Role': role } }),
      axios.get('http://localhost:8080/api/produk?page=1&limit=1', { headers: { 'X-User-Role': role } }),
      axios.get('http://localhost:8080/api/transaksi?page=1&limit=100', { headers: { 'X-User-Role': role } })
    ])
    const totalRevenue = transactionsRes.data.data?.reduce((sum, t) => sum + t.total_harga, 0) || 0
    stats.value = {
      customers: customersRes.data.total || 0,
      products: productsRes.data.total || 0,
      transactions: transactionsRes.data.total || 0,
      revenue: totalRevenue
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(fetchStats)
</script>
