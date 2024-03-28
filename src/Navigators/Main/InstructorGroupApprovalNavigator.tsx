import React, { useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Button, TabBar } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { InstructorGroupApprovalScreen, InstructorGroupDeclineScreen, InstructorGroupPendingScreen } from '@/Screens';
import Colors from '@/Theme/Colors';
import SearchBar from '@/Components/SearchBar/SearchBar';

type InstructorGroupApprovalNavigatorParamList = {
  InstructorGroupApproval: undefined
  InstructorGroupDecline: undefined
  InstructorGroupPending: undefined
};

// @refresh reset
const InstructorGroupApprovalNavigator = () => {
  const TabNavigator = createMaterialTopTabNavigator<InstructorGroupApprovalNavigatorParamList>();
  const tabNames = ['Approved', 'Declined', 'Pending'];
  const [searchParam, setSearchParam] = useState('');
  //@ts-ignore
  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      selectedIndex={state.index}
      indicatorStyle={{ display: 'none' }}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      {tabNames.map((tabName, index) => {
        if (state.index == index) {
          return (
            <Button
              key={index}
              style={[
                styles.buttonText,
                styles.background,
                { backgroundColor: Colors.lightgray },
              ]}
              appearance="ghost"
              size="small"
              status="primary"
            >
              {tabName}
            </Button>
          );
        } else {
          return (
            <View key={index} style={styles.background}>
              <Button
                style={styles.buttonText}
                appearance="ghost"
                size="small"
                status="control"
                onPress={() => navigation.navigate(state.routeNames[index])}
              >
                {tabName}
              </Button>
            </View>
          );
        }
      })}
    </TabBar>
  );
  return (
    <>
      <SearchBar
        searchText={searchParam}
        onChangeText={(value) => setSearchParam(value)}
      />
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => <TopTabBar {...props} />}
      >
        <TabNavigator.Screen
          name="InstructorGroupApproval"
          options={{ title: 'Approved' }}
          component={InstructorGroupApprovalScreen}
        />
        <TabNavigator.Screen
          name="InstructorGroupDecline"
          options={{ title: 'Declined' }}
          component={InstructorGroupDeclineScreen}
        />
        <TabNavigator.Screen
          name="InstructorGroupPending"
          options={{ title: 'Pending' }}
          component={InstructorGroupPendingScreen}
        />
      </TabNavigator.Navigator>
    </>
  );
};

export default InstructorGroupApprovalNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.white,
    zIndex: -1,
    marginLeft: 2,
    marginRight: 2,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
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
});
