<template>
  <div class="min-h-screen" 
       :style="{ backgroundImage: 'url(/images/background2.jpg)' }">    

      <!-- Navigation -->
    <nav class="shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="ml-2 text-xl font-bold text-white">LoanOptimizer</span>
            </div>
          </div>
          <div class="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            <div class="flex items-baseline space-x-4">
              <!-- Dashboard link -->
              <button 
                @click="goToDashboard"
                class="text-white hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <!-- Explore/Matching link -->
              <button 
                @click="goToMatching"
                class="text-orange-500 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
              >
                Explore
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="relative">
              <!-- Profile dropdown -->
              <div class="relative">
                <button @click="showUserMenu = !showUserMenu" class="flex items-center space-x-2 text-sm font-medium text-white">
                  <div class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserIcon class="h-5 w-5 text-green-600" />
                  </div>
                  <span>{{ userName }}</span>
                  <ChevronDownIcon class="h-4 w-4" />
                </button>
                
                <!-- Dropdown menu -->
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button 
                    @click="goToProfile"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <div class="border-t border-gray-100"></div>
                  <button 
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

      <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-4">
          Scholarship & Loan Matches
        </h1>
        <p class="text-xl text-white mb-6">We found {{ filteredProducts.length }} opportunities matching your profile</p>
        
      </div>

      <!-- Filters and Tabs -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
          <!-- Tabs -->
          <div class="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              @click="activeTab = 'all'"
              :class="activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="px-4 py-2 rounded-md font-medium transition duration-200"
            >
              All Opportunities
            </button>
            <button
              @click="activeTab = 'saved'"
              :class="activeTab === 'saved' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="px-4 py-2 rounded-md font-medium transition duration-200 flex items-center gap-2"
            >
              <span>💾</span>
              Saved
            </button>
          </div>

          <!-- Search & Filters -->
          <div class="flex flex-wrap gap-4 items-center">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search loans & scholarships..."
                class="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select v-model="filters.type" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="scholarship">With Amount</option>
              <option value="loan">Without Amount</option>
            </select>

            <select v-model="filters.matchLevel" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Match Levels</option>
              <option value="High">🟢 High Match</option>
              <option value="Medium">🟡 Medium Match</option>
              <option value="Low">🔴 Low Match</option>
            </select>

            <select v-model="filters.sortBy" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="match">Sort by Match</option>
              <option value="deadline">Sort by Deadline</option>
              <option value="amount">Sort by Amount</option>
              <option value="latest">Sort by Latest</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Finding your perfect matches...</p>
      </div>

      <!-- Results Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <!-- Product Card -->
      <div 
        v-for="product in displayedProducts" 
        :key="product.product_id"
        class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative group"
      >
        <!-- Colored top accent bar -->
        <div :class="product.amount ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'" class="h-1.5"></div>

        <!-- Save Button -->
        <button
          @click="toggleSave(product)"
          class="absolute top-5 right-4 z-10 p-2 rounded-full transition-all duration-200"
          :class="product.isSaved ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'"
          :title="product.isSaved ? 'Remove from saved' : 'Save opportunity'"
        >
          <svg class="w-5 h-5" :fill="product.isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        <!-- Card Content -->
        <div class="p-5 pt-4">
          <!-- Match Badge -->
          <div class="mb-3">
            <span
              :class="[getMatchLevel(product).bg, getMatchLevel(product).text, getMatchLevel(product).border]"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border"
            >
              {{ getMatchLevel(product).icon }} {{ getMatchLevel(product).level }} Match
            </span>
          </div>

          <!-- Product Name -->
          <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2 pr-10">{{ product.name }}</h3>

          <!-- Info chips -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-if="product.amount" class="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              RM {{ formatAmount(product.amount) }}
            </span>
            <span v-else class="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm font-medium">
              Amount TBD
            </span>
            <span v-if="product.deadline" :class="getDeadlineBadgeClass(product.deadline)" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ formatDeadline(product.deadline) }}
            </span>
          </div>

          <!-- Key Details -->
          <div class="space-y-2 mb-5 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
              <span class="font-medium text-gray-500 w-20">CGPA:</span>
              <span class="text-gray-800">{{ product.eligibility ? product.eligibility.toFixed(2) : 'Not specified' }}</span>
            </div>

            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"/></svg>
              <span class="font-medium text-gray-500 w-20">Courses:</span>
              <span class="text-gray-800">{{ product.course || 'Not specified' }}</span>
            </div>

            <div class="flex items-center gap-2 text-gray-600">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
              <span class="font-medium text-gray-500 w-20">Posted:</span>
              <span class="text-gray-800">{{ product.date ? new Date(product.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown' }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <a 
              v-if="product.detail_link"
              :href="product.detail_link"
              target="_blank"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 transition duration-200 font-medium text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
              View Details
            </a>
            <a 
              v-if="product.apply_link"
              :href="product.apply_link"
              target="_blank"
              class="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-xl hover:bg-green-700 transition duration-200 font-medium text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
              Apply Now
            </a>
            <button 
              v-if="!product.detail_link && !product.apply_link"
              disabled
              class="flex-1 bg-gray-100 text-gray-400 py-2.5 px-4 rounded-xl font-medium text-sm cursor-not-allowed"
            >
              No Link Available
            </button>
            <button
              @click="toggleSave(product)"
              class="px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium"
              :class="product.isSaved ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'"
            >
              {{ product.isSaved ? 'Saved ♥' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>

      <!-- No Results -->
      <div v-if="!loading && displayedProducts.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">
          <span v-if="activeTab === 'saved'">💾</span>
          <span v-else>🔍</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          {{ activeTab === 'saved' ? 'No saved opportunities' : 'No matches found' }}
        </h3>
        <p class="text-gray-600 mb-6">
          {{ activeTab === 'saved' ? 'Start saving opportunities you like by clicking the save button' : 'Try adjusting your filters or update your profile for better matches' }}
        </p>
        <button 
          v-if="activeTab === 'saved'"
          @click="activeTab = 'all'"
          class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          Browse All Opportunities
        </button>
        <button 
          v-else
          @click="updateProfile"
          class="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          Update Profile
        </button>
      </div>

      <!-- Save Success Toast -->
      <div v-if="showSaveToast" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          {{ saveToastMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Supabase client
let supabase = null
const initSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(
    'https://wlwsjwdmbcxrryqlpjxo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'
  )
}

// State
const loading = ref(true)
const allProducts = ref([])
const activeTab = ref('all')
const showUserMenu = ref(false)
const showSaveToast = ref(false)
const saveToastMessage = ref('')
const searchQuery = ref('')

// User data
const userName = ref('Student')
const userMajor = ref('')
const userGpa = ref(0)
const userIncome = ref(0)
const savedPostIds = ref(new Set())

const loadUserData = () => {
  try {
    const stored = localStorage.getItem('studentData')
    if (stored) {
      const data = JSON.parse(stored)
      if (data.name) userName.value = data.name
      if (data.major) userMajor.value = data.major
      if (data.gpa) userGpa.value = parseFloat(data.gpa) || 0
      if (data.family_income) userIncome.value = parseInt(data.family_income) || 0
    }
  } catch (e) { /* ignore */ }
}

const loadSavedItems = () => {
  try {
    const saved = localStorage.getItem('savedOpportunities')
    if (saved) savedPostIds.value = new Set(JSON.parse(saved))
  } catch (e) { /* ignore */ }
}

const persistSavedItems = () => {
  localStorage.setItem('savedOpportunities', JSON.stringify([...savedPostIds.value]))
}

// Filters
const filters = ref({
  type: 'all',
  matchLevel: 'all',
  sortBy: 'match'
})

// Extract a short title from the post message text
const extractTitle = (text) => {
  if (!text) return 'Untitled Opportunity'
  // Take first line or first 80 chars, strip emojis for cleaner look
  const firstLine = text.split('\n').find(l => l.trim().length > 5) || text
  // Remove common emoji patterns and clean up
  const cleaned = firstLine.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()
  return cleaned.length > 100 ? cleaned.substring(0, 100) + '...' : cleaned
}

// Extract application link from media_urls
const extractApplyLink = (mediaUrls) => {
  if (!mediaUrls) return null
  // Find the first URL in the media_urls text
  const match = mediaUrls.match(/(https?:\/\/[^\s\]]+)/)
  return match ? match[1] : null
}

// Fetch posts from the database
const fetchPosts = async () => {
  try {
    loading.value = true
    if (!supabase) await initSupabase()

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error

    // Map DB posts to display format
    allProducts.value = (data || []).map(post => ({
      product_id: post.id,
      name: extractTitle(post.message_text),
      amount: post.amount,
      deadline: post.deadline,
      date: post.date,
      channel_username: post.channel_username,
      message_text: post.message_text,
      apply_link: post.link || null,
      detail_link: extractApplyLink(post.media_urls),
      eligibility: post.eligibility,
      course: post.course,
      isSaved: savedPostIds.value.has(post.id)
    }))

    console.log(`Loaded ${allProducts.value.length} posts from database`)
  } catch (error) {
    console.error('Error fetching posts:', error)
  } finally {
    loading.value = false
  }
}

// Computed properties
const filteredProducts = computed(() => {
  let filtered = [...allProducts.value]

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    filtered = filtered.filter(p =>
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.message_text && p.message_text.toLowerCase().includes(query)) ||
      (p.channel_username && p.channel_username.toLowerCase().includes(query))
    )
  }

  // Filter by type (amount-based: scholarships tend to be non-repayable)
  if (filters.value.type === 'scholarship') {
    filtered = filtered.filter(p => p.amount != null)
  } else if (filters.value.type === 'loan') {
    filtered = filtered.filter(p => p.amount == null)
  }

  // Filter by match level
  if (filters.value.matchLevel !== 'all') {
    filtered = filtered.filter(p => getMatchLevel(p).level === filters.value.matchLevel)
  }

  // Sort
  const matchRank = { 'High': 3, 'Medium': 2, 'Low': 1 }
  switch (filters.value.sortBy) {
    case 'match':
      filtered.sort((a, b) => (matchRank[getMatchLevel(b).level] || 0) - (matchRank[getMatchLevel(a).level] || 0))
      break
    case 'amount':
      filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0))
      break
    case 'deadline':
      filtered.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
      break
    default:
      filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  }

  return filtered
})

const displayedProducts = computed(() => {
  if (activeTab.value === 'saved') {
    return filteredProducts.value.filter(product => product.isSaved)
  }
  return filteredProducts.value
})

// Methods
const getDeadlineClass = (deadline) => {
  if (!deadline) return 'text-gray-400'
  const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysUntilDeadline < 0) return 'text-red-600'
  if (daysUntilDeadline < 7) return 'text-red-600'
  if (daysUntilDeadline < 30) return 'text-orange-600'
  return 'text-green-600'
}

