import { useState, useCallback, useEffect } from 'react'
import { GetSharedBlogs } from '@/Services/Shared'
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from '../usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [posts, setPosts] = useState<Object[]>([])
    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    useDebouncedEffect(() => {
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3)) {
            fetch(true)
        }
    }, [searchParam], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetSharedBlogs(searchParam, 1, 10)
            setPosts([...newBlogs])
            setPage(1)
        }
        else {
            const newBlogs = await GetSharedBlogs(searchParam, page, 10)
            setShouldFetch(false)


            let finalBlogs = [...posts]
            newBlogs.forEach((e: any) => {
                let found = false
                if (posts.find((itm: any) => itm?.id === e?.id))
                    found = true
                if (!found) {
                    finalBlogs.push(e)
                }
            })
            setPosts([...finalBlogs])
            setPage(page + 1)
        }
        setReload(false)
    }
    useEffect(() => {
        if (!shouldFetch) {
            return;
        }
        setTimeout(() => {
            fetch()
        }, 1000)
    }, [page, shouldFetch])

    useEffect(() => {
        if (reload) {
            fetch(true)
        }
    }, [
        reload
    ])

    return [posts, fetchMore, searchParam, setSearchParam, reload, setReload]
}
