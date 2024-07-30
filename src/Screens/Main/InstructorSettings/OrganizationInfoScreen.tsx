import React, { FC, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useStateValue } from '@/Context/state/State';
import { useTheme } from '@/Theme';
import { AutocompleteItem, Input, Text } from '@ui-kitten/components';
import { GetAllCities, GetAllStates } from '@/Services/PlaceServices';
import { useDispatch, useSelector } from 'react-redux';
import { PlaceState } from '@/Store/Places';
import ChangeUserState from '@/Store/User/FetchOne';
import fetchOneUserService from '@/Services/User/FetchOne';
import * as yup from 'yup';
import { actions } from '@/Context/state/Reducer';
import { Formik } from 'formik';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '@/Theme/Colors';
import { GetAllInstructors, GetInstructor } from '@/Services/Instructor';

import { AppHeader, LinearGradientButton } from '@/Components';
import { UserState } from '@/Store/User';
import { GetSchool, UpdateSchool } from '@/Services/School';
import { GetOrg } from '@/Services/Org';
import { loadUserId } from '@/Storage/MainAppStorage';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import Autocomplete from '@/Components/CustomAutocomplete';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { CountryDTO } from '@/Models/CountryDTOs';

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const Divider = () => (
  <View
    style={{
      borderBottomColor: '#E0E0E0',
      borderBottomWidth: 1,
    }}
  />
);

const grades = ['ECP', 'Transition', 'Kindergander', '1st Grade', '2nd Grade'];
type OrganizationInfoScreenProps = {
  navigation: StackNavigationProp<MainStackNavigatorParamsList, 'OrganizationInfo'>;
};

