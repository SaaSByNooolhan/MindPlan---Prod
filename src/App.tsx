import React, { useState } from 'react'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PomodoroProvider } from './contexts/PomodoroContext'
import { AuthFormSimple } from './components/auth/AuthFormSimple'
import { LandingPage } from './components/landing/LandingPage'
import Sidebar from './components/layout/Sidebar'
import { Dashboard } from './components/dashboard/Dashboard'
import { TaskList } from './components/tasks/TaskList'
import { FinanceTracker } from './components/finance/FinanceTracker'
import { PomodoroTimer } from './components/pomodoro/PomodoroTimer'
import { Calendar } from './components/calendar/Calendar'
import { Settings } from './components/settings/Settings'

const AppContent: React.FC = () => {
  const { user, loading } = useAuthContext()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showAuth, setShowAuth] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sectionParams, setSectionParams] = useState<any>({})

  // S'assurer que l'utilisateur est redirigé vers le dashboard après authentification
  React.useEffect(() => {
    if (user) {
      // Vérifier si c'est une redirection spéciale pour l'essai Premium (seulement pour les nouvelles inscriptions)
      const wantsPremium = localStorage.getItem('wantsPremium') === 'true'
      const isNewSignup = localStorage.getItem('isNewSignup') === 'true'
      
      if (wantsPremium && isNewSignup) {
        // Rediriger vers les paramètres pour démarrer l'essai (nouvelle inscription seulement)
        setActiveSection('settings')
        localStorage.removeItem('wantsPremium') // Nettoyer le flag
        localStorage.removeItem('isNewSignup') // Nettoyer le flag
      } else {
        // Pour les connexions d'utilisateurs existants, toujours aller au dashboard
        setActiveSection('dashboard')
        // Nettoyer les flags au cas où
        localStorage.removeItem('wantsPremium')
        localStorage.removeItem('isNewSignup')
      }
    }
  }, [user]) // Seulement quand l'utilisateur change, pas quand activeSection change

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, afficher la landing page ou le formulaire d'auth
  if (!user) {
    if (showAuth) {
      return <AuthFormSimple onBackToLanding={() => setShowAuth(false)} />
    }
    return <LandingPage onNavigateToAuth={() => setShowAuth(true)} />
  }

  const handleNavigate = (section: string, params?: any) => {
    setActiveSection(section)
    setSectionParams(params || {})
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'tasks':
        return <TaskList initialParams={sectionParams} />
      case 'finance':
        return <FinanceTracker initialParams={sectionParams} />
      case 'pomodoro':
        return <PomodoroTimer />
      case 'calendar':
        return <Calendar />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="flex bg-white dark:bg-black min-h-screen">
      <Sidebar 
        activeView={activeSection} 
        onViewChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PomodoroProvider>
          <AppContent />
        </PomodoroProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App