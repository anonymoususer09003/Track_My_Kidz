import React, { useState } from "react";
import { View, StyleSheet, Image, Share } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { ProfileAvatar } from "@/Components/SignUp/profile-avatar.component";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import { useDispatch, useSelector } from "react-redux";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import LogoutStore from "@/Store/Authentication/LogoutStore";
import { Avatar, Text } from "@ui-kitten/components";
import { UserState } from "@/Store/User";
import Toast from "react-native-toast-message";
import { NotificationsState } from "@/Store/Notifications";
import Colors from "@/Theme/Colors";

const RightDrawerContent = (props: any) => {
  const userData = useSelector((state: { user: UserState }) => state.user.item);

  const dispatch = useDispatch();
  const [rightDrawerOptions, setrightDrawerOptions] = useState<Array<any>>([
    {
      label: "My Profile",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/YourProfile.png"),
      route: "MyProfile",
    },
    {
      label: "Chat",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/chat-icon.png"),
      route: "Chats",
    },
    {
      label: "Notifications",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/notifications-icon.png"),
      route: "Notifications",
    },
    {
      label: "Invite Friends",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/InviteFriends.png"),
    },
    {
      label: "Contact Us",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/contact-icon.png"),
      route: "ContactUs",
    },
    {
      label: "Settings",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/settings-icon.png"),
      route: "Settings",
    },
    {
      label: "Logout",
      url: "/layout/userprofile",
      imageIcon: require("@/Assets/Images/DrawerIcons/logout.png"),
    },
  ]);

  const onShare = async () => {
    try {
      const result = await Share.share({
        url: "",
        message: `${userData?.firstName} ${userData?.lastName} (${userData?.username}) would like to invite you to TrackMyKidz. See and share TrackMyKidz from all around the world. You may download TrackMyKidz app by clicking on this link https://trackmykidz.com/apps/ OR search for TrackMyKidz on the Apple App Store or Google Play Store`,
      });
      if (result.action === Share.sharedAction) {
        Toast.show({
          type: "success",
          position: "top",
          text1: "Invite",
          text2: "Invitation has been sent.",
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
          onShow: () => {},
          onHide: () => {},
          onPress: () => {},
        });
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        <View>
          <ProfileAvatar
            style={
              userData?.pictureUrl === ""
                ? styles.profileAvatar
                : styles.profileImage
            }
            source={
              userData?.pictureUrl === ""
                ? require("@/Screens/Auth/SignUp/assets/image-person.png")
                : { uri: userData?.pictureUrl }
            }
          />
          <Text style={styles.basicDetails}>
            {userData?.firstName + " " + userData?.lastName}
          </Text>
          <Text style={styles.basicDetails}>{userData?.username}</Text>
        </View>
        <View style={styles.drawerSection}>
          {rightDrawerOptions.map((option, index) => {
            return (
              <DrawerItem
                key={index}
                label={option.label}
                style={styles.drawerItem}
                icon={() => (
                  <Image
                    source={option.imageIcon}
                    style={styles.drawerImage}
                    resizeMode="contain"
                  />
                )}
                onPress={() => {
                  if (option.label === "Logout") {
                    dispatch(LogoutStore.action());
                  } else if (
                    option.label === "Settings" ||
                    option.label === "Contact Us" ||
                    option.label === "My Profile" ||
                    option.label === "Chat" ||
                    option.label === "Notifications"
                  ) {
                    props.navigation.closeDrawer();
                    navigateAndSimpleReset(option.route);
                  } else if (option.label === "Invite Friends") {
                    props.navigation.closeDrawer();
                    onShare();
                  } else {
                    props.navigation.closeDrawer();
                    navigateAndSimpleReset("Home");
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default RightDrawerContent;
const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  profileAvatar: {
    width: Normalize(100),
    height: Normalize(100),
    borderRadius: Normalize(75),
    alignSelf: "center",
  },
  profileImage: {
    width: Normalize(100),
    height: Normalize(100),
    borderRadius: Normalize(75),
    alignSelf: "center",
  },
  basicDetails: {
    fontWeight: "bold",
    alignSelf: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  drawerSection: {
    marginTop: 15,
  },
  drawerItem: {
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  drawerImage: {
    height: 27,
    width: 27,
  },
});
