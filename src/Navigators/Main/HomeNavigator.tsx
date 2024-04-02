import React from 'react';
import { HomeScreen, ImportDependentScreen, StudentLocationScreen } from '@/Screens';
import { createStackNavigator } from '@react-navigation/stack';

export type HomeNavigationParamsList = {
  HomeScreen: undefined
  StudentLocationScreen: { student: any, parent: any }
  ImportDependentScreen: undefined
}

const HomeNavigator = createStackNavigator<HomeNavigationParamsList>();
const HomeStack = () => (
  <HomeNavigator.Navigator
    initialRouteName="HomeScreen"
    screenOptions={{ headerShown: false }}
  >
    <HomeNavigator.Screen name="HomeScreen" component={HomeScreen} />
    <HomeNavigator.Screen name="StudentLocationScreen" component={StudentLocationScreen} />
    <HomeNavigator.Screen name="ImportDependentScreen" component={ImportDependentScreen} />
  </HomeNavigator.Navigator>
);

export default HomeStack;
