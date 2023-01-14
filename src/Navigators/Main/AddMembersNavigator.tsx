import React, { useState, useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Button, TabBar } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";
import { GetGroup } from "@/Services/Group";
import { AddMembersInstructorScreen, AddMembersStudentScreen } from "@/Screens";
import { AppHeader } from "@/Components";
import Colors from "@/Theme/Colors";
import { AuthStackHeader } from "@/Components";

// @refresh reset
const AddMembersNavigator = ({ route }) => {
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Students", "Instructors"];
  const [activeTab, setActiveTab] = useState(1);
  const [groupDetail, setGroupDetail] = useState();
  //@ts-ignore
  console.log("909090909009", route?.params);
  const TopTabBar = ({ navigation, state, route }) => {
    console.log("route00", route);
    return (
      <TabBar
        selectedIndex={state.index}
        indicatorStyle={{ display: "none" }}
        onSelect={(index) =>
          navigation.navigate(state.routeNames[index], {
            data: route?.params?.data,
          })
        }
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
                  onPress={() => {
                    setActiveTab(state.index);
                    navigation.navigate(state.routeNames[index], {
                      data: route?.params?.data,
                    });
                  }}
                >
                  {tabName}
                </Button>
              </View>
            );
          }
        })}
      </TabBar>
    );
  };
  return (
    <>
      <AppHeader
        hideCalendar={true}
        hideApproval={true}
        // hideCalendar={activeTab == 1 ? false : true}
        // hideApproval={activeTab == 1 ? false : true}
        title={route?.params ? "Edit Group" : `Create Group`}
      />
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false }}
        tabBar={(props) => <TopTabBar {...props} route={route} />}
      >
        <TabNavigator.Screen
          name="AddMembersStudent"
          options={{ title: "Students" }}
          component={AddMembersStudentScreen}
        />
        <TabNavigator.Screen
          name="AddMembersInstructor"
          options={{ title: "Instructors" }}
          component={AddMembersInstructorScreen}
        />
      </TabNavigator.Navigator>
    </>
  );
};

export default AddMembersNavigator;
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
