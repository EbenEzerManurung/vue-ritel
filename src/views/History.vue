<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar :userRole="userRole" />
    <main class="flex-1 overflow-y-auto p-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold">Riwayat Transaksi</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" v-model="search" @input="filterTransactions" placeholder="Cari transaksi..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64" />
          </div>
          <button @click="exportToExcel" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <DocumentArrowDownIcon class="h-5 w-5" /><span>Export Excel</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Harga</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in paginatedTransactions" :key="transaction.id_transaksi" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transaction.id_transaksi }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transaction.nama_produk }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transaction.nama_customer }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transaction.qty }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">Rp {{ (transaction.total_harga || 0).toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', transaction.metode_pembayaran === 'cash' ? 'bg-green-100 text-green-800' : transaction.metode_pembayaran === 'qris' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800']">
                    {{ transaction.metode_pembayaran?.toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.created_at) }}</td>
              </tr>
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">Tidak ada data transaksi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">Previous</button>
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">Next</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { MagnifyingGlassIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import Sidebar from '../components/Sidebar.vue'
import * as XLSX from 'xlsx'

const userRole = ref(localStorage.getItem('userRole') || '')
const transactions = ref([])
const filteredTransactions = ref([])
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const fetchTransactions = async () => {
  loading.value = true
  try {
    const role = localStorage.getItem('userRole')
    const response = await axios.get('http://localhost:8080/api/transaksi?page=1&limit=1000', { 
      headers: { 'X-User-Role': role } 
    })
    transactions.value = response.data.data || []
    filteredTransactions.value = transactions.value
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal mengambil data transaksi' })
  } finally {
    loading.value = false
  }
}

const filterTransactions = () => {
  if (!search.value) {
    filteredTransactions.value = transactions.value
  } else {
    const searchLower = search.value.toLowerCase()
    filteredTransactions.value = transactions.value.filter(t => 
      t.nama_produk?.toLowerCase().includes(searchLower) || 
      t.nama_customer?.toLowerCase().includes(searchLower)
    )
  }
  currentPage.value = 1
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID')
}

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

const exportToExcel = () => {
  const exportData = filteredTransactions.value.map(t => ({
    'ID Transaksi': t.id_transaksi,
    'Produk': t.nama_produk,
    'Customer': t.nama_customer,
    'Quantity': t.qty,
    'Total Harga': `Rp ${(t.total_harga || 0).toLocaleString('id-ID')}`,
    'Metode Pembayaran': t.metode_pembayaran?.toUpperCase(),
    'Tanggal': formatDate(t.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
  XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`)
  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diexport', timer: 1500, showConfirmButton: false })
}

onMounted(fetchTransactions)
</script>
