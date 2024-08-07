import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserTypeState } from '@/Store/UserType';
import Colors from '@/Theme/Colors';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { Select, SelectItem } from '@ui-kitten/components';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MONTHS } from '@/Constants';

export interface CalendarProps {
  selectedMonth: number;
  selectedDay: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  setSelectedDay: React.Dispatch<React.SetStateAction<number>>;
  style?: any;
}

const months = MONTHS;

const Calendar = ({
  selectedMonth,
  setSelectedMonth,
  selectedDay,
  setSelectedDay,
  style,
}: CalendarProps) => {
  const user_type = useSelector((state: { userType: UserTypeState }) => state.userType.userType);
  const getDays = (month: string) => {
    const year = moment(new Date()).year();

    if (
      month === 'Jan' ||
      month === 'Mar' ||
      month === 'May' ||
      month === 'Jul' ||
      month === 'Aug' ||
      month === 'Oct' ||
      month === 'Dec'
    ) {
      const data = [];
      for (let i = 0; i < 31; i++) {
        data.push(i + 1);
      }
      return data;
    } else if (month === 'Apr' || month === 'Jun' || month === 'Sept' || month === 'Nov') {
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
  const isFirstRender = useRef(true);
  const ref = useRef<any>();
  const focused = useIsFocused();
  const dispatch = useDispatch();
  const [days, setDays] = useState(getDays(months[moment(new Date()).month()]));
  useEffect(() => {
    ref.current.scrollToIndex({ index: selectedDay, animated: true });
  }, []);

  const route = useRoute();
  useEffect(() => {
    if (!isFirstRender.current && !focused) {
      dispatch(
        ChangeModalState.action({
          showCalendar: false,
        })
      );
    }
    isFirstRender.current = false;
  }, [focused]);

  return (
    <>
      <View style={[styles.calendar, style && style]}>
        <Select
          style={{ width: '30%' }}
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

        <View
          style={{
            flex: 1,
            marginTop: Platform.OS == 'android' ? 5 : 0,
            marginLeft: 15,
          }}
        >
          {days && (
            <FlatList
              horizontal
              ref={ref}
              data={days}
              getItemLayout={(data, index) => {
                return { length: 33, index, offset: 33 * index };
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={selectedDay === item ? styles.selectedDay : styles.day}
                  onPress={() => setSelectedDay(item)}
                >
                  <Text style={{ color: selectedDay === item ? '#fff' : '#000' }}>{item}</Text>
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
    width: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  day: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
  },
});
