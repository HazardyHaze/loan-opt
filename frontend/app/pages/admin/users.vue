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
          <router-link to="/admin/users" class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200">
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
            <h2 class="text-2xl font-bold text-white">User Management</h2>
            <p class="text-gray-300">Manage all student accounts</p>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="openCreateModal" class="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 hover:opacity-90" style="background-color: #FF0000; color: white;">
              <i class="fas fa-user-plus mr-2"></i> Add New Student
            </button>
            <div class="text-sm text-gray-300">{{ currentTime }}</div>
          </div>
        </div>
      </header>

      <main class="p-8">
        <!-- Stats -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Students</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ students.length }}</p>
              </div>
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-blue-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input type="text" v-model="searchQuery" placeholder="Search by name, email, or student ID..." class="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <div class="flex gap-3">
              <select v-model="majorFilter" class="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
                <option value="">All Majors</option>
                <option v-for="m in uniqueMajors" :key="m" :value="m">{{ m }}</option>
              </select>
              <button @click="resetFilters" class="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Reset</button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading students...</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="s in paginatedStudents" :key="s.student_id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user text-blue-600"></i>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ s.name }}</div>
                        <div class="text-sm text-gray-500">ID: {{ s.student_id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ s.email }}</div>
                    <div class="text-sm text-gray-500">{{ s.phone_no }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ s.major }}</div>
                    <div class="text-sm text-gray-500">GPA: {{ s.gpa }} &bull; {{ s.academic_level }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">RM {{ Number(s.family_income).toLocaleString() }}</div>
                    <div class="text-sm text-gray-500">{{ s.institution }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-3">
                      <button @click="openEditModal(s)" class="text-blue-600 hover:text-blue-900" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="confirmDelete(s)" class="text-red-600 hover:text-red-900" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredStudents.length === 0" class="text-center py-12">
            <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
            <h3 class="text-sm font-medium text-gray-900">No students found</h3>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="text-sm text-gray-700">
              Showing {{ startIndex + 1 }} to {{ Math.min(endIndex, filteredStudents.length) }} of {{ filteredStudents.length }}
            </div>
            <div class="flex space-x-1">
              <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="currentPage === page ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'" class="px-3 py-1 border rounded text-sm">{{ page }}</button>
              <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-gray-900">{{ isEditMode ? 'Edit Student' : 'Add New Student' }}</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500"><i class="fas fa-times"></i></button>
          </div>

          <!-- Error -->
          <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{{ formError }}</div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">Personal Information</h4>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Student ID *</label>
                  <input v-model.number="formData.student_id" type="number" required :readonly="isEditMode" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500" :class="isEditMode ? 'bg-gray-100' : ''">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name *</label>
                  <input v-model="formData.name" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email *</label>
                  <input v-model="formData.email" type="email" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div v-if="!isEditMode">
                  <label class="block text-sm font-medium text-gray-700">Password *</label>
                  <input v-model="formData.password" type="password" :required="!isEditMode" class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone *</label>
                  <input v-model="formData.phone_no" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">Academic Information</h4>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Major *</label>
                  <select v-model="formData.major" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select</option>
                    <option v-for="m in majorOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">GPA *</label>
                  <input v-model.number="formData.gpa" type="number" step="0.01" min="0" max="4" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Academic Level *</label>
                  <select v-model="formData.academic_level" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Degree">Degree</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Institution *</label>
                  <input v-model="formData.institution" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Family Income (RM) *</label>
                  <input v-model.number="formData.family_income" type="number" min="0" required class="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
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
          <h3 class="text-lg font-medium text-gray-900">Delete Student</h3>
          <p class="mt-2 text-sm text-gray-500">
            Are you sure you want to delete <strong>{{ studentToDelete?.name }}</strong> (ID: {{ studentToDelete?.student_id }})? This cannot be undone.
          </p>
        </div>
        <div class="mt-6 flex justify-center space-x-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button @click="deleteStudent" :disabled="saving" class="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50">
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

const majorOptions = [
  'Marketing', 'Business', 'Economic', 'Account', 'Human Resource', 'Banking',
  'Computer Science', 'Graphic Design', 'Multimedia', 'Information System',
  'Animation', 'Farmasi', 'Perubatan', 'Pergigian', 'Accounting', 'Finance'
]

// State
const students = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const studentToDelete = ref(null)
const searchQuery = ref('')
const majorFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const formError = ref('')
const toast = ref({ show: false, message: '', type: 'success' })

const formData = ref({
  student_id: null, name: '', email: '', password: '', phone_no: '',
  major: '', gpa: 3.0, academic_level: '', institution: '', family_income: 0
})

// Fetch students from DB
const fetchStudents = async () => {
  try {
    loading.value = true
    if (!supabase) await initSupabase()
    const { data, error } = await supabase.from('student').select('*').order('student_id', { ascending: true })
    if (error) throw error
    students.value = data || []
  } catch (e) {
    console.error('Fetch students error:', e)
  } finally {
    loading.value = false
  }
}

// Computed
const filteredStudents = computed(() => {
  let filtered = students.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      String(s.student_id).includes(q)
    )
  }
  if (majorFilter.value) filtered = filtered.filter(s => s.major === majorFilter.value)
  return filtered
})

const uniqueMajors = computed(() => [...new Set(students.value.map(s => s.major))].sort())
const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedStudents = computed(() => filteredStudents.value.slice(startIndex.value, endIndex.value))

const resetFilters = () => { searchQuery.value = ''; majorFilter.value = ''; currentPage.value = 1 }

// Modal
const openCreateModal = () => {
  isEditMode.value = false
  formError.value = ''
  formData.value = { student_id: null, name: '', email: '', password: '', phone_no: '', major: '', gpa: 3.0, academic_level: '', institution: '', family_income: 0 }
  showModal.value = true
}

const openEditModal = (s) => {
  isEditMode.value = true
  formError.value = ''
  formData.value = { ...s, password: '' }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

// CRUD
const handleSubmit = async () => {
  try {
    saving.value = true
    formError.value = ''
    if (!supabase) await initSupabase()

    if (isEditMode.value) {
      const updateData = { ...formData.value }
      delete updateData.password
      const { error } = await supabase.from('student').update(updateData).eq('student_id', formData.value.student_id)
      if (error) throw error
      showToast('Student updated successfully', 'success')
    } else {
      if (!formData.value.password) { formError.value = 'Password is required'; saving.value = false; return }
      const { error } = await supabase.from('student').insert([formData.value])
      if (error) throw error
      showToast('Student created successfully', 'success')
    }

    closeModal()
    await fetchStudents()
  } catch (e) {
    formError.value = e.message || 'Operation failed'
    console.error('Save error:', e)
  } finally {
    saving.value = false
  }
}

const confirmDelete = (s) => { studentToDelete.value = s; showDeleteModal.value = true }

const deleteStudent = async () => {
  try {
    saving.value = true
    if (!supabase) await initSupabase()
    const { error } = await supabase.from('student').delete().eq('student_id', studentToDelete.value.student_id)
    if (error) throw error
    showDeleteModal.value = false
    studentToDelete.value = null
    showToast('Student deleted', 'success')
    await fetchStudents()
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
  await fetchStudents()
})

const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('isAuthenticated'); router.push('/login') }
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
