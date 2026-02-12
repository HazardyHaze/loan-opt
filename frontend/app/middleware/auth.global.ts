export default function (to: any) {
  // Only run on client side
  if (import.meta.server) return

  const adminToken = localStorage.getItem('adminToken')
  const studentSession =
    localStorage.getItem('studentSession') || sessionStorage.getItem('studentSession')

  let isAdmin = false
  let isStudent = false

  if (adminToken) {
    try {
      const parsed = JSON.parse(adminToken)
      if (parsed.loggedIn) isAdmin = true
    } catch {}
  }

  if (studentSession) {
    try {
      const parsed = JSON.parse(studentSession)
      if (parsed.loggedIn) isStudent = true
    } catch {}
  }

  const path = to.path

  const isLoginPage = path === '/login'
  const isAdminRoute = path.startsWith('/admin')
  const isUserRoute = path.startsWith('/user')

  // 1) Logged-in users/admins should NOT reach the login page
  if (isLoginPage) {
    if (isAdmin) return navigateTo('/admin/dashboard')
    if (isStudent) return navigateTo('/user/dashboard')
    return
  }

  // 2) Admin routes require admin session
  if (isAdminRoute) {
    if (!isAdmin) return navigateTo('/login')
    return
  }

  // 3) User routes require student session
  if (isUserRoute) {
    if (!isStudent) return navigateTo('/login')
    return
  }
}
