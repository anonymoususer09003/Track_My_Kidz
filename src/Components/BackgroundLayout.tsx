import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Icon, Input, Select, SelectItem } from '@ui-kitten/components';
import React, { FC, useEffect, useState } from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import setHeaderParams from '@/Store/header/setHeaderParams';
import Colors from '@/Theme/Colors';
import { StudentState } from '@/Store/StudentActivity';

type BackgroundLayoutProps = {
  title?: string;
  children?: any;
  hideHeader?: boolean;
  style?: any;
  rightIcon?: any;
  dropDownList?: any;
  showDropDown?: any;
  hideLeftIcon?: any;
};
const BackgroundLayout: FC<BackgroundLayoutProps> = ({
  title,
  children,
  hideHeader,
  style,
  rightIcon,
  dropDownList,
  showDropDown,
  hideLeftIcon,
}) => {
  const searchIcon = require('@/Assets/Images/search_icon.png');
  const arrowBackIcon = require('@/Assets/Images/arrow_back.png');
  const navigation = useNavigation();
  const focused = useIsFocused();
  const dispatch = useDispatch();

  const headerState = useSelector((state: { user: any; header: any }) => state.header);

  const { showFamilyMap } = useSelector(
    (state: { studentActivity: StudentState }) => state.studentActivity
  );
  const [showSearchBar, setShowSearchBar] = useState(false);
  useEffect(() => {
    if (!focused) {
      dispatch(
        setHeaderParams.action({
          selectedDropDownOption: '',
          searchBarValue: '',
        })
      );
    }
  }, [focused]);
  const renderSearchIcon = (setShowSearchBar: any) => {
    return (
      <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
        <Image source={searchIcon} style={{ height: 15, width: 15, resizeMode: 'contain' }} />
      </TouchableOpacity>
    );
  };

  const renderIcon = (props: any) => <Icon {...props} name={'search'} />;

  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require('@/Assets/Images/App_Background.png')}
      resizeMode="stretch"
    >
      {!hideHeader && !showFamilyMap && (
        <View style={[styles.main, style && style]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            {!hideLeftIcon && <Image source={arrowBackIcon} style={{ height: 15, width: 25 }} />}
          </TouchableOpacity>

          <Text style={{ color: Colors.white, fontWeight: 'bold' }}>{title}</Text>
          <View style={{ height: 10, width: 10, paddingRight: 20 }}>
            {rightIcon && renderSearchIcon(setShowSearchBar)}
          </View>
        </View>
      )}
      {showDropDown && (
        <Select
          style={{ width: '90%', marginBottom: 10, alignSelf: 'center' }}
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
            dropDownList?.map((item: any, index: any) => (
              <SelectItem key={index} title={item?.firstname + ' ' + item?.lastname} />
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
};

export default BackgroundLayout;

const styles = StyleSheet.create({
  main: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20,
    // marginTop: 30,
  },
  searchBar: {
    width: '90%',
    marginTop: 10,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