const OrganizationInfoScreen: FC<OrganizationInfoScreenProps> = ({ navigation }) => {
  const [, _dispatch]: any = useStateValue();
  const { Layout } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const height = Dimensions.get('screen').height;
  const [instructors, setInstructors] = useState<any>([]);
  const dispatch = useDispatch();
  const reportAProblemValidationSchema = yup.object().shape({
    message: yup
      .string()
      .max(20, 'Name can not be more than 20 characters')
      .min(3, ({ min }) => `Name needs to be at least ${min} characters`)
      .required('Name is required'),
  });
  const [tableData, setTableData] = useState({
    tableHead: ['First Name', 'Last Name', 'Email', 'Phone', 'Admin', ' '],
    tableData: [],
    item: [],
  });
  const getInstructors = async () => {
    GetAllInstructors(0, 30)
      .then((res) => {
        formatTableData(res);
      })
      .catch((err) => {});
  };
  const formatTableData = (data: any) => {
    let temp: any = { ...tableData };
    let row: any[] = [];
    let rowItem: any[] = [];
    data.result.map((item: any, index: number) => {
      let { firstname, lastname, email, phone, isAdmin, state } = item;
      row.push([firstname, lastname, email, phone ? phone : '', isAdmin, state]);
      rowItem.push(item);
    });
    console.log('row', row);
    temp.tableData = row;
    temp.item = rowItem;
    setTableData(temp);
    // console.log("data", data);

    setInstructors(data);
  };
  const isFocused = useIsFocused();
  const [isTouched, setisTouched] = useState(false);

  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);

  const countries = useSelector((state: { places: PlaceState }) => state.places.countries);
  const currentUser = useSelector((state: { user: UserState }) => state.user.item);

  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<any[]>([]);
  const [citiesData, setCitiesData] = React.useState<any[]>([]);
  const [placement, setPlacement] = React.useState<string>('bottom');
  const [isEditMode, setisEditMode] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [addEditVisible, setaddEditVisible] = useState<boolean>(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>({});
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [orgInfo, setOrgInfo] = useState<any>(null);

  const handleGetOrganizationInfo = async () => {
    try {
      const userId = await loadUserId();

      if (!userId) return;

      let res = await GetInstructor(userId);
      console.log('res', res);

      if (res.schoolId || res.orgId) {
        let response = res.schoolId ? await GetSchool(res?.schoolId) : await GetOrg(res?.orgId);
        setOrgInfo(response);

        setInstructors({ result: response?.instructors });
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  const fetchState = async () => {
    try {
      let res = await GetAllStates(currentUser?.country);
      setStates(res.data);
      setStatesData(res.data);
    } catch (err) {
      console.log('err', err);
    }
  };
  const fetchCity = async () => {
    try {
      let res = await GetAllCities(orgInfo?.country, orgInfo?.state);
      setCities(res.data);
      setCitiesData(res.data);
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (orgInfo && isEditMode) {
      fetchState();
      fetchCity();
    }
  }, [orgInfo && isEditMode]);

  useEffect(() => {
    // getInstructors();
    if (isFocused) {
      handleGetOrganizationInfo();
    } else {
      setisEditMode(false);
    }
  }, [isFocused]);

  const admin1 =
    orgInfo && orgInfo.instructors && orgInfo.instructors.length > 0 ? orgInfo.instructors[0] : {};
  const admin2 =
    orgInfo && orgInfo.instructors && orgInfo.instructors.length > 1 ? orgInfo.instructors[1] : {};

  return (
    <BackgroundLayout title="Organization Information">
      {!orgInfo && (
        <>
          <ActivityIndicator style={{ marginTop: 50 }} color={Colors.primary} />
        </>
      )}

      {orgInfo && (
        <>
          {/* {visible && (
        <OrgInstructorsListModal
          visible={visible}
          setVisible={(value) => setVisible(value)}
        />
      )} */}
          {/* <AddInstructorOrgModal /> */}
          <AppHeader hideCalendar={true} hideCenterIcon={true} />

          <KeyboardAwareScrollView
            extraHeight={10}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flex: 1 }}
          >
            <View style={styles.layout}>
              <View style={[styles.mainLayout, { paddingLeft: 20 }]}>
                <>
                  <Formik
                    validateOnMount={true}
                    initialValues={{
                      name: orgInfo ? orgInfo.name : '',
                      address: orgInfo ? orgInfo.address : '',
                      country: orgInfo ? orgInfo.country : '',
                      selectedCountry: '',
                      selectedState: '',
                      selectedCity: '',
                      city: orgInfo ? orgInfo.city : '',
                      state: orgInfo ? orgInfo.state : '',
                      zipcode: orgInfo ? orgInfo.zipcode : '',
                      newRepresentative1: false,
                      newRepresentative2: false,
                      email1: admin1 ? admin1.email : '',
                      firstName1: admin1 ? admin1.firstname : '',
                      lastName1: admin1 ? admin1.lastname : '',
                      email2: admin2 ? admin2.email : '',
                      firstName2: admin2 ? admin2.firstname : '',
                      lastName2: admin2 ? admin2.lastname : '',

                      phone1: admin1?.phone ? admin1.phone : '',

                      phone2: admin2.phone ? admin2.phone : '',
                    }}
                    enableReinitialize
                    onSubmit={(values, { resetForm }) => {
                      dispatch(ChangeModalState.action({ loading: true }));
                      if (isEditMode) {
                        const data = {
                          id: orgInfo.schoolId,
                          name: values.name,
                          address: values.address,
                          country: values.country,
                          zipcode: values.zipcode,
                          city: values.city,
                          state: values.state,
                          grades: [],
                          representatives: [
                            {
                              id: admin1.instructorId,
                              email: values.email1,
                              firstname: values.firstName1,
                              lastname: values.lastName1,
                              type: 'school',

                              phone: values.phone1,
                            },
                            {
                              id: admin2.instructorId,
                              email: values.email2,
                              firstname: values.firstName2,
                              lastname: values.lastName2,
                              type: 'school',
                              phone: values.phone2,
                            },
                          ],
                        };
                        UpdateSchool(data)
                          .then(async (res) => {
                            setisEditMode(false);
                            dispatch(ChangeModalState.action({ loading: false }));
                            const user = await fetchOneUserService();

                            dispatch(
                              ChangeUserState.action({
                                item: { ...user, schoolName: res?.name },
                                fetchOne: { loading: false, error: null },
                              })
                            );
                            _dispatch({
                              type: actions.INSTRUCTOR_DETAIL,
                              payload: res,
                            });
                          })
                          .catch((err) => {
                            console.log(err);
                            dispatch(ChangeModalState.action({ loading: false }));
                          });
                      } else {
                        setisEditMode(true);
                        dispatch(ChangeModalState.action({ loading: false }));
                      }
                    }}
                  >
                    {({ handleChange, handleSubmit, values, errors, isValid, setFieldValue }) => (
                      <>
                        <View style={styles.formContainer}>
                          <Input
                            style={styles.textInput}
                            placeholder="School Name"
                            onChangeText={handleChange('name')}
                            value={values.name}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={styles.textInput}
                            placeholder="School Address"
                            onChangeText={handleChange('address')}
                            value={values.address}
                            disabled={!isEditMode}
                          />
                          <Input
                            style={styles.textInput}
                            placeholder="Zip/Post Code"
                            onChangeText={handleChange('zipcode')}
                            value={values.zipcode}
                            disabled={!isEditMode}
                          />
                          <Autocomplete
                            style={{
                              container: {
                                width: '95%',
                              },
                            }}
                            placeholder="Select your country"
                            value={values.country}
                            data={countriesData}
                            disabled={!isEditMode}
                            onSelect={(query) => {
                              const selectedCountry = query;
                              setFieldValue('country', selectedCountry.name);
                              setFieldValue('selectedCountry', selectedCountry.name);
                              setFieldValue('selectedState', '');
                              setFieldValue('state', '');
                              setStates([]);
                              GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                                setStates(res.data);
                                setStatesData(res.data);
                              });
                            }}
                          />

                          <Autocomplete
                            data={statesData}
                            style={{
                              container: {
                                width: '95%',
                              },
                            }}
                            value={values.state}
                            disabled={!isEditMode}
                            placeholder="Select City"
                            onSelect={(query) => {
                              const selectedState = query;
                              // const selectedState = states[(query as any).row];
                              setFieldValue('state', selectedState);
                              setFieldValue('selectedState', selectedState);
                              setFieldValue('selectedCity', '');
                              setFieldValue('city', '');
                              setCities([]);
                              GetAllCities(values.selectedCountry, selectedState).then((res) => {
                                setCities(res.data);
                                setCitiesData(res.data);
                              });
                            }}
                          />

                          <Autocomplete
                            data={citiesData}
                            style={{
                              container: {
                                width: '95%',
                              },
                            }}
                            value={values.city}
                            disabled={!isEditMode}
                            placeholder="Select City"
                            onSelect={(query: any) => {
                              const selectedCity = query;
                              setFieldValue('selectedCity', selectedCity);
                              setFieldValue('city', selectedCity);
                            }}
                          />
                          {(currentUser as any)?.isAdmin ? (
                            <>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('InstructorList', {
                                    data: orgInfo,
                                  })
                                }
                                style={styles.bottomButtons}
                              >
                                <Text style={styles.bottomButtonsText}>Instructor List</Text>
                                <Icon
                                  // style={styles.icon}
                                  size={22}
                                  // fill={Colors.gray}
                                  name="chevron-right"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  navigation.navigate('BusInfo', {
                                    data: orgInfo,
                                  })
                                }
                                style={styles.bottomButtons}
                              >
                                <Text style={styles.bottomButtonsText}>Bus Information</Text>
                                <Icon
                                  // style={styles.icon}
                                  size={22}
                                  // fill={Colors.gray}
                                  name="chevron-right"
                                />
                              </TouchableOpacity>

                              <View
                                style={{
                                  marginVertical: 30,
                                  marginRight: 20,
                                }}
                              >
                                <LinearGradientButton onPress={handleSubmit}>
                                  {isEditMode ? 'Submit' : 'Edit'}
                                </LinearGradientButton>
                              </View>
                            </>
                          ) : (
                            <View style={{ marginBottom: 100 }}></View>
                          )}
                        </View>
                      </>
                    )}
                  </Formik>
                </>
              </View>
            </View>
            <View style={{ height: 80 }} />
          </KeyboardAwareScrollView>
        </>
      )}
    </BackgroundLayout>
  );
};

