import React from 'react'
import { ContributorScreen, UserProfile, UserBlogsScreen, CommentsScreen, ReplyCommentScreen } from '@/Screens'
import { createStackNavigator } from '@react-navigation/stack'
import CustomizedPostScreen from '@/Screens/Main/Featured/CustomizedPostScreen'
import { AuthStackHeader } from '@/Components'
const ContributorNavigatior = createStackNavigator()
const ContributorStack = () => (
    <ContributorNavigatior.Navigator
        initialRouteName="CustomizedPostScreen"
    >
        <ContributorNavigatior.Screen name="HomeScreen" component={CustomizedPostScreen} options={{ headerShown: false }} />
        <ContributorNavigatior.Screen name="SinglePostsContributor" component={ContributorScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Contributor's posts" back={true} />) }} />
        <ContributorNavigatior.Screen name="UserProfile" component={UserProfile} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Contributor's profile" back={true} />) }} />
        <ContributorNavigatior.Screen name="SingleContributorBlogs" component={UserBlogsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Contributor's blogs" back={true} />) }} />
        <ContributorNavigatior.Screen name="CommentsContributorScreen" component={CommentsScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Comments" back={true} />) }} />
        <ContributorNavigatior.Screen name="ReplyCommentContributorScreen" component={ReplyCommentScreen} options={{ header: ({ navigation }) => (<AuthStackHeader navigation={navigation} title="Reply" back={true} />) }} />


    </ContributorNavigatior.Navigator>
)
export default ContributorStack
