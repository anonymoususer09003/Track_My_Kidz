import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { DrawerItem, DrawerContentScrollView } from "@react-navigation/drawer";
import { Text } from "@ui-kitten/components";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ProfileAvatar } from "@/Components/SignUp/profile-avatar.component";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import FetchMenu from "@/Services/Menus/FetchMenu";
import { navigateAndSimpleReset } from "@/Navigators/Functions";
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "@/Store/User";
import ChangeSearchString from "@/Store/Blogs/ChangeSearchString";
import FastImage from "react-native-fast-image";
import Colors from "@/Theme/Colors";
const LeftDrawerContent = (props: any) => {
  const userData = useSelector((state: { user: UserState }) => state.user.item);
  const dispatch = useDispatch();
  const [leftDrawerOptions, setLeftDrawerOptions] = useState<Array<any>>([]);

  // useEffect(() => {
  //   FetchMenu().then((menu: any) => {
  //     let drawerOptions = [
  //       {
  //         label: 'Featured',
  //         value: 'Featured',
  //         url: '/layout/userprofile',
  //         imageIcon: require('@/Assets/Images/DrawerIcons/home.png'),
  //       },
  //     ]
  //     setLeftDrawerOptions(drawerOptions)
  //   })
  // }, [])

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0, marginTop: 4 }}
    >
      <View style={styles.drawerContent}>
        <View>
          <ProfileAvatar
            style={
              userData?.pictureUrl == ""
                ? styles.profileAvatar
                : styles.profileImage
            }
            source={
              userData?.pictureUrl == ""
                ? require("@/Screens/Auth/SignUp/assets/image-person.png")
                : { uri: userData?.pictureUrl }
            }
          />
          {!!userData?.firstName && (
            <Text style={styles.basicDetails}>
              {userData?.firstName + " " + userData?.lastName}
            </Text>
          )}
          <Text style={styles.basicDetails}>{userData?.username}</Text>
        </View>
        <View style={styles.drawerSection}>
          {leftDrawerOptions.map((option, index) => {
            return (
              <>
                <View style={styles.drawerContainer}>
                  <DrawerItem
                    key={index}
                    style={[styles.drawerItem, { width: "83%" }]}
                    label={option.label}
                    icon={() =>
                      option.icon ? (
                        option.imageIcon
                      ) : (
                        <FastImage
                          source={
                            !option.isMenuItem
                              ? option.imageIcon
                              : { uri: option.imageIcon }
                          }
                          style={{ height: 27, width: 27 }}
                          resizeMode="contain"
                        />
                      )
                    }
                    onPress={() => {
                      if (option.collapsible) {
                        const data = [...leftDrawerOptions];
                        const index = data.findIndex(
                          (i) => i.label === option.label
                        );
                        data[index].itemsVisible = !data[index].itemsVisible;
                        setLeftDrawerOptions([...data]);
                      } else {
                        props.navigation.closeDrawer();
                        if (option?.isMenuItem) {
                          dispatch(
                            ChangeSearchString.action({
                              menuId: option?.id,
                              screenName: option?.label,
                            })
                          );
                          navigateAndSimpleReset("CustomizedFeature");
                        } else if (option.value == "MyUploads") {
                          navigateAndSimpleReset("MyUploads");
                        } else if (option.value === "Blogs") {
                          navigateAndSimpleReset("Blogs");
                        } else if (option.value === "NeedAnswers") {
                          navigateAndSimpleReset("NeedAnswers");
                        } else if (option.value === "MyBoosts") {
                          navigateAndSimpleReset("MyBoosts");
                        } else if (option.value === "Contributor") {
                          props.navigation.closeDrawer();
                          navigateAndSimpleReset("Contributors");
                        } else if (option.value === "Country") {
                          navigateAndSimpleReset("Country");
                        } else if (option.value === "Products") {
                          navigateAndSimpleReset("Products");
                        } else if (option.value === "Favourite") {
                          navigateAndSimpleReset("Favourite");
                        } else if (option.value === "Shared") {
                          navigateAndSimpleReset("Shared");
                        } else if (option.value === "ShoppingList") {
                          navigateAndSimpleReset("ShoppingList");
                        } else {
                          navigateAndSimpleReset("Home");
                        }
                      }
                    }}
                  />
                  {option && option.items && option.itemsVisible ? (
                    <Entypo
                      name="chevron-up"
                      color={Colors.primary}
                      size={20}
                      style={{ marginRight: 30 }}
                    />
                  ) : (
                    option &&
                    option.items && (
                      <Entypo
                        name="chevron-down"
                        color={Colors.primary}
                        size={20}
                        style={{ marginRight: 30 }}
                      />
                    )
                  )}
                </View>
                {option &&
                  option.itemsVisible &&
                  option.items.map((item: any, index) => (
                    <DrawerItem
                      key={index}
                      style={[styles.drawerItemChild, { paddingLeft: 25 }]}
                      label={item.label}
                      onPress={() => {
                        props.navigation.closeDrawer();
                        navigateAndSimpleReset("CustomizedFeature");
                      }}
                    />
                  ))}
              </>
            );
          })}
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default LeftDrawerContent;
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
  row: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  drawerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  drawerItem: {
    // borderBottomColor: Colors.lightgray,
    // borderBottomWidth: 1,
  },
  drawerItemChild: {
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
