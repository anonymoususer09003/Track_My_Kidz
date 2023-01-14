import { useState, useCallback, useEffect } from 'react'
import { GetUserFollowing } from '@/Services/ContributorServices'
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [followers, setFollowers] = useState<Object[]>([])

    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const [userId, setUserId] = useState<any>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    useDebouncedEffect(() => {
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3)) {
            fetch(true)
        }
    }, [searchParam], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newFollowers = await GetUserFollowing(userId, searchParam, 1, 20)
            setFollowers([...newFollowers])
            setPage(1)
        }
        else {
            const newFollowers = await GetUserFollowing(userId, searchParam, page, 20)
            setShouldFetch(false)
            let finalFollowers = [...followers]
            newFollowers.forEach((e) => {
                let found = false
                if (followers.find((itm: any) => itm?.id === e?.id))
                    found = true
                if (!found) {
                    finalFollowers.push(e)
                }
            })
            setFollowers([...finalFollowers])
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
        if (reload || userId) {
            fetch(true)
        }
    }, [
        reload,
        userId
    ])

    return [followers, fetchMore, searchParam, setSearchParam, reload, setReload, userId, setUserId]
}
