import { useEffect, useState } from "react";
import usePrevious from "@/Utils/Hooks/usePrevious";
import { GetPosts, GetPostsByMenu, GetPostsByUser } from "@/Services/Posts";
import { PostGetDto } from "@/Models/PostDTOS/post.interface";
import { GetFavoritePosts } from "@/Services/Favorites";
import { useSelector } from "react-redux";
import { BlogsState } from "@/Store/Blogs";
import { UserState } from "@/Store/User";
import getSharedPosts from "@/Services/Shared/GetSharedPosts";
import { useDebouncedEffect } from "@/Utils/Hooks";

export default ({ menuId, viewName }: { menuId?: string, viewName: string }) => {
    const [page, setPage] = useState(1)
    const [shouldFetch, setShouldFetch] = useState(true)
    const [posts, setPosts] = useState<PostGetDto[]>([])
    const [reload, setReload] = useState(false)
    const [searchParam, setSearchParam] = useState<any>('')
    const [oldPosts, setOldPosts] = useState<PostGetDto[]>([])
    const [noPosts, setNoPosts] = useState<boolean>(false)
    const previousSearchParam = usePrevious(searchParam)
    const selectedUserId = useSelector((state: { blogs: BlogsState }) => state.blogs.userId)
    const user = useSelector((state: { user: UserState }) => state.user.item)

    useDebouncedEffect(() => {
        if (searchParam !== previousSearchParam && (searchParam.length === 0 || searchParam.length > 3 || previousSearchParam)) {
            setNoPosts(false)
            fetch(true)
        }
    }, [searchParam], 1000);

    const fetch = async (isFirst = false) => {
        if (isFirst) {
            let newPosts: any[]
            if (viewName == "FavouriteView") {
                newPosts = await GetFavoritePosts(searchParam.toLowerCase(), 1, 6)
            } else if (viewName == "ContributorView") {
                newPosts = await GetPostsByUser(searchParam.toLowerCase(), page, 6, selectedUserId)
            } else if (viewName == "MyPostsView") {
                newPosts = await GetPostsByUser(searchParam.toLowerCase(), page, 6, user.id)
            } else if (viewName == "SharedView") {
                newPosts = await getSharedPosts(searchParam.toLowerCase(), page, 6)
            } else if (menuId) {
                newPosts = await GetPostsByMenu(searchParam.toLowerCase(), (page - 1) * 6, menuId)
            } else if (searchParam.length > 2) {
                newPosts = await GetPosts(searchParam.toLowerCase(), 0)
            } else 
                newPosts = await GetPosts('', (page - 1) * 6)
            setPosts(newPosts)
            setPage(1)
            setOldPosts(newPosts)
            setNoPosts(newPosts.length == 0)
        } else {
            let newPosts = []
            if (viewName == "FavouriteView") {
                newPosts = await GetFavoritePosts(searchParam.toLowerCase(), page, 12)
            } else if (viewName == "ContributorView") {
                newPosts = await GetPostsByUser(searchParam.toLowerCase(), page, 12, selectedUserId)
            } else if (viewName == "MyPostsView") {
                newPosts = await GetPostsByUser(searchParam.toLowerCase(), page, 12, user.id)
            } else if (viewName == "SharedView") {
                newPosts = await getSharedPosts(searchParam.toLowerCase(), page, 12)
            } else if (menuId) {
                newPosts = await GetPostsByMenu(searchParam.toLowerCase(), (page - 1) * 12, menuId)
            } else if (searchParam.length > 2) {
                newPosts = await GetPosts(searchParam.toLowerCase(), 0)
            } else 
                newPosts = await GetPosts('', (page - 1) * 12)
            if (newPosts.length === 0 && oldPosts.length > 9) {
                setPosts([...posts, ...oldPosts])
            } else {
                setPosts([...posts, ...newPosts])
                setOldPosts([...posts])
                setPage(page + 1)
            }
            setShouldFetch(false)

        }
        setReload(false)
    }
    useEffect(() => {
        if (!shouldFetch) {
            return;
        }
        setTimeout(() => {
            fetch()
        }, 1200)
    }, [page, shouldFetch])

    useEffect(() => {
        if (reload) {
            setNoPosts(false)
            fetch(true)
        }
    }, [reload])

    return [posts, setPosts, shouldFetch, setShouldFetch, searchParam, setSearchParam, reload, setReload, noPosts]
}
