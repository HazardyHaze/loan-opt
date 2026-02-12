<template>
  <div class="min-h-screen" style="background-color: #BAC7CC;">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-center h-16 px-4" style="background-color: #222831;">
          <h1 class="text-xl font-bold text-white">LoanOpt Admin</h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2" style="background-color: #222831;">
          <router-link to="/admin/dashboard" class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200">
            <i class="fas fa-tachometer-alt mr-3"></i> Dashboard
          </router-link>
          <router-link to="/admin/users" class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200">
            <i class="fas fa-users mr-3"></i> Users
          </router-link>
          <router-link to="/admin/loans" class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200">
            <i class="fas fa-hand-holding-usd mr-3"></i> Loans
          </router-link>
        </nav>
        <div class="p-4 border-t" style="background-color: #222831;">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-blue-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-white">Admin User</p>
              <button @click="logout" class="text-sm text-gray-300 hover:text-gray-500">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="ml-64">
      <header class="shadow-sm border-b">
        <div class="flex items-center justify-between px-8 py-4" style="background-color: #262626;">
          <div>
            <h2 class="text-2xl font-bold text-white">Dashboard Overview</h2>
            <p class="text-gray-300">Welcome back, Admin!</p>
          </div>
          <div class="text-sm text-gray-300">{{ currentTime }}</div>
        </div>
      </header>

      <main class="p-8">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading dashboard...</p>
        </div>

        <template v-else>
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-600">Total Students</h3>
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-users text-blue-600"></i>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalStudents }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-600">Total Posts</h3>
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-hand-holding-usd text-green-600"></i>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalPosts }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-600">With Amount</h3>
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-dollar-sign text-purple-600"></i>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.postsWithAmount }}</p>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium text-gray-600">Active (Not Expired)</h3>
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-check-circle text-orange-600"></i>
                </div>
              </div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.activePosts }}</p>
            </div>
          </div>

          <!-- Recent Posts -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Recent Posts</h3>
              <router-link to="/admin/loans" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</router-link>
            </div>
            <div class="space-y-3">
              <div v-for="post in recentPosts" :key="post.id" class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition duration-200">
                <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="post.amount ? 'bg-green-100' : 'bg-blue-100'">
                  <i :class="post.amount ? 'fas fa-dollar-sign text-green-600' : 'fas fa-file-alt text-blue-600'" class="text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ extractTitle(post.message_text) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ post.channel_username || 'Unknown' }} &middot; {{ formatDate(post.date) }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p v-if="post.amount" class="text-sm font-semibold text-green-600">RM {{ Number(post.amount).toLocaleString() }}</p>
                  <p v-else class="text-xs text-gray-400">No amount</p>
                  <p v-if="post.deadline" class="text-xs mt-1" :class="isExpired(post.deadline) ? 'text-red-500' : 'text-green-500'">
                    {{ isExpired(post.deadline) ? 'Expired' : formatDate(post.deadline) }}
                  </p>
                </div>
              </div>
              <div v-if="recentPosts.length === 0" class="text-center py-8 text-gray-500">No posts found</div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')
const loading = ref(true)

let supabase = null
const initSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(
    'https://wlwsjwdmbcxrryqlpjxo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'
  )
}

const stats = ref({ totalStudents: 0, totalPosts: 0, postsWithAmount: 0, activePosts: 0 })
const recentPosts = ref([])

const fetchDashboard = async () => {
  try {
    loading.value = true
    if (!supabase) await initSupabase()

    const [studentsRes, postsRes] = await Promise.all([
      supabase.from('student').select('student_id', { count: 'exact', head: true }),
      supabase.from('posts').select('*').order('date', { ascending: false })
    ])

    stats.value.totalStudents = studentsRes.count || 0
    const posts = postsRes.data || []
    stats.value.totalPosts = posts.length
    stats.value.postsWithAmount = posts.filter(p => p.amount != null).length
    stats.value.activePosts = posts.filter(p => !p.deadline || new Date(p.deadline) >= new Date()).length
    recentPosts.value = posts.slice(0, 8)
  } catch (e) {
    console.error('Dashboard fetch error:', e)
  } finally {
    loading.value = false
  }
}

const extractTitle = (text) => {
  if (!text) return 'Untitled'
  const firstLine = text.split('\n').find(l => l.trim().length > 5) || text
  const cleaned = firstLine.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
  return cleaned.length > 80 ? cleaned.substring(0, 80) + '...' : cleaned
}

const formatDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

const isExpired = (deadline) => deadline && new Date(deadline) < new Date()

let timeInterval
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
  await fetchDashboard()
})
onUnmounted(() => clearInterval(timeInterval))

const logout = () => {
  localStorage.removeItem('adminToken')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
