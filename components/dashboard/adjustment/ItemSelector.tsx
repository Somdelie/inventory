'use client'

import React, { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ItemForAdjustment } from '@/types/adjustment'


interface ItemSelectorProps {
  items: ItemForAdjustment[]
  selectedItems: string[]
  onItemSelect: (item: ItemForAdjustment) => void
  loading: boolean
}

export default function ItemSelector({ 
  items, 
  selectedItems, 
  onItemSelect, 
  loading 
}: ItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredItems = items.filter(item => 
    !selectedItems.includes(item.id) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search items by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <RefreshCw className="h-4 w-4 animate-spin mx-auto text-gray-500" />
              <p className="text-sm text-gray-500 mt-2">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No items found matching your search' : 'No more items available'}
            </div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onItemSelect(item)
                  setSearchTerm('')
                  setIsOpen(false)
                }}
                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      SKU: {item.sku} • {item.categoryName} • {item.brandName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      Stock: {item.currentStock}
                    </div>
                    {item.reservedQuantity > 0 && (
                      <div className="text-xs text-orange-600">
                        Reserved: {item.reservedQuantity}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}