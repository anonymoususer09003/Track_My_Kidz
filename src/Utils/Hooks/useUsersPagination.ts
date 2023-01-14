import { useState, useCallback, useEffect } from 'react'
import { GetUsers } from '@/Services/ContributorServices'
import { useDebouncedEffect } from "@/Utils/Hooks";
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [users, setFollowers] = useState<Object[]>([])

    const [reloadUser, setReloadUser] = useState(false)
    const [searchParamUser, setSearchParamUser] = useState<any>('')
    const previousSearchParam = usePrevious(searchParamUser)
    const fetchMoreUsers = useCallback(() => setShouldFetch(true), [])

    useDebouncedEffect(() => {
        if (searchParamUser !== previousSearchParam && (searchParamUser.length === 0 || searchParamUser.length > 3)) {
            fetch(true)
        }
    }, [searchParamUser], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            const newFollowers = await GetUsers(searchParamUser?.toLowerCase(), 1, 20)
            setFollowers([...newFollowers])
            setPage(1)
        }
        else {
            const newFollowers = await GetUsers(searchParamUser?.toLowerCase(), page, 20)
            let finalFollowers = [...users]
            newFollowers.forEach((e) => {
                let found = false
                if (users.find((itm: any) => itm?.id === e?.id))
                    found = true
                if (!found) {
                    finalFollowers.push(e)
                }
            })
            setFollowers([...finalFollowers])
            setPage(page + 1)
        }
        setShouldFetch(false)
        setReloadUser(false)
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
        if (reloadUser) {
            fetch(true)
        }
    }, [
        reloadUser
    ])

    return [users, fetchMoreUsers, searchParamUser, setSearchParamUser, reloadUser, setReloadUser]
}
