import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Button, TabBar } from "@ui-kitten/components";
import { Alert, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ActivityScreen, GroupScreen } from "@/Screens";
import { AppHeader } from "@/Components";
import Colors from "@/Theme/Colors";
import { useStateValue } from "@/Context/state/State";

// @refresh reset
const ActivityNavigator = ({ route }) => {
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Activity", "Group"];

  const [{ childName }] = useStateValue();
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
            <View
              key={index}
              style={[styles.background, { backgroundColor: Colors.lightgray }]}
            >
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
      <AppHeader title={`${route.params.dependent.firstname}'s Events`} />
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => <TopTabBar {...props} />}
      >
        <TabNavigator.Screen
          name="Activity"
          options={{ title: "Activity" }}
          component={ActivityScreen}
        />
        <TabNavigator.Screen
          name="Group"
          options={{ title: "Groups" }}
          component={GroupScreen}
        />
      </TabNavigator.Navigator>
    </>
  );
};

export default ActivityNavigator;
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
