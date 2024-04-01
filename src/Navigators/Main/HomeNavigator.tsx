import React from 'react';
import { HomeScreen, ImportDependentScreen } from '@/Screens';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';

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
    <HomeNavigator.Screen name="HomeScreen" component={Placeholder} />
    <HomeNavigator.Screen name="StudentLocationScreen" component={Placeholder} />
    <HomeNavigator.Screen name="ImportDependentScreen" component={Placeholder} />
  </HomeNavigator.Navigator>
);

const Placeholder = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  return <View>
    <Text onPress={() => navigation.navigate('StudentActivity')}>
      Open test page
    </Text>
  </View>;
};

export default HomeStack;
