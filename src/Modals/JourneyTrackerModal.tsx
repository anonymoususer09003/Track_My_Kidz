import {
  Card,
  IndexPath,
  Modal,
  Radio,
  RadioGroup,
  Text,
  AutocompleteItem,
  // Autocomplete,
  Input,
} from '@ui-kitten/components';
import Autocomplete from '@/Components/CustomAutocomplete';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ModalState } from '@/Store/Modal';
import { GetSchool, UpdateSchool } from '@/Services/School';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { UserState } from '@/Store/User';
import { useTheme } from '@/Theme';
import { loadUserId } from '@/Storage/MainAppStorage';
import { LinearGradientButton } from '@/Components';
import { GetActivity } from '@/Services/Activity';
import { GetEtaGoogle } from '@/Services/JoruneyTracker';
import ChangeSelectedState from '@/Store/Selected/ChangeSelectedState';

import Colors from '@/Theme/Colors';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { GetAllCities, GetAllStates } from '@/Services/PlaceServices';
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';
import { PlaceState } from '@/Store/Places';
import axios from 'axios';
import { GetInstructor } from '@/Services/Instructor';
import { ScrollView } from 'react-native-gesture-handler';
const dependents = [
  {
    id: 1,
    name: 'Name one',
  },
  {
    id: 2,
    name: 'Name two',
  },
  {
    id: 3,
    name: 'Name three',
  },
];
const windowHeight = Dimensions.get('window').height;
const JourneyTrackerModal = ({ selectedActivity }: any) => {
  const [orgInfo, setOrgInfo] = useState<any>({});
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const amountValues = [
    { id: 0, amount: 500, label: '$5' },
    { id: 1, amount: 1000, label: '$10' },
    {
      id: 3,
      amount: 2000,
      label: '$20',
    },
    { id: 4, amount: 5000, label: '$50' },
    { id: 5, amount: 10000, label: '$100' },
  ];

  const { Layout } = useTheme();
  const countries = useSelector((state: { places: PlaceState }) => state.places.countries);
  const filterStates = (item: string, query: string) => {
    return item?.toLowerCase().includes(query.toLowerCase());
  };
  const filterCities = (item: string, query: string) => {
    return item?.toLowerCase().includes(query.toLowerCase());
  };
  const [selectedAmountIndex, setSelectedAmountIndex] = useState<IndexPath | null>(null);

  const [cardData, setCardData] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [payment, setPayment] = useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [countriesToData, setCountriesToData] = React.useState(countries);

  const [statesToData, setStatesToData] = React.useState<Array<any>>([]);
  const [citiesToData, setCitiesToData] = React.useState<Array<any>>([]);
  const [tostates, setToStates] = useState<Array<any>>([]);
  const [toCities, setToCities] = useState<Array<any>>([]);
  const [countriesFromData, setCountriesFromData] = React.useState(countries);
  const [statesFromData, setStatesFromData] = React.useState<Array<any>>([]);

  const [citiesFromData, setCitiesFromData] = React.useState<Array<any>>([]);
  const [fromStates, setFromStates] = useState<Array<any>>([]);
  const [fromCities, setFromCities] = useState<Array<any>>([]);
  const [selectedToLocation, setSelectedToLocation] = useState(0);
  const [activityDetail, setActivityDetail] = useState<any>({});
  const [toOthersLocation, setToOthersLocation] = useState({
    country: '',
    state: '',
    city: '',
    selectedCountry: '',
    selectedState: '',
    selectedCity: '',
    address: '',
  });
  const [fromOthersLocation, setFromOthersLocation] = useState({
    country: '',
    state: '',
    city: '',
    selectedCountry: '',
    selectedState: '',
    selectedCity: '',
    address: '',
  });
  // const [toOthersLocation, setToOthersLocation] = useState({
  //   country: "Texas",
  //   state: "Rosenberg",
  //   city: "2015 Foxgate drive",
  //   selectedCountry: "",
  //   selectedState: "",
  //   selectedCity: "",
  //   address: "4111 Sweetwater blvd, Sugar Land, Texas",
  // });
  // const [fromOthersLocation, setFromOthersLocation] = useState({
  //   country: "Texas",
  //   state: "Sugar Land",
  //   city: "4111 Sweetwater blvd",
  //   selectedCountry: "",
  //   selectedState: "",
  //   selectedCity: "",
  //   address: "2015 Foxgate drive, Rosenberg, Texas",
  // });
  const [country, setCountry] = useState('');

  const [selectedFromLocation, setSelectedFromLocation] = useState(0);
  const availableAmounts = [
    {
      amount: 1,
      label: '$50 - Annually (Best Deal)',
    },
    {
      amount: 5,
      label: '$4.99 - Monthly',
    },
  ];
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.journeyTrackerModalVisibility
  );
  const dispatch = useDispatch();
  const getEta = async (origin: any, destination: any) => {
    console.log(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=AIzaSyBBDJwlh5Mnc6Aa1l371eEOZ9G6Uc0ByWA`
    );
    try {
      let res = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=AIzaSyBBDJwlh5Mnc6Aa1l371eEOZ9G6Uc0ByWA`
      );
      console.log(JSON.stringify(res.data));
      let eta = res.data;
      let splitHours = eta.rows[0].elements[0].duration.text.includes('min')
        ? eta.rows[0].elements[0].duration.text.split('min')
        : eta.rows[0].elements[0].duration.text.split('hours');
      let splitMins = splitHours[1].split('mins');
      console.log('--eta', splitHours);
      console.log('--eta', splitMins);
      var travelTime = moment()
        .add(parseInt(splitHours[0].trim()), 'hour')
        .add(parseInt(splitHours[1].trim()), 'minute')
        .format('hh:mm A'); // it will add 642 seconds in the current time and will give time in 03:35 PM format

      getEtaTrack(travelTime);
    } catch (err) {
      console.log('err', err);
    }
  };
  const getEtaTrack = (eta: any) => {
    GetEtaGoogle(selectedActivity?.activityId, eta)
      .then((res) => {
        dispatch(
          ChangeModalState.action({
            journeyTrackerModalVisibility: false,
          })
        );
        Toast.show({
          type: 'success',
          position: 'top',
          text1: `Journey has start to {} ETA: ${eta} Parents/Guardians have been notified`,
        });
      })
      .catch((err) => {
        console.log('err', err);
      });
  };
  const getActivityDetail = () => {
    GetActivity(selectedActivity?.activityId)
      .then((res) => {
        setActivityDetail(res);
      })
      .catch((err) => {
        console.log('err-----', err);
      });
  };

  const handleGetOrganizationInfo = async () => {
    const userId = await loadUserId();
    console.log('userId', userId);
    GetInstructor(userId ? userId : '').then((res) => {
      if (res.schoolId) {
        GetSchool(res.schoolId)
          .then((org) => {
            setOrgInfo(org);
          })
          .catch((err) => console.log(err));
      }
    });
  };

  useEffect(() => {
    // getEta();
    if (isVisible) {
      handleGetOrganizationInfo();
      getActivityDetail();
      setPayment(false);
      setIsValid(false);

      // getEta();
      setSelectedAmountIndex(null);
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    let address1 = '';
    let address2 = '';

    switch (selectedToLocation) {
      case 0:
        address1 = address2 =
          orgInfo?.address + ' ' + orgInfo?.city + ' ' + orgInfo?.state + ' ' + orgInfo?.country ||
          '';
        break;
      case 1:
        address1 =
          activityDetail?.venueToAddress +
            ' ' +
            activityDetail?.venueToCity +
            ' ' +
            activityDetail?.venueToState +
            ' ' +
            activityDetail?.venueToCountry || '';
        break;
      case 2:
        address1 =
          toOthersLocation.address +
          ' ' +
          toOthersLocation.city +
          ' ' +
          toOthersLocation.state +
          ' ' +
          toOthersLocation.country;
        break;
      default:
        null;
    }
    switch (selectedFromLocation) {
      case 0:
        address2 =
          orgInfo?.address + ' ' + orgInfo?.city + ' ' + orgInfo?.state + ' ' + orgInfo?.country ||
          '';
        break;
      case 1:
        address2 =
          activityDetail?.venueToAddress +
            ' ' +
            activityDetail?.venueToCity +
            ' ' +
            activityDetail?.venueToState +
            ' ' +
            activityDetail?.venuetoCountry || '';
        break;
      case 2:
        address2 =
          fromOthersLocation.address +
          ' ' +
          fromOthersLocation.city +
          ' ' +
          fromOthersLocation.state +
          ' ' +
          fromOthersLocation.country;
        break;
      default:
        null;
    }
    getEta(address1, address2);
  };

  // @ts-ignore
  return (
    <Modal
      style={[
        styles.container,
        {
          justifyContent:
            selectedToLocation == 2 || selectedFromLocation == 2 ? 'center' : 'flex-start',
        },
      ]}
      visible={isVisible || true}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(ChangeModalState.action({ journeyTrackerModalVisibility: false }));
      }}
    >
      <KeyboardAwareScrollView style={{ height: 300 }} keyboardShouldPersistTaps="handled">
        <Card style={[styles.modal]} disabled={true}>
          <View style={styles.body}>
            <View style={{ paddingBottom: 10, paddingTop: 30 }}>
              <Text
                textBreakStrategy={'highQuality'}
                style={{
                  textAlign: 'center',
                  color: '#606060',
                  fontSize: 18,
                }}
              >
                Journey Tracker
              </Text>
            </View>
          </View>
          <Text
            textBreakStrategy={'highQuality'}
            style={{
              // textAlign: "center",
              color: '#606060',
              fontSize: 18,
            }}
          >
            Start Location
          </Text>
          <RadioGroup
            selectedIndex={selectedFromLocation}
            onChange={(index) => {
              setSelectedFromLocation(index);
            }}
          >
            <Radio>School Address</Radio>
            <Radio>Activity Address</Radio>
            <Radio>Other</Radio>
          </RadioGroup>
          {selectedFromLocation == 2 && (
            <View>
              <Autocomplete
                placeholder="Country*"
                value={fromOthersLocation.country}
                data={countriesFromData}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                // label={evaProps => <Text {...evaProps}>Country*</Text>}

                onSelect={(query) => {
                  const selectedCountry = query;

                  setFromOthersLocation({
                    ...fromOthersLocation,
                    state: '',
                    country: selectedCountry.name,
                  });

                  GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                    console.log('res000', res.data);
                    setFromStates(res.data);
                    setStatesFromData(res.data);
                  });
                }}
              />

              <Autocomplete
                placeholder="State"
                value={fromOthersLocation.state}
                data={statesFromData}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                // label={evaProps => <Text {...evaProps}>State</Text>}

                onSelect={(query) => {
                  const selectedState = query;
                  // setFromOthersLocation({
                  //   ...toOthersLocation,
                  //   state: selectedState,
                  // });
                  setFromOthersLocation({
                    ...fromOthersLocation,
                    state: selectedState,
                    city: '',
                  });

                  setFromCities([]);
                  setCitiesFromData([]);
                  GetAllCities(fromOthersLocation.country, selectedState)
                    .then((res) => {
                      console.log('res----', res);
                      setFromCities(res.data);
                      setCitiesFromData(res.data);
                    })
                    .catch((err) => console.log('err', err));
                }}
              />

              <Autocomplete
                placeholder="City"
                value={fromOthersLocation.city}
                data={citiesFromData}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                // label={evaProps => <Text {...evaProps}>City</Text>}

                onSelect={(query) => {
                  setFromOthersLocation({
                    ...fromOthersLocation,
                    city: query,
                  });
                  // setFieldValue("fromCity", citiesData[query]);
                  // setFieldValue("fromSelectedCity", citiesData[query]);
                }}
              />

              <Input
                style={{ width: '100%' }}
                placeholder="Address"
                onChangeText={(text) =>
                  setFromOthersLocation({
                    ...fromOthersLocation,
                    address: text,
                  })
                }
                value={fromOthersLocation.address}
              />
            </View>
          )}

          <Text
            textBreakStrategy={'highQuality'}
            style={{
              // textAlign: "center",
              color: '#606060',
              fontSize: 18,
            }}
          >
            End Location
          </Text>
          {selectedFromLocation == 2 && (
            <RadioGroup
              selectedIndex={selectedToLocation}
              onChange={(index) => setSelectedToLocation(index)}
            >
              <Radio>School Address</Radio>
              <Radio>Activity Address</Radio>
              {/* {selectedFromLocation != 0 && <Radio>School Address</Radio>}
          {selectedFromLocation != 1 && <Radio>Activity Address</Radio>} */}
              <Radio>Other</Radio>
            </RadioGroup>
          )}
          {selectedFromLocation == 0 && (
            <RadioGroup
              selectedIndex={selectedToLocation}
              onChange={(index) => setSelectedToLocation(index)}
            >
              <Radio>Activity Address</Radio>

              <Radio>Other</Radio>
            </RadioGroup>
          )}
          {selectedFromLocation == 1 && (
            <RadioGroup
              selectedIndex={selectedToLocation}
              onChange={(index) => setSelectedToLocation(index)}
            >
              <Radio>School Address</Radio>
              <Radio>Other</Radio>
            </RadioGroup>
          )}
          {((selectedFromLocation == 2 && selectedToLocation == 2) ||
            (selectedFromLocation != 2 && selectedToLocation == 1)) && (
            <View>
              <Autocomplete
                placeholder="Country*"
                value={toOthersLocation.country}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                // label={evaProps => <Text {...evaProps}>Country*</Text>}
                data={countriesToData}
                onSelect={(query) => {
                  const selectedCountry = query;

                  setToOthersLocation({
                    ...toOthersLocation,
                    state: '',
                    country: selectedCountry.name,
                  });
                  setToStates([]);
                  GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                    setToStates(res.data);
                    setStatesToData(res.data);
                  });
                }}
              />

              <Autocomplete
                placeholder="State"
                value={toOthersLocation.state}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                data={statesToData}
                // label={evaProps => <Text {...evaProps}>State</Text>}

                onSelect={(query) => {
                  const selectedState = query;
                  // setToOthersLocation({
                  //   ...toOthersLocation,
                  //   state: selectedState,
                  // });
                  setToOthersLocation({
                    ...toOthersLocation,
                    state: selectedState,
                    city: '',
                  });

                  setToCities([]);
                  GetAllCities(toOthersLocation.country, selectedState).then((res) => {
                    console.log('res,city', res.data);
                    setToCities(res.data);
                  });
                }}
              />

              <Autocomplete
                placeholder="City"
                value={toOthersLocation.city}
                data={toCities}
                style={{ input: styles.textInput, list: { ...styles.textInput } }}
                // label={evaProps => <Text {...evaProps}>City</Text>}

                onSelect={(query) => {
                  const selectedCity = query;
                  setToOthersLocation({
                    ...toOthersLocation,
                    city: selectedCity,
                  });
                  // setFieldValue("fromCity", citiesData[query]);
                  // setFieldValue("fromSelectedCity", citiesData[query]);
                }}
              />

              <Input
                style={{ width: '100%' }}
                placeholder="Address"
                onChangeText={(text) => setToOthersLocation({ ...toOthersLocation, address: text })}
                value={toOthersLocation.address}
              />
            </View>
          )}

          {/* <View style={[styles.buttonText, { marginVertical: 10 }]}>
          <LinearGradientButton
            style={{
              borderRadius: 25,
              flex: 1,
            }}
            appearance="ghost"
            size="medium"
            status="control"
            onPress={() => {
              dispatch(
                ChangeModalState.action({
                  journeyTrackerModalVisibility: false,
                })
              );
              Toast.show({
                type: "success",
                position: "top",
                text1: `Journey has start to {} ETA: 4:30PM Parents/Guardians have been notified`,
              });
            }}
          >
            Start journey to destination
          </LinearGradientButton>
        </View> */}
          <View style={[styles.buttonText, { marginVertical: 10 }]}>
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              status="control"
              onPress={() => {
                handleSubmit();
                // dispatch(
                //   ChangeModalState.action({
                //     journeyTrackerModalVisibility: false,
                //   })
                // );
                // Toast.show({
                //   type: "success",
                //   position: "top",
                //   text1: `Journey has start to {} ETA: 4:30PM Parents/Guardians have been notified`,
                // });
              }}
            >
              Start journey
            </LinearGradientButton>
          </View>
          <View style={[styles.buttonText, { marginTop: 20 }]}>
            <LinearGradientButton
              style={{
                borderRadius: 25,
                flex: 1,
              }}
              appearance="ghost"
              size="medium"
              status="control"
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    journeyTrackerModalVisibility: false,
                  })
                );
              }}
            >
              Cancel
            </LinearGradientButton>
          </View>
          <View style={{ marginTop: 200 }} />
        </Card>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default JourneyTrackerModal;

const styles = StyleSheet.create({
  container: {
    minHeight: windowHeight * 0.8,
    flex: 1,
    flexDirection: 'column',
    // justifyContent: "center",
    width: '90%',
    // backgroundColor: "red",
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: 'row',
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: 'row',
    height: 45,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 2,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
  },
  textInput: {
    // marginTop: 2,
    marginBottom: 10,
    alignSelf: 'center',
    width: '100%',
    borderWidth: 0.9,
    borderColor: Colors.borderColor,
    borderRadius: 6,
    elevation: 2,
    backgroundColor: Colors.textInputBackgroundColor,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
