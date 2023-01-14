import React from 'react'
import {
    CommentsScreen, ReplyCommentScreen, MyPostsScreen
} from '@/Screens'
import { AuthStackHeader } from '@/Components'
import { createStackNavigator } from '@react-navigation/stack'
const MyPostsNavigator = createStackNavigator()
const MyPostsStack = () => (
    <MyPostsNavigator.Navigator
        initialRouteName="MyPosts"
    >
        <MyPostsNavigator.Screen name="MyPosts" component={MyPostsScreen} options={{ headerShown: false }} />
        <MyPostsNavigator.Screen name="CommentsContributorScreen" component={CommentsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Comments" back={true} />) }} />
        <MyPostsNavigator.Screen name="ReplyCommentContributorScreen" component={ReplyCommentScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Reply" back={true} />) }} />

    </MyPostsNavigator.Navigator>
)
export default MyPostsStack
