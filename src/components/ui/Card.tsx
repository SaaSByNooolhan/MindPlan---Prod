import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false 
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700
      ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}