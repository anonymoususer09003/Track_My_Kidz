import { AppHeader, Calendar } from '@/Components';
import SearchBar from '@/Components/SearchBar/SearchBar';
import { EditDependentModal, WelcomeMessageModal } from '@/Modals';
import { GetAllStudents } from '@/Services/Parent';
import FetchOne from '@/Services/User/FetchOne';
import { ModalState } from '@/Store/Modal';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { useNavigation } from '@react-navigation/native';
import { Icon, Text } from '@ui-kitten/components';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MapView, { LatLng, Marker } from 'react-native-maps';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { TEST_CHILDREN } from '@/Constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref } from 'yup';

const _children = TEST_CHILDREN;

// const months = MONTHS

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();

  const swipeableRef = useRef<any>(null);
  const dispatch = useDispatch();
  // const [initialRoute, setInitialRoute] = useState<string>('FeaturedScreen');
  // const [loading, setLoading] = useState<boolean>(true);
  const [children, setChildren] = useState<any>(_children);
  const [thumbnail, setThumbnail] = useState<boolean>(false);
  const [searchParam, setSearchParam] = useState<string>('');
  const [selectedDependent, setSelectedDependent] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(moment(new Date()).month());
  const [selectedDay, setSelectedDay] = useState(moment(new Date()).date());
  // const currentUser = useSelector(
  //   (state: { user: UserState }) => state.user.item,
  // );
  const [userLocation, setUserLocation] = useState<LatLng>({ longitude: 0, latitude: 0 });

  const loadUserDetails = async () => {
    FetchOne();
  };

  const isCalendarVisible = useSelector((state: { modal: ModalState }) => state.modal.showCalendar);

  useEffect(() => {
    loadUserDetails();
    GetAllStudents()
      .then((res) => {
        setChildren(res.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);

  const ref = useRef<MapView>();

  function navigateToMyLocation() {
    ref.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.896,
      longitudeDelta: 0.896,
    });
  }

  useEffect(() => {
    if (userLocation.longitude !== 0 || userLocation.latitude !== 0) {
      navigateToMyLocation();
    }
  }, [userLocation]);

  const RightActions = (dragX: any, item: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          //   onPress={pressRightAction}
          style={{
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome size={30} color={Colors.primary} name="plane" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('StudentLocationScreen', {
              student: item,
            })
          }
          style={{
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Entypo size={30} color={Colors.primary} name="back-in-time" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDependent(item)}
          style={{
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 30, height: 30 }} fill={Colors.primary} name="edit-2" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <WelcomeMessageModal />
      {!!selectedDependent && (
        <EditDependentModal
          selectedDependent={selectedDependent}
          setSelectedDependent={setSelectedDependent}
        />
      )}
      <AppHeader title="Home" hideCalendar />
      {isCalendarVisible && (
        <Calendar
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />
      )}
      <SearchBar
        searchText={searchParam}
        onChangeText={(value) => setSearchParam(value)}
        thumbnailView={thumbnail}
        onToggleChange={() => setThumbnail(!thumbnail)}
        isThumbnail
      />
      <View style={styles.layout}>
        {!thumbnail ? (
          <FlatList
            data={children}
            style={{ padding: 10, width: '100%' }}
            renderItem={({ item, index }) => (
              <Swipeable ref={swipeableRef} renderRightActions={(e) => RightActions(e, item)}>
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      backgroundColor:
                        index % 3 === 0 ? 'lightgreen' : index % 2 === 0 ? '#F6DDCC' : '#fff',
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate('Activity', {
                      dependent: item,
                      setThumbnail: () => setThumbnail(true),
                    })
                  }
                >
                  <Text
                    style={[styles.text, { fontWeight: '600' }]}
                  >{`${item.firstName} ${item.lastName}`}</Text>
                  <Text style={styles.text}>{`${item.schoolName}`}</Text>
                  <Text style={styles.text}>{`${item.grade}`}</Text>
                  <Text style={styles.text}>{`Status: ${item.status}`}</Text>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        ) : (
          <View style={styles.container}>
            <TouchableOpacity
              onPress={navigateToMyLocation}
              style={{
                position: 'absolute',
                bottom: 60,
                right: 10,
                zIndex: 222,
                paddingHorizontal: 10,
                paddingVertical: 9,
                borderRadius: 20,
                backgroundColor: '#fff8ff',
              }}
            >
              <Ionicons name="accessibility" style={{ fontSize: 28 }} />
            </TouchableOpacity>
            <MapView
              showsUserLocation
              showsMyLocationButton
              followsUserLocation
              //METHOD TO FETCH USER LOCATION , USE ON YOUR OWN
              onUserLocationChange={(e) => {
                setUserLocation({
                  latitude: e.nativeEvent.coordinate?.latitude || 0,
                  longitude: e.nativeEvent.coordinate?.longitude || 0,
                });
              }}
              ref={ref}
              style={{ flex: 1 }}
              initialRegion={position} // Set initial region to current position
              onLayout={() => {
                let temp = studentsEmails.filter(
                  (item: { latitude: null; longitude: null }) =>
                    item.latitude != null && item.longitude != null
                );
                ref.current.fitToCoordinates(temp, {
                  edgePadding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10,
                  },
                  animated: true,
                });
              }}
            >
              <Marker
                coordinate={{ ...userLocation }}
                title="Your Location"
                description="This is where you are"
              />
              {children.map(
                (
                  child: {
                    latitude: string;
                    longititude: string;
                    firstname: string | undefined;
                    lastname: string | undefined;
                  },
                  index: React.Key | null | undefined
                ) => {
                  const latitude = parseFloat(child.latitude);
                  const longitude = parseFloat(child.longititude);

                  // Check if latitude and longitude are valid numbers
                  if (isNaN(latitude) || isNaN(longitude)) {
                    console.log(
                      `Invalid coordinates for child ${child.firstname}:`,
                      child.latitude,
                      child.longititude
                    );
                    return null; // Skip rendering this marker
                  }

                  return (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude: latitude,
                        longitude: longitude,
                      }}
                      title={child.firstname}
                      description={child.lastname}
                    />
                  );
                }
              )}
            </MapView>
          </View>
        )}
      </View>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
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
});
