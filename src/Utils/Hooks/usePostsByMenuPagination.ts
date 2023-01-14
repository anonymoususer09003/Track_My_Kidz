import { useState, useCallback, useEffect } from 'react'
import { GetPostsByMenu } from '@/Services/Posts'
import { useSelector } from 'react-redux'
import { BlogsState } from '@/Store/Blogs'
import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [posts, setPosts] = useState<Object[]>([])
    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const [oldPosts, setOldPosts] = useState<Object[]>([])
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    const menuId = useSelector(
        (state: { blogs: BlogsState }) => state.blogs.menuId,
    )
    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetPostsByMenu((page - 1) * 10, menuId)
            setPosts([...newBlogs])
            setPage(1)
            setOldPosts([...newBlogs])
        }
        else {
            const newBlogs = await GetPostsByMenu((page - 1) * 10, menuId)
            setShouldFetch(false)
            if (newBlogs.length === 0 && oldPosts.length > 9) {
                
                setPosts([...posts, ...oldPosts])
                setPage(page + 1)
            }
            else {
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
                setOldPosts([...finalBlogs])
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
        if (searchParam !== previousSearchParam) {
            fetch(true)
        }
        if (reload) {
            fetch(true)
        }
    }, [searchParam, reload])

    return [posts, setPosts, fetchMore, searchParam, setSearchParam, reload, setReload]
}
