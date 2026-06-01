<template>
  

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl font-bold">R</span>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Aplikasi Ritel</h1>
          <p className="text-gray-600 mt-2"></p>
        </div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            v-model="namaUser"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan username"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            v-model="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan password"
            required
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Memproses...' : 'Login' }}
        </button>
      </form>
      <div class="mt-6 text-center text-sm text-gray-600">
        <p class="font-semibold">Demo Account:</p>
        <p>Admin: Admin User / password123</p>
        <p>Kasir: Kasir User / password123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const namaUser = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await axios.post('http://localhost:8080/api/login', {
      nama_user: namaUser.value,
      password: password.value
    })
    if (response.data.user) {
      localStorage.setItem('token', 'dummy-token')
      localStorage.setItem('userRole', response.data.user.role_user)
      localStorage.setItem('userName', response.data.user.nama_user)
      alert('Login berhasil!')
      router.push('/dashboard')
    }
  } catch (error) {
    alert('Login gagal! Periksa username dan password Anda.')
  } finally {
    loading.value = false
  }
}
</script>
