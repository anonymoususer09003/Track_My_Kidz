import {useState, useCallback, useEffect} from 'react'
import {GetPostComments} from '@/Services/Comments'

import {  useSelector } from 'react-redux'
import { BlogsState } from '@/Store/Blogs'
import usePrevious from './usePrevious'
export default () => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [comments, setComments] = useState<Object[]>([])
    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const previousSearchParam=usePrevious(searchParam)
    const fetchMore = useCallback(() => setShouldFetch(true), [])
    const postId = useSelector(
        (state: { blogs: BlogsState }) => state.blogs.postId,
    )
    const fetch=async(isFirst=false)=>{
        if(isFirst) {
            const newBlogs = await GetPostComments(searchParam, 1, 10, postId)
            setComments([...newBlogs])
            setPage(1)
        }
        else{
            const newBlogs = await GetPostComments(searchParam, page, 10,postId)
            setShouldFetch(false)
        let finalBlogs=[...comments]
            newBlogs.forEach((e:any)=>{
                let found=false
                 if(comments.find((itm:any)=>itm?.id===e?.id))
                found=true
                if(!found)
                {
                    finalBlogs.push(e)
                }
            })
            setComments([...finalBlogs])
            setPage(page+1)
        }
        setReload(false)
    }
    useEffect(() => {
        if(!shouldFetch && postId!==null && postId!=='' ) {
            return;
        }
        setTimeout(() => {
            if(postId!==null && postId!==''){
            fetch()}
         },1000)
    }, [page, shouldFetch, postId])

    useEffect(() => {
        if(searchParam!==previousSearchParam && postId!==null && postId!==''){
            fetch(true)
        }
        if(reload && postId!==null && postId!==''){
            fetch(true)
        }
    },[searchParam, reload, postId])

    return [comments, fetchMore, searchParam, setSearchParam, reload,setReload]
}
