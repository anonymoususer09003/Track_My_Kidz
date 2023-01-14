import {useState, useCallback, useEffect} from 'react'
import {GetMyBlogs} from '@/Services/BlogServices'

import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [blogs, setBlogs] = useState<Object[]>([])
      
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam=usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    
    const fetch=async(isFirst=false)=>{
        if(isFirst) {
            const newBlogs = await GetMyBlogs(searchParam, 1, 10)
            setBlogs([...newBlogs])
            setPage(1)
        }
        else{
            const newBlogs = await GetMyBlogs(searchParam, page, 10)
            setShouldFetch(false)
        let finalBlogs=[...blogs]
            newBlogs.forEach((e)=>{
                let found=false
                 if(blogs.find((itm:any)=>itm?.id===e?.id))
                found=true
                if(!found)
                {
                    finalBlogs.push(e)
                }
            })
            setBlogs([...finalBlogs])
            setPage(page+1)
        }
    }    
    useEffect(() => {
        if(!shouldFetch  ) {
            return;
        }           
        setTimeout(() => {
            fetch()
         },1000)
    }, [page, shouldFetch])

    useEffect(() => {
        if(searchParam!==previousSearchParam){
            fetch(true)
        }
    },[searchParam])

    return [blogs, fetchMore, searchParam, setSearchParam]
}
