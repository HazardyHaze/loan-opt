<template>
  <div class="min-h-screen" style="background-color: #BAC7CC;">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 px-4" style="background-color: #222831;">
          <h1 class="text-xl font-bold text-white">LoanOpt Admin</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-2" style="background-color: #222831;">
          <router-link 
            to="/admin/dashboard" 
            class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200"
            :class="{ 'bg-red-100 text-red-700': $route.path === '/admin/dashboard' }"
          >
            <i class="fas fa-tachometer-alt mr-3"></i>
            Dashboard
          </router-link>
          
          <router-link 
            to="/admin/users" 
            class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            <i class="fas fa-users mr-3"></i>
            Users
          </router-link>
          
          <router-link 
            to="/admin/loans" 
            class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200"
          >
            <i class="fas fa-hand-holding-usd mr-3"></i>
            Loans
          </router-link>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t" style="background-color: #222831;">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-blue-600"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-white">Admin User</p>
              <button 
                @click="logout"
                class="text-sm text-gray-300 hover:text-gray-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="flex items-center justify-between px-8 py-4" style="background-color: #262626;">
          <div>
            <h2 class="text-2xl font-bold text-white">Dashboard Overview</h2>
            <p class="text-gray-300">Welcome back, Admin! Here's what's happening today.</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-300">
              {{ currentTime }}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="p-8">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          <!-- Total Users Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style="background-color: white;">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Total Users</h3>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.totalUsers.toLocaleString() }}</p>
              <p class="text-sm text-green-600 mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +{{ stats.userGrowth }}% this month
              </p>
              <div class="mt-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Active Users</span>
                  <span>{{ Math.round(stats.totalUsers * 0.85).toLocaleString() }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 85%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Loans Card -->
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style="background-color: white;">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Total Loans</h3>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-hand-holding-usd text-green-600 text-xl"></i>
              </div>
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ stats.activeLoans.toLocaleString() }}</p>
              <p class="text-sm text-green-600 mt-2">
                <i class="fas fa-arrow-up mr-1"></i>
                +{{ stats.loanGrowth }}% this month
              </p>
              <div class="mt-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Active Loans</span>
                  <span>{{ Math.round(stats.activeLoans * 0.92).toLocaleString() }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-600 h-2 rounded-full" style="width: 92%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100" style="background-color: white;">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div class="space-y-4">
            <div
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition duration-200"
            >
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`">
                <i :class="`fas ${getActivityIcon(activity.type)} text-white text-sm`"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ formatTime(activity.timestamp) }}</p>
              </div>
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`">
                {{ activity.status }}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')

// Statistics data
const stats = ref({
  totalUsers: 12458,
  activeLoans: 3421,
  pendingApplications: 23,
  totalRevenue: 1254300,
  userGrowth: 12.5,
  loanGrowth: 8.3,
  revenueGrowth: 15.2,
  activeSessions: 142
})

// Recent activities data
const recentActivities = ref([
  {
    id: 1,
    type: 'user',
    description: 'New user registration: John Doe',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    status: 'Completed'
  },
  {
    id: 2,
    type: 'loan',
    description: 'Loan application submitted ($15,000)',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    status: 'Pending'
  },
  {
    id: 3,
    type: 'payment',
    description: 'Payment received from Sarah Wilson',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    status: 'Completed'
  },
  {
    id: 4,
    type: 'system',
    description: 'System backup completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'Success'
  },
  {
    id: 5,
    type: 'user',
    description: 'User profile updated: Mike Johnson',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    status: 'Completed'
  }
])

// Update current time
let timeInterval
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000) // Update every minute
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Helper functions
const getActivityColor = (type) => {
  const colors = {
    user: 'bg-blue-500',
    loan: 'bg-green-500',
    payment: 'bg-purple-500',
    system: 'bg-orange-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getActivityIcon = (type) => {
  const icons = {
    user: 'fa-user',
    loan: 'fa-hand-holding-usd',
    payment: 'fa-credit-card',
    system: 'fa-cog'
  }
  return icons[type] || 'fa-circle'
}

const getStatusColor = (status) => {
  const colors = {
    Completed: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Success: 'bg-blue-100 text-blue-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

const logout = () => {
  // Clear admin session
  localStorage.removeItem('adminToken')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>