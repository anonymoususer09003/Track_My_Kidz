import {useCallback, useEffect, useState} from 'react'
import {GetFollowerPrivacy} from '@/Services/Settings'
import usePrevious from './usePrevious'
import {PrivacyFollowersDTO} from "@/Models/UserDTOs";


export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [endReached, setEndReached] = useState(false)
    const [followers, setFollowers] = useState<PrivacyFollowersDTO[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const previousSearchParam = usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    const fetch = async (isFirst = false) => {
        if (endReached) return;
        if (isFirst) {
            const newFollowers = await GetFollowerPrivacy(searchParam, 1, 20)
            const tempFollowers = newFollowers.map((x) => ({...x, checked: false}))
            setFollowers([...tempFollowers])
            setPage(1)
        } else {
            const newFollowers = await GetFollowerPrivacy(searchParam, page, 20)

            if (newFollowers.length == 0) setEndReached(true)
            let finalFollowers = [...followers]
            newFollowers.forEach((e) => {
                let found = false
                if (followers.find((itm: any) => itm.user.id === e.user.id))
                    found = true
                if (!found) {
                    let new_obj
                    new_obj = {...e, checked: false}
                    finalFollowers.push(e)
                }
            })
            setShouldFetch(false)
            setFollowers([...finalFollowers])
            setPage(page + 1)
        }
    }

    useEffect(() => {
        if (!shouldFetch) {
            return;
        }
        setTimeout(() => {
            fetch()
        }, 1000) // Give it a 1 second break
    }, [page, shouldFetch])

    useEffect(() => {
        if (searchParam !== previousSearchParam) {
            fetch(true)
        }
    }, [searchParam])

    return [followers, setFollowers, fetchMore, searchParam, setSearchParam, endReached,shouldFetch]
}
