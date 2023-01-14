import {Image} from "react-native";
import React from "react";
import {Icon} from "@ui-kitten/components";


export const NewChatIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/newChat.png')}
    />
}
export const NewChatTealIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/newChatOrange.png')}
    />
}
export const WebsiteGreyIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/webGrey.png')}
    />
}
export const InstagramGreyIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/instagramGrey.png')}
    />
}

export const FacebookGreyIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/facebookGrey.png')}
    />
}
export const TwitterGreyIcon = () => {
    return  <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/twitterGrey.png')}
    />
}
export const SmallBlogIcon = () => {
    return <Image
        style={{width: 25, height: 25, marginLeft: 20}}
        source={require('@/Assets/Images/blogGrey.png')}
    />
}

export const MenuToggleIcon = () => {
    return <Icon name={'more-vertical'} style={{width: 25, height: 25, marginLeft: 25}} fill="grey"/>
}
