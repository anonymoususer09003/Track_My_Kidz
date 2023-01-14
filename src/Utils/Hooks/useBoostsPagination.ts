import {useState, useCallback, useEffect} from 'react'
import { GetAllBoosts } from '@/Services/BoostsServices'
import usePrevious from './usePrevious'

export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [boosts, setBoosts] = useState<Object[]>([])
    const [searchParam, setSearchParam] = useState<string>('')
    const previousSearchParam=usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])

    const fetch=async(isFirst=false)=>{
        if(isFirst) {
            const newBoosts = await GetAllBoosts(searchParam, 1, 10)
            setBoosts([...newBoosts])
            //setPage(1)
        }
        else{
            const newBoosts = await GetAllBoosts(searchParam, page, 10)
            setShouldFetch(false)
        let finalBoosts=[...boosts]
            newBoosts.forEach((e)=>{
                let found=false
                if(boosts.find(itm=>itm.id===e.id))
                found=true
                if(!found)
                {
                    finalBoosts.push(e)
                }
            })
            setBoosts([...finalBoosts])
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

    return [boosts, fetchMore, searchParam, setSearchParam]
}