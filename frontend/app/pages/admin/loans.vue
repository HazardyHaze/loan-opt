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
            class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200"
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
            class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200"
            :class="{ 'bg-red-100 text-red-700': $route.path === '/admin/loans' }"
          >
            <i class="fas fa-hand-holding-usd mr-3"></i>
            Opportunities
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
            <h2 class="text-2xl font-bold text-white">Opportunity Management</h2>
            <p class="text-gray-300">Manage scholarships and loans for your platform</p>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              @click="openCreateModal"
              class="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 hover:opacity-90"
              style="background-color: #2669FF; color: white;"
            >
              <i class="fas fa-plus mr-2"></i>
              Create Opportunity
            </button>
            <div class="text-sm text-gray-300">
              {{ currentTime }}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="p-8">
        <!-- Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Opportunities</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.total }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-briefcase text-blue-600"></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Scholarships</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.scholarships }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-graduation-cap text-green-600"></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Loans</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.loans }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-hand-holding-usd text-purple-600"></i>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Active</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics.active }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-check-circle text-green-600"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div class="relative">
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="Search opportunities..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select 
                v-model="filters.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="scholarship">Scholarship</option>
                <option value="loan">Loan</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                v-model="filters.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                v-model="filters.category"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Opportunities Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="opportunity in filteredOpportunities" 
                  :key="opportunity.id"
                  class="hover:bg-gray-50 transition duration-150"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ opportunity.title }}</div>
                      <div class="text-sm text-gray-500">{{ opportunity.organization }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(opportunity.type)}`">
                      <i :class="`fas ${opportunity.type === 'scholarship' ? 'fa-graduation-cap' : 'fa-hand-holding-usd'} mr-1`"></i>
                      {{ opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatAmount(opportunity.amount, opportunity.currency) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(opportunity.deadline) }}
                    <div class="text-xs text-gray-500" :class="getDeadlineClass(opportunity.deadline)">
                      {{ getDaysRemaining(opportunity.deadline) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(opportunity.status)}`">
                      {{ opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button 
                        @click="editOpportunity(opportunity)"
                        class="text-green-600 hover:text-green-900 transition duration-200"
                        title="Edit"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button 
                        @click="confirmDelete(opportunity)"
                        class="text-red-600 hover:text-red-900 transition duration-200"
                        title="Delete"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <button 
                        @click="toggleStatus(opportunity)"
                        class="text-orange-600 hover:text-orange-900 transition duration-200"
                        :title="opportunity.status === 'active' ? 'Deactivate' : 'Activate'"
                      >
                        <i :class="opportunity.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div v-if="filteredOpportunities.length === 0" class="text-center py-12">
            <i class="fas fa-inbox text-gray-300 text-4xl mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p class="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button 
              @click="clearFilters"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6">
          <div class="text-sm text-gray-700">
            Showing {{ filteredOpportunities.length }} of {{ opportunities.length }} opportunities
          </div>
          <div class="flex space-x-2">
            <button class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Previous
            </button>
            <button class="px-3 py-2 border border-blue-500 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
              1
            </button>
            <button class="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity' }}
          </h2>
        </div>
        
        <form @submit.prevent="saveOpportunity" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select 
                v-model="form.type"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="scholarship">Scholarship</option>
                <option value="loan">Loan</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select 
                v-model="form.status"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter opportunity title"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Organization *</label>
            <input
              v-model="form.organization"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter organization name"
            >
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                v-model="form.amount"
                type="number"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
              <select 
                v-model="form.currency"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="MYR">MYR (RM)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              v-model="form.description"
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter opportunity description"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
              <input
                v-model="form.deadline"
                type="date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select 
                v-model="form.category"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
              <textarea
                v-model="form.eligibility"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter eligibility requirements"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
              <textarea
                v-model="form.requiredDocuments"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter required documents"
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 rounded-lg text-white transition duration-200 font-medium"
              style="background-color: #56B2BB;"
            >
              {{ editingOpportunity ? 'Update' : 'Create' }} Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-4"></i>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Delete Opportunity</h3>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete "{{ opportunityToDelete?.title }}"? This action cannot be undone.
          </p>
          <div class="flex justify-center space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              @click="deleteOpportunity"
              class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')

// Data
const opportunities = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingOpportunity = ref(null)
const opportunityToDelete = ref(null)

// Filters
const filters = ref({
  search: '',
  type: '',
  status: '',
  category: ''
})

// Form data
const form = ref({
  type: 'scholarship',
  status: 'active',
  title: '',
  organization: '',
  amount: '',
  currency: 'USD',
  description: '',
  deadline: '',
  category: '',
  eligibility: '',
  requiredDocuments: ''
})

// Categories
const categories = ref([
  'Academic Excellence',
  'Financial Need',
  'Sports',
  'Arts & Culture',
  'STEM',
  'Business',
  'Medical',
  'Engineering',
  'Community Service',
  'International Students'
])

// Statistics
const statistics = computed(() => {
  const total = opportunities.value.length
  const scholarships = opportunities.value.filter(o => o.type === 'scholarship').length
  const loans = opportunities.value.filter(o => o.type === 'loan').length
  const active = opportunities.value.filter(o => o.status === 'active').length
  
  return { total, scholarships, loans, active }
})

// Filtered opportunities
const filteredOpportunities = computed(() => {
  return opportunities.value.filter(opportunity => {
    const matchesSearch = !filters.value.search || 
      opportunity.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      opportunity.organization.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesType = !filters.value.type || opportunity.type === filters.value.type
    const matchesStatus = !filters.value.status || opportunity.status === filters.value.status
    const matchesCategory = !filters.value.category || opportunity.category === filters.value.category
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory
  })
})

// Methods
const logout = () => {
  localStorage.removeItem('adminToken')
  router.push('/admin/login')
}

const openCreateModal = () => {
  editingOpportunity.value = null
  resetForm()
  showModal.value = true
}

const editOpportunity = (opportunity) => {
  editingOpportunity.value = opportunity
  form.value = { ...opportunity }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingOpportunity.value = null
  resetForm()
}

const resetForm = () => {
  form.value = {
    type: 'scholarship',
    status: 'active',
    title: '',
    organization: '',
    amount: '',
    currency: 'USD',
    description: '',
    deadline: '',
    category: '',
    eligibility: '',
    requiredDocuments: ''
  }
}

const saveOpportunity = () => {
  if (editingOpportunity.value) {
    // Update existing opportunity
    const index = opportunities.value.findIndex(o => o.id === editingOpportunity.value.id)
    if (index !== -1) {
      opportunities.value[index] = { ...form.value, id: editingOpportunity.value.id }
    }
  } else {
    // Create new opportunity
    const newOpportunity = {
      ...form.value,
      id: Date.now().toString(),
      applications: 0,
      createdAt: new Date().toISOString()
    }
    opportunities.value.unshift(newOpportunity)
  }
  
  closeModal()
}

const confirmDelete = (opportunity) => {
  opportunityToDelete.value = opportunity
  showDeleteModal.value = true
}

const deleteOpportunity = () => {
  opportunities.value = opportunities.value.filter(o => o.id !== opportunityToDelete.value.id)
  showDeleteModal.value = false
  opportunityToDelete.value = null
}

const toggleStatus = (opportunity) => {
  opportunity.status = opportunity.status === 'active' ? 'inactive' : 'active'
}

const viewOpportunity = (id) => {
  // Navigate to opportunity detail page
  console.log('View opportunity:', id)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    type: '',
    status: '',
    category: ''
  }
}

// Helper functions
const getTypeBadgeClass = (type) => {
  return type === 'scholarship' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatAmount = (amount, currency) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  })
  return formatter.format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDaysRemaining = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day left'
  return `${diffDays} days left`
}

