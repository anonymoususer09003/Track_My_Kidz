import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabBar } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';

import { ParentApprovalScreen, ParentDeclineScreen, ParentPendingScreen } from '@/Screens';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import BackgroundLayout from '@/Components/BackgroundLayout';

type ApprovalNavigatorPramList = {
  ParentApprovalScreen: undefined
  ParentDeclineScreen: undefined
  ParentPendingScreen: undefined
}

// @refresh reset
const ApprovalNavigator = () => {
  const TabNavigator = createMaterialTopTabNavigator<ApprovalNavigatorPramList>();
  const tabNames = ['Approved', 'Declined', 'Pending'];
  //@ts-ignore

  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      style={styles.toolBar}
      selectedIndex={state.index}
      indicatorStyle={{ display: 'none' }}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      {tabNames.map((tabName, index) => {
        if (state.index == index) {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton
                onPress={() => null}
                textStyle={{ fontSize: 14 }}
              >
                {tabName}
              </LinearGradientButton>
            </View>
          );
        } else {
          return (
            <View key={index} style={styles.background}>
              <LinearGradientButton
                textStyle={{ color: Colors.black, fontSize: 14 }}
                gradient={[Colors.white, Colors.white]}
                onPress={() => navigation.navigate(state.routeNames[index])}
              >
                {tabName}
              </LinearGradientButton>
            </View>
          );
        }
      })}
    </TabBar>
  );
  return (
    <BackgroundLayout title="Event Information">
      <TabNavigator.Navigator
        backBehavior="none"
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => <TopTabBar {...props} />}
      >
        <TabNavigator.Screen
          name="ParentApprovalScreen"
          options={{ title: 'Approved' }}
          component={ParentApprovalScreen}
        />
        <TabNavigator.Screen
          name="ParentDeclineScreen"
          options={{ title: 'Declined' }}
          component={ParentDeclineScreen}
        />
        <TabNavigator.Screen
          name="ParentPendingScreen"
          options={{ title: 'Pending' }}
          component={ParentPendingScreen}
        />
      </TabNavigator.Navigator>
    </BackgroundLayout>
  );
};

export default ApprovalNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,

    borderRadius: 10,
    backgroundColor: Colors.newBackgroundColor,
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.black,
    // fontWeight: "bold",
    fontSize: 18,
  },
  buttonText: {
    borderRadius: 10,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    color: Colors.white,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,

    backgroundColor: Colors.newBackgroundColor,
    width: '100%',
  },
});
