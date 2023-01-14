import { useState, useCallback, useEffect } from 'react'
import { GetAllBlogsOfUser } from '@/Services/BlogServices'

import { useSelector } from 'react-redux'
import { BlogsState } from '@/Store/Blogs'
import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [blogs, setBlogs] = useState<Object[]>([])
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    const userId = useSelector(
        (state: { blogs: BlogsState }) => state.blogs.userId,
    )
    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetAllBlogsOfUser(searchParam, 1, 10, userId)
            setBlogs([...newBlogs])
            setPage(1)
        }
        else {
            const newBlogs = await GetAllBlogsOfUser(searchParam, page, 10, userId)
            setShouldFetch(false)
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
            setPage(page + 1)
        }
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
    }, [searchParam])

    return [blogs, fetchMore, searchParam, setSearchParam]
}
