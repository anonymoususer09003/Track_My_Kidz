import { useState, useCallback, useEffect } from 'react'
import { GetPostsByUser } from '@/Services/Posts'

import { useSelector } from 'react-redux'
import { BlogsState } from '@/Store/Blogs'
import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [posts, setPosts] = useState<Object[]>([])
    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    const userId = useSelector(
        (state: { blogs: BlogsState }) => state.blogs.userId,
    )
    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetPostsByUser(searchParam, 1, 10, userId)
            setPosts([...newBlogs])
            setPage(1)
        }
        else {
            const newBlogs = await GetPostsByUser(searchParam, page, 10, userId)
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
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3)) {
            fetch(true)
        }
        if (reload) {
            fetch(true)
        }
    }, [searchParam, reload])

    return [posts, fetchMore, searchParam, setSearchParam, reload, setReload]
}
