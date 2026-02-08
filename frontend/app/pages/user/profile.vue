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
                class="text-white hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium"
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

    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">
          Edit Profile
        </h1>
        <p class="text-gray-300">Update your personal information</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Personal Information Section -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b">Personal Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your full name"
                >
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                >
              </div>

              <!-- Phone Number -->
              <div>
                <label for="phone_no" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone_no"
                  v-model="form.phone_no"
                  type="tel"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your phone number"
                >
              </div>

              <!-- Student ID -->
              <div>
                <label for="student_id" class="block text-sm font-medium text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  id="student_id"
                  v-model="form.student_id"
                  type="text"
                  required
                  disabled
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Student ID"
                >
                <p class="text-sm text-gray-500 mt-1">Student ID cannot be changed</p>
              </div>
            </div>
          </div>

          <!-- Academic Information Section -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b">Academic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- GPA -->
              <div>
                <label for="gpa" class="block text-sm font-medium text-gray-700 mb-2">
                  GPA *
                </label>
                <input
                  id="gpa"
                  v-model="form.gpa"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your GPA (0.0 - 4.0)"
                >
              </div>

              <!-- Family Income -->
              <div>
                <label for="family_income" class="block text-sm font-medium text-gray-700 mb-2">
                  Family Income (Annual) *
                </label>
                <input
                  id="family_income"
                  v-model="form.family_income"
                  type="number"
                  min="0"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter annual family income"
                >
              </div>

              <!-- Academic Level -->
              <div>
                <label for="academic_level" class="block text-sm font-medium text-gray-700 mb-2">
                  Academic Level *
                </label>
                <select
                  id="academic_level"
                  v-model="form.academic_level"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="">Select academic level</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="PhD">PhD</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

              <!-- Institution -->
              <div>
                <label for="institution" class="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <input
                  id="institution"
                  v-model="form.institution"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your institution name"
                >
              </div>

              <!-- Major -->
              <div class="md:col-span-2">
                <label for="major" class="block text-sm font-medium text-gray-700 mb-2">
                  Major/Field of Study *
                </label>
                <input
                  id="major"
                  v-model="form.major"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your major or field of study"
                >
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
            <button
              type="button"
              @click="navigateToDashboard"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Updating Profile...</span>
              <span v-else>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'C:/projects/loan-scholar-opt/frontend/utils/supabase'

const router = useRouter()

// Form data
const form = ref({
  name: '',
  email: '',
  phone_no: '',
  student_id: '',
  gpa: 0,
  family_income: 0,
  academic_level: '',
  institution: '',
  major: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentUser = ref(null)

// Fetch current user data
const fetchUserData = async () => {
  try {
    loading.value = true
    
    // Get current user from Supabase Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    currentUser.value = user

    // Fetch user data from User table
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('*')
      .eq('email', user.email)
      .single()

    if (userError) throw userError

    // Update form with user data
    form.value.name = userData.name
    form.value.email = userData.email
    form.value.student_id = userData.student_id

    // If user is a student, fetch student data
    if (userData.student_id) {
      const { data: studentData, error: studentError } = await supabase
        .from('Student')
        .select('*')
        .eq('student_id', userData.student_id)
        .single()

      if (studentError) throw studentError

      // Update form with student data
      form.value.phone_no = studentData.phone_no
      form.value.gpa = studentData.gpa
      form.value.family_income = studentData.family_income
      form.value.academic_level = studentData.academic_level
      form.value.institution = studentData.institution
      form.value.major = studentData.major
    }

  } catch (error) {
    console.error('Error fetching user data:', error)
    errorMessage.value = 'Failed to load user data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Form submission handler
const handleSubmit = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!form.value.name || !form.value.email || !form.value.phone_no) {
    errorMessage.value = 'Please fill in all required fields!'
    return
  }

  if (form.value.gpa < 0 || form.value.gpa > 4) {
    errorMessage.value = 'GPA must be between 0.0 and 4.0!'
    return
  }

  if (form.value.family_income < 0) {
    errorMessage.value = 'Family income cannot be negative!'
    return
  }

  loading.value = true

  try {
    // Update User table
    const { error: userError } = await supabase
      .from('User')
      .update({
        name: form.value.name,
        email: form.value.email
      })
      .eq('email', currentUser.value.email)

    if (userError) throw userError

    // Update Student table
    const { error: studentError } = await supabase
      .from('Student')
      .update({
        phone_no: parseInt(form.value.phone_no),
        gpa: parseInt(form.value.gpa),
        family_income: parseInt(form.value.family_income),
        academic_level: form.value.academic_level,
        institution: form.value.institution,
        major: form.value.major
      })
      .eq('student_id', form.value.student_id)

    if (studentError) throw studentError

    successMessage.value = 'Profile updated successfully!'
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (error) {
    console.error('Profile update error:', error)
    errorMessage.value = error.message || 'Failed to update profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Navigation functions
const navigateToDashboard = () => {
  router.push('/user/dashboard')
}

// Fetch user data when component mounts
onMounted(() => {
  fetchUserData()
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

// Add click event listener
import { onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

</script>

<style scoped>
input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}
</style>