import { useState, useCallback, useEffect } from 'react'
import { GetFavoriteProducts } from '@/Services/Favorites'
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from '../usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [posts, setPosts] = useState<Object[]>([])
    const [reloadPage, setReloadPage] = useState(false)
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
            const newBlogs = await GetFavoriteProducts(searchParam, 1, 10)

            setPosts([...newBlogs])
            setPage(1)
        }
        else {

            const newBlogs = await GetFavoriteProducts(searchParam, page, 10)

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
        setReloadPage(false)
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
        if (reload || reloadPage) {
            fetch(true)
        }
    }, [
        reload, 
        reloadPage
    ])

    return [posts, setPosts, reloadPage, setReloadPage, fetchMore, searchParam, setSearchParam, reload, setReload]
}
