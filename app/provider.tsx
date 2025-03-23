'use client'

import React, { ReactNode } from 'react'
import { trpc } from '@/utils/trpc/client'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import SuperJSON from 'superjson'
import { ConfigProvider } from 'antd'
import { SiteConfigProvider } from './components/SiteConfigProvider'

interface ProviderProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export default function Provider({ children }: ProviderProps): JSX.Element {
    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                httpBatchLink({
                    url: '/api/trpc',
                    // optional
                    headers() {
                        return {}
                    },
                }),
            ],
            transformer: SuperJSON
        })
    })

    return (
        <ConfigProvider theme={{ token: { fontFamily: 'Nunito, sans-serif' } }}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <SiteConfigProvider>
                            {children}
                        </SiteConfigProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </trpc.Provider>
        </ConfigProvider>
    )
}