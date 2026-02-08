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

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
          Smarter Student Loan
          <span class="text-orange-400">Repayment</span>
        </h1>
        <p class="text-xl text-white mb-8 max-w-3xl mx-auto">
          Optimize your student loan repayment strategy. Save thousands with our intelligent payment planner and discover the best repayment plan for your financial situation.
        </p>
        
        <div class="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <button 
            @click="navigateToRegister"
            class="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-orange-300 transition duration-200 text-lg font-semibold"
          >
            Start Optimizing Now
          </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-black mb-2">$15K+</div>
            <div class="text-gray-600">Average Savings</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-black mb-2">50K+</div>
            <div class="text-gray-600">Loans Optimized</div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm">
            <div class="text-3xl font-bold text-black mb-2">4.9/5</div>
            <div class="text-gray-600">User Rating</div>
          </div>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mt-20">
        <h2 class="text-3xl font-bold text-center text-white mb-12">How We Help You Save</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ChartBarIcon class="h-6 w-6 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Payment Strategy</h3>
            <p class="text-gray-600">Optimize your payment schedule to minimize interest and pay off loans faster.</p>
          </div>
          
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CalculatorIcon class="h-6 w-6 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Plan Comparison</h3>
            <p class="text-gray-600">Compare all federal repayment plans to find the best fit for your income.</p>
          </div>
          
          <div class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition duration-200">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ClockIcon class="h-6 w-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Forgiveness Tracking</h3>
            <p class="text-gray-600">Track progress toward loan forgiveness programs like PSLF and IDR.</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Demo Modal -->
    <div v-if="showDemo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">How LoanOptimizer Works</h3>
          <button @click="showDemo = false" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <PlayIcon class="h-16 w-16 text-green-600" />
        </div>
        <p class="mt-4 text-gray-600 text-center">
          See how our platform analyzes your loans and creates the optimal repayment strategy.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showDemo = ref(false)

const navigateToRegister = () => {
  navigateTo('/register')
}

const navigateToLogin = () => {
  navigateTo('/login')
}

// Icon components
const BanknotesIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ChartBarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const CalculatorIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.807-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ClockIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const XMarkIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const PlayIcon = {
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5v14l11-7z"/>
    </svg>
  `
}
</script>