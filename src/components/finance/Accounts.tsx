import React from 'react'
import { Card } from '../ui/Card'
import { Building2 } from 'lucide-react'

export const Accounts: React.FC = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Mes Comptes
            </h1>
            <div className="flex items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Gestion multi-comptes
              </p>
              <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full font-medium">
                En cours de développement
              </span>
            </div>
          </div>
        </div>

        {/* Message de développement */}
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Gestion Multi-Comptes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Cette fonctionnalité est en cours de développement et sera disponible dans la version 2.0 de MindPlan.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-lg mx-auto">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              🚀 Fonctionnalités prévues pour la v2.0 :
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 text-left space-y-1">
              <li>• Gestion de plusieurs comptes bancaires</li>
              <li>• Association des transactions aux comptes</li>
              <li>• Suivi des soldes en temps réel</li>
              <li>• Rapports détaillés par compte</li>
              <li>• Transferts entre comptes</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}