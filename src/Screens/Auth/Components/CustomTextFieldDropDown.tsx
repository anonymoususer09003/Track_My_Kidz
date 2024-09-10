import Colors from '@/Theme/Colors';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
const CustomDropdown: React.FC = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleOptionSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
  };
  useEffect(() => {
    if (props?.value) {
      setSelectedValue(props?.value);
    }
  }, [props?.value]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={props?.disable}
        style={styles.dropdownHeader}
        onPress={toggleDropdown}
      >
        {/* <PersonIcon /> */}
        <Text
          style={[
            styles.selectedValue,
            { color: selectedValue ? Colors.black : Colors.borderGrey },
          ]}
        >
          {selectedValue || props.placeholder}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.black}
          style={styles.rightIcon}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdownContainer, { zIndex: 2 }]}>
          <View style={styles.dropdownOptions}>
            <FlatList
              // nestedScrollEnabled={true}
              data={props?.dropDownList}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      props.onSelect(index);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item?.name}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            {/* <ScrollView nestedScrollEnabled={true}>
              {props?.dropDownList?.map((item, index) => {
        
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      props.onSelect(index);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item?.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView> */}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    width: '90%',

    // position: "relative",
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f7f9fc',

    height: 40,
    borderRadius: 10,
    elevation: 5,
    marginTop: 10,
    alignSelf: 'center',
    width: '90%',
  },
  leftIcon: {
    marginRight: 10,
  },
  selectedValue: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  rightIcon: {
    marginLeft: 10,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 10,
    right: 0,
    zIndex: 2,
    borderWidth: 0,
    width: '95%',
  },
  dropdownOptions: {
    marginTop: 10,
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: 'white',
    zIndex: 2,
    maxHeight: 200,
    // position: "absolute",
    // overflow: "hidden",
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 2,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default CustomDropdown;
