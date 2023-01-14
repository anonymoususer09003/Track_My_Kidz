import { useState, useCallback, useEffect } from 'react'
import { GetAllBlogsWithAdvertisements } from '@/Services/BlogServices'

import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [blogs, setBlogs] = useState<Object[]>([])
    const [oldBlogs, setOldBlogs] = useState<Object[]>([])
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const [reload, setReload] = useState(false)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    useDebouncedEffect(() => {
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3)) {
            fetch(true)
        }
    }, [searchParam], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetAllBlogsWithAdvertisements(searchParam.toLowerCase(), 1, 10)
            setBlogs([...newBlogs])
            setOldBlogs([...newBlogs])
            setPage(1)
        }
        else {
            const newBlogs = await GetAllBlogsWithAdvertisements(searchParam, page, 10)
            setShouldFetch(false)
            if (newBlogs.length === 0 && oldBlogs.length > 9) {
                setBlogs([...blogs, ...oldBlogs])
                setPage(page + 1)
            }
            else {
                let finalBlogs = [...blogs]
                newBlogs.forEach((e) => {
                    let found = false
                    if (blogs.find((itm: any) => itm?.id === e?.id))
                        found = true
                    if (!found) {
                        finalBlogs.push(e)
                    }
                })
                setBlogs([...finalBlogs])
                setOldBlogs([...finalBlogs])
                setPage(page + 1)
            }
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

    return [blogs, fetchMore, searchParam, setSearchParam, reload, setReload]
}
