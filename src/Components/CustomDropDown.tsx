import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Colors from '@/Theme/Colors';
import { PersonIcon } from '@/Components/SignUp/icons';

interface CustomDropdownProps {
  value?: any;
  disable?: boolean;
  placeholder?: string;
  dropDownList?: any[];
  onSelect?: (index: number) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
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
        <PersonIcon />
        <Text style={[styles.selectedValue, { color: Colors.white }]}>
          {selectedValue || props.placeholder}
        </Text>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.white}
          style={styles.rightIcon}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownOptions}>
            {props?.dropDownList?.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownOption}
                  onPress={() => {
                    props?.onSelect && props.onSelect(index);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item?.label}</Text>
                </TouchableOpacity>
              );
            })}
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
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 55,
  },
  leftIcon: {
    marginRight: 10,
  },
  selectedValue: {
    flex: 1,
  },
  rightIcon: {
    marginLeft: 10,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 2,
    borderWidth: 0,
  },
  dropdownOptions: {
    marginTop: 10,
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default CustomDropdown;
