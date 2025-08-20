import React from 'react'
import { Coins } from 'lucide-react'

interface CreditDisplayProps {
  cvCredits: number
  skripsiCredits: number
}

export function CreditDisplay({ cvCredits, skripsiCredits }: CreditDisplayProps) {
  const getCreditStyle = (credits: number) => {
    return credits <= 10 ? 'text-orange-500 font-semibold' : 'text-gray-600'
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        <Coins className="h-4 w-4 text-[#81b59a]" />
        <span className="text-gray-600">CV:</span>
        <span className={getCreditStyle(cvCredits)}>{cvCredits}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Coins className="h-4 w-4 text-[#81b59a]" />
        <span className="text-gray-600">Skripsi:</span>
        <span className={getCreditStyle(skripsiCredits)}>{skripsiCredits}</span>
      </div>
    </div>
  )
}