export default OrganizationInfoScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sent: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  background: {
    width: '80%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: -20,
    marginBottom: 60,
  },
  selectSettings: {
    marginTop: 18,
  },
  errorText: {
    color: 'red',

    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  },
  terms: {
    color: 'text-hint-color',
    marginLeft: 10,
  },
  floatButton: {
    alignSelf: 'flex-end',
    marginRight: 10,
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    shadowColor: Colors.primary,
    shadowOffset: {
      height: 10,
      width: 10,
    },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    // marginBottom: 10,
    // borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  head: {
    height: 60,
    padding: 5,
    // width: 100,
    backgroundColor: Colors.primary,
  },
  head0: {
    height: 50,
    padding: 5,
    backgroundColor: Colors.white,
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,

    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 10,
  },
  tableView: {
    marginTop: 70,
    marginBottom: 10,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between',
    flex: 1,
    backgroundColor: Colors.primary,
  },
  icon: {
    width: 32,
    height: 32,
  },
  text: {
    // backgroundColor: 'red',
    marginVertical: 6,
    // width: 50,
    // marginHorizontal: 2,
    color: Colors.black,
    textAlign: 'center',
    fontSize: 12,
  },
  tableHeadertext: {
    textAlign: 'center',
    margin: 6,
    color: Colors.white,
  },
  tableHeadertext0: {
    textAlign: 'center',
    margin: 6,
    color: Colors.black,
  },
  regularButton: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },

  textDecoration: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  touchableRow: {
    position: 'absolute',
    height: 29,

    backgroundColor: 'transparent',
    zIndex: 1,
    bottom: 15,
  },
  cellView: {
    backgroundColor: Colors.white,

    alignItems: 'center',
  },
  textInput: {
    marginTop: 10,
    alignSelf: 'center',
    width: '95%',

    borderRadius: 8,
    elevation: 2,
    marginLeft: '-5%',
    color: Colors.black,
  },
  autoCompleteItem: {
    // elevation: 2,
    backgroundColor: 'transparent',
    width: Dimensions.get('screen').width * 0.9,
  },
  bottomButtons: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 15,
    marginTop: 20,
  },
  bottomButtonsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
