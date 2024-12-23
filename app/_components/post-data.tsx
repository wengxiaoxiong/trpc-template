'use client'

import { RouterOutputs } from '@/server'
import { trpc } from '@/utils/trpc/client'

export default function PostData({ initialData }: { initialData?: RouterOutputs['post']['getAll'] }) {
    const { data: posts } = trpc.post.getAll.useQuery(undefined, {
        initialData,
        refetchOnMount: initialData ? false : true
    })

    return (
        <pre>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Submit
            </button>
            <div>{JSON.stringify(posts, null, 2)}</div>
        </pre>
    )
}