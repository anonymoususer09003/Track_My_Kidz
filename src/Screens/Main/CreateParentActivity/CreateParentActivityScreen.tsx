import { LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { AddIndividialMembersModal, GroupSelectionModal } from '@/Modals';
import { CreateActivity } from '@/Services/Activity';
import { GetAllCities, GetAllStates } from '@/Services/PlaceServices';
import { GetAllStudents } from '@/Services/Student';
import Colors from '@/Theme/Colors';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Autocomplete from '@/Components/CustomAutocomplete';
import {
  AutocompleteItem,
  CheckBox,
  Datepicker,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Text,
} from '@ui-kitten/components';
import { Formik } from 'formik';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackNavigatorParamsList } from '@/Navigators/Main/RightDrawerNavigator';
import { TIME_STAMP, WEEK_DAYS } from '@/Constants';
import { CountryDTO } from '@/Models/CountryDTOs';
import { TimeStampSelect } from '@/Components/TimeStampSelect/TimeStampSelect';
import { CustomTextDropDown } from '@/Components';

const _days = WEEK_DAYS;
const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const CreateParentActivityScreen = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<StackNavigationProp<MainStackNavigatorParamsList>>();
  const currentUser = useSelector((state: any) => state.user.item);
  console.log('current User', currentUser);
  // const dispatch = useDispatch();
  const [days, setDays] = useState(_days);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [timeSelectedIndex, setTimeSelectedIndex] = useState<number>(0);
  // const [selectedDay, setSelectedDay] = useState("");
  const [askPermission, setAskPermission] = useState<boolean>(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const countries: any[] = useSelector((state: { places: any }) => state.places.countries);
  const [statesData, setStatesData] = React.useState<any[]>([]);
  const [citiesData, setCitiesData] = React.useState<any[]>([]);
  const [countriesData, setCountriesData] = React.useState<any[]>(countries);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedStudentIndexNew, setSelectedStudentIndex] = useState<any[]>([]);
  const timeStamp = TIME_STAMP;

  let selectedStudentIndex: any[] = [];
  const [fromCheckBox, setFromCheckBox] = useState<boolean>(false);
  const [toCheckBox, setToCheckBox] = useState<boolean>(false);
  const handleRemoveStudent = (item: any) => {
    let data = [...students];
    data = data.filter((d) => d.parent1_email !== item.parent1_email);
    setStudents(data);
  };

  const handleRemoveGroup = (item: any) => {
    let data = [...groups];
    data = data.filter((d) => d.id !== item.id);
    setGroups(data);
  };

  const handleGetStudents = () => {
    GetAllStudents()
      .then((res) => {
        setStudentsData(res.result);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  useEffect(() => {
    if (isFocused) {
      handleGetStudents();
    } else {
      setToCheckBox(false);
      setFromCheckBox(false);
      setSelectedIndex(0);
    }
  }, [isFocused]);

  return (
    <BackgroundLayout title="Create Event">
      <GroupSelectionModal individuals={groups} setIndividuals={setGroups} />
      <AddIndividialMembersModal individuals={students} setIndividuals={setStudents} />

      <ScrollView style={styles.layout} keyboardShouldPersistTaps="handled">
        <Formik
          validateOnMount={true}
          initialValues={{
            name: '',
            activityType: '',
            from: new Date(),
            fromTime: '',
            to: new Date(),
            toTime: '',
            fromVenueName: '',
            fromAddress: '',
            fromCity: '',
            fromSelectedCity: '',
            fromState: '',
            fromSelectedState: '',
            fromZipCode: '',
            venueName: '',
            address: '',
            city: '',
            selectedCity: '',
            state: '',
            selectedState: '',
            zipCode: '',
            instructions: '',
            disclaimer: '',
            agreement: '',
            starting: new Date(),
            startingFrom: '',
            startingTo: '',
            students: '',
            noEnd: false,
          }}
          onSubmit={async (values, { resetForm }) => {
            const fromTime =
              values.fromTime.length > 0
                ? values.fromTime.includes('AM')
                  ? values.fromTime.split('AM')[0]
                  : parseInt(values.fromTime.split(':')[0], 0) +
                    12 +
                    ':' +
                    values.fromTime.split(':')[1].split('PM')[0]
                : '';
            const toTime =
              values.toTime.length > 0
                ? values.toTime.includes('AM')
                  ? values.toTime.split('AM')[0]
                  : parseInt(values.toTime.split(':')[0], 0) +
                    12 +
                    ':' +
                    values.toTime.split(':')[1].split('PM')[0]
                : '';
            const fromDateTime =
              fromTime.length > 0
                ? moment(values.from).format('yyyy-MM-DD') + 'T' + fromTime + ':00.000Z'
                : values.from;
            const toDateTime =
              toTime.length > 0
                ? moment(values.to).format('yyyy-MM-DD') + 'T' + toTime + ':00.000Z'
                : values.to;
            const unixFrom = moment(fromDateTime).unix();
            const unixTo = moment(toDateTime).unix();
            const data = {
              name: values.name,
              requestPermission: askPermission,
              type: selectedIndex === 2 ? 'trip' : 'activity',
              where: values.venueName,
              address: values.address,
              venueToName: values.venueName,
              venueToAddress: values.address,
              venueToCity: values.city,
              venueToState: values.state,
              venueToZip: values.zipCode,
              venueFromName: values.fromVenueName,
              venueFromAddress: values.fromAddress,
              venueFromCity: values.fromCity,
              venueFromState: values.fromState,
              venueFromZip: values.fromZipCode,
              students: [],
              instructors: [],
              groups: groups.map((g) => g.groupId),
              schedule: {
                id: 0,
                recurrence: timeSelectedIndex === 2 ? 1 : 0,
                fromDate: unixFrom,
                toDate: values.noEnd ? '9999-12-31T12:00.000Z' : unixTo,
                days: timeSelectedIndex === 2 ? days.map((d) => (d.selected ? 1 : 0)).join('') : 0,
                status: 'enabled',
              },
              optin: {
                instructions: values.instructions,
                disclaimer: values.disclaimer,
                agreement: values.agreement,
                status: true,
              },
              journey: {
                journeyStartToDestination: '',
                journeyStartToOrgin: '',
                eta: 0,
                id: 0,
              },
            };
            CreateActivity(data)
              .then((res) => {
                resetForm();
                Toast.show({
                  type: 'success',
                  text2: 'Activity has been successfully created',
                });
                setGroups([]);
                setStudents([]);
                setAskPermission(false);
                setToCheckBox(false);
                setFromCheckBox(false);
                setSelectedIndex(0);
                navigation.goBack();
              })
              .catch((err) => {
                Toast.show({
                  type: 'info',
                  text2: 'Something went wrong',
                });
              });
          }}
        >
          {({ handleChange, handleSubmit, setFieldValue, values, errors, isValid }) => (
            <>
              <View style={styles.formContainer}>
                <Input
                  style={[styles.textInput, { marginLeft: '5%' }]}
                  placeholder="Event Name*"
                  onChangeText={handleChange('name')}
                  value={values.name}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                <View
                  style={{
                    flexDirection: 'column',

                    // justifyContent: "space-between",
                    marginLeft: '5%',
                    width: '100%',
                  }}
                >
                  <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}> Event Type*</Text>
                  <RadioGroup
                    selectedIndex={selectedIndex}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '50%',
                    }}
                    onChange={(index) => {
                      setSelectedIndex(index);
                      setToCheckBox(false);
                      setFromCheckBox(false);
                    }}
                  >
                    <Radio
                      style={[
                        styles.radioButton,
                        {
                          borderColor: selectedIndex == 0 ? Colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {(evaProps) => (
                        <Text {...evaProps} style={{ fontSize: 14, marginLeft: 10 }}>
                          {' '}
                          Activity
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                    <Radio
                      style={[
                        styles.radioButton,
                        {
                          borderColor: selectedIndex == 2 ? Colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {(evaProps) => (
                        <Text {...evaProps} style={{ fontSize: 14, marginLeft: 10 }}>
                          Trip
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                  </RadioGroup>
                  <Text style={{ fontSize: 14, marginLeft: 10, marginTop: 10 }}>
                    {' '}
                    Event Duration*
                  </Text>
                  <RadioGroup
                    selectedIndex={timeSelectedIndex}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '50%',
                    }}
                    onChange={(index) => setTimeSelectedIndex(index)}
                  >
                    <Radio
                      style={[
                        styles.radioButton,
                        {
                          borderColor: timeSelectedIndex == 0 ? Colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {(evaProps) => (
                        <Text {...evaProps} style={{ fontSize: 14, marginLeft: 10 }}>
                          {' '}
                          One-Time
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                    <Radio
                      style={[
                        styles.radioButton,
                        {
                          borderColor: timeSelectedIndex == 2 ? Colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {(evaProps) => (
                        <Text {...evaProps} style={{ fontSize: 14, marginLeft: 10 }}>
                          {' '}
                          Recurring
                        </Text>
                      )}
                    </Radio>

                    <Divider />
                  </RadioGroup>
                </View>
                {/* {timeSelectedIndex !== 2 && (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "90%",
                      }}
                    >
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: "65%" }]}
                        label="From*"
                        placeholder="From"
                        date={values.from}
                        onSelect={(date: Date | null) => {
                          setFieldValue("from", date);
                        }}
                      />
                      <Input
                        style={{ marginTop: 22 }}
                        placeholder="00:00 AM"
                        onChangeText={handleChange("fromTime")}
                        value={values.fromTime}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "90%",
                      }}
                    >
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: "65%" }]}
                        label="To*"
                        placeholder="To"
                        date={values.to}
                        onSelect={(date: Date | null) => {
                          setFieldValue("to", date);
                        }}
                      />
                      <Input
                        style={{ marginTop: 22 }}
                        placeholder="00:00 AM"
                        onChangeText={handleChange("toTime")}
                        value={values.toTime}
                      />
                    </View>
                  </>
                )} */}

                {timeSelectedIndex !== 2 && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '90%',
                      }}
                    >
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: '60%' }]}
                        label="From*"
                        placeholder="From"
                        date={values.from}
                        onSelect={(date: Date | null) => {
                          setFieldValue('from', date);
                          setFieldValue('to', date);
                        }}
                      />
                      {/* <Select
                        value={values.fromTime}
                        style={{ marginTop: 5, marginLeft: 5, width: '45%' }}
                        placeholder="From"
                        onSelect={(index: any) => {
                          setFieldValue('fromTime', timeStamp[index.row]);
                        }}
                        label={(evaProps: any) => <Text {...evaProps}></Text>}
                      >
                        <TimeStampSelect timeStamp={timeStamp} />
                      </Select> */}
                      <View style={{ width: '50%', marginTop: 22 }}>
                        <CustomTextDropDown
                          value={
                            typeof values?.fromTime == 'object'
                              ? values.fromTime?.name
                              : values?.fromTime
                          }
                          placeholder="Time"
                          dropDownList={timeStamp}
                          onSelect={(name: any) => {
                            setFieldValue('fromTime', name);
                          }}
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '90%',
                      }}
                    >
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: '60%' }]}
                        label="To*"
                        placeholder="To"
                        date={values.to}
                        onSelect={(date: Date | null) => {
                          setFieldValue('to', date);
                        }}
                      />
                      {/* {console.log("values", values.toTime)} */}
                      {/* <Select
                        value={values.toTime}
                        style={{ marginTop: 5, marginLeft: 5, width: '45%' }}
                        placeholder="To"
                        onSelect={(index: any) => {
                          setFieldValue('toTime', timeStamp[index.row]);
                        }}
                        label={(evaProps: any) => <Text {...evaProps}></Text>}
                      >
                        <TimeStampSelect timeStamp={timeStamp} />
                      </Select> */}
                      <View style={{ width: '50%', marginTop: 22 }}>
                        <CustomTextDropDown
                          value={
                            typeof values?.toTime == 'object' ? values.toTime?.name : values?.toTime
                          }
                          placeholder="Time"
                          dropDownList={timeStamp}
                          onSelect={(name: any) => {
                            setFieldValue('toTime', name);
                          }}
                        />
                      </View>
                    </View>
                  </>
                )}
                {timeSelectedIndex === 2 && (
                  <>
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '90%',
                        }}
                      >
                        <Datepicker
                          min={new Date(1900, 0, 0)}
                          style={[styles.selectSettings, { width: '60%' }]}
                          label="From*"
                          placeholder="From"
                          date={values.from}
                          onSelect={(date: Date | null) => {
                            setFieldValue('from', date);
                            setFieldValue('to', date);
                          }}
                        />
                        {/* <Select
                          value={values.fromTime}
                          style={{
                            marginTop: 5,
                            marginLeft: 5,
                            width: '45%',
                          }}
                          placeholder="From"
                          onSelect={(index: any) => {
                            setFieldValue('fromTime', timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          <TimeStampSelect timeStamp={timeStamp} />
                        </Select> */}
                        <View style={{ width: '50%', marginTop: 22 }}>
                          <CustomTextDropDown
                            value={
                              typeof values?.fromTime == 'object'
                                ? values.fromTime?.name
                                : values?.fromTime
                            }
                            placeholder="Time"
                            dropDownList={timeStamp}
                            onSelect={(name: any) => {
                              setFieldValue('fromTime', name);
                            }}
                          />
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '90%',
                        }}
                      >
                        <Datepicker
                          disabled={values?.noEnd}
                          min={new Date(1900, 0, 0)}
                          style={[styles.selectSettings, { width: '60%' }]}
                          label="To*"
                          placeholder="To"
                          date={values.to}
                          onSelect={(date: Date | null) => {
                            setFieldValue('to', date);
                          }}
                        />
                        {/* {console.log("values", values.toTime)} */}
                        {/* <Select
                          disabled={values?.noEnd}
                          value={values.toTime}
                          style={{
                            marginTop: 5,
                            marginLeft: 5,
                            width: '45%',
                          }}
                          placeholder="To"
                          onSelect={(index: any) => {
                            setFieldValue('toTime', timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          <TimeStampSelect timeStamp={timeStamp} />
                        </Select> */}
                        <View style={{ width: '50%', marginTop: 22 }}>
                          <CustomTextDropDown
                            value={
                              typeof values?.toTime == 'object'
                                ? values.toTime?.name
                                : values?.toTime
                            }
                            placeholder="Time"
                            dropDownList={timeStamp}
                            onSelect={(name: any) => {
                              setFieldValue('toTime', name);
                            }}
                          />
                        </View>
                      </View>
                    </>

                    <View
                      style={{
                        flexDirection: 'row',

                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ marginHorizontal: 15, marginTop: 10 }}>No end</Text>
                      <CheckBox
                        style={[{ flex: 1, marginTop: 15 }]}
                        checked={values?.noEnd}
                        onChange={(checked) => {
                          setFieldValue('noEnd', checked);

                          // if (checked) {
                          //   Alert.alert(checked);
                          // } else {
                          //   Alert.alert(checked);
                          // }
                        }}
                      >
                        {''}
                      </CheckBox>
                    </View>

                    <Text
                      style={{
                        color: '#000',
                        marginTop: 15,
                        marginLeft: 15,
                        alignSelf: 'flex-start',
                      }}
                    >
                      Every
                    </Text>
                    <ScrollView
                      style={{ flexDirection: 'row' }}
                      contentContainerStyle={{ alignItems: 'center' }}
                      horizontal
                    >
                      {days &&
                        days.map((day) => (
                          <TouchableOpacity
                            style={day.selected ? styles.selectedDay : styles.day}
                            onPress={() => {
                              const data = [...days];
                              const index = data.findIndex((i) => i.name === day.name);
                              data[index].selected = !day.selected;
                              setDays(data);
                            }}
                          >
                            <Text
                              style={{
                                color: day.selected ? '#fff' : '#000',
                              }}
                            >
                              {day.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 18,
                      fontWeight: '700',
                      marginVertical: 10,
                      alignSelf: 'flex-start',
                      marginLeft: '5%',
                    }}
                  >
                    {selectedIndex === 0 ? 'At*' : 'From*'}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',

                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ marginRight: 20, marginTop: 10 }}>Use my address</Text>
                    <CheckBox
                      disabled={toCheckBox}
                      style={[{ flex: 1, marginTop: 15 }]}
                      checked={fromCheckBox}
                      onChange={(checked) => {
                        setFromCheckBox(checked);
                        if (!fromCheckBox) {
                          setFieldValue('fromVenueName', currentUser?.name);
                          setFieldValue('fromAddress', currentUser?.address);

                          setFieldValue('fromState', currentUser?.state);

                          setFieldValue('fromCountry', currentUser?.country);
                          setFieldValue('fromCity', currentUser?.city);
                          setFieldValue('fromZipCode', currentUser?.zipcode);
                        } else {
                          setFieldValue('fromVenueName', '');
                          setFieldValue('fromAddress', '');

                          setFieldValue('fromState', '');

                          setFieldValue('fromCountry', '');
                          setFieldValue('fromCity', '');
                          setFieldValue('fromZipCode', '');
                        }

                        // if (checked) {
                        //   Alert.alert(checked);
                        // } else {
                        //   Alert.alert(checked);
                        // }
                      }}
                    >
                      {''}
                    </CheckBox>
                  </View>
                </View>

                <View
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: Colors.primary,
                    width: '100%',
                    marginLeft: '5%',
                    marginVertical: 10,
                  }}
                >
                  <Input
                    style={styles.textInput}
                    placeholder="Venue name*"
                    onChangeText={handleChange('fromVenueName')}
                    value={values.fromVenueName}
                  />
                  {errors.venueName && <Text style={styles.errorText}>{errors.venueName}</Text>}
                  <Input
                    style={styles.textInput}
                    placeholder="Address*"
                    onChangeText={handleChange('fromAddress')}
                    value={values.fromAddress}
                  />
                  {errors.venueName && <Text style={styles.errorText}>{errors.address}</Text>}
                  {/* <Select
                    style={[styles.selectSettings, { marginVertical: 5 }]}
                    value={values.fromState}
                    placeholder="State"
                    onSelect={(query) => { }}
                  >
                  </Select>
                  <Input
                    style={{ marginRight: 20, marginTop: 10, width: "100%" }}
                    placeholder="City"
                    onChangeText={handleChange("fromCity")}
                    value={values.fromCity}
                  /> */}
                  <Autocomplete
                    placeholder="Country*"
                    value={(values as any)?.fromCountry}
                    style={{
                      input: { ...styles.textInput, marginTop: 0 },
                      list: { marginHorizontal: 10 },
                    }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    data={countriesData}
                    onSelect={(query) => {
                      const selectedCountry = query;

                      setFieldValue('fromCountry', selectedCountry.name);
                      setFieldValue('selectedCountry', selectedCountry.name);
                      setFieldValue('fromSelectedState', '');
                      setFieldValue('fromState', '');
                      setStates([]);
                      GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                        setStates(res.data);
                        setStatesData(res.data);
                      });
                    }}
                  />

                  <Autocomplete
                    placeholder="State"
                    value={values.fromState}
                    style={{
                      input: { ...styles.textInput, marginTop: 0 },
                      list: { marginHorizontal: 10 },
                    }}
                    // label={evaProps => <Text {...evaProps}>State</Text>}
                    data={statesData}
                    onSelect={(query) => {
                      const selectedState = query;
                      setFieldValue('fromState', selectedState);
                      setFieldValue('fromSelectedState', selectedState);
                      setFieldValue('fromSelectedCity', '');
                      setFieldValue('fromCity', '');
                      setCities([]);
                      GetAllCities((values as any).selectedCountry, selectedState).then((res) => {
                        setCities(res.data);
                      });
                    }}
                  />

                  <Autocomplete
                    placeholder="City"
                    value={values.fromCity}
                    data={cities}
                    style={{
                      input: { ...styles.textInput, marginTop: 0 },
                      list: { marginHorizontal: 10 },
                    }}
                    // label={evaProps => <Text {...evaProps}>City</Text>}

                    onSelect={(query) => {
                      setFieldValue('fromCity', query);
                      setFieldValue('fromSelectedCity', query);
                    }}
                  />

                  <Input
                    style={styles.textInput}
                    placeholder="Zip/Post Code"
                    onChangeText={handleChange('fromZipCode')}
                    value={values.fromZipCode}
                  />
                </View>
                {selectedIndex === 2 && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: '700',
                          marginVertical: 10,
                          alignSelf: 'flex-start',
                          marginLeft: '5%',
                        }}
                      >
                        To*
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',

                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ marginRight: 20, marginTop: 10 }}>Use my address</Text>
                        <CheckBox
                          disabled={fromCheckBox}
                          style={[{ flex: 1, marginTop: 15 }]}
                          checked={toCheckBox}
                          onChange={(checked) => {
                            setToCheckBox(checked);
                            if (!toCheckBox) {
                              setFieldValue('venueName', currentUser?.name);
                              setFieldValue('address', currentUser?.address);

                              setFieldValue('state', currentUser?.state);

                              setFieldValue('country', currentUser?.country);
                              setFieldValue('city', currentUser?.city);
                              setFieldValue('zipCode', currentUser?.zipcode);
                            } else {
                              setFieldValue('venueName', '');
                              setFieldValue('address', '');

                              setFieldValue('state', '');

                              setFieldValue('country', '');
                              setFieldValue('city', '');
                              setFieldValue('zipCode', '');
                            }

                            // if (checked) {
                            //   Alert.alert(checked);
                            // } else {
                            //   Alert.alert(checked);
                            // }
                          }}
                        >
                          {''}
                        </CheckBox>
                      </View>
                    </View>
                    <View
                      style={{
                        padding: 15,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: Colors.primary,
                        width: '100%',
                        marginLeft: '5%',
                        marginVertical: 10,
                      }}
                    >
                      <Input
                        style={styles.textInput}
                        placeholder="Venue name"
                        onChangeText={handleChange('venueName')}
                        value={values.venueName}
                      />
                      <Input
                        style={styles.textInput}
                        placeholder="Address"
                        onChangeText={handleChange('address')}
                        value={values.address}
                      />

                      <Autocomplete
                        placeholder="Country*"
                        value={(values as any).country}
                        data={countriesData}
                        style={{
                          input: { ...styles.textInput, marginTop: 0 },
                          list: { marginHorizontal: 10 },
                        }}
                        // label={evaProps => <Text {...evaProps}>Country*</Text>}

                        onSelect={(query) => {
                          const selectedCountry = query;

                          setFieldValue('country', selectedCountry.name);
                          setFieldValue('selectedCountry', selectedCountry.name);
                          setFieldValue('toSelectedState', '');
                          setFieldValue('state', '');
                          setStates([]);
                          GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                            setStates(res.data);
                            setStatesData(res.data);
                          });
                        }}
                      />

                      <Autocomplete
                        placeholder="State"
                        value={values.state}
                        data={statesData}
                        style={{
                          input: { ...styles.textInput, marginTop: 0 },
                          list: { marginHorizontal: 10 },
                        }}
                        // label={evaProps => <Text {...evaProps}>State</Text>}

                        onSelect={(query) => {
                          const selectedState = query;
                          setFieldValue('state', selectedState);
                          setFieldValue('toSelectedState', selectedState);
                          setFieldValue('toSelectedCity', '');
                          setFieldValue('city', '');
                          setCities([]);
                          GetAllCities((values as any).selectedCountry, selectedState).then(
                            (res) => {
                              setCities(res.data);
                            }
                          );
                        }}
                      />

                      <Autocomplete
                        placeholder="City"
                        value={values.city}
                        data={cities}
                        style={{
                          input: { ...styles.textInput, marginTop: 0 },
                          list: { marginHorizontal: 10 },
                        }}
                        // label={evaProps => <Text {...evaProps}>City</Text>}

                        onSelect={(query) => {
                          setFieldValue('city', query);
                          setFieldValue('toSelectedCity', query);
                        }}
                      />

                      <Input
                        style={styles.textInput}
                        placeholder="Zip/Post Code"
                        onChangeText={handleChange('zipCode')}
                        value={values.zipCode}
                      />
                    </View>
                  </>
                )}

                <Input
                  style={styles.textArea}
                  textStyle={{ minHeight: 70, textAlignVertical: 'top' }}
                  placeholder="Instructions"
                  onChangeText={handleChange('instructions')}
                  value={values.instructions}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={styles.textArea}
                  textStyle={{ minHeight: 70, textAlignVertical: 'top' }}
                  placeholder="Disclaimer"
                  onChangeText={handleChange('disclaimer')}
                  value={values.disclaimer}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={styles.textArea}
                  textStyle={{ minHeight: 70, textAlignVertical: 'top' }}
                  placeholder="Agreement"
                  onChangeText={handleChange('agreement')}
                  value={values.agreement}
                  multiline={true}
                  maxLength={500}
                />
                {students && students.length > 0 && (
                  <View style={{ width: '100%', marginTop: 15, marginLeft: '5%' }}>
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 18,
                        fontWeight: '700',
                        marginBottom: 10,
                      }}
                    >
                      Students*
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: Colors.primary,
                        padding: 5,
                      }}
                    >
                      {students &&
                        students.length > 0 &&
                        students?.map((item) => (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: 2.5,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text>{item.name}</Text>
                            </View>
                            <AntDesign
                              name="delete"
                              color={Colors.primary}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                              onPress={() => handleRemoveStudent(item)}
                            />
                          </View>
                        ))}
                    </View>
                  </View>
                )}
                <Select
                  style={{
                    marginTop: 10,
                    width: '90%',
                    marginHorizontal: '5%',
                  }}
                  value={values?.students?.toString()}
                  selectedIndex={
                    selectedStudentIndex && selectedStudentIndex.length > 0
                      ? selectedStudentIndex
                      : selectedStudentIndexNew
                  }
                  multiSelect={true}
                  onSelect={(indexes) => {
                    if (Array.isArray(indexes) && indexes.length === 0) {
                      setSelectedStudentIndex([]);
                    }
                    selectedStudentIndex = Array.isArray(indexes) ? indexes : [indexes];
                    setFieldValue('students', '');
                    const _students = studentsData;
                    let newValue: string[] = [];
                    Array.isArray(indexes) &&
                      indexes.forEach((index) => {
                        newValue.push(
                          _students[index.row]?.firstname + ' ' + _students[index.row]?.lastname
                        );
                      });
                    setFieldValue('students', newValue);
                  }}
                >
                  {studentsData &&
                    studentsData
                      ?.map((c, index) => ({
                        id: index + 1,
                        title: c?.firstname + ' ' + c?.lastname,
                      }))
                      .map((student, index) => {
                        return <SelectItem key={index} title={student?.title} />;
                      })}
                </Select>
                {groups && groups.length > 0 && (
                  <View style={{ width: '100%', marginTop: 15, marginLeft: '5%' }}>
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 18,
                        fontWeight: '700',
                        marginBottom: 10,
                      }}
                    >
                      Members*
                    </Text>
                    <View
                      style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        borderColor: Colors.primary,
                        padding: 5,
                      }}
                    >
                      {groups &&
                        groups.length > 0 &&
                        groups?.map((item) => (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: 2.5,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <Text>{item.groupName}</Text>
                            </View>
                            <AntDesign
                              name="delete"
                              color={Colors.primary}
                              size={20}
                              style={{ marginHorizontal: 5 }}
                              onPress={() => handleRemoveGroup(item)}
                            />
                          </View>
                        ))}
                    </View>
                  </View>
                )}

                <View style={styles.buttonSettings}>
                  <View style={{ marginVertical: 20 }}>
                    <CheckBox
                      style={{ marginLeft: 20 }}
                      checked={askPermission}
                      onChange={() => setAskPermission(!askPermission)}
                    >
                      {'Request Permission from Parents/Guardian'}
                    </CheckBox>
                  </View>
                  <View style={styles.buttonSettings}>
                    <LinearGradientButton
                      onPress={handleSubmit}
                      colors={[Colors.primary, '#EC5ADD']}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.linearGradient}
                    >
                      I'm done
                    </LinearGradientButton>
                  </View>
                </View>
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </BackgroundLayout>
  );
};

