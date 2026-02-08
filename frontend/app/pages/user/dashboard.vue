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
                class="text-orange-500 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
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

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">Welcome back, John! 👋</h1>
        <p class="text-white mt-2">Here's your scholarship application overview</p>
      </div>

      <!-- Side by side section: Checklist and Scholarship Matches -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Documents Checklist Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Document Preparation Checklist</h2>
            <span class="text-sm text-gray-500">{{ documentsPrepared }}/{{ documents.length }} completed</span>
          </div>
          <div class="space-y-3">
            <div v-for="doc in documents" :key="doc.id" class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition duration-200">
              <input 
                type="checkbox" 
                :id="'doc-' + doc.id" 
                v-model="doc.prepared"
                class="h-5 w-5 text-blue-600 rounded cursor-pointer"
              />
              <label :for="'doc-' + doc.id" class="ml-4 flex-1 cursor-pointer">
                <span :class="['font-medium', doc.prepared ? 'text-gray-500 line-through' : 'text-gray-900']">{{ doc.name }}</span>
                <p class="text-sm text-gray-500">{{ doc.description }}</p>
              </label>
              <span v-if="doc.prepared" class="ml-2 text-green-500 font-semibold">✓</span>
            </div>
          </div>
        </div>

        <!-- Scholarship Matches Section -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">Scholarship Matches</h2>
            <button 
            @click="navigateToMatching"
            class="text-green-600 hover:text-green-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div class="space-y-4">
            <div v-for="match in scholarshipMatches" :key="match.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 transition duration-200">
              <div class="flex items-center space-x-4">
                <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <AcademicCapIcon class="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">{{ match.name }}</h3>
                  <p class="text-sm text-gray-500">Deadline: {{ match.deadline }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ match.amount }}</p>
                <span :class="['inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', 
                  match.matchLevel === 'High' ? 'bg-green-100 text-green-800' :
                  match.matchLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                ]">
                  {{ match.matchLevel }} Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- You can add other sections below if needed -->
      
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showNotifications = ref(false)
const showUserMenu = ref(false)
const unreadNotifications = ref(3)

const goToDashboard = () => {
  navigateTo('/user/dashboard')
}

const goToMatching = () => {
  navigateTo('/user/matching')
}

const navigateToMatching = () => {
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
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})


const documents = ref([
  {
    id: 1,
    name: 'Proof of Income',
    description: 'Recent pay stubs or employment letter',
    prepared: false
  },
  {
    id: 2,
    name: 'Tax Returns',
    description: 'Last 2 years of federal tax returns',
    prepared: false
  },
  {
    id: 3,
    name: 'Identification',
    description: 'Government-issued ID or passport',
    prepared: false
  },
  {
    id: 4,
    name: 'Bank Statements',
    description: 'Last 3 months of bank statements',
    prepared: false
  },
  {
    id: 5,
    name: 'Academic Transcripts',
    description: 'High school or college transcripts',
    prepared: false
  },
  {
    id: 6,
    name: 'Personal Statement',
    description: 'Written essay or personal statement',
    prepared: false
  }
])

const documentsPrepared = computed(() => documents.value.filter(doc => doc.prepared).length)

// Sample data
const scholarshipMatches = ref([
  {
    id: 1,
    name: 'STEM Excellence Scholarship',
    deadline: 'Mar 15, 2024',
    amount: '$10,000',
    matchLevel: 'High'
  },
  {
    id: 2,
    name: 'Community Service Award',
    deadline: 'Apr 1, 2024',
    amount: '$5,000',
    matchLevel: 'Medium'
  },
  {
    id: 3,
    name: 'First Generation Scholarship',
    deadline: 'May 30, 2024',
    amount: '$7,500',
    matchLevel: 'High'
  }
])

const savedScholarships = ref([
  {
    id: 1,
    name: 'Technology Innovation Grant',
    description: 'For students pursuing computer science and engineering',
    amount: '$15,000',
    deadline: '2 days left',
    deadlineStatus: 'urgent'
  },
  {
    id: 2,
    name: 'Leadership Excellence Award',
    description: 'Recognizing outstanding leadership in community service',
    amount: '$8,000',
    deadline: '1 week left',
    deadlineStatus: 'soon'
  },
  {
    id: 3,
    name: 'Future Educators Scholarship',
    description: 'Supporting aspiring teachers in their educational journey',
    amount: '$6,000',
    deadline: '1 month left',
    deadlineStatus: 'later'
  }
])

const applications = ref([
  {
    id: 1,
    name: 'STEM Excellence Scholarship',
    amount: '$10,000',
    status: 'submitted',
    statusDisplay: 'Submitted',
    submittedDate: 'Feb 12, 2024',
    deadline: 'Mar 15, 2024'
  },
  {
    id: 2,
    name: 'Community Service Award',
    amount: '$5,000',
    status: 'in-progress',
    statusDisplay: 'In Progress',
    submittedDate: '-',
    deadline: 'Apr 1, 2024'
  },
  {
    id: 3,
    name: 'First Generation Scholarship',
    amount: '$7,500',
    status: 'draft',
    statusDisplay: 'Draft',
    submittedDate: '-',
    deadline: 'May 30, 2024'
  },
  {
    id: 4,
    name: 'Technology Innovation Grant',
    amount: '$15,000',
    status: 'rejected',
    statusDisplay: 'Not Selected',
    submittedDate: 'Jan 20, 2024',
    deadline: 'Feb 1, 2024'
  }
])

// Icon components
const BanknotesIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const BellIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const UserIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const ChevronDownIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const TargetIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const BookmarkIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const DocumentTextIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const CurrencyDollarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const AcademicCapIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const BookmarkSlashIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}

const PlusIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5v15m7.5-7.5h-15" stroke-linecap="round" stroke-linejoin="round"/>
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

const CogIcon = {
  template: `
    <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
}
</script>