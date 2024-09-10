import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '@/Components';
import React, { useEffect, useState } from 'react';
import { Text } from '@ui-kitten/components';
import { UserDeleteNotifications, UserGetNotifications } from '@/Services/User';
import Colors from '@/Theme/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useIsFocused } from '@react-navigation/native';
import BackgroundLayout from '@/Components/BackgroundLayout';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const isFocused = useIsFocused();
  let prevOpenedRow: any;
  let row: Array<any> = [];

  const closeRow = (index: number) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };
  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          // backgroundColor: "red",
          justifyContent: 'center',
          paddingVertical: 3,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
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
      console.log('err', err);
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
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (isFocused) {
      getNotifications();
    }
  }, [isFocused]);

  return (
    <BackgroundLayout title="Notifications">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />
      <View style={styles.layout}>
        {notifications.length > 0 && (
          <View>
            <FlatList
              data={notifications}
              style={{
                padding: 10,
                width: '100%',
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
                    renderRightActions={(e) => RightActions(e, item)}
                  >
                    <View style={styles.card}>
                      <Text style={styles.text}>{item?.dateTime?.split(' ')[0]}</Text>
                      <Text style={styles.text}>{item?.title}</Text>
                      <Text style={styles.text}>{item?.message}</Text>
                    </View>
                  </Swipeable>
                );
              }}
            />
          </View>
        )}
        {notifications && notifications.length === 0 && (
          <Text
            style={{
              marginTop: 30,
              alignSelf: 'center',
              color: Colors.textInputPlaceholderColor,
            }}
          >
            No notifications yet
          </Text>
        )}
      </View>
    </BackgroundLayout>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  card: {
    minHeight: 100,
    width: '100%',
    marginBottom: 5,
    // borderWidth: 2,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 2,
  },
  text: {
    fontSize: 14,
  },
});
