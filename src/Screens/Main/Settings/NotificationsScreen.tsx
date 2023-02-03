import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/Components";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NotificationsState } from "@/Store/Notifications";
import {
  Divider,
  Icon,
  List,
  ListItem,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { FlatList, TouchableOpacity } from "react-native";
import { UserDeleteNotifications, UserGetNotifications } from "@/Services/User";
import FetchUnreadCount from "@/Store/Notifications/FetchUnreadCount";
import { format, getDate } from "date-fns";
import Colors from "@/Theme/Colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useIsFocused } from "@react-navigation/native";
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const isFocused = useIsFocused();
  let prevOpenedRow: any;
  let row: Array<any> = [];

  const closeRow = (index) => {
    console.log(index);
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  const RightActions = (dragX: any, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          // backgroundColor: "red",
          justifyContent: "center",
          paddingVertical: 3,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            deleteNotification(item?.notificationId);
          }}
        >
          <AntDesign name="delete" color={Colors.primary} size={30} />
        </TouchableOpacity>
      </View>
    );
  };
  const getNotifications = async () => {
    try {
      let res = await UserGetNotifications();

      setNotifications(res);
    } catch (err) {
      console.log("err", err);
    }
  };
  const deleteNotification = async (id: any) => {
    try {
      prevOpenedRow?.close();
      let temp = notifications.filter((item) => item.notificationId != id);
      // console.log("temp", temp.length);
      setNotifications(temp);
      let res = await UserDeleteNotifications(id);

      // getNotifications();
    } catch (err) {
      console.log("err", err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      getNotifications();
    }
  }, [isFocused]);
  return (
    <>
      <AppHeader title="Notifications" isBack />

      {notifications.length > 0 && (
        <View>
          <FlatList
            data={notifications}
            style={{
              padding: 10,
              width: "100%",
              marginTop: 10,
              marginBottom: 20,
            }}
            keyExtractor={(item, index) => item.notificationId}
            renderItem={({ item, index }) => {
              return (
                <Swipeable
                  ref={(ref) => (row[index] = ref)}
                  // ref={swipeableRef}
                  onSwipeableOpen={() => closeRow(index)}
                  renderRightActions={(e) => RightActions(e, item, index)}
                >
                  <View style={styles.card}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.dateTime?.split(" ")[0]}
                    </Text>
                    <Text>{item?.title}</Text>
                    <Text>{item?.message}</Text>
                  </View>
                </Swipeable>
              );
            }}
            // onEndReached={async () => {
            //   console.log("logs", originalActivities.result.length);

            //   console.log("logs", totalRecords);
            //   if (totalRecords > originalActivities.result.length) {
            //     console.log("logs");
            //     const userId = await loadUserId();
            //     user?.isAdmin
            //       ? getActivities(true)
            //       : getActivitiesByUser(userId);
            //   }
            // }}
            // refreshing={false}
            // onRefresh={() => null}
          />

          {notifications && notifications.length === 0 && (
            <Text style={{ marginTop: 30, alignSelf: "center" }}>
              No notifications yet
            </Text>
          )}
        </View>
      )}
    </>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  card: {
    minHeight: 200,
    width: "100%",
    marginBottom: 5,
    // borderWidth: 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
});
