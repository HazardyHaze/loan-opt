<template>
  <div class="min-h-screen" style="background-color: #BAC7CC;">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-center h-16 px-4" style="background-color: #222831;">
          <h1 class="text-xl font-bold text-white">LoanOpt Admin</h1>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2" style="background-color: #222831;">
          <router-link to="/admin/dashboard" class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200">
            <i class="fas fa-tachometer-alt mr-3"></i> Dashboard
          </router-link>
          <router-link to="/admin/users" class="flex items-center px-4 py-3 text-white rounded-lg hover:bg-gray-700 transition duration-200">
            <i class="fas fa-users mr-3"></i> Users
          </router-link>
          <router-link to="/admin/loans" class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200">
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
            <h2 class="text-2xl font-bold text-white">Posts / Opportunities</h2>
            <p class="text-gray-300">Manage all scraped posts &amp; financial opportunities</p>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="openCreateModal" class="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 hover:opacity-90" style="background-color: #FF0000; color: white;">
              <i class="fas fa-plus mr-2"></i> Add Post
            </button>
            <div class="text-sm text-gray-300">{{ currentTime }}</div>
          </div>
        </div>
      </header>

      <main class="p-8">
        <!-- Stats -->
        <div class="grid grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p class="text-sm font-medium text-gray-600">Total Posts</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ posts.length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p class="text-sm font-medium text-gray-600">With Amount</p>
            <p class="text-3xl font-bold text-green-600 mt-2">{{ posts.filter(p => p.amount).length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p class="text-sm font-medium text-gray-600">With Deadline</p>
            <p class="text-3xl font-bold text-blue-600 mt-2">{{ posts.filter(p => p.deadline).length }}</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p class="text-sm font-medium text-gray-600">With Link</p>
            <p class="text-3xl font-bold text-purple-600 mt-2">{{ posts.filter(p => p.link).length }}</p>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" v-model="searchQuery" placeholder="Search posts by text, channel, or course..." class="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div class="flex gap-3">
              <select v-model="amountFilter" class="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
                <option value="">All Posts</option>
                <option value="with">With Amount</option>
                <option value="without">Without Amount</option>
              </select>
              <button @click="resetFilters" class="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading posts...</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="p in paginatedPosts" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="max-w-sm">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ getTitle(p) }}</div>
                      <div class="text-xs text-gray-500 mt-1">ID: {{ p.id }} &bull; {{ p.channel_username || 'N/A' }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      <span v-if="p.amount" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">RM {{ Number(p.amount).toLocaleString() }}</span>
                      <span v-else class="text-gray-400 text-xs">No amount</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      <span v-if="p.eligibility">CGPA: {{ p.eligibility }}</span>
                      <span v-if="p.course" class="ml-2">{{ p.course }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900" v-if="p.deadline">
                      <i class="fas fa-clock text-orange-500 mr-1"></i> {{ formatDate(p.deadline) }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1" v-if="p.date">Posted: {{ formatDate(p.date) }}</div>
                    <div v-if="!p.deadline && !p.date" class="text-gray-400 text-xs">No dates</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <a v-if="p.link" :href="p.link" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                      <i class="fas fa-external-link-alt mr-1"></i> Open
                    </a>
                    <span v-else class="text-gray-400 text-xs">No link</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-3">
                      <button @click="openViewModal(p)" class="text-gray-600 hover:text-gray-900" title="View">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="openEditModal(p)" class="text-blue-600 hover:text-blue-900" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="confirmDelete(p)" class="text-red-600 hover:text-red-900" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredPosts.length === 0" class="text-center py-12">
            <i class="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
            <h3 class="text-sm font-medium text-gray-900">No posts found</h3>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="text-sm text-gray-700">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredPosts.length) }} of {{ filteredPosts.length }}
            </div>
            <div class="flex space-x-1">
              <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button v-for="page in displayPages" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'" class="px-3 py-1 border rounded text-sm">{{ page }}</button>
              <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-900">Post Details</h3>
            <button @click="showViewModal = false" class="text-gray-400 hover:text-gray-500"><i class="fas fa-times"></i></button>
          </div>
          <div class="space-y-4" v-if="viewPost">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="font-medium text-gray-500">ID:</span> {{ viewPost.id }}</div>
              <div><span class="font-medium text-gray-500">Telegram ID:</span> {{ viewPost.telegram_id }}</div>
              <div><span class="font-medium text-gray-500">Channel:</span> {{ viewPost.channel_username || 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Amount:</span> {{ viewPost.amount ? 'RM ' + Number(viewPost.amount).toLocaleString() : 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Eligibility:</span> {{ viewPost.eligibility || 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Course:</span> {{ viewPost.course || 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Deadline:</span> {{ viewPost.deadline ? formatDate(viewPost.deadline) : 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Posted:</span> {{ viewPost.date ? formatDate(viewPost.date) : 'N/A' }}</div>
              <div><span class="font-medium text-gray-500">Opening Date:</span> {{ viewPost.opening_date ? formatDate(viewPost.opening_date) : 'N/A' }}</div>
              <div>
                <span class="font-medium text-gray-500">Link:</span>
                <a v-if="viewPost.link" :href="viewPost.link" target="_blank" class="text-blue-600 hover:underline ml-1">{{ viewPost.link }}</a>
                <span v-else> N/A</span>
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-500 text-sm">Message Text:</span>
              <div class="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">{{ viewPost.message_text }}</div>
            </div>
            <div v-if="viewPost.media_urls">
              <span class="font-medium text-gray-500 text-sm">Media URLs:</span>
              <div class="mt-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 break-all">{{ viewPost.media_urls }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900">{{ isEditMode ? 'Edit Post' : 'Add New Post' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500"><i class="fas fa-times"></i></button>
          </div>

          <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{{ formError }}</div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Telegram ID *</label>
                  <input v-model="formData.telegram_id" type="text" required :readonly="isEditMode" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500" :class="isEditMode ? 'bg-gray-100' : ''">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Channel</label>
                  <input v-model="formData.channel_username" type="text" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Amount (RM)</label>
                  <input v-model.number="formData.amount" type="number" step="0.01" min="0" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Eligibility (CGPA)</label>
                  <input v-model="formData.eligibility" type="text" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Course</label>
                  <input v-model="formData.course" type="text" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Link</label>
                  <input v-model="formData.link" type="url" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Deadline</label>
                  <input v-model="formData.deadline" type="date" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Opening Date</label>
                  <input v-model="formData.opening_date" type="date" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Posted Date</label>
                  <input v-model="formData.date" type="date" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Media URLs</label>
                  <input v-model="formData.media_urls" type="text" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Message Text *</label>
              <textarea v-model="formData.message_text" rows="5" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            <div class="flex justify-end space-x-3 pt-6 border-t">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" :disabled="saving" class="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50" style="background-color: #56B2BB;">
                {{ saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <i class="fas fa-exclamation-triangle text-red-600"></i>
        </div>
        <div class="mt-4 text-center">
          <h3 class="text-lg font-medium text-gray-900">Delete Post</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete post <strong>#{{ postToDelete?.id }}</strong>? This cannot be undone.
          </p>
        </div>
        <div class="mt-6 flex justify-center space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button @click="deletePost" :disabled="saving" class="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50" :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')
const loading = ref(true)
const saving = ref(false)

let supabase = null
const initSupabase = async () => {
  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(
    'https://wlwsjwdmbcxrryqlpjxo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'
  )
}

// State
const posts = ref([])
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const viewPost = ref(null)
const postToDelete = ref(null)
const searchQuery = ref('')
const amountFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const formError = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

const formData = ref({
  telegram_id: '', channel_username: '', message_text: '', media_urls: '',
  link: '', amount: null, eligibility: '', course: '',
  opening_date: '', deadline: '', date: ''
})

const getTitle = (p) => {
  const text = p.message_text || ''
  const firstLine = text.split('\n')[0]
  return firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine || 'Untitled'
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const toDateInput = (d) => {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

// Fetch posts from DB
const fetchPosts = async () => {
  try {
    loading.value = true
    if (!supabase) await initSupabase()
    const { data, error } = await supabase.from('posts').select('*').order('id', { ascending: false })
    if (error) throw error
    posts.value = data || []
  } catch (e) {
    console.error('Fetch posts error:', e)
  } finally {
    loading.value = false
  }
}

// Computed
const filteredPosts = computed(() => {
  let filtered = posts.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      (p.message_text || '').toLowerCase().includes(q) ||
      (p.channel_username || '').toLowerCase().includes(q) ||
      (p.course || '').toLowerCase().includes(q) ||
      String(p.id).includes(q)
    )
  }
  if (amountFilter.value === 'with') filtered = filtered.filter(p => p.amount)
  if (amountFilter.value === 'without') filtered = filtered.filter(p => !p.amount)
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedPosts = computed(() => filteredPosts.value.slice(startIndex.value, endIndex.value))
const displayPages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const resetFilters = () => { searchQuery.value = ''; amountFilter.value = ''; currentPage.value = 1 }

// Modals
const openViewModal = (p) => { viewPost.value = p; showViewModal.value = true }

const openCreateModal = () => {
  isEditMode.value = false
  formError.value = ''
  formData.value = { telegram_id: '', channel_username: '', message_text: '', media_urls: '', link: '', amount: null, eligibility: '', course: '', opening_date: '', deadline: '', date: '' }
  showModal.value = true
}

const openEditModal = (p) => {
  isEditMode.value = true
  formError.value = ''
  formData.value = {
    id: p.id,
    telegram_id: p.telegram_id || '',
    channel_username: p.channel_username || '',
    message_text: p.message_text || '',
    media_urls: p.media_urls || '',
    link: p.link || '',
    amount: p.amount || null,
    eligibility: p.eligibility || '',
    course: p.course || '',
    opening_date: toDateInput(p.opening_date),
    deadline: toDateInput(p.deadline),
    date: toDateInput(p.date)
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

// CRUD
const handleSubmit = async () => {
  try {
    saving.value = true
    formError.value = ''
    if (!supabase) await initSupabase()

    const payload = {
      telegram_id: formData.value.telegram_id,
      channel_username: formData.value.channel_username || null,
      message_text: formData.value.message_text,
      media_urls: formData.value.media_urls || '',
      link: formData.value.link || null,
      amount: formData.value.amount || null,
      eligibility: formData.value.eligibility || null,
      course: formData.value.course || null,
      opening_date: formData.value.opening_date || null,
      deadline: formData.value.deadline || null,
      date: formData.value.date || null
    }

    if (isEditMode.value) {
      const { error } = await supabase.from('posts').update(payload).eq('id', formData.value.id)
      if (error) throw error
      showToast('Post updated successfully', 'success')
    } else {
      const { error } = await supabase.from('posts').insert([payload])
      if (error) throw error
      showToast('Post created successfully', 'success')
    }

    closeModal()
    await fetchPosts()
  } catch (e) {
    formError.value = e.message || 'Operation failed'
    console.error('Save error:', e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (p) => { postToDelete.value = p; showDeleteModal.value = true }

const deletePost = async () => {
  try {
    saving.value = true
    if (!supabase) await initSupabase()
    const { error } = await supabase.from('posts').delete().eq('id', postToDelete.value.id)
    if (error) throw error
    showDeleteModal.value = false
    postToDelete.value = null
    showToast('Post deleted', 'success')
    await fetchPosts()
  } catch (e) {
    console.error('Delete error:', e)
    showToast('Delete failed: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

const showToast = (message, type) => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

// Init
onMounted(async () => {
  const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
  updateTime()
  setInterval(updateTime, 60000)
  await fetchPosts()
})

const logout = () => { localStorage.removeItem('adminToken'); router.push('/login') }
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
