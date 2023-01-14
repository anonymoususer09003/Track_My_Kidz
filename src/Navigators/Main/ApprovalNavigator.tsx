import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Button, TabBar } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  ParentApprovalScreen,
  ParentDeclineScreen,
  ParentPendingScreen,
} from "@/Screens";
import { AppHeader } from "@/Components";
import Colors from "@/Theme/Colors";

// @refresh reset
const ApprovalNavigator = () => {
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Approved", "Declined", "Pending"];
  //@ts-ignore
  const TopTabBar = ({ navigation, state }) => (
    <TabBar
      selectedIndex={state.index}
      indicatorStyle={{ display: "none" }}
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
              size="medium"
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
                size="medium"
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
      <AppHeader hideCalendar={true} title={``} />
      <TabNavigator.Navigator
        backBehavior="none"
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => <TopTabBar {...props} />}
      >
        <TabNavigator.Screen
          name="ParentApprovalScreen"
          options={{ title: "Approved" }}
          component={ParentApprovalScreen}
        />
        <TabNavigator.Screen
          name="ParentDeclineScreen"
          options={{ title: "Declined" }}
          component={ParentDeclineScreen}
        />
        <TabNavigator.Screen
          name="ParentPendingScreen"
          options={{ title: "Pending" }}
          component={ParentPendingScreen}
        />
      </TabNavigator.Navigator>
    </>
  );
};

export default ApprovalNavigator;
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
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonText: {
    borderRadius: 10,
    fontFamily: "Gill Sans",
    textAlign: "center",
    color: Colors.white,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: "center",
    alignItems: "center",
  },
});
