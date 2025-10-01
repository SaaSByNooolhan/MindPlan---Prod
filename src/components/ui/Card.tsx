import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  onClick
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
        ${hover ? 'hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''}
        ${padding ? 'p-4 md:p-6' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
