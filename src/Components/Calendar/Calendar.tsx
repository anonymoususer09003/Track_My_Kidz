import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Button, Icon, Input, Select, SelectItem } from "@ui-kitten/components";
import { useTheme } from "@/Theme";
import Colors from "@/Theme/Colors";
import moment from "moment";

export interface CalendarProps {
  selectedMonth: number;
  selectedDay: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  setSelectedDay: React.Dispatch<React.SetStateAction<number>>;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const Calendar = ({
  selectedMonth,
  setSelectedMonth,
  selectedDay,
  setSelectedDay,
}: CalendarProps) => {
  const getDays = (month: string) => {
    const year = moment(new Date()).year();
    if (
      month === "Jan" ||
      month === "Mar" ||
      month === "May" ||
      month === "Jul" ||
      month === "Aug" ||
      month === "Oct" ||
      month === "Dec"
    ) {
      const data = [];
      for (let i = 0; i < 31; i++) {
        data.push(i + 1);
      }
      return data;
    } else if (
      month === "Apr" ||
      month === "Jun" ||
      month === "Sept" ||
      month === "Nov"
    ) {
      const data = [];
      for (let i = 0; i < 30; i++) {
        data.push(i + 1);
      }
      return data;
    } else if (year % 4 === 0) {
      const data = [];
      for (let i = 0; i < 29; i++) {
        data.push(i + 1);
      }
      return data;
    } else {
      const data = [];
      for (let i = 0; i < 28; i++) {
        data.push(i + 1);
      }
      return data;
    }
  };
  const ref = useRef();
  const [days, setDays] = useState(
    getDays(months[moment(new Date()).month() - 1])
  );
  useEffect(() => {
    ref.current.scrollToIndex({ index: selectedDay, animated: true });
  }, []);

  return (
    <>
      <View style={styles.calendar}>
        <Select
          style={{ width: "30%" }}
          value={months[selectedMonth]}
          placeholder="Grade"
          onSelect={(index: any) => {
            setSelectedMonth(index.row);
            setDays(getDays(months[index.row]));
          }}
          label={(evaProps: any) => <Text {...evaProps}></Text>}
        >
          {months.map((month, index) => {
            return <SelectItem key={index} title={month} />;
          })}
        </Select>

        <View style={{ flex: 1, marginTop: 5, marginLeft: 15 }}>
          {days && (
            <FlatList
              horizontal
              ref={ref}
              keyExtractor={(item, index) => item}
              data={days}
              getItemLayout={(data, index) => {
                return { length: 33, index, offset: 33 * index };
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={selectedDay === item ? styles.selectedDay : styles.day}
                  onPress={() => setSelectedDay(item)}
                >
                  <Text
                    style={{ color: selectedDay === item ? "#fff" : "#000" }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </>
  );
};
export default Calendar;

const styles = StyleSheet.create({
  calendar: {
    // flex: 0,
    color: Colors.white,
    // zIndex: -1,
    padding: 10,
    width: "100%",
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  day: {
    width: 40,
    height: 40,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDay: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
  },
});
