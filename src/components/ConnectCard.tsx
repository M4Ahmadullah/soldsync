'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ExternalLink, Loader2, Unplug } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EbayLogo, EtsyLogo } from './PlatformLogos'

interface ConnectCardProps {
  platform: 'ebay' | 'etsy'
  username?: string
  isConnected: boolean
}

const PLATFORM_META = {
  ebay: {
    label: 'eBay',
    description: 'Sell on the world\'s largest resale marketplace',
    connectUrl: '/api/oauth/ebay/start',
    color: 'text-[#e53238]',
    bgColor: 'bg-[#fff3f3]',
    borderColor: 'border-[#ffd0d0]',
    logo: <EbayLogo size={16} />,
  },
  etsy: {
    label: 'Etsy',
    description: 'The marketplace for unique and handmade goods',
    connectUrl: '/api/oauth/etsy/start',
    color: 'text-[#f45800]',
    bgColor: 'bg-[#fff5f0]',
    borderColor: 'border-[#ffd4b8]',
    logo: <EtsyLogo size={16} />,
  },
}

export function ConnectCard({ platform, username, isConnected }: ConnectCardProps) {
  const [loading, setLoading] = useState(false)
  const meta = PLATFORM_META[platform]

  const handleConnect = () => {
    setLoading(true)
    window.location.href = meta.connectUrl
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await fetch(`/api/oauth/${platform}/disconnect`, { method: 'POST' })
      window.location.reload()
    } catch {
      setLoading(false)
    }
  }

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isConnected && `${meta.bgColor} ${meta.borderColor}`
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isConnected ? 'bg-emerald-100' : 'bg-zinc-100'
            )}>
              {isConnected
                ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                : <Circle className="h-5 w-5 text-zinc-400" />
              }
            </div>

            {/* Platform info */}
            <div>
              <div className="flex items-center gap-2">
                {meta.logo}
                {isConnected && (
                  <Badge variant="success" className="text-xs">Connected</Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-zinc-500">
                {isConnected && username
                  ? <span>Signed in as <span className="font-medium text-zinc-700">@{username}</span></span>
                  : meta.description
                }
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="shrink-0">
            {isConnected ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-red-600"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Unplug className="mr-1.5 h-3.5 w-3.5" />
                    Disconnect
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                )}
                Connect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
