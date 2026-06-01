<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar :userRole="userRole" />
    <main class="flex-1 overflow-y-auto p-8">
      <!-- Header dengan Search dan Tombol Export -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold">Data Customer</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              v-model="search" 
              @input="filterCustomers"
              placeholder="Cari customer..." 
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <button @click="exportToExcel" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <DocumentArrowDownIcon class="h-5 w-5" />
            <span>Export Excel</span>
          </button>
          <button v-if="userRole === 'admin'" @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon class="h-5 w-5" />
            <span>Tambah Customer</span>
          </button>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Tabel Data -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telepon</th>
                <th v-if="userRole === 'admin'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="customer in paginatedCustomers" :key="customer.custcd" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ customer.custcd }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ customer.nama_customer }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ customer.address?.substring(0, 50) || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ customer.phone || '-' }}</td>
                <td v-if="userRole === 'admin'" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="editCustomer(customer)" class="text-blue-600 hover:text-blue-900 mr-3">
                    <PencilIcon class="h-5 w-5 inline" />
                  </button>
                  <button @click="deleteCustomer(customer.custcd)" class="text-red-600 hover:text-red-900">
                    <TrashIcon class="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredCustomers.length === 0">
                <td :colspan="userRole === 'admin' ? 5 : 4" class="px-6 py-12 text-center text-gray-500">
                  Tidak ada data customer
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300">
          Previous
        </button>
        <span class="text-gray-700">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300">
          Next
        </button>
      </div>

      <!-- Modal Form Tambah/Edit -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-xl font-bold mb-4">{{ editingCustomer ? 'Edit Customer' : 'Tambah Customer' }}</h3>
          <form @submit.prevent="saveCustomer">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kode Customer</label>
                <input type="text" v-model="form.custcd" class="input-field" :disabled="!!editingCustomer" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Customer</label>
                <input type="text" v-model="form.nama_customer" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea v-model="form.address" class="input-field" rows="3"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="tel" v-model="form.phone" class="input-field" />
              </div>
            </div>
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Batal</button>
              <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/vue/24/outline'
import Sidebar from '../components/Sidebar.vue'
import * as XLSX from 'xlsx'

const userRole = ref(localStorage.getItem('userRole') || '')
const customers = ref([])
const filteredCustomers = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingCustomer = ref(null)
const form = ref({ custcd: '', nama_customer: '', address: '', phone: '' })
const currentPage = ref(1)
const itemsPerPage = 10

// Fetch data dari API
const fetchCustomers = async () => {
  loading.value = true
  try {
    const role = localStorage.getItem('userRole')
    const response = await axios.get('http://localhost:8080/api/customers?page=1&limit=1000', { 
      headers: { 'X-User-Role': role } 
    })
    customers.value = response.data.data || []
    filteredCustomers.value = customers.value
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal mengambil data customer' })
  } finally {
    loading.value = false
  }
}

// Filter berdasarkan search
const filterCustomers = () => {
  if (!search.value) {
    filteredCustomers.value = customers.value
  } else {
    const searchLower = search.value.toLowerCase()
    filteredCustomers.value = customers.value.filter(c => 
      c.nama_customer?.toLowerCase().includes(searchLower) || 
      c.custcd?.toLowerCase().includes(searchLower)
    )
  }
  currentPage.value = 1
}

// Pagination
const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCustomers.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage))

const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }

// Export ke Excel
const exportToExcel = () => {
  const exportData = filteredCustomers.value.map(customer => ({
    'Kode Customer': customer.custcd,
    'Nama Customer': customer.nama_customer,
    'Alamat': customer.address || '-',
    'Telepon': customer.phone || '-'
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Customers')
  XLSX.writeFile(wb, `customers_${new Date().toISOString().split('T')[0]}.xlsx`)
  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diexport', timer: 1500, showConfirmButton: false })
}

// Simpan Customer (Create/Update)
const saveCustomer = async () => {
  try {
    const role = localStorage.getItem('userRole')
    if (editingCustomer.value) {
      await axios.put(`http://localhost:8080/api/customers/${editingCustomer.value.custcd}`, form.value, { 
        headers: { 'X-User-Role': role } 
      })
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Customer berhasil diupdate', timer: 1500, showConfirmButton: false })
    } else {
      await axios.post('http://localhost:8080/api/customers', form.value, { 
        headers: { 'X-User-Role': role } 
      })
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Customer berhasil ditambahkan', timer: 1500, showConfirmButton: false })
    }
    fetchCustomers()
    closeModal()
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal menyimpan customer' })
  }
}

// Delete Customer
const deleteCustomer = async (custcd) => {
  const result = await Swal.fire({
    title: 'Yakin?',
    text: "Data customer akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })
  if (result.isConfirmed) {
    try {
      const role = localStorage.getItem('userRole')
      await axios.delete(`http://localhost:8080/api/customers/${custcd}`, { 
        headers: { 'X-User-Role': role } 
      })
      await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Customer berhasil dihapus', timer: 1500, showConfirmButton: false })
      fetchCustomers()
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal menghapus customer' })
    }
  }
}

// Modal functions
const openModal = (customer = null) => {
  if (customer) {
    editingCustomer.value = customer
    form.value = { ...customer }
  } else {
    editingCustomer.value = null
    form.value = { custcd: '', nama_customer: '', address: '', phone: '' }
  }
  showModal.value = true
}

const editCustomer = (customer) => openModal(customer)
const closeModal = () => {
  showModal.value = false
  editingCustomer.value = null
}

onMounted(fetchCustomers)
</script>
