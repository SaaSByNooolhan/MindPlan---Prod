import React, { useState } from 'react'
import { AuthProvider, useAuthContext } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PomodoroProvider } from './contexts/PomodoroContext'
import { AuthFormSimple } from './components/auth/AuthFormSimple'
import { LandingPage } from './components/landing/LandingPage'
import Sidebar from './components/layout/Sidebar'
import { SimpleDashboard } from './components/dashboard/SimpleDashboard'
import { FinanceHub } from './components/finance/FinanceHub'
import { Settings } from './components/settings/Settings'

const AppContent: React.FC = () => {
  const { user, loading } = useAuthContext()
  
  // Initialiser avec la dernière section visitée ou dashboard par défaut
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      const lastSection = localStorage.getItem('lastActiveSection')
      const validSections = ['dashboard', 'finance', 'settings']
      if (lastSection && validSections.includes(lastSection)) {
        return lastSection
      }
    }
    return 'dashboard'
  }
  
  const [activeSection, setActiveSection] = useState(getInitialSection)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [sectionParams, setSectionParams] = useState<any>({})

  // Sauvegarder la section active dans localStorage à chaque changement
  React.useEffect(() => {
    if (user && activeSection) {
      localStorage.setItem('lastActiveSection', activeSection)
    }
  }, [activeSection, user])

  // Gérer les redirections spéciales pour l'essai Premium
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
        // Nettoyer les flags au cas où
        localStorage.removeItem('wantsPremium')
        localStorage.removeItem('isNewSignup')
      }
    }
  }, [user]) // Seulement quand l'utilisateur change

  // Plus de vérification d'expiration - l'application est maintenant gratuite

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
      return <AuthFormSimple onBackToLanding={() => setShowAuth(false)} initialMode={authMode} />
    }
    return <LandingPage onNavigateToAuth={(mode = 'login') => {
      setAuthMode(mode)
      setShowAuth(true)
    }} />
  }

  const handleNavigate = (section: string, params?: any) => {
    setActiveSection(section)
    setSectionParams(params || {})
  }

  const renderContent = () => {
    const content = (() => {
      switch (activeSection) {
        case 'dashboard':
          return <SimpleDashboard onNavigate={handleNavigate} />
        case 'finance':
          return <FinanceHub initialSection={sectionParams?.section || 'overview'} />
        case 'settings':
          return <Settings />
        default:
          return <SimpleDashboard onNavigate={handleNavigate} />
      }
    })()

    return (
      <div 
        key={activeSection} 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          animation: 'fadeIn 0.3s ease-in-out'
        }}
      >
        {content}
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar 
        activeView={activeSection} 
        onViewChange={setActiveSection}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
          {renderContent()}
        </div>
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
