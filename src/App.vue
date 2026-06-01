<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token && router.currentRoute.value.path === '/login') {
    router.push('/dashboard')
  }
})
</script>