export default CreateParentActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 20,
    backgroundColor: Colors.newBackgroundColor,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    width: '98%',
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: Colors.primary,
    marginLeft: '5%',
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
    width: '95%',
    alignItems: 'center',
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
    width: '90%',
  },
  errorText: {
    fontSize: 10,
    color: 'red',
    marginLeft: 10,
    marginTop: 10,
  },
  selectSettings: {
    width: '100%',
  },
  day: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  selectedDay: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff',
    marginLeft: 5,
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
  radioButton: {
    width: '60%',
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingLeft: 10,
    marginLeft: '10%',
  },
  participantContainer: {
    width: '95%',
    marginVertical: 5,
    marginLeft: '2%',
  },
  participantListView: {
    borderRadius: 10,
    backgroundColor: Colors.white,
    padding: 5,
    elevation: 2,
  },
  participantsListCards: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
    borderColor: Colors.newBackgroundColor,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },

  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    marginRight: 20,
    marginTop: 10,
    marginLeft: '8%',
    borderRadius: 10,
    elevation: 2,
    width: '95%',
  },
  textInput: {
    marginTop: 10,
    alignSelf: 'center',
    width: '95%',

    borderRadius: 8,
    elevation: 2,
  },
  autoCompleteItem: {
    // elevation: 2,
    backgroundColor: 'transparent',
    width: '100%',
    marginLeft: '1%',
  },
});