const getDeadlineClass = (deadline) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600'
  if (diffDays <= 7) return 'text-orange-600'
  return 'text-green-600'
}

// Initialize with sample data
onMounted(() => {
  // Update current time
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  updateTime()
  setInterval(updateTime, 60000)
  
  opportunities.value = [
    {
      id: '1',
      type: 'scholarship',
      status: 'active',
      title: 'Merit-Based Academic Scholarship',
      organization: 'University Excellence Foundation',
      amount: 10000,
      currency: 'USD',
      description: 'A scholarship for outstanding academic achievement...',
      deadline: '2024-06-30',
      category: 'Academic Excellence',
      eligibility: 'GPA 3.5 or above, full-time student',
      requiredDocuments: 'Transcript, Recommendation Letters, Essay',
      applications: 45,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'loan',
      status: 'active',
      title: 'Student Education Loan',
      organization: 'Global Education Bank',
      amount: 25000,
      currency: 'USD',
      description: 'Low-interest education loan for undergraduate students...',
      deadline: '2024-07-15',
      category: 'Financial Need',
      eligibility: 'Enrolled in accredited institution, creditworthy cosigner',
      requiredDocuments: 'Financial Statements, ID Proof, Admission Letter',
      applications: 23,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      type: 'scholarship',
      status: 'draft',
      title: 'STEM Innovation Grant',
      organization: 'Tech Future Foundation',
      amount: 15000,
      currency: 'USD',
      description: 'Supporting innovative projects in STEM fields...',
      deadline: '2024-08-01',
      category: 'STEM',
      eligibility: 'STEM major, project proposal required',
      requiredDocuments: 'Project Proposal, Academic Records',
      applications: 0,
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      type: 'loan',
      status: 'active',
      title: 'International Student Loan Program',
      organization: 'Global Finance Group',
      amount: 30000,
      currency: 'USD',
      description: 'Special loan program for international students...',
      deadline: '2024-09-01',
      category: 'International Students',
      eligibility: 'International student visa, enrollment proof',
      requiredDocuments: 'Visa Copy, Passport, Admission Letter',
      applications: 18,
      createdAt: '2024-01-25'
    },
    {
      id: '5',
      type: 'scholarship',
      status: 'active',
      title: 'Community Service Leadership Award',
      organization: 'Civic Engagement Foundation',
      amount: 8000,
      currency: 'USD',
      description: 'For students demonstrating exceptional community leadership...',
      deadline: '2024-05-15',
      category: 'Community Service',
      eligibility: '100+ community service hours, leadership role',
      requiredDocuments: 'Service Logs, Recommendation Letters, Essay',
      applications: 32,
      createdAt: '2024-01-30'
    }
  ]
})
</script>

<style scoped>
/* Active link styling */
.router-link-active {
  background-color: #EFF6FF;
  color: #2563EB;
}

.router-link-active:hover {
  background-color: #DBEAFE;
}
</style>