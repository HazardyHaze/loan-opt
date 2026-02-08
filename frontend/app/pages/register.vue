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
              Create Account
            </h1>
            <p class="text-gray-600">Sign up to get started</p>
          </div>

          <!-- Success Message -->  
          <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {{ errorMessage }}
          </div>

          <!-- Debug Info -->
          <div v-if="debugInfo" class="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
            <strong>Debug:</strong> {{ debugInfo }}
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name Field -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name
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

            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
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

            <!-- Phone Number Field -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                v-model="form.phone_no"
                type="tel"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your phone number"
              >
            </div>

            <!-- Student ID Field -->
            <div>
              <label for="student_id" class="block text-sm font-medium text-gray-700 mb-2">
                Student ID
              </label>
              <input
                id="student_id"
                v-model="form.student_id"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your student ID number"
              >
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Create a password (min. 6 characters)"
              >
            </div>

            <!-- Confirm Password Field -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Confirm your password"
              >
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Creating Account...</span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <!-- Login Links -->
          <div class="mt-6 text-center space-y-3">
            <div class="pt-2 border-t border-gray-200">
              <p class="text-gray-600 text-sm">
                Already have an account?
                <a
                  @click="navigateToLogin"
                  class="text-orange-600 hover:text-orange-800 font-medium ml-1 cursor-pointer transition duration-200"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. CREATE SUPABASE CONNECTION DIRECTLY
// ==========================================
const supabaseUrl = 'https://wlwsjwdmbcxrryqlpjxo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsd3Nqd2RtYmN4cnJ5cWxwanhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzUxNDcsImV4cCI6MjA3NzIxMTE0N30.mWPU2-LvX0LgeQVx7Ixs-emgLXRt9LYn-cxPLeOgzDY'

let supabase = null

import('@supabase/supabase-js').then(({ createClient }) => {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase client created')
}).catch(error => {
  console.error('❌ Failed to load Supabase:', error)
  debugInfo.value = 'Failed to load database connection'
})

// 2. FORM DATA
// ==========================================
const form = ref({
  name: '',
  email: '',
  phone_no: '',
  student_id: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const debugInfo = ref('')

// 3. FORM SUBMISSION HANDLER
// ==========================================
const handleSubmit = async () => {
  // Reset messages
  errorMessage.value = ''
  successMessage.value = ''
  debugInfo.value = 'Starting registration...'
  
  // Basic validation
  if (!form.value.email || !form.value.email.includes('@')) {
    errorMessage.value = 'Please enter a valid email address!'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match!'
    return
  }
  
  if (form.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters!'
    return
  }
  
  const studentIdNum = parseInt(form.value.student_id)
  if (isNaN(studentIdNum) || studentIdNum <= 0) {
    errorMessage.value = 'Student ID must be a positive number!'
    return
  }
  
  loading.value = true
  
  try {
    debugInfo.value = 'Creating Supabase connection...'
    
    // Make sure Supabase is loaded
    if (!supabase) {
      const { createClient } = await import('@supabase/supabase-js')
      supabase = createClient(supabaseUrl, supabaseKey)
    }
    
    // STEP 1: Test connection first
    debugInfo.value = 'Testing database connection...'
    
    // First, check if email already exists
    const { data: existingEmail } = await supabase
      .from('student')
      .select('email')
      .eq('email', form.value.email)
      .limit(1)
    
    if (existingEmail && existingEmail.length > 0) {
      throw new Error('Email already registered!')
    }
    
    // Check if student ID already exists
    const { data: existingStudentId } = await supabase
      .from('student')
      .select('student_id')
      .eq('student_id', studentIdNum)
      .limit(1)
    
    if (existingStudentId && existingStudentId.length > 0) {
      throw new Error('Student ID already exists!')
    }
    
    // Check if phone number already exists
    const { data: existingPhone } = await supabase
      .from('student')
      .select('phone_no')
      .eq('phone_no', form.value.phone_no)
      .limit(1)
    
    if (existingPhone && existingPhone.length > 0) {
      throw new Error('Phone number already registered!')
    }
    
    debugInfo.value = 'Connection successful. Inserting data...'
    
    // STEP 2: Insert into Student table WITH email and password
    const studentData = {
      email: form.value.email, // Email as primary key
      password: form.value.password, // Store password (consider hashing!)
      student_id: studentIdNum,
      phone_no: form.value.phone_no,
      name: form.value.name, // Add name field if your table has it
      gpa: 0,
      family_income: 0,
      academic_level: '',
      institution: '',
      major: ''
    }
    
    console.log('Inserting student data:', studentData)
    
    const { data, error } = await supabase
      .from('student') // Note: lowercase table name
      .insert(studentData)
      .select()
    
    if (error) {
      console.error('Database error details:', error)
      
      // Check if it's a structure issue
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        throw new Error(`Database column error: ${error.message}. Make sure your table has email and password columns.`)
      }
      
      throw new Error(`Failed to save data: ${error.message}`)
    }
    
    // Debug: Check what was inserted
    console.log('Data inserted successfully:', data)
    
    // STEP 3: Optional - Also create Supabase Auth user
    // Only do this if you want separate authentication
    debugInfo.value = 'Setting up authentication...'
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.value.email,
        password: form.value.password,
        options: {
          data: {
            name: form.value.name,
            student_id: studentIdNum,
            phone_no: form.value.phone_no
          }
        }
      })
      
      if (authError) {
        console.warn('Supabase Auth creation failed (but student data saved):', authError.message)
        // Continue anyway since student data was saved in our table
      } else {
        console.log('Supabase Auth user created successfully')
      }
    } catch (authErr) {
      console.warn('Supabase Auth skipped:', authErr.message)
    }
    
    // SUCCESS!
    successMessage.value = `Account created successfully! 
                            Student ID: ${studentIdNum}
                            Email: ${form.value.email}`
    debugInfo.value = 'Registration complete!'
    
    // Clear form
    form.value = {
      name: '',
      email: '',
      phone_no: '',
      student_id: '',
      password: '',
      confirmPassword: ''
    }
    
    // Optional: Redirect after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (error) {
    console.error('Registration failed:', error)
    errorMessage.value = error.message
    debugInfo.value = `Error: ${error.message}`
  } finally {
    loading.value = false
  }
}

// 4. NAVIGATION
// ==========================================
const navigateToLogin = () => {
  router.push('/login')
}
</script>