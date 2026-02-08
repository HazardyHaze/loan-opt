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

          <div class="flex items-center space-x-4">
            <button 
              @click="navigateToLogin"
              class="text-white hover:text-black px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </button>
            <button 
              @click="navigateToRegister"
              class="bg-white text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition duration-200 text-sm font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>

  <div class="flex-1 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center">
          <KeyIcon class="h-6 w-6 text-white" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-white">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <div v-if="!emailSent" class="mt-8 space-y-6">
        <form @submit.prevent="sendResetLink">
          <div>
            <label for="email" class="block text-sm font-medium text-white">Email address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Enter your email address"
            >
          </div>

          <div class="mt-6">
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <KeyIcon class="h-5 w-5 text-orange-500 group-hover:text-orange-400" />
              </span>
              {{ loading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>
        </form>

        <div class="text-center">
          <a 
            @click="navigateToLogin" 
            class="font-medium text-orange-600 hover:text-orange-500 cursor-pointer"
          >
            Back to Sign in
          </a>
        </div>
      </div>

      <div v-else class="mt-8 text-center">
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckIcon class="h-6 w-6 text-green-600" />
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
          <p class="mt-2 text-sm text-gray-600">
            We've sent a password reset link to <strong>{{ email }}</strong>
          </p>
          <p class="mt-2 text-sm text-gray-500">
            The link will expire in 1 hour for security reasons.
          </p>
          <div class="mt-6">
            <button
              @click="emailSent = false"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Try another email
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)
const emailSent = ref(false)

const sendResetLink = async () => {
  loading.value = true
  try {
    console.log('Sending reset link to:', email.value)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    emailSent.value = true
  } catch (error) {
    console.error('Failed to send reset link:', error)
  } finally {
    loading.value = false
  }
}

// Navigation function to login page
const navigateToLogin = () => {
  navigateTo('/login')
}

const KeyIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const CheckIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 12.75l6 6 9-13.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}
</script>