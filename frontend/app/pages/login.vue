<template>
  <div class="min-h-screen" 
       :style="{ backgroundImage: 'url(/images/background2.jpg)' }">

    <nav class="shadow-sm bg-transparent">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <span class="ml-2 text-xl font-bold text-white">LoanOptimizer</span>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex-1 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <!-- Debug Info (optional - can remove in production) -->
        <div v-if="debugInfo" class="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
          <i class="fas fa-info-circle mr-2"></i> {{ debugInfo }}
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <i class="fas fa-exclamation-circle mr-2"></i> {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <i class="fas fa-check-circle mr-2"></i> {{ successMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-envelope text-gray-400"></i>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                placeholder="Enter your registered email"
                :disabled="loading"
              >
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a 
                @click="navigateToForgotPassword" 
                class="text-sm text-orange-600 hover:text-orange-800 transition duration-200 cursor-pointer"
              >
                Forgot password?
              </a>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200"
                placeholder="Enter your password"
                :disabled="loading"
              >
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              :disabled="loading"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Signing In...
            </span>
            <span v-else>
              <i class="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </span>
          </button>
        </form>

        <!-- Register Link -->
        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <a 
              @click="navigateToRegister" 
              class="text-orange-600 hover:text-orange-800 font-medium ml-1 cursor-pointer transition duration-200"
            >
              Register now
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.min-h-screen {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const debugInfo = ref('')

// Form validation
const validateForm = () => {
  if (!form.value.email.trim()) {
    errorMessage.value = 'Please enter your email address'
    return false
  }
  
  if (!form.value.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errorMessage.value = 'Please enter a valid email address'
    return false
  }
  
  if (!form.value.password) {
    errorMessage.value = 'Please enter your password'
    return false
  }
  
  if (form.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return false
  }
  
  return true
}

// Clear messages
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
  debugInfo.value = ''
}

// Initialize Supabase client
let supabase = null

const initSupabase = async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    supabase = createClient(
      'https://wlwsjwdmbcxrryqlpjxo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'
    )
    console.log('✅ Supabase client initialized')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error)
    errorMessage.value = 'Failed to connect to database'
    return false
  }
}

// Form submission handler - checks both admin and student tables
const handleSubmit = async () => {
  clearMessages()
  
  if (!validateForm()) {
    return
  }

  loading.value = true
  debugInfo.value = 'Initializing login...'

  try {
    // Initialize Supabase if not already done
    if (!supabase) {
      const initialized = await initSupabase()
      if (!initialized) {
        throw new Error('Failed to initialize database connection')
      }
    }
    
    debugInfo.value = 'Looking up account...'

    // 1) Check the admin table first
    const { data: admins, error: adminError } = await supabase
      .from('admin')
      .select('*')
      .eq('email', form.value.email)
      .limit(1)

    if (adminError) {
      console.error('Admin query error:', adminError)
    }

    if (admins && admins.length > 0) {
      const admin = admins[0]

      // Verify password
      if (admin.password !== form.value.password) {
        throw new Error('Incorrect password')
      }

      debugInfo.value = 'Admin login successful!'
      successMessage.value = 'Welcome, Admin! Redirecting to dashboard...'

      // Store admin session
      localStorage.setItem('adminToken', JSON.stringify({
        admin_id: admin.admin_id,
        email: admin.email,
        permission_level: admin.permission_level,
        loggedIn: true,
        timestamp: new Date().toISOString()
      }))
      localStorage.setItem('isAuthenticated', 'true')

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1500)
      return
    }

    // 2) Check the student table
    debugInfo.value = 'Checking student account...'

    const { data: students, error: studentError } = await supabase
      .from('student')
      .select('*')
      .eq('email', form.value.email)
      .limit(1)
    
    if (studentError) {
      console.error('Student query error:', studentError)
      throw new Error(`Database error: ${studentError.message}`)
    }
    
    if (!students || students.length === 0) {
      throw new Error('No account found with this email address')
    }
    
    const student = students[0]

    // Verify password
    if (student.password !== form.value.password) {
      throw new Error('Incorrect password')
    }
    
    debugInfo.value = 'Login successful!'
    successMessage.value = 'Login successful! Redirecting to dashboard...'
    
    // Store user session data
    const userSession = {
      email: student.email,
      student_id: student.student_id,
      name: student.name,
      phone_no: student.phone_no,
      loggedIn: true,
      timestamp: new Date().toISOString()
    }
    
    // Store in appropriate storage based on "Remember Me"
    if (form.value.rememberMe) {
      localStorage.setItem('studentSession', JSON.stringify(userSession))
    } else {
      sessionStorage.setItem('studentSession', JSON.stringify(userSession))
    }
    
    // Also set a flag for easy checking
    localStorage.setItem('isAuthenticated', 'true')
    
    // Store user data for access in dashboard
    localStorage.setItem('studentData', JSON.stringify({
      id: student.student_id,
      email: student.email,
      name: student.name,
      phone: student.phone_no,
      gpa: student.gpa,
      institution: student.institution,
      major: student.major
    }))
    
    // Redirect to student dashboard after successful login
    setTimeout(() => {
      router.push('/user/dashboard')
    }, 1500)
    
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message
    debugInfo.value = `Error: ${error.message}`
  } finally {
    loading.value = false
  }
}

// Navigation functions
const navigateToRegister = () => {
  router.push('/register')
}

const navigateToForgotPassword = () => {
  router.push('/user/forgot-password')
}
</script>