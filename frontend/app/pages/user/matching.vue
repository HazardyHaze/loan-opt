<template>
  <div class="min-h-screen" 
       :style="{ backgroundImage: 'url(/images/background2.jpg)' }">    

      <!-- Navigation -->
    <nav class="shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="ml-2 text-xl font-bold text-white">LoanOptimizer</span>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
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
                  <span>John Doe</span>
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

          <!-- Filters -->
          <div class="flex flex-wrap gap-4">
            <select v-model="filters.matchLevel" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Match Levels</option>
              <option value="high">High Match (80-100%)</option>
              <option value="medium">Medium Match (60-79%)</option>
              <option value="low">Low Match (0-59%)</option>
            </select>
            
            <select v-model="filters.type" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="scholarship">Scholarships</option>
              <option value="loan">Loans</option>
            </select>

            <select v-model="filters.sortBy" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="match">Sort by Match %</option>
              <option value="amount">Sort by Amount</option>
              <option value="deadline">Sort by Deadline</option>
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
        class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 relative"
      >
        <!-- Top badges area - side by side -->
        <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
          <!-- Left side: Both badges side by side -->
          <div class="flex items-center gap-2">
            <!-- Match Badge -->
            <div 
              :class="getMatchBadgeClass(product.matchPercentage)"
              class="px-3 py-1 rounded-full text-white text-sm font-semibold whitespace-nowrap"
            >
              {{ product.matchPercentage }}% Match
            </div>
            
            <!-- Product Type Badge - now next to Match Badge -->
            <div 
              :class="product.type === 'scholarship' ? 'bg-green-500' : 'bg-blue-500'"
              class="px-3 py-1 rounded-full text-white text-sm font-semibold whitespace-nowrap"
            >
              {{ product.type === 'scholarship' ? '🎓 Scholarship' : '💰 Loan' }}
            </div>
          </div>
          
          <!-- Right side: Save button -->
          <button
            @click="toggleSave(product)"
            :class="product.isSaved ? 'bg-purple-600 text-white' : 'bg-white text-gray-400 hover:text-purple-600 border border-gray-300'"
            class="p-2 rounded-full z-20 transition-all duration-200 hover:scale-110 flex-shrink-0"
            :title="product.isSaved ? 'Remove from saved' : 'Save for later'"
          >
            <svg v-if="product.isSaved" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>

        <!-- Card Content - add top padding for badges -->
        <div class="p-6 pt-16"> <!-- Increased pt-16 to accommodate both badges side by side -->
          <!-- Product Name -->
          <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{{ product.name }}</h3>
          
          <!-- Match Progress Bar -->
          <div class="mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>Match Score</span>
              <span>{{ product.matchPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="getProgressBarColor(product.matchPercentage)"
                class="h-2 rounded-full transition-all duration-500"
                :style="{ width: product.matchPercentage + '%' }"
              ></div>
            </div>
          </div>

          <!-- Key Details -->
          <div class="space-y-3 mb-4">
            <div class="flex items-center text-gray-700">
              <span class="font-semibold w-24">Amount:</span>
              <span class="text-gray-900 font-medium">${{ formatAmount(product.amount_range) }}</span>
            </div>
            
            <div class="flex items-center text-gray-700">
              <span class="font-semibold w-24">Deadline:</span>
              <span :class="getDeadlineClass(product.deadline)" class="font-medium">
                {{ formatDeadline(product.deadline) }}
              </span>
            </div>
            
            <div class="flex items-center text-gray-700">
              <span class="font-semibold w-24">Eligibility:</span>
              <span class="text-gray-900 font-medium">{{ product.eligibility_score }}/10</span>
            </div>
          </div>

          <!-- Match Reasons -->
          <div class="mb-4">
            <h4 class="font-semibold text-gray-900 mb-2">Why it matches:</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li v-for="reason in product.matchReasons" :key="reason" class="flex items-center">
                <span class="text-green-500 mr-2">✓</span>
                {{ reason }}
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button 
              @click="viewDetails(product)"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-center"
            >
              View Details
            </button>
            <button 
              @click="applyForProduct(product)"
              :class="getApplyButtonClass(product.matchPercentage)"
              class="flex-1 py-2 px-4 rounded-lg transition duration-200 font-medium text-center"
            >
              Apply Now
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const loading = ref(true)
const allProducts = ref([])
const userProfile = ref({})
const activeTab = ref('all')
const showSaveToast = ref(false)
const saveToastMessage = ref('')

// Filters
const filters = ref({
  matchLevel: 'all',
  type: 'all',
  sortBy: 'match'
})

// Sample data - replace with your actual data from scraping
const sampleProducts = [
  {
    product_id: 1,
    name: "Merit-Based STEM Scholarship",
    type: "scholarship",
    amount_range: 10000,
    deadline: "2024-06-30",
    eligibility_score: "8",
    is_solved: "false",
    matchPercentage: 92,
    matchReasons: ["Matches your Computer Science major", "High GPA requirement met", "Open to undergraduate students"],
    isSaved: false
  },
  {
    product_id: 2,
    name: "Federal Student Loan Program",
    type: "loan",
    amount_range: 20000,
    deadline: "2024-12-31",
    eligibility_score: "9",
    is_solved: "false",
    matchPercentage: 85,
    matchReasons: ["Available for all academic levels", "No income restrictions", "Flexible repayment options"],
    isSaved: true
  },
  {
    product_id: 3,
    name: "Underrepresented Groups Scholarship",
    type: "scholarship",
    amount_range: 15000,
    deadline: "2024-05-15",
    eligibility_score: "7",
    is_solved: "false",
    matchPercentage: 78,
    matchReasons: ["Supports diversity in tech", "Matches your institution", "Partial GPA requirement met"],
    isSaved: false
  },
  {
    product_id: 4,
    name: "Emergency Education Loan",
    type: "loan",
    amount_range: 5000,
    deadline: "2024-08-01",
    eligibility_score: "6",
    is_solved: "false",
    matchPercentage: 65,
    matchReasons: ["Quick approval process", "Available for current students", "Basic eligibility met"],
    isSaved: false
  },
  {
    product_id: 5,
    name: "Graduate Research Fellowship",
    type: "scholarship",
    amount_range: 25000,
    deadline: "2024-04-20",
    eligibility_score: "8",
    is_solved: "false",
    matchPercentage: 45,
    matchReasons: ["Requires graduate level", "Research focus area mismatch"],
    isSaved: false
  },
  {
    product_id: 6,
    name: "International Student Loan",
    type: "loan",
    amount_range: 30000,
    deadline: "2024-11-30",
    eligibility_score: "5",
    is_solved: "false",
    matchPercentage: 30,
    matchReasons: ["Citizenship requirement not met", "Higher income threshold"],
    isSaved: false
  }
]

// Computed properties
const filteredProducts = computed(() => {
  let filtered = [...allProducts.value]

  // Filter by match level
  if (filters.value.matchLevel !== 'all') {
    filtered = filtered.filter(product => {
      const percentage = product.matchPercentage
      switch (filters.value.matchLevel) {
        case 'high': return percentage >= 80
        case 'medium': return percentage >= 60 && percentage < 80
        case 'low': return percentage < 60
        default: return true
      }
    })
  }

  // Filter by type
  if (filters.value.type !== 'all') {
    filtered = filtered.filter(product => product.type === filters.value.type)
  }

  // Sort products
  switch (filters.value.sortBy) {
    case 'amount':
      filtered.sort((a, b) => b.amount_range - a.amount_range)
      break
    case 'deadline':
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      break
    case 'match':
    default:
      filtered.sort((a, b) => b.matchPercentage - a.matchPercentage)
  }

  return filtered
})

const displayedProducts = computed(() => {
  if (activeTab.value === 'saved') {
    return filteredProducts.value.filter(product => product.isSaved)
  }
  return filteredProducts.value
})

const highMatchCount = computed(() => 
  allProducts.value.filter(p => p.matchPercentage >= 80).length
)

const mediumMatchCount = computed(() => 
  allProducts.value.filter(p => p.matchPercentage >= 60 && p.matchPercentage < 80).length
)

const lowMatchCount = computed(() => 
  allProducts.value.filter(p => p.matchPercentage < 60).length
)

const savedCount = computed(() => 
  allProducts.value.filter(p => p.isSaved).length
)

// Methods
const getMatchBadgeClass = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-orange-500'
}

const getProgressBarColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-orange-500'
}

