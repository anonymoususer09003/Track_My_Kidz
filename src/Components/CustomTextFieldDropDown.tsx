import Colors from "@/Theme/Colors";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const CustomDropdown = (props:any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleOptionSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    props.onSelect(value);
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
        style={[styles.dropdownHeader,props?.style?.customDropDown&&props?.style?.customDropDown]}
        onPress={toggleDropdown}
      >
        <Text
          style={[
            styles.selectedValue,
            { color: selectedValue ? Colors.black : Colors.borderGrey },
          ]}
        >
          {selectedValue || props.placeholder}
        </Text>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.black}
          style={styles.rightIcon}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownOptions}>
              <FlatList
                data={props?.dropDownList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => handleOptionSelect(item.name)}
                  >
                    <Text style={styles.optionText}>{item?.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f7f9fc",
    borderColor: Colors.textInputBorderColor,
    elevation: 2,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 2,
    width: "95%",
  },
  selectedValue: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  rightIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdownContainer: {
    width: "95%",
    backgroundColor: "white",
    borderRadius: 5,
    maxHeight: 200,
    elevation: 2,
  },
  dropdownOptions: {
    borderWidth: 0,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default CustomDropdown;
