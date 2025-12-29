"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Filter, X, ChevronDown } from 'lucide-react'
import type { ReportReason } from '@/types'
import { REPORT_REASONS } from '@/lib/constants'

interface ReportFiltersProps {
  selectedReasons: ReportReason[]
  onReasonsChange: (reasons: ReportReason[]) => void
  targetType: 'listing' | 'user' | 'all'
  onTargetTypeChange: (type: 'listing' | 'user' | 'all') => void
  dateFrom?: Date
  dateTo?: Date
  onDateFromChange: (date: Date | undefined) => void
  onDateToChange: (date: Date | undefined) => void
  onClearFilters: () => void
}

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'scam', label: 'Scam/Fraud' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'fake_item', label: 'Fake Item' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'prohibited_item', label: 'Prohibited Item' },
  { value: 'other', label: 'Other' },
]

export function ReportFilters({
  selectedReasons,
  onReasonsChange,
  targetType,
  onTargetTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: ReportFiltersProps) {
  const hasActiveFilters =
    selectedReasons.length > 0 ||
    targetType !== 'all' ||
    dateFrom !== undefined ||
    dateTo !== undefined

  const toggleReason = (reason: ReportReason) => {
    if (selectedReasons.includes(reason)) {
      onReasonsChange(selectedReasons.filter((r) => r !== reason))
    } else {
      onReasonsChange([...selectedReasons, reason])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      {/* Reason Multi-Select */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Reason
            {selectedReasons.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {selectedReasons.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Report Reasons</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {REASON_OPTIONS.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedReasons.includes(option.value)}
              onCheckedChange={() => toggleReason(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Target Type Select */}
      <Select
        value={targetType}
        onValueChange={(v) => onTargetTypeChange(v as 'listing' | 'user' | 'all')}
      >
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue placeholder="Target type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Targets</SelectItem>
          <SelectItem value="listing">Listings</SelectItem>
          <SelectItem value="user">Users</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
          onChange={(e) =>
            onDateFromChange(e.target.value ? new Date(e.target.value) : undefined)
          }
          className="h-8 w-[140px]"
          placeholder="From"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="date"
          value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
          onChange={(e) =>
            onDateToChange(e.target.value ? new Date(e.target.value) : undefined)
          }
          className="h-8 w-[140px]"
          placeholder="To"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onClearFilters}
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}

      {/* Active Filter Badges */}
      {selectedReasons.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-auto">
          {selectedReasons.map((reason) => (
            <Badge
              key={reason}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleReason(reason)}
            >
              {REPORT_REASONS[reason]?.label || reason}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