const getApplyButtonClass = (percentage) => {
  if (percentage >= 60) return 'bg-green-600 text-white hover:bg-green-700'
  return 'bg-gray-300 text-gray-600 hover:bg-gray-400'
}

const getDeadlineClass = (deadline) => {
  const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  if (daysUntilDeadline < 7) return 'text-red-600'
  if (daysUntilDeadline < 30) return 'text-orange-600'
  return 'text-green-600'
}

const formatAmount = (amount) => {
  return amount.toLocaleString()
}

const formatDeadline = (deadline) => {
  const date = new Date(deadline)
  const now = new Date()
  const diffTime = date - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`
  return date.toLocaleDateString()
}

const toggleSave = async (product) => {
  try {
    product.isSaved = !product.isSaved
    
    // Here you would save to your database
    // await saveToDatabase(product.product_id, product.isSaved)
    
    saveToastMessage.value = product.isSaved 
      ? 'Opportunity saved!' 
      : 'Opportunity removed from saved'
    
    showSaveToast.value = true
    setTimeout(() => {
      showSaveToast.value = false
    }, 3000)
    
  } catch (error) {
    console.error('Error saving opportunity:', error)
    // Revert the change if there's an error
    product.isSaved = !product.isSaved
  }
}

const viewDetails = (product) => {
  router.push(`/products/${product.product_id}`)
}

const applyForProduct = (product) => {
  if (product.matchPercentage >= 60) {
    router.push(`/apply/${product.product_id}`)
  } else {
    alert('This product has low match percentage. Consider updating your profile for better matches.')
  }
}

const updateProfile = () => {
  router.push('/profile/edit')
}

const fetchUserProfile = async () => {
  try {
    userProfile.value = {
      gpa: 3.8,
      family_income: 50000,
      academic_level: 'Undergraduate',
      institution: 'State University',
      major: 'Computer Science'
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const calculateMatches = () => {
  allProducts.value = sampleProducts
}

// Database integration function (to be implemented)
const saveToDatabase = async (productId, isSaved) => {
  // This would be your actual API call to save to your database
  // Example:
  // const { data, error } = await supabase
  //   .from('SavedOpportunities')
  //   .upsert({
  //     user_id: currentUser.id,
  //     product_id: productId,
  //     saved: isSaved
  //   })
  
  console.log(`Product ${productId} ${isSaved ? 'saved' : 'unsaved'}`)
}

// Lifecycle
onMounted(async () => {
  await fetchUserProfile()
  calculateMatches()
  
  setTimeout(() => {
    loading.value = false
  }, 1500)
})

const goToDashboard = () => {
  navigateTo('/user/dashboard')
}

const goToMatching = () => {
  navigateTo('/user/matching')
}

const goToProfile = () => {
  navigateTo('/user/profile')
  showUserMenu.value = false
}


const handleLogout = () => {
  // Clear user data
  localStorage.removeItem('userToken')
  localStorage.removeItem('userData')
  
  // Redirect to login
  navigateTo('/login')
  
  // Close dropdown
  showUserMenu.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.relative > div.relative')
  if (dropdown && !dropdown.contains(event.target)) {
    showUserMenu.value = false
  }
}



onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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