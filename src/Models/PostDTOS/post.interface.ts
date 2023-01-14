import {Asset} from 'react-native-image-picker'
import {CurrentUserDTO} from "@/Models/UserDTOs"

export interface PostPOSTDto {
    allowComments: boolean
    allowScheduling: boolean
    allowToBuyItem: boolean
    country: string
    description: string
    disclaimer: string
    linkedBlogIds?: LinkedBlogIdsEntityOrId[]
    menuIds: number[]
    name: string
    postContents: PostContents[]
    productUrl: string
    tags: string
}

export interface LinkedBlogIdsEntityOrId {
}

export interface PostContents {
    id?: string
    mediaType: string
    mediaUrl: string
    name: string
    size?: number
    timeLength?: number
    videoLinks?: VideoLinks[]
}

export interface VideoLinks {
    id: string
    resolution: string
    url: string
}

export class PostFinalStep {
    allowComments: boolean = false
    allowScheduling: boolean = false
    allowToBuyItem: boolean = false
    country: string = ''
    description: string = ''
    disclaimer: string = ''
    linkedBlogs: PostPlainDTO[] = []
    name: string = ''
    mainAsset: Asset | undefined = {}
    extraImages: Asset[] = []
    productUrl: string = ''
    tags: string = ''
    editting: PostGetDto | null | undefined = undefined
}

export interface PostPatchDTO {
    allowComments: boolean
    allowScheduling: boolean
    country: string
    description: string
    disclaimer: string
    id: string
    menuIds: number[]
    name: string
    postContents: PostContents[]
    productUrl: string
    tags: string
}

export class ProductFinalStep {
    amount: string = ''
    currency: string = ''
    description: string = ''
    productImage: Asset = {}
    productUrl: string = ''
    itemName: string = ''
}

export class BlogFinalStep {
    allowToBuyItem: boolean = false
    blogContent: string = ''
    blogImage: Asset = {}
    linkedPosts: PostPlainDTO[] = []
    tags: string = ''
    productUrl: string = ''
    title: string = ''
}

export interface PostGetDto {
    followedByYou: boolean;
    favourite: boolean
    likedByYou: boolean
    allowComments: boolean
    allowScheduling: boolean
    allowToBuyItem: boolean
    country: string
    createdBy: string
    createdDate: Date
    description: string
    disclaimer: string
    id: string
    linkedBlogs: BlogGetDto[]
    isFlagged: boolean
    lastModifiedBy: string
    lastModifiedDate: Date
    name: string
    noLikes: number
    noViews: number
    postContents: PostContents[]
    productUrl: string
    tags: string
    user: CurrentUserDTO
    hasBlogs: boolean
}

export interface BlogGetDto {
    id: string
    createdBy: string
    createdDate: Date
    lastModifiedBy: string
    lastModifiedDate: Date
    user: CurrentUserDTO
    favourite: boolean
    flaggedByYou: boolean
    likedByYou: boolean
    followedByYou: boolean
    noLikes: number
    noViews: number
    noClicks: number
    noFlags: number
    title: string
    blogContent: string
    tags: string
    allowToBuyItem: boolean
    productUrl: string
    blogImage: PostContents
    linkedPosts: any
}

export interface PostDataTable {
    data: PostGetDto[]
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
}

export interface PostPlainDTO {
    id: string
    title: string
    description?: string
}

export interface PostBoostDTO {
    allCities: boolean
    allCountries: boolean
    allStates: boolean
    paymentIntentId: string
    places: Place[]
    postId: string
}

export interface PostBoostFreeDTO {
    allCities: boolean
    allCountries: boolean
    allStates: boolean
    amountToPay: number
    places: Place[]
    postId: string
}


export interface Place {
    place: string
    placeLevel: string
}

export interface ProductBoostDTO {
    allCities: boolean
    allCountries: boolean
    allStates: boolean
    paymentIntentId: string
    places: Place[]
    productId: string
}
