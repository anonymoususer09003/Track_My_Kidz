import React from 'react'
import {
    HomeScreen, ImportDependentScreen, StudentLocationScreen
} from '@/Screens'
import { createStackNavigator } from '@react-navigation/stack'
import { AuthStackHeader } from '@/Components'

const HomeNavigatior = createStackNavigator()
const HomeStack = () => (
    <HomeNavigatior.Navigator
        initialRouteName="HomeScreen"
    >
        <HomeNavigatior.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        <HomeNavigatior.Screen name="StudentLocationScreen" component={StudentLocationScreen} options={{ headerShown: false }} />
        <HomeNavigatior.Screen name="ImportDependentScreen" component={ImportDependentScreen} options={{ headerShown: false }} />
    </HomeNavigatior.Navigator>
)
export default HomeStack
