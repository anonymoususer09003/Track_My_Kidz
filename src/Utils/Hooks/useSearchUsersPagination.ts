import {useState, useCallback, useEffect} from 'react'
import { SearchUsers } from '@/Services/User'
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [users, setUsers] = useState<Object[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const previousSearchParam=usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    const fetch=async(isFirst=false)=>{
        if(isFirst) {
            const newUsers = await SearchUsers(searchParam, 1, 10)
            setUsers([...newUsers])
            setPage(1)
        }
        else{
            const newUsers = await SearchUsers(searchParam, page, 10)
            setShouldFetch(false)
        let finalUsers=[...users]
            newUsers.forEach((e)=>{
                let found=false
                if(users.find(itm=>itm.user.id===e.user.id))
                found=true
                if(!found)
                {
                    finalUsers.push(e)
                }
            })
            setUsers([...finalUsers])
            setPage(page+1)
        }
    }
    
    useEffect(() => {
        if(!shouldFetch) {
            return;
        }
        setTimeout(() => {
           fetch()
        },1000) // Give it a 1 second break
    }, [page, shouldFetch])

    useEffect(() => {
        if(searchParam!==previousSearchParam){
            fetch(true)
        }
    },[searchParam])

    return [users, fetchMore, searchParam, setSearchParam]
}