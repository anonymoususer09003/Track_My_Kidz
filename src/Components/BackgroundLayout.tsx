import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import { Icon, Input, Select, SelectItem } from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import Colors from "@/Theme/Colors";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import setHeaderParams from "@/Store/header/setHeaderParams";
export default function BackgroundLayout({
  title,
  children,
  hideHeader,
  style,
  rightIcon,
  dropDownList,
  showDropDown,
}: any) {
  const searchIcon = require("@/Assets/Images/search_icon.png");
  const navigation = useNavigation();
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const headerState = useSelector((state: { user: UserState }) => state.header);
  const [showSearchBar, setShowSearchBar] = useState(false);
  useEffect(() => {
    if (!focused) {
      dispatch(
        setHeaderParams.action({
          selectedDropDownOption: "",
          searchBarValue: "",
        })
      );
    }
  }, [focused]);
  const renderSearchIcon = (setShowSearchBar: any) => {
    return (
      <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
        <Image
          source={searchIcon}
          style={{ height: 15, width: 15, resizeMode: "contain" }}
        />
      </TouchableOpacity>
    );
  };

  const renderIcon = (props: any) => <Icon {...props} name={"search"} />;
  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require("@/Assets/Images/App_Background.png")}
      resizeMode="stretch"
    >
      {!hideHeader && (
        <View style={[styles.main, style && style]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcon name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={{ color: Colors.white, fontWeight: "bold" }}>
            {title}
          </Text>
          <View style={{ height: 10, width: 10, paddingRight: 20 }}>
            {rightIcon && renderSearchIcon(setShowSearchBar)}
          </View>
        </View>
      )}
      {showDropDown && (
        <Select
          style={{ width: "90%", marginBottom: 10, alignSelf: "center" }}
          value={headerState?.dropDownValue}
          placeholder="Select Name"
          onSelect={(index: any) => {
            dispatch(
              setHeaderParams.action({
                selectedDropDownOption: index,
              })
            );
          }}
          label={(evaProps: any) => <Text {...evaProps}></Text>}
        >
          <SelectItem title="All" />
          {dropDownList &&
            dropDownList.map((item, index) => (
              <SelectItem
                key={index}
                title={item?.firstname + " " + item?.lastname}
              />
            ))}
        </Select>
      )}
      {showSearchBar && (
        <Input
          //@ts-ignore
          value={headerState?.searchBarValue}
          style={styles.searchBar}
          placeholder="Search"
          accessoryLeft={renderIcon}
          onChangeText={(nextValue) => {
            dispatch(
              setHeaderParams.action({
                searchBarValue: nextValue,
              })
            );

            //@ts-ignore
            // search(nextValue);
            // setSearchParam(nextValue);
          }}
        />
      )}
      {children}
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  main: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 40,
    marginTop: 30,
  },
  searchBar: {
    width: "90%",
    marginTop: 10,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
});
