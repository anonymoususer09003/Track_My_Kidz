import { useState, useCallback, useEffect } from 'react'
import { GetProducts } from '@/Services/ProductServices'
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [products, setProducts] = useState<Object[]>([])
    const [oldProducts, setOldProducts] = useState<Object[]>([])
    const [advertisements, setAdvertisements] = useState<Object[]>([])
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    const [reload, setReload] = useState(false)

    useDebouncedEffect(() => {
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3)) {
            fetch(true)
        }
    }, [searchParam], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newObject = await GetProducts(searchParam, 1, 10, 10)
            const newBlogs = newObject?.products?.data
            const newAdverts = newObject?.advertisements?.data
            setProducts([...newBlogs])
            setOldProducts([...newBlogs])
            setAdvertisements([...newAdverts])
            setPage(1)
        }
        else {
            const newObject = await GetProducts(searchParam, page, 10, 10)
            const newBlogs = newObject?.products?.data
            setShouldFetch(false)
            if (newBlogs.length === 0 && oldProducts.length > 9) {
                setProducts([...products, ...oldProducts])
                setPage(page + 1)
            }
            else {
                let finalBlogs = [...products]
                newBlogs.forEach((e: any) => {
                    let found = false
                    if (products.find((itm: any) => itm?.id === e?.id))
                        found = true
                    if (!found) {
                        finalBlogs.push(e)
                    }
                })
                setProducts([...finalBlogs])
                setOldProducts([...finalBlogs])
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

    return [products, fetchMore, searchParam, setSearchParam, advertisements, reload, setReload]
}
