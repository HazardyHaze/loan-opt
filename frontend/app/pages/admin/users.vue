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
            class="flex items-center px-4 py-3 text-white bg-red-600 rounded-lg hover:bg-red-400 transition duration-200"
            :class="{ 'bg-red-100 text-red-700': $route.path === '/admin/users' }"
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
            <h2 class="text-2xl font-bold text-white">User Management</h2>
            <p class="text-gray-300">Manage all student accounts and information</p>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              @click="openCreateModal"
              class="px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 hover:opacity-90"
              style="background-color: #FF0000; color: white;"
            >
              <i class="fas fa-user-plus mr-2"></i>
              Add New Student
            </button>
            <div class="text-sm text-gray-300">
              {{ currentTime }}
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="p-8">
        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Students</p>
                <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalStudents }}</p>
                <p class="text-sm text-green-600 mt-1">
                  <i class="fas fa-arrow-up mr-1"></i>
                  +{{ stats.newStudentsToday }} today
                </p>
                <div class="mt-4">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" :style="{ width: activeStudentPercentage + '%' }"></div>
                  </div>
                </div>
              </div>
              <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-users text-blue-600 text-3xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                  type="text" 
                  v-model="searchQuery"
                  placeholder="Search students by name, email, or student ID..."
                  class="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <select v-model="majorFilter" class="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
                <option value="">All Majors</option>
                <option v-for="major in uniqueMajors" :key="major" :value="major">{{ major }}</option>
              </select>
              <button @click="resetFilters" class="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in paginatedStudents" :key="student.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 flex-shrink-0">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <i class="fas fa-user text-blue-600"></i>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ student.firstName }} {{ student.lastName }}</div>
                        <div class="text-sm text-gray-500">ID: {{ student.studentId }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.email }}</div>
                    <div class="text-sm text-gray-500">{{ student.phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ student.major }}</div>
                    <div class="text-sm text-gray-500">GPA: {{ student.gpa }} • {{ student.academicLevel }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-3">
                      <button @click="openEditModal(student)" class="text-blue-600 hover:text-blue-900">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="viewStudentDetails(student)" class="text-green-600 hover:text-green-900">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button @click="confirmDeleteStudent(student)" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredStudents.length === 0" class="text-center py-12">
            <i class="fas fa-users text-gray-400 text-4xl mb-4"></i>
            <h3 class="text-sm font-medium text-gray-900">No students found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>

          <!-- Pagination -->
          <div v-if="filteredStudents.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button @click="nextPage" :disabled="currentPage * itemsPerPage >= filteredStudents.length" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{{ startIndex + 1 }}</span> to 
                  <span class="font-medium">{{ Math.min(endIndex, filteredStudents.length) }}</span> of 
                  <span class="font-medium">{{ filteredStudents.length }}</span> results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Previous</span>
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    currentPage === page 
                      ? 'z-10 bg-red-50 border-red-500 text-red-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]">
                    {{ page }}
                  </button>
                  <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span class="sr-only">Next</span>
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
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
            <h3 class="text-xl font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Student' : 'Add New Student' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Personal Information -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">Personal Information</h4>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">First Name *</label>
                  <input v-model="formData.firstName" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input v-model="formData.lastName" type="text" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Email *</label>
                  <input v-model="formData.email" type="email" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input v-model="formData.phone" type="tel" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>

              <!-- Academic Information -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">Academic Information</h4>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Student ID *</label>
                  <input v-model="formData.studentId" type="text" required :readonly="isEditMode" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Major *</label>
                  <select v-model="formData.major" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select a major</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                    <option value="Biology">Biology</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Nursing">Nursing</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">GPA *</label>
                  <input v-model="formData.gpa" type="number" step="0.01" min="0" max="4.0" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Academic Level *</label>
                  <select v-model="formData.academicLevel" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select level</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white" style="background-color: #56B2BB;">
                {{ isEditMode ? 'Update Student' : 'Create Student' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <i class="fas fa-exclamation-triangle text-red-600"></i>
          </div>
          <div class="mt-4 text-center">
            <h3 class="text-lg font-medium text-gray-900">Delete Student</h3>
            <p class="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {{ studentToDelete?.firstName }} {{ studentToDelete?.lastName }}? 
              This action cannot be undone.
            </p>
          </div>
          <div class="mt-6 flex justify-center space-x-3">
            <button @click="showDeleteModal = false" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button @click="deleteStudent" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
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

// State management
const students = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const studentToDelete = ref(null)
const searchQuery = ref('')
const majorFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const currentTime = ref('')

// Form data
const formData = ref({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  studentId: '',
  major: '',
  gpa: 3.0,
  academicLevel: '',
})

// Stats
const stats = ref({
  totalStudents: 0,
  activeStudents: 0,
  newStudentsToday: 0
})

// Computed properties
const activeStudentPercentage = computed(() => {
  if (stats.value.totalStudents === 0) return 0
  return Math.round((stats.value.activeStudents / stats.value.totalStudents) * 100)
})

// Navigation functions
const logout = () => {
  localStorage.removeItem('adminToken')
  router.push('/admin/login')
}

// Modal functions
const openCreateModal = () => {
  resetForm()
  isEditMode.value = false
  showModal.value = true
}

const openEditModal = (student) => {
  formData.value = { ...student }
  isEditMode.value = true
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    studentId: '',
    major: '',
    gpa: 3.0,
    academicLevel: '',
  }
}

// CRUD Operations
const handleSubmit = async () => {
  if (isEditMode.value) {
    // Update existing student
    const index = students.value.findIndex(s => s.id === formData.value.id)
    if (index !== -1) {
      students.value[index] = { ...formData.value }
    }
  } else {
    // Create new student
    const newStudent = {
      ...formData.value,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    students.value.unshift(newStudent)
    stats.value.newStudentsToday++
  }
  
  updateStats()
  closeModal()
}

const confirmDeleteStudent = (student) => {
  studentToDelete.value = student
  showDeleteModal.value = true
}

const deleteStudent = () => {
  students.value = students.value.filter(s => s.id !== studentToDelete.value.id)
  updateStats()
  showDeleteModal.value = false
  studentToDelete.value = null
}

const viewStudentDetails = (student) => {
  alert(`Viewing details for ${student.firstName} ${student.lastName}`)
}

// Filtering and Search
const filteredStudents = computed(() => {
  let filtered = students.value
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student =>
      student.firstName.toLowerCase().includes(query) ||
      student.lastName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.studentId.toLowerCase().includes(query) ||
      student.major.toLowerCase().includes(query)
    )
  }
  
  
  // Apply major filter
  if (majorFilter.value) {
    filtered = filtered.filter(student => student.major === majorFilter.value)
  }
  
  return filtered
})

const uniqueMajors = computed(() => {
  const majors = students.value.map(s => s.major)
  return [...new Set(majors)].sort()
})

const resetFilters = () => {
  searchQuery.value = ''
  majorFilter.value = ''
  currentPage.value = 1
}

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / itemsPerPage)
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStudents.value.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// Stats calculation
const updateStats = () => {
  stats.value.totalStudents = students.value.length
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
  
  // Sample data
  students.value = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@university.edu',
      phone: '(555) 123-4567',
      studentId: 'STU2024001',
      major: 'Computer Science',
      gpa: 3.8,
      academicLevel: 'Senior',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@university.edu',
      phone: '(555) 987-6543',
      studentId: 'STU2024002',
      major: 'Engineering',
      gpa: 3.9,
      academicLevel: 'Junior',
      createdAt: '2024-01-16'
    },
    {
      id: 3,
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.j@university.edu',
      phone: '(555) 456-7890',
      studentId: 'STU2024003',
      major: 'Business',
      gpa: 3.5,
      academicLevel: 'Sophomore',
      createdAt: '2024-01-17'
    },
    {
      id: 4,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.g@university.edu',
      phone: '(555) 234-5678',
      studentId: 'STU2024004',
      major: 'Biology',
      gpa: 3.7,
      academicLevel: 'Senior',
      createdAt: '2024-01-18'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Williams',
      email: 'david.w@university.edu',
      phone: '(555) 345-6789',
      studentId: 'STU2024005',
      major: 'Psychology',
      gpa: 3.2,
      academicLevel: 'Freshman',
      createdAt: '2024-01-19'
    },
    {
      id: 6,
      firstName: 'Sarah',
      lastName: 'Miller',
      email: 'sarah.m@university.edu',
      phone: '(555) 567-8901',
      studentId: 'STU2024006',
      major: 'Mathematics',
      gpa: 3.9,
      academicLevel: 'Graduate',
      createdAt: '2024-01-20'
    },
    {
      id: 7,
      firstName: 'James',
      lastName: 'Brown',
      email: 'james.b@university.edu',
      phone: '(555) 678-9012',
      studentId: 'STU2024007',
      major: 'Computer Science',
      gpa: 3.6,
      academicLevel: 'Junior',
      createdAt: '2024-01-21'
    },
    {
      id: 8,
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.d@university.edu',
      phone: '(555) 789-0123',
      studentId: 'STU2024008',
      major: 'Nursing',
      gpa: 3.8,
      academicLevel: 'Senior',
      createdAt: '2024-01-22'
    }
  ]
  
  updateStats()
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