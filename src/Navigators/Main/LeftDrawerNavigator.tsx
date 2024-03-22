import React, { useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import ChangeNavigationCustomState from '@/Store/Navigation/ChangeNavigationCustomState'
import RightDrawerNavigator from '@/Navigators/Main/RightDrawerNavigator'
import { useDispatch } from 'react-redux'
import LeftDrawerContent from "@/Navigators/Main/DrawerContents/LeftDrawerContent/LeftDrawerContent";
import { View } from 'react-native';

const LeftDrawerNavigator = () => {
  const Drawer = createDrawerNavigator()
  const dispatch = useDispatch()
  let leftNavigation: any

  useEffect(() => {
    if (leftNavigation) {
      dispatch(
        ChangeNavigationCustomState.action({
          navigationLeftDrawer: leftNavigation,
        }),
      )
    }
  }, [dispatch, leftNavigation])

  return (
    <Drawer.Navigator
      drawerContent={(props) => <LeftDrawerContent {...props} />}
      screenOptions={({ navigation }) => {
        leftNavigation = navigation
        return {
          headerShown: false,
        }
      }}
    >
      <>
        <Drawer.Screen name="AccountDrawer" component={View} />
      </>
    </Drawer.Navigator>
  )
}
export default LeftDrawerNavigator
