import React, { useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Button, TabBar } from "@ui-kitten/components";
import { Alert, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ParentChatScreen, StudentChatScreen } from "@/Screens/Chats";
import { AppHeader } from "@/Components";
import { useIsFocused } from "@react-navigation/native";
import Colors from "@/Theme/Colors";
import { useStateValue } from "@/Context/state/State";
import SetChatParam from "@/Store/chat/SetChatParams";
import { UserState } from "@/Store/User";
import { useDispatch, useSelector } from "react-redux";
// @refresh reset
const ActivityNavigator = ({ route }) => {
  console.log("route-----------", route.params);
  const isFocused = useIsFocused();
  const TabNavigator = createMaterialTopTabNavigator();
  const tabNames = ["Parents", "Participants"];
  const dispatch = useDispatch();
  const chat = useSelector((state: { user: UserState }) => state.chat.item);
  //   useEffect(() => {
  //     if (!isFocused) {
  //       dispatch(SetChatParam.action({}));
  //     }
  //   }, [isFocused]);
  //@ts-ignore
  const TopTabBar = ({ navigation, state, navRoutes }) => {
    return (
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
                style={[
                  styles.background,
                  { backgroundColor: Colors.lightgray },
                ]}
              >
                <Button
                  style={styles.buttonText}
                  appearance="ghost"
                  size="medium"
                  status="control"
                  onPress={() => {
                    dispatch(
                      SetChatParam.action({
                        ...chat,

                        subcollection:
                          state.routeNames[index] == "ParentChat"
                            ? "parent"
                            : "student",
                      })
                    );

                    navigation.navigate(state.routeNames[index], {
                      receiverUser: {},
                      chatId: 1,
                      fromChat: false,
                      ...navRoutes,
                    });
                  }}
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
                  onPress={() => {
                    dispatch(
                      SetChatParam.action({
                        ...chat,

                        subcollection:
                          state.routeNames[index] == "ParentChat"
                            ? "parent"
                            : "student",
                      })
                    );
                    navigation.navigate(state.routeNames[index], {
                      receiverUser: {},
                      chatId: 1,
                      fromChat: false,
                      ...navRoutes,
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
        isBack={true}
        title={`${route?.params?.title} Chat`}
        hideCalendar={true}
      />
      <TabNavigator.Navigator
        screenOptions={{ lazy: true, swipeEnabled: false, ...route.params }}
        tabBar={(props) => <TopTabBar {...props} {...route.params} />}
      >
        <TabNavigator.Screen
          name="ParentChat"
          options={{ title: "ParentChat" }}
          component={ParentChatScreen}
        />
        <TabNavigator.Screen
          name="StudentChat"
          options={{ title: "StudentChat" }}
          component={ParentChatScreen}
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