const getDeadlineBadgeClass = (deadline) => {
  if (!deadline) return 'bg-gray-100 text-gray-500'
  const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysUntilDeadline < 0) return 'bg-red-100 text-red-700'
  if (daysUntilDeadline < 7) return 'bg-red-50 text-red-600'
  if (daysUntilDeadline < 30) return 'bg-orange-50 text-orange-600'
  return 'bg-blue-50 text-blue-600'
}

const formatAmount = (amount) => {
  if (amount == null) return 'N/A'
  return Number(amount).toLocaleString()
}

const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline'
  const date = new Date(deadline)
  const now = new Date()
  const diffTime = date - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Today!'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `${diffDays} days left`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks left`
  return date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Matching algorithm: scores each post against the student's profile.
 * Factors: CGPA (higher = better match), Family Income (lower = better match), Field of Study.
 * Returns { level: 'High'|'Medium'|'Low', color classes }
 */
const getMatchLevel = (product) => {
  const hasProfile = userGpa.value > 0 || userIncome.value > 0 || !!userMajor.value

  // If user has not filled in any profile data, always Low
  if (!hasProfile) {
    return { level: 'Low', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: '🔴' }
  }

  let score = 0
  let maxScore = 0

  // --- CGPA Score (0-40 points) ---
  if (userGpa.value > 0) {
    maxScore += 40
    if (product.eligibility) {
      const requiredCgpa = parseFloat(product.eligibility)
      if (!isNaN(requiredCgpa)) {
        if (userGpa.value >= requiredCgpa) {
          // Meets requirement: scale 28-40 based on how much they exceed
          const excess = Math.min(userGpa.value - requiredCgpa, 1.0)
          score += 28 + (excess / 1.0) * 12
        } else {
          // Below requirement: scale 0-10 based on how close
          const gap = requiredCgpa - userGpa.value
          score += Math.max(0, 10 - (gap / 1.0) * 10)
        }
      }
    }
    // If post has no CGPA requirement, give a small neutral score (not a free pass)
  }

  // --- Family Income Score (0-30 points) — lower income = higher match ---
  if (userIncome.value > 0) {
    maxScore += 30
    if (userIncome.value <= 2500) {
      score += 30   // B40 range — highest match
    } else if (userIncome.value <= 5000) {
      score += 22   // Lower-M40
    } else if (userIncome.value <= 8000) {
      score += 14   // Upper-M40
    } else if (userIncome.value <= 12000) {
      score += 7    // T20 border
    } else {
      score += 2    // High income — low match for aid
    }
  }

  // --- Field of Study Score (0-30 points) ---
  if (userMajor.value) {
    maxScore += 30
    if (product.course) {
      const postCourses = product.course.toLowerCase()
      const studentMajor = userMajor.value.toLowerCase()
      if (postCourses.includes('all courses') || postCourses.includes('semua')) {
        score += 30   // Open to all — full match
      } else if (postCourses.includes(studentMajor)) {
        score += 30   // Direct field match
      } else {
        score += 3    // No field match — minimal score
      }
    }
    // If post has no course specified, give nothing — can't confirm a match
  }

  // Normalise to 0-100 based on actual max
  const normalised = maxScore > 0 ? (score / maxScore) * 100 : 0

  if (normalised >= 70) return { level: 'High', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: '🟢' }
  if (normalised >= 45) return { level: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: '🟡' }
  return { level: 'Low', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: '🔴' }
}

const toggleSave = (product) => {
  product.isSaved = !product.isSaved
  if (product.isSaved) {
    savedPostIds.value.add(product.product_id)
  } else {
    savedPostIds.value.delete(product.product_id)
  }
  persistSavedItems()
  saveToastMessage.value = product.isSaved ? '♥ Opportunity saved!' : 'Removed from saved'
  showSaveToast.value = true
  setTimeout(() => { showSaveToast.value = false }, 2500)
}

const updateProfile = () => {
  navigateTo('/user/profile')
}

// Lifecycle
onMounted(async () => {
  loadUserData()
  loadSavedItems()
  await fetchPosts()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Navigation
const goToDashboard = () => navigateTo('/user/dashboard')
const goToMatching = () => navigateTo('/user/matching')
const goToProfile = () => { navigateTo('/user/profile'); showUserMenu.value = false }

const handleLogout = () => {
  localStorage.removeItem('studentSession')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('studentData')
  sessionStorage.removeItem('studentSession')
  navigateTo('/login')
  showUserMenu.value = false
}

const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.relative > div.relative')
  if (dropdown && !dropdown.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Icon components
const UserIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ChevronDownIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-lift:hover {
  transform: translateY(-4px);
}
</style>