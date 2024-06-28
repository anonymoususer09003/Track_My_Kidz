import { AppHeader, Calendar } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import SearchBar from '@/Components/SearchBar/SearchBar';
import { EditDependentModal, OtherTrackingModal, WelcomeMessageModal } from '@/Modals';
import { GetChildTrackHistory } from '@/Services/Parent';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import { Button, Text } from '@ui-kitten/components';
import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { Image, Linking, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useDispatch, useSelector } from 'react-redux';

type InstructorActivityDetailScreenProps = {
  route: any
}


const StudentLocationScreen: FC<InstructorActivityDetailScreenProps> = ({ route }) => {
  console.log('route.params', route.params);
  const focused = useIsFocused();
  const { student, parent } = route.params;
  // const navigation = useNavigation();

  const dispatch = useDispatch();

  const [thumbnail, setThumbnail] = useState<boolean>(false);
  const [searchParam, setSearchParam] = useState<string>('');
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [trackHistroy, setTrackHistory] = useState<any[]>([]);
  const [originaltrackHistroy, setOriginalTrackHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    moment(new Date()).month(),
  );
  const [selectedDay, setSelectedDay] = useState<string>(moment().format('D'));
  // const currentUser = useSelector(
  //   (state: { user: UserState }) => state.user.item
  // );

  const isCalendarVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.showCalendar,
  );
  const filterHistory = (month: any, day: any) => {
    console.log('studet', student);
    let activities: any[] = [...originaltrackHistroy];

    console.log('month', month);
    console.log('day', day);

    let temp: any[] = [];
    activities.map((item) => {
      let activmonth = moment(item?.date).format('M');

      let activeday = moment(item.date).format('D');
      if (activeday == day && activmonth == month) {
        temp.push(item);
      }
      console.log('month-', activmonth);
      console.log('day-', activeday);
    });
    setTrackHistory(temp);
  };
  const getChildrenHistory = async () => {
    try {
      let res = await GetChildTrackHistory(student.studentId);
      setTrackHistory(res);
      setOriginalTrackHistory(res);
    } catch (err) {
    }
  };
  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }

    if (focused) {
      getChildrenHistory();
    }
  }, [selectedDependent, focused]);
  console.log('trackhostro', trackHistroy);
  return (
    <BackgroundLayout>
      <OtherTrackingModal />
      <WelcomeMessageModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={setSelectedDependent}
        />
      )}
      <AppHeader
        hideCenterIcon={true}
        hideCalendar={thumbnail || false}
        // title={`${student?.firstname || ""} History`}
        // isStack
      />
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          // todo check if it works
          setSelectedMonth={(value: any) => {
            if (
              moment().format('M') <= value + 1 ||
              parseInt(moment().format('M')) - 1 == value + 1
            ) {
              setSelectedMonth(value);
              filterHistory(value, selectedDay);
            } else {
              Toast.show({
                type: 'success',
                position: 'top',
                text1: `History Tracker is only for the last 30 days`,
              });
            }
          }}
          selectedDay={parseInt(selectedDay)}
          // todo check if it works
          setSelectedDay={(value: any) => {
            setSelectedDay(value);
            filterHistory(selectedMonth, value);
          }}
        />
      )}
      <View style={{ backgroundColor: Colors.newBackgroundColor }}>
        <SearchBar
          searchText={searchParam}
          onChangeText={(value) => setSearchParam(value)}
          thumbnailView={thumbnail}
          onToggleChange={() => {
            setThumbnail(!thumbnail);
            dispatch(
              ChangeModalState.action({
                showCalendar: false,
              }),
            );
          }}
          isThumbnail
          isThumbnailOnly
        />
        <Button
          style={{
            width: 110,
            height: 40,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.primary,
            alignSelf: 'flex-end',
            marginTop: 10,
          }}
          status="basic"
          size="small"
          onPress={() => {
            Linking.openURL(
              `https://live-api.trackmykidz.com/user/parent/download-csv?studentId=${student.studentId}`,
            );
          }}
        >
          {() => <Text style={styles.buttonMessage}>Download</Text>}
        </Button>
      </View>
      <View style={styles.layout}>
        {!thumbnail ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 10,
              }}
            >
              <View style={{ width: '22%' }}>
                <Text style={{ textAlign: 'center' }}>Date</Text>
              </View>
              <View style={{ width: '22%' }}>
                <Text style={{ textAlign: 'center' }}>Time</Text>
              </View>
              <View style={{ width: '23%' }}>
                <Text style={{ textAlign: 'center' }}>Latitude</Text>
              </View>
              <View style={{ width: '23%' }}>
                <Text style={{ textAlign: 'center' }}>Longitude</Text>
              </View>
            </View>

            {trackHistroy.length == 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  height: 30,
                }}
              >
                <View
                  style={[
                    styles.rowItem,
                    { backgroundColor: '#cccccc', width: '22%' },
                  ]}
                >
                  <Text style={styles.title}>
                    {moment(new Date()).format('YYYY-MM-DD')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.rowItem,
                    { backgroundColor: '#cccccc', width: '22%' },
                  ]}
                >
                  <Text style={styles.title}>
                    {moment(new Date()).format('hh:mm')}
                  </Text>
                </View>
                <View style={[styles.rowItem, { backgroundColor: '#cccccc' }]}>
                  <Text style={styles.title}>{student?.latitude}</Text>
                </View>
                <View style={[styles.rowItem, { backgroundColor: '#cccccc' }]}>
                  <Text style={styles.title}>{student?.longititude}</Text>
                </View>
              </View>
            )}
            {trackHistroy.map((item, index) => (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  height: 30,
                }}
              >
                <View
                  style={[
                    styles.rowItem,
                    {
                      // todo check if it works
                      backgroundColor: index / 2 === 1 ? '#cccccc' : '',
                      width: 22,
                    },
                  ]}
                >
                  <Text style={styles.title}>
                    {moment(item?.date).format('YYYY-MM-DD')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.rowItem,
                    {
                      // todo check if it works
                      backgroundColor: index / 2 === 1 ? '#cccccc' : '',
                      width: 22,
                    },
                  ]}
                >
                  <Text style={styles.title}>
                    {moment(item?.date).format('hh:mm')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.rowItem,
                    // todo check if it works
                    {
                      backgroundColor: index / 2 === 1 ? '#cccccc' : '',
                      width: 22,
                    },
                  ]}
                >
                  <Text style={styles.title}>{item?.latitude}</Text>
                </View>
                <View
                  style={[
                    styles.rowItem,
                    // todo check if it works
                    {
                      backgroundColor: index / 2 === 1 ? '#cccccc' : '',
                      width: 22,
                    },
                  ]}
                >
                  <Text style={styles.title}>{item?.longititude}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <MapView
          showsUserLocation
          showsMyLocationButton
            initialRegion={{
              latitude: parseFloat(student?.latitude),
              longitude: parseFloat(student?.longititude),
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <>
              {(
                <Circle
                  center={{
                    latitude: parent?.location[0]?.parentLat
                      ? parseFloat(parent?.location[0]?.parentLat)
                      : 10,
                    longitude: parent?.location[0]?.parentLong
                      ? parseFloat(parent?.location[0]?.parentLong)
                      : 10,

                  }}
                  radius={student?.allowedDistance || 100}
                  strokeWidth={2}
                  strokeColor={'#1a66ff'}
                  fillColor={'rgba(230,238,255,0.5)'}
                />
              )}
              <Marker
                coordinate={{
                  latitude: parseFloat(student?.latitude),
                  longitude: parseFloat(student?.longititude),
                }}
              >
                <View>
                  <View
                    style={{
                      height: 35,
                      width: 35,
                      borderRadius: 80,
                      overflow: 'hidden',
                      // top: 33,
                      // zIndex: 10,
                    }}
                  >
                    {student?.studentImage == '' && (
                      <View
                        style={{
                          // height: "100%",
                          // width: "100%",
                          borderRadius: 20,
                          backgroundColor: Colors.primary,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: Colors.white }}>
                          {student?.firstname?.substring(0, 1)?.toUpperCase() ||
                            ''}
                          {student?.lastname?.substring(0, 1)?.toUpperCase() ||
                            ''}
                        </Text>
                      </View>
                    )}
                    {student?.studentImage != '' && (
                      <Image
                        source={{
                          uri: student?.studentImage,
                        }}
                        style={{
                          height: 40,
                          width: 40,
                          borderRadius: 30,
                          aspectRatio: 1.5,
                        }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  {/* <FA5 name="map-marker" size={40} color={"red"} /> */}
                </View>

         
              </Marker>
            </>
          </MapView>
        )}
      </View>
    </BackgroundLayout>
  );
};

export default StudentLocationScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
  },
  item: {
    borderRadius: 10,
    width: '96%',
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: '2%',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  calendar: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    padding: 20,
    width: '100%',
    backgroundColor: Colors.primary,
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
  rowItem: {
    width: '23%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMessage: {
    color: Colors.primary,
    fontSize: 17,
  },
  title: {
    fontSize: 15,
  },
});
