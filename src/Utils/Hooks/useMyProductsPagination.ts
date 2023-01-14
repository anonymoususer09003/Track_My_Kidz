import { useState, useCallback, useEffect } from 'react'
import { GetMyProducts } from '@/Services/ProductServices'

import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [products, setProducts] = useState<Object[]>([])

    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newBlogs = await GetMyProducts(searchParam, 1, 10)
            setProducts([...newBlogs])
            setPage(1)
        }
        else {
            const newBlogs = await GetMyProducts(searchParam, page, 10)
            setShouldFetch(false)
            let finalBlogs = [...products]
            newBlogs.forEach((e) => {
                let found = false
                if (products.find((itm: any) => itm?.id === e?.id))
                    found = true
                if (!found) {
                    finalBlogs.push(e)
                }
            })
            setProducts([...finalBlogs])
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
        
        if (searchParam !== previousSearchParam) {
            fetch(true)
        }
    }, [searchParam])

    return [products, fetchMore, searchParam, setSearchParam]
}
