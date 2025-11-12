import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'primary'
}

const StatCard = ({ title, value, icon, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900 border-blue-200',
    green: 'bg-green-50 text-green-900 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    red: 'bg-red-50 text-red-900 border-red-200',
    primary: 'bg-primary-50 text-primary-900 border-primary-200'
  }

  const cardClass = colorClasses[color] || colorClasses.primary

  return (
    <Card className={cn('border', cardClass)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {icon && <span className="text-4xl opacity-70">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
