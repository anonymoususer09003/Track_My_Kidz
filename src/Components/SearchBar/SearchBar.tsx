import React, { useState, useEffect } from "react";
import { StyleSheet, Switch, View, TouchableOpacity } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Icon, Input } from "@ui-kitten/components";
import { useTheme } from "@/Theme";
import Colors from "@/Theme/Colors";

export interface SearchBarProps {
  onChangeText?: (nextValue: string) => void;
  onToggleChange?: (boolean: boolean) => void;
  searchText?: string;
  viewName?: string;
  thumbnailView?: boolean;
  isThumbnail?: boolean;
  isThumbnailOnly?: boolean;
  showFilter?: boolean;
  showDropdown?: boolean;
  thumbnail?: boolean;
  setShowDropdown?: (nextValue: boolean) => void;
}

const SearchBar = ({
  showDropdown,
  setShowDropdown,
  showFilter,
  searchText,
  onChangeText,
  onToggleChange,
  viewName,
  thumbnailView,
  isThumbnail,
  isThumbnailOnly,
  thumbnail,
}: SearchBarProps) => {
  const { Layout } = useTheme();

  const [toggle, setToggle] = useState(false);
  const renderSearchIcon = (props: any) => <Icon {...props} name={"search"} />;

  const handleClearSearch = () =>
    searchText && searchText.length > 0 ? (
      <TouchableOpacity
        onPress={() => onChangeText("")}
        style={{ flexDirection: "column" }}
      >
        <AntDesign name="closecircle" size={20} color="gray" />
      </TouchableOpacity>
    ) : (
      <></>
    );
  useEffect(() => {
    setToggle(thumbnail);
  }, [thumbnail]);
  return (
    <View style={[Layout.alignItemsStart, { width: "100%", minHeight: 80 }]}>
      <View style={styles.background}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {showFilter && (
            <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
              <MaterialIcons
                name="settings-input-composite"
                color="#fff"
                size={30}
              />
            </TouchableOpacity>
          )}
          {isThumbnailOnly && (
            <Input
              value={searchText}
              style={{
                width: showFilter ? "65%" : isThumbnail ? "80%" : "100%",
                marginLeft: showFilter ? 20 : 0,
              }}
              placeholder="Search"
              accessoryLeft={renderSearchIcon}
              onChangeText={onChangeText}
              accessoryRight={handleClearSearch}
            />
          )}
          {isThumbnail && (
            <Switch
              style={{ marginLeft: 20 }}
              trackColor={{ false: "#767577", true: "#50CBC7" }}
              thumbColor={Colors.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                onToggleChange(!thumbnailView);
              }}
              value={thumbnailView}
            />
          )}
        </View>
      </View>
    </View>
  );
};
export default SearchBar;

const styles = StyleSheet.create({
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    padding: 20,
    width: "100%",
    backgroundColor: Colors.primary,
  },
});
