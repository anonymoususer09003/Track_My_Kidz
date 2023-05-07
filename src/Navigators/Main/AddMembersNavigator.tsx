import React, { useState, useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Button, TabBar } from "@ui-kitten/components";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import { AddMembersInstructorScreen, AddMembersStudentScreen } from "@/Screens";
import { AppHeader, LinearGradientButton } from "@/Components";
import Colors from "@/Theme/Colors";
import { AuthStackHeader } from "@/Components";
import BackgroundLayout from "@/Components/BackgroundLayout";

// @refresh reset
const AddMembersNavigator = ({ route }) => {
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Students", "Instructors"];
  const [activeTab, setActiveTab] = useState(1);
  const [groupDetail, setGroupDetail] = useState();
  //@ts-ignore

  const TopTabBar = ({ navigation, state, route }) => {
    return (
      <TabBar
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          // paddingVertical: 20,
          backgroundColor: Colors.newBackgroundColor,
        }}
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
              <View key={index} style={styles.background}>
                <LinearGradientButton
                  onPress={() => {
                    setActiveTab(state.index);
                    navigation.navigate(state.routeNames[index], {
                      data: route?.params?.data,
                    });
                  }}
                >
                  {tabName}
                </LinearGradientButton>
              </View>
            );
          } else {
            return (
              <View
                key={index}
                style={[styles.background, { backgroundColor: Colors.white }]}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    height: 38,
                  }}
                  onPress={() => {
                    setActiveTab(state.index);
                    navigation.navigate(state.routeNames[index], {
                      data: route?.params?.data,
                    });
                  }}
                >
                  <Text style={styles.text}>{tabName}</Text>
                </TouchableOpacity>
              </View>
            );
          }
        })}
      </TabBar>
    );
  };
  return (
    <>
      <BackgroundLayout
        title={
          route.name == "AddMembers"
            ? "Add Group Members"
            : route?.params
            ? "Edit Group"
            : `Create Group`
        }
      >
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
      </BackgroundLayout>
    </>
  );
};

export default AddMembersNavigator;
const styles = StyleSheet.create({
  background: {
    color: Colors.black,
    zIndex: -1,
    marginLeft: 10,
    marginRight: 2,
    borderRadius: 50,
    marginTop: 20,
  },
  topNav: {
    color: Colors.black,
  },
  text: {
    color: Colors.black,
    // fontWeight: "bold",
    fontSize: 18,
  },
  buttonText: {
    borderRadius: 90,
    fontFamily: "Gill Sans",
    textAlign: "center",
    color: Colors.black,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    justifyContent: "center",
    alignItems: "center",
  },
});
