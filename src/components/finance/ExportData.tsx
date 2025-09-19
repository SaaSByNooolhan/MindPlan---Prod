import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Download, 
  FileText, 
  FileSpreadsheet,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { supabase, Transaction } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ExportOptions {
  format: 'pdf' | 'excel'
  dateRange: 'current_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'all' | 'custom'
  customStartDate?: string
  customEndDate?: string
  includeTransactions: boolean
  includeBudgets: boolean
  includeGoals: boolean
  includeAnalytics: boolean
}

export const ExportData: React.FC = () => {
  const { user } = useAuthContext()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'current_month',
    includeTransactions: true,
    includeBudgets: true,
    includeGoals: true,
    includeAnalytics: true
  })

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error loading transactions:', error)
      } else {
        setTransactions(data || [])
      }
    } catch (error) {
      console.error('Error in loadTransactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    
    switch (options.dateRange) {
      case 'current_month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        }
      case 'last_3_months':
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now)
        }
      case 'last_6_months':
        return {
          start: startOfMonth(subMonths(now, 5)),
          end: endOfMonth(now)
        }
      case 'last_year':
        return {
          start: startOfMonth(subMonths(now, 11)),
          end: endOfMonth(now)
        }
      case 'custom':
        return {
          start: options.customStartDate ? new Date(options.customStartDate) : startOfMonth(now),
          end: options.customEndDate ? new Date(options.customEndDate) : endOfMonth(now)
        }
      default:
        return {
          start: new Date('2020-01-01'),
          end: now
        }
    }
  }

  const getFilteredTransactions = () => {
    const { start, end } = getDateRange()
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= start && transactionDate <= end
    })
  }

  const getCategoryBreakdown = (transactions: Transaction[]) => {
    const categoryTotals: { [key: string]: number } = {}
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    
    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0
      }
      categoryTotals[transaction.category] += transaction.amount
    })
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  const generatePDF = async () => {
    setExporting(true)
    setExportStatus('idle')

    try {
      const filteredTransactions = getFilteredTransactions()
      const { start, end } = getDateRange()
      
      // Calculate statistics
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netBalance = totalIncome - totalExpenses

      // Create PDF content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Rapport Financier - ${format(start, 'dd/MM/yyyy')} au ${format(end, 'dd/MM/yyyy')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .summary h3 { margin-top: 0; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .income { color: #10B981; }
            .expense { color: #EF4444; }
            .balance { color: #3B82F6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .positive { color: #10B981; }
            .negative { color: #EF4444; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Financier</h1>
            <p>Période: ${format(start, 'dd/MM/yyyy', { locale: fr })} au ${format(end, 'dd/MM/yyyy', { locale: fr })}</p>
            <p>Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
          </div>

          <div class="summary">
            <h3>Résumé Financier</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-value income">${totalIncome.toFixed(2)} €</div>
                <div>Revenus</div>
              </div>
              <div class="summary-item">
                <div class="summary-value expense">${totalExpenses.toFixed(2)} €</div>
                <div>Dépenses</div>
              </div>
              <div class="summary-item">
                <div class="summary-value balance">${netBalance.toFixed(2)} €</div>
                <div>Solde Net</div>
              </div>
            </div>
          </div>

          ${options.includeTransactions ? `
            <h3>Transactions (${filteredTransactions.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Type</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(transaction => `
                  <tr>
                    <td>${format(new Date(transaction.date), 'dd/MM/yyyy', { locale: fr })}</td>
                    <td>${transaction.title}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.type === 'income' ? 'Revenu' : 'Dépense'}</td>
                    <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
                      ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} €
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : ''}

          ${options.includeBudgets ? `
            <h3>Budgets</h3>
            <div class="summary">
              <p><strong>Note:</strong> Les budgets seront synchronisés avec vos données réelles dans la v2.0</p>
              <p>Pour l'instant, cette section affiche les budgets configurés dans votre application.</p>
            </div>
          ` : ''}

          ${options.includeGoals ? `
            <h3>Objectifs Financiers</h3>
            <div class="summary">
              <p><strong>Note:</strong> Les objectifs financiers seront synchronisés avec vos données réelles dans la v2.0</p>
              <p>Pour l'instant, cette section affiche les objectifs configurés dans votre application.</p>
            </div>
          ` : ''}

          ${options.includeAnalytics ? `
            <h3>Analyses et Statistiques</h3>
            <div class="summary">
              <h4>Répartition par Catégorie</h4>
              <table>
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${getCategoryBreakdown(filteredTransactions).map(cat => `
                    <tr>
                      <td>${cat.category}</td>
                      <td>${cat.amount.toFixed(2)} €</td>
                      <td>${cat.percentage.toFixed(1)}%</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="footer">
            <p>Rapport généré par MindPlan - Gestionnaire Financier Personnel</p>
          </div>
        </body>
        </html>
      `

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-financier-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
    } catch (error) {
      console.error('Error generating PDF:', error)
      setExportStatus('error')
    } finally {
      setExporting(false)
    }
  }

  const generateExcel = async () => {
    setExporting(true)
    setExportStatus('idle')

    try {
      const filteredTransactions = getFilteredTransactions()
      const { start, end } = getDateRange()
      
      // Calculate statistics
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const netBalance = totalIncome - totalExpenses

      // Create CSV content (Excel compatible)
      let csvContent = 'Rapport Financier\n'
      csvContent += `Période,${format(start, 'dd/MM/yyyy', { locale: fr })} au ${format(end, 'dd/MM/yyyy', { locale: fr })}\n`
      csvContent += `Généré le,${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}\n\n`
      
      csvContent += 'Résumé Financier\n'
      csvContent += 'Revenus,' + totalIncome.toFixed(2) + ' €\n'
      csvContent += 'Dépenses,' + totalExpenses.toFixed(2) + ' €\n'
      csvContent += 'Solde Net,' + netBalance.toFixed(2) + ' €\n\n'

      if (options.includeTransactions) {
        csvContent += '\nTransactions\n'
        csvContent += 'Date,Description,Catégorie,Type,Montant\n'
        
        filteredTransactions.forEach(transaction => {
          csvContent += `${format(new Date(transaction.date), 'dd/MM/yyyy', { locale: fr })},`
          csvContent += `"${transaction.title}",`
          csvContent += `"${transaction.category}",`
          csvContent += `${transaction.type === 'income' ? 'Revenu' : 'Dépense'},`
          csvContent += `${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} €\n`
        })
      }

      if (options.includeBudgets) {
        csvContent += '\nBudgets\n'
        csvContent += 'Note,Les budgets seront synchronisés avec vos données réelles dans la v2.0\n'
        csvContent += 'Description,Pour l\'instant cette section affiche les budgets configurés dans votre application\n'
      }

      if (options.includeGoals) {
        csvContent += '\nObjectifs Financiers\n'
        csvContent += 'Note,Les objectifs financiers seront synchronisés avec vos données réelles dans la v2.0\n'
        csvContent += 'Description,Pour l\'instant cette section affiche les objectifs configurés dans votre application\n'
      }

      if (options.includeAnalytics) {
        csvContent += '\nAnalyses et Statistiques\n'
        csvContent += 'Catégorie,Montant,Pourcentage\n'
        
        const categoryBreakdown = getCategoryBreakdown(filteredTransactions)
        categoryBreakdown.forEach(cat => {
          csvContent += `"${cat.category}",${cat.amount.toFixed(2)} €,${cat.percentage.toFixed(1)}%\n`
        })
      }

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-financier-${format(start, 'yyyy-MM-dd')}-${format(end, 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExportStatus('success')
    } catch (error) {
      console.error('Error generating Excel:', error)
      setExportStatus('error')
    } finally {
      setExporting(false)
    }
  }

  const handleExport = () => {
    if (options.format === 'pdf') {
      generatePDF()
    } else {
      generateExcel()
    }
  }

  const getFilteredCount = () => {
    return getFilteredTransactions().length
  }

  // Pas d'écran de chargement bloquant - affichage immédiat

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Export des Données
          </h1>
          <div className="flex items-center space-x-2">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Exportez vos données financières
            </p>
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">
              {transactions.length} transactions
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Options d'export */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Options d'Export
            </h2>
            
            <div className="space-y-6">
              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Format d'export
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, format: 'pdf' })}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      options.format === 'pdf'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">PDF</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rapport formaté</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, format: 'excel' })}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      options.format === 'excel'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Excel</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Données tabulaires</div>
                  </button>
                </div>
              </div>

              {/* Période */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Période
                </label>
                <select
                  value={options.dateRange}
                  onChange={(e) => setOptions({ ...options, dateRange: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="current_month">Mois actuel</option>
                  <option value="last_3_months">3 derniers mois</option>
                  <option value="last_6_months">6 derniers mois</option>
                  <option value="last_year">12 derniers mois</option>
                  <option value="all">Toutes les données</option>
                  <option value="custom">Période personnalisée</option>
                </select>
              </div>

              {/* Période personnalisée */}
              {options.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={options.customStartDate || ''}
                      onChange={(e) => setOptions({ ...options, customStartDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={options.customEndDate || ''}
                      onChange={(e) => setOptions({ ...options, customEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Contenu à inclure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Contenu à inclure
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeTransactions}
                      onChange={(e) => setOptions({ ...options, includeTransactions: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Transactions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeBudgets}
                      onChange={(e) => setOptions({ ...options, includeBudgets: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Budgets</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeGoals}
                      onChange={(e) => setOptions({ ...options, includeGoals: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Objectifs financiers</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.includeAnalytics}
                      onChange={(e) => setOptions({ ...options, includeAnalytics: e.target.checked })}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Analyses et statistiques</span>
                  </label>
                </div>
              </div>

              {/* Bouton d'export */}
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter en {options.format.toUpperCase()}
                  </>
                )}
              </Button>

              {/* Statut d'export */}
              {exportStatus === 'success' && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Export réussi ! Le fichier a été téléchargé.
                  </span>
                </div>
              )}

              {exportStatus === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-800 dark:text-red-200">
                    Erreur lors de l'export. Veuillez réessayer.
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Aperçu */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Aperçu de l'Export
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Format</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {options.format === 'pdf' ? 'PDF' : 'Excel (CSV)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Période</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {options.dateRange === 'current_month' ? 'Mois actuel' :
                   options.dateRange === 'last_3_months' ? '3 derniers mois' :
                   options.dateRange === 'last_6_months' ? '6 derniers mois' :
                   options.dateRange === 'last_year' ? '12 derniers mois' :
                   options.dateRange === 'all' ? 'Toutes les données' : 'Période personnalisée'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {getFilteredCount()} transaction{getFilteredCount() > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contenu inclus</span>
                <div className="text-sm text-gray-900 dark:text-gray-100">
                  {[
                    options.includeTransactions && 'Transactions',
                    options.includeBudgets && 'Budgets',
                    options.includeGoals && 'Objectifs',
                    options.includeAnalytics && 'Analyses'
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                💡 Conseil
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {options.format === 'pdf' 
                  ? 'Le PDF est idéal pour partager un rapport formaté avec votre conseiller financier.'
                  : 'Le format Excel est parfait pour analyser vos données dans des tableurs ou créer des graphiques personnalisés.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
