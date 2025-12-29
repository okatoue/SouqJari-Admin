"use client"

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MODERATION_STATUS_LABELS } from '@/lib/constants'
import { formatDateShort } from '@/lib/utils'
import { User, Mail, Phone, Calendar, AlertTriangle, ExternalLink } from 'lucide-react'
import type { Profile } from '@/types'

interface SellerCardProps {
  seller: Profile
}

export function SellerCard({ seller }: SellerCardProps) {
  const moderationInfo = MODERATION_STATUS_LABELS[seller.moderation_status]
  const initials = seller.display_name
    ? seller.display_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : seller.email?.[0]?.toUpperCase() || 'U'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Seller Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={seller.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {seller.display_name || 'No Name'}
            </p>
            <Badge
              variant={
                moderationInfo.color === 'green'
                  ? 'default'
                  : moderationInfo.color === 'red'
                  ? 'destructive'
                  : 'secondary'
              }
              className={
                moderationInfo.color === 'yellow'
                  ? 'bg-yellow-100 text-yellow-800'
                  : moderationInfo.color === 'orange'
                  ? 'bg-orange-100 text-orange-800'
                  : ''
              }
            >
              {moderationInfo.label}
            </Badge>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {seller.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{seller.email}</span>
              {seller.email_verified && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          )}
          {seller.phone_number && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{seller.phone_number}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDateShort(seller.created_at)}</span>
          </div>
        </div>

        {/* Warning Count */}
        {seller.warning_count > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <span>{seller.warning_count} warning(s)</span>
          </div>
        )}

        {/* Suspension Info */}
        {seller.moderation_status === 'suspended' && seller.suspension_until && (
          <div className="rounded-md bg-orange-50 p-2 text-sm text-orange-800">
            <p>Suspended until {formatDateShort(seller.suspension_until)}</p>
          </div>
        )}

        {/* Ban Info */}
        {seller.moderation_status === 'banned' && seller.ban_reason && (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-800">
            <p className="font-medium">Banned</p>
            <p className="mt-1 text-xs">{seller.ban_reason}</p>
          </div>
        )}

        {/* View Profile Button */}
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/users/${seller.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
