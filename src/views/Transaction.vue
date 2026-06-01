<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar :userRole="userRole" />
    <main class="flex-1 overflow-y-auto p-8">
      <h2 class="text-2xl font-bold mb-6">Transaksi Baru</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">Informasi Transaksi</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Customer</label>
                <select v-model="selectedCustomer" class="input-field">
                  <option value="">Pilih Customer</option>
                  <option v-for="customer in customers" :key="customer.custcd" :value="customer.custcd">
                    {{ customer.nama_customer }} ({{ customer.custcd }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <select v-model="paymentMethod" class="input-field">
                  <option value="cash">Cash</option>
                  <option value="qris">QRIS</option>
                  <option value="transfer">Transfer Bank</option>
                </select>
              </div>
            </div>

            <div class="border-t mt-6 pt-6">
              <h3 class="text-lg font-semibold mb-4">Tambah Produk</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Produk</label>
                  <select v-model="selectedProduct" class="input-field">
                    <option value="">Pilih Produk</option>
                    <option v-for="product in products" :key="product.id_produk" :value="product.id_produk">
                      {{ product.nama_produk }} (Stok: {{ product.stok_produk }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Harga</label>
                  <select v-model="selectedPriceType" class="input-field">
                    <option value="R">Regular</option>
                    <option value="SW">Special Weekday (25% off)</option>
                    <option value="D">Discount (35% off)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input type="number" v-model="quantity" class="input-field" min="1" />
                </div>

                <div class="flex items-end">
                  <button @click="addToCart" class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                    <PlusIcon class="h-5 w-5" />
                    <span>Tambah ke Keranjang</span>
                  </button>
                </div>
              </div>

              <!-- Info Harga dan Stok -->
              <div v-if="selectedProduct" class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-800">
                  Harga: <span class="font-bold">Rp {{ getProductPrice().toLocaleString('id-ID') }}</span> / unit
                </p>
                <p class="text-sm text-blue-800 mt-1">
                  Stok tersedia: {{ getProductStock() }} unit
                </p>
                <p v-if="selectedPriceType !== 'R'" class="text-sm text-green-600 mt-1">
                  ✓ Diskon {{ selectedPriceType === 'SW' ? '25%' : '35%' }} berlaku
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Cart -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 class="text-lg font-semibold mb-4">Keranjang Belanja</h3>
            
            <div v-if="cart.length === 0" class="text-gray-500 text-center py-8">
              Belum ada produk
            </div>
            
            <div v-else>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div v-for="(item, index) in cart" :key="index" class="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <p class="font-medium text-gray-800">{{ item.nama_produk }}</p>
                      <p class="text-xs" :class="getPriceTypeColor(item.jenis_harga)">
                        {{ getPriceTypeLabel(item.jenis_harga) }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-sm text-gray-600">Rp {{ item.harga_satuan.toLocaleString('id-ID') }}</span>
                        <span class="text-gray-400">x</span>
                        <input 
                          type="number" 
                          v-model="item.qty" 
                          @change="updateQuantity(index, $event.target.value)"
                          class="w-16 px-1 py-0 border border-gray-300 rounded text-center"
                          min="1"
                        />
                        <span class="text-gray-400">=</span>
                        <span class="text-sm font-semibold text-blue-600">
                          Rp {{ item.subtotal.toLocaleString('id-ID') }}
                        </span>
                      </div>
                    </div>
                    <button @click="removeFromCart(index)" class="text-red-600 hover:text-red-800 ml-2">
                      <TrashIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="border-t mt-4 pt-4">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-lg font-semibold">Total:</span>
                  <span class="text-2xl font-bold text-blue-600">
                    Rp {{ totalHarga.toLocaleString('id-ID') }}
                  </span>
                </div>
                
                <button 
                  @click="submitTransaction" 
                  :disabled="loading || cart.length === 0 || !selectedCustomer"
                  class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="!loading">Bayar Rp {{ totalHarga.toLocaleString('id-ID') }}</span>
                  <span v-else>Memproses...</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import Sidebar from '../components/Sidebar.vue'

const userRole = ref(localStorage.getItem('userRole') || '')
const products = ref([])
const customers = ref([])
const prices = ref([])
const selectedCustomer = ref('')
const paymentMethod = ref('cash')
const loading = ref(false)
const cart = ref([])
const selectedProduct = ref('')
const selectedPriceType = ref('R')
const quantity = ref(1)

// Fetch data
const fetchData = async () => {
  try {
    const role = localStorage.getItem('userRole')
    const [productsRes, customersRes, pricesRes] = await Promise.all([
      axios.get('http://localhost:8080/api/produk?page=1&limit=100', { headers: { 'X-User-Role': role } }),
      axios.get('http://localhost:8080/api/customers?page=1&limit=100', { headers: { 'X-User-Role': role } }),
      axios.get('http://localhost:8080/api/harga', { headers: { 'X-User-Role': role } })
    ])
    products.value = productsRes.data.data || []
    customers.value = customersRes.data.data || []
    prices.value = pricesRes.data
  } catch (error) {
    console.error('Error fetching data:', error)
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal mengambil data' })
  }
}

// Helper functions
const getProductPrice = () => {
  if (!selectedProduct.value) return 0
  const price = prices.value.find(p => p.id_produk === parseInt(selectedProduct.value) && p.jenis_harga === selectedPriceType.value)
  return price ? price.harga_produk : 0
}

const getProductStock = () => {
  const product = products.value.find(p => p.id_produk === parseInt(selectedProduct.value))
  if (!product) return 0
  const existingItem = cart.value.find(item => item.id_produk === parseInt(selectedProduct.value) && item.jenis_harga === selectedPriceType.value)
  return product.stok_produk - (existingItem?.qty || 0)
}

const getProductName = () => {
  const product = products.value.find(p => p.id_produk === parseInt(selectedProduct.value))
  return product ? product.nama_produk : ''
}

const getPriceTypeLabel = (type) => {
  const labels = { 'R': 'Regular', 'SW': 'Special Weekday (25% off)', 'D': 'Discount (35% off)' }
  return labels[type] || type
}

const getPriceTypeColor = (type) => {
  const colors = { 'R': 'text-gray-600', 'SW': 'text-green-600', 'D': 'text-red-600' }
  return colors[type] || 'text-gray-600'
}

// Cart functions
const addToCart = () => {
  if (!selectedProduct.value) {
    Swal.fire({ icon: 'warning', title: 'Peringatan!', text: 'Pilih produk terlebih dahulu' })
    return
  }
  
  const price = getProductPrice()
  const maxStock = getProductStock()
  
  if (quantity.value < 1) {
    Swal.fire({ icon: 'warning', title: 'Peringatan!', text: 'Quantity minimal 1' })
    return
  }
  
  if (quantity.value > maxStock) {
    Swal.fire({ icon: 'error', title: 'Error!', text: `Stok tidak mencukupi. Tersisa ${maxStock} unit` })
    return
  }
  
  if (price === 0) {
    Swal.fire({ icon: 'error', title: 'Error!', text: 'Harga produk tidak tersedia' })
    return
  }
  
  const existingIndex = cart.value.findIndex(item => 
    item.id_produk === parseInt(selectedProduct.value) && item.jenis_harga === selectedPriceType.value
  )
  
  if (existingIndex !== -1) {
    const newQty = cart.value[existingIndex].qty + quantity.value
    if (newQty > getProductStock() + cart.value[existingIndex].qty) {
      Swal.fire({ icon: 'error', title: 'Error!', text: 'Total quantity melebihi stok' })
      return
    }
    cart.value[existingIndex].qty = newQty
    cart.value[existingIndex].subtotal = newQty * cart.value[existingIndex].harga_satuan
  } else {
    cart.value.push({
      id_produk: parseInt(selectedProduct.value),
      nama_produk: getProductName(),
      qty: quantity.value,
      harga_satuan: price,
      jenis_harga: selectedPriceType.value,
      subtotal: price * quantity.value
    })
  }
  
  selectedProduct.value = ''
  selectedPriceType.value = 'R'
  quantity.value = 1
  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk ditambahkan ke keranjang', timer: 1500, showConfirmButton: false })
}

const removeFromCart = (index) => {
  cart.value.splice(index, 1)
  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk dihapus dari keranjang', timer: 1500, showConfirmButton: false })
}

const updateQuantity = (index, newQty) => {
  newQty = parseInt(newQty)
  if (newQty < 1) {
    Swal.fire({ icon: 'warning', title: 'Peringatan!', text: 'Quantity minimal 1' })
    return
  }
  
  const item = cart.value[index]
  const product = products.value.find(p => p.id_produk === item.id_produk)
  if (newQty > product.stok_produk) {
    Swal.fire({ icon: 'error', title: 'Error!', text: `Stok tidak mencukupi. Maksimal ${product.stok_produk} unit` })
    cart.value[index].qty = item.qty
    return
  }
  
  cart.value[index].qty = newQty
  cart.value[index].subtotal = newQty * cart.value[index].harga_satuan
}

const totalHarga = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.subtotal, 0)
})

// Submit transaction
const submitTransaction = async () => {
  if (!selectedCustomer.value) {
    Swal.fire({ icon: 'warning', title: 'Peringatan!', text: 'Pilih customer terlebih dahulu' })
    return
  }
  
  if (cart.value.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Peringatan!', text: 'Tambahkan produk ke keranjang terlebih dahulu' })
    return
  }
  
  loading.value = true
  
  try {
    const role = localStorage.getItem('userRole')
    for (const item of cart.value) {
      await axios.post('http://localhost:8080/api/transaksi', {
        id_produk: item.id_produk,
        qty: item.qty,
        custcd: selectedCustomer.value,
        metode_pembayaran: paymentMethod.value,
        jenis_harga: item.jenis_harga
      }, { headers: { 'X-User-Role': role } })
    }
    
    await Swal.fire({ 
      icon: 'success', 
      title: 'Berhasil!', 
      text: `Transaksi berhasil! Total: Rp ${totalHarga.value.toLocaleString('id-ID')}`,
      timer: 2000,
      showConfirmButton: false
    })
    
    // Reset form
    cart.value = []
    selectedCustomer.value = ''
    paymentMethod.value = 'cash'
    await fetchData()
    
  } catch (error) {
    console.error('Error:', error)
    await Swal.fire({ icon: 'error', title: 'Error!', text: 'Gagal melakukan transaksi' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
