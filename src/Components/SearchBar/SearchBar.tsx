import { useTheme } from '@/Theme';
import Colors from '@/Theme/Colors';
import { Icon, Input } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

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
                     thumbnailView,
                     isThumbnail,
                     isThumbnailOnly,
                     thumbnail,
                   }: SearchBarProps) => {
  const { Layout } = useTheme();

  const [toggle, setToggle] = useState(false);
  const renderSearchIcon = (props: any) => <Icon {...props} name={'search'} />;

  const settingsInputCompositeIcon = require('@/Assets/Images/settings-input-composite.png');


  const handleClearSearch = () =>
    searchText && searchText.length > 0 ? (
      <TouchableOpacity
        onPress={() => onChangeText && onChangeText('')}
        style={{ flexDirection: 'column' }}
      >
        <AntDesign name="closecircle" size={20} color="gray" />
      </TouchableOpacity>
    ) : (
      <></>
    );
  useEffect(() => {
    setToggle(!!thumbnail);
  }, [thumbnail]);
  return (
    <View style={[Layout.alignItemsStart, { width: '100%', minHeight: 80 }]}>
      <View style={styles.background}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {showFilter && (
            <TouchableOpacity onPress={() => setShowDropdown && setShowDropdown(!showDropdown)}>
              <Image
                source={settingsInputCompositeIcon}
                style={{ height: 30, width: 30 }}
              />
            </TouchableOpacity>
          )}
          {isThumbnailOnly && (
            <Input
              value={searchText}
              style={{
                width: showFilter ? '65%' : isThumbnail ? '80%' : '100%',
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
              trackColor={{ false: '#767577', true: '#50CBC7' }}
              thumbColor={Colors.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                onToggleChange && onToggleChange(!thumbnailView);
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

    color: Colors.white,
    zIndex: -1,
    padding: 25,
    width: '100%',
    backgroundColor: Colors.primary,
    margin:0
  },
});
