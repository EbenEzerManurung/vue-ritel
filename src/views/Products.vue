<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar :userRole="userRole" />
    <main class="flex-1 overflow-y-auto p-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 class="text-2xl font-bold">Data Produk</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <div class="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              v-model="search" 
              @input="filterProducts" 
              placeholder="Cari produk..." 
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64" 
            />
          </div>
          <button @click="exportToExcel" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <DocumentArrowDownIcon class="h-5 w-5" />
            <span>Export Excel</span>
          </button>
          <button @click="openModal" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlusIcon class="h-5 w-5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Produk</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Regular</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga SW</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga D</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in paginatedProducts" :key="product.id_produk" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.id_produk }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.nama_produk }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.stok_produk }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {{ getPrice(product.id_produk, 'R').toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Rp {{ getPrice(product.id_produk, 'SW').toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">Rp {{ getPrice(product.id_produk, 'D').toLocaleString('id-ID') }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="editProduct(product)" class="text-blue-600 hover:text-blue-900 mr-3">
                    <PencilIcon class="h-5 w-5 inline" />
                  </button>
                  <button @click="deleteProduct(product.id_produk)" class="text-red-600 hover:text-red-900">
                    <TrashIcon class="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">Tidak ada data produk</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-6">
        <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">Previous</button>
        <span>Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300">Next</button>
      </div>

      <!-- Modal Form -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-md w-full p-6">
          <h3 class="text-xl font-bold mb-4">{{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}</h3>
          <form @submit.prevent="saveProduct">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input type="text" v-model="form.nama_produk" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                <input type="number" v-model="form.stok_produk" class="input-field" min="0" required />
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
const products = ref([])
const prices = ref([])
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const editingProduct = ref(null)
const form = ref({ nama_produk: '', stok_produk: 0 })
const currentPage = ref(1)
const itemsPerPage = 10

const fetchProducts = async () => {
  loading.value = true
  try {
    const role = localStorage.getItem('userRole')
    const [productsRes, pricesRes] = await Promise.all([
      axios.get('http://localhost:8080/api/produk?page=1&limit=1000', { headers: { 'X-User-Role': role } }),
      axios.get('http://localhost:8080/api/harga', { headers: { 'X-User-Role': role } })
    ])
    products.value = productsRes.data.data || []
    prices.value = pricesRes.data
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal mengambil data produk' })
  } finally {
    loading.value = false
  }
}

const getPrice = (productId, type) => {
  const price = prices.value.find(p => p.id_produk === productId && p.jenis_harga === type)
  return price ? price.harga_produk : 0
}

const filteredProducts = computed(() => {
  return products.value.filter(p => p.nama_produk?.toLowerCase().includes(search.value.toLowerCase()))
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const filterProducts = () => { 
  currentPage.value = 1 
}

const prevPage = () => { 
  if (currentPage.value > 1) currentPage.value-- 
}

const nextPage = () => { 
  if (currentPage.value < totalPages.value) currentPage.value++ 
}

const exportToExcel = () => {
  const exportData = filteredProducts.value.map(product => ({
    'ID Produk': product.id_produk,
    'Nama Produk': product.nama_produk,
    'Stok': product.stok_produk,
    'Harga Regular': `Rp ${getPrice(product.id_produk, 'R').toLocaleString('id-ID')}`,
    'Harga SW (25%)': `Rp ${getPrice(product.id_produk, 'SW').toLocaleString('id-ID')}`,
    'Harga D (35%)': `Rp ${getPrice(product.id_produk, 'D').toLocaleString('id-ID')}`
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Products')
  XLSX.writeFile(wb, `products_${new Date().toISOString().split('T')[0]}.xlsx`)
  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diexport', timer: 1500, showConfirmButton: false })
}

const saveProduct = async () => {
  try {
    const role = localStorage.getItem('userRole')
    if (editingProduct.value) {
      await axios.put(`http://localhost:8080/api/produk/${editingProduct.value.id_produk}`, form.value, { headers: { 'X-User-Role': role } })
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil diupdate', timer: 1500, showConfirmButton: false })
    } else {
      await axios.post('http://localhost:8080/api/produk', form.value, { headers: { 'X-User-Role': role } })
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk berhasil ditambahkan', timer: 1500, showConfirmButton: false })
    }
    fetchProducts()
    closeModal()
  } catch (error) {
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal menyimpan produk' })
  }
}

const deleteProduct = async (id) => {
  const result = await Swal.fire({
    title: 'Yakin?',
    text: "Data produk akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })
  if (result.isConfirmed) {
    try {
      const role = localStorage.getItem('userRole')
      await axios.delete(`http://localhost:8080/api/produk/${id}`, { headers: { 'X-User-Role': role } })
      await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Produk berhasil dihapus', timer: 1500, showConfirmButton: false })
      fetchProducts()
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal menghapus produk' })
    }
  }
}

const openModal = (product = null) => {
  if (product) {
    editingProduct.value = product
    form.value = { nama_produk: product.nama_produk, stok_produk: product.stok_produk }
  } else {
    editingProduct.value = null
    form.value = { nama_produk: '', stok_produk: 0 }
  }
  showModal.value = true
}

const editProduct = (product) => openModal(product)

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

onMounted(fetchProducts)
</script>
