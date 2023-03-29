import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  Divider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Datepicker,
  CheckBox,
  Autocomplete,
  AutocompleteItem,
} from "@ui-kitten/components";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { AddIndividialMembersModal, GroupSelectionModal } from "@/Modals";
import { Formik } from "formik";
import { AppHeader } from "@/Components";
import AntDesign from "react-native-vector-icons/AntDesign";
import { CreateActivity } from "@/Services/Activity";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import moment from "moment";
import { GetAllStudents } from "@/Services/Student";
import { useIsFocused } from "@react-navigation/native";

const _days = [
  {
    id: 1,
    name: "Mon",
    selected: false,
  },
  {
    id: 1,
    name: "Tue",
    selected: false,
  },
  {
    id: 1,
    name: "Wed",
    selected: false,
  },
  {
    id: 1,
    name: "Thu",
    selected: false,
  },
  {
    id: 1,
    name: "Fri",
    selected: false,
  },
  {
    id: 1,
    name: "Sat",
    selected: false,
  },
  {
    id: 1,
    name: "Sun",
    selected: false,
  },
];
const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const CreateParentActivityScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const currentUser = useSelector((state) => state.user.item);
  console.log("current User", currentUser);
  const dispatch = useDispatch();
  const [days, setDays] = useState(_days);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [timeSelectedIndex, setTimeSelectedIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState("");
  const [askPermission, setAskPermission] = useState(false);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [countriesData, setCountriesData] = React.useState(countries);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [selectedStudentIndexNew, setSelectedStudentIndex] = useState([]);
  const timeStamp = [
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
    "12:00 AM",
    "12:30 AM",
  ];

  let selectedStudentIndex: any[] = [];
  const [fromCheckBox, setFromCheckBox] = useState(false);
  const [toCheckBox, setToCheckBox] = useState(false);
  const handleRemoveStudent = (item) => {
    let data = [...students];
    data = data.filter((d) => d.parent1_email !== item.parent1_email);
    setStudents(data);
  };

  const handleRemoveGroup = (item) => {
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
        console.log("err", err);
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

  console.log("currentUser29992929292929", currentUser);
  return (
    <>
      <GroupSelectionModal individuals={groups} setIndividuals={setGroups} />
      <AddIndividialMembersModal
        individuals={students}
        setIndividuals={setStudents}
      />
      <AppHeader hideCalendar={true} title="Create Event" />
      <ScrollView style={styles.layout}>
        <Formik
          validateOnMount={true}
          initialValues={{
            name: "",
            activityType: "",
            from: new Date(),
            fromTime: "",
            to: new Date(),
            toTime: "",
            fromVenueName: "",
            fromAddress: "",
            fromCity: "",
            fromSelectedCity: "",
            fromState: "",
            fromSelectedState: "",
            fromZipCode: "",
            venueName: "",
            address: "",
            city: "",
            selectedCity: "",
            state: "",
            selectedState: "",
            zipCode: "",
            instructions: "",
            disclaimer: "",
            agreement: "",
            starting: new Date(),
            startingFrom: "",
            startingTo: "",
            students: "",
            noEnd: false,
          }}
          onSubmit={async (values, { resetForm }) => {
            const fromTime =
              values.fromTime.length > 0
                ? values.fromTime.includes("AM")
                  ? values.fromTime.split("AM")[0]
                  : parseInt(values.fromTime.split(":")[0], 0) +
                    12 +
                    ":" +
                    values.fromTime.split(":")[1].split("PM")[0]
                : "";
            const toTime =
              values.toTime.length > 0
                ? values.toTime.includes("AM")
                  ? values.toTime.split("AM")[0]
                  : parseInt(values.toTime.split(":")[0], 0) +
                    12 +
                    ":" +
                    values.toTime.split(":")[1].split("PM")[0]
                : "";
            const fromDateTime =
              fromTime.length > 0
                ? moment(values.from).format("yyyy-MM-DD") +
                  "T" +
                  fromTime +
                  ":00.000Z"
                : values.from;
            const toDateTime =
              toTime.length > 0
                ? moment(values.to).format("yyyy-MM-DD") +
                  "T" +
                  toTime +
                  ":00.000Z"
                : values.to;
            const unixFrom = moment(fromDateTime).unix();
            const unixTo = moment(toDateTime).unix();
            const data = {
              name: values.name,
              requestPermission: askPermission,
              type: selectedIndex === 2 ? "trip" : "activity",
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
                toDate: values.noEnd ? "9999-12-31T12:00.000Z" : unixTo,
                days:
                  timeSelectedIndex === 2
                    ? days.map((d) => (d.selected ? 1 : 0)).join("")
                    : 0,
                status: "enabled",
              },
              optin: {
                instructions: values.instructions,
                disclaimer: values.disclaimer,
                agreement: values.agreement,
                status: true,
              },
              journey: {
                journeyStartToDestination: "",
                journeyStartToOrgin: "",
                eta: 0,
                id: 0,
              },
            };
            CreateActivity(data)
              .then((res) => {
                resetForm();
                Toast.show({
                  type: "success",
                  text2: "Activity has been successfully created",
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
                  type: "info",
                  text2: "Something went wrong",
                });
              });
          }}
        >
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            isValid,
          }) => (
            <>
              <View style={styles.formContainer}>
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  placeholder="Event Name*"
                  onChangeText={handleChange("name")}
                  value={values.name}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginLeft: "5%",
                    width: "100%",
                  }}
                >
                  <RadioGroup
                    selectedIndex={selectedIndex}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      width: "50%",
                    }}
                    onChange={(index) => {
                      setSelectedIndex(index);
                      setToCheckBox(false);
                      setFromCheckBox(false);
                    }}
                  >
                    <Radio style={{ flexDirection: "row", width: "50%" }}>
                      {(evaProps) => (
                        <Text
                          {...evaProps}
                          style={{ fontSize: 14, marginLeft: 10 }}
                        >
                          {" "}
                          Activity
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                    <Radio style={{ flexDirection: "row", width: "50%" }}>
                      {(evaProps) => (
                        <Text
                          {...evaProps}
                          style={{ fontSize: 14, marginLeft: 10 }}
                        >
                          Trip
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                  </RadioGroup>
                  <RadioGroup
                    selectedIndex={timeSelectedIndex}
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      width: "50%",
                    }}
                    onChange={(index) => setTimeSelectedIndex(index)}
                  >
                    <Radio style={{ flexDirection: "row", width: "50%" }}>
                      {(evaProps) => (
                        <Text
                          {...evaProps}
                          style={{ fontSize: 14, marginLeft: 10 }}
                        >
                          {" "}
                          One-Time
                        </Text>
                      )}
                    </Radio>
                    <Divider />
                    <Radio style={{ flexDirection: "row", width: "50%" }}>
                      {(evaProps) => (
                        <Text
                          {...evaProps}
                          style={{ fontSize: 14, marginLeft: 10 }}
                        >
                          {" "}
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
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "90%",
                      }}
                    >
                      <Datepicker
                        min={new Date(1900, 0, 0)}
                        style={[styles.selectSettings, { width: "60%" }]}
                        label="From*"
                        placeholder="From"
                        date={values.from}
                        onSelect={(date: Date | null) => {
                          setFieldValue("from", date);
                          setFieldValue("to", date);
                        }}
                      />
                      <Select
                        value={values.fromTime}
                        style={{ marginTop: 5, marginLeft: 5, width: "45%" }}
                        placeholder="From"
                        onSelect={(index: any) => {
                          setFieldValue("fromTime", timeStamp[index.row]);
                        }}
                        label={(evaProps: any) => <Text {...evaProps}></Text>}
                      >
                        {timeStamp &&
                          timeStamp.length > 0 &&
                          timeStamp.map((_timeStamp, index) => {
                            return (
                              <SelectItem
                                key={index}
                                title={_timeStamp || ""}
                              />
                            );
                          })}
                      </Select>
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
                        style={[styles.selectSettings, { width: "60%" }]}
                        label="To*"
                        placeholder="To"
                        date={values.to}
                        onSelect={(date: Date | null) => {
                          setFieldValue("to", date);
                        }}
                      />
                      {/* {console.log("values", values.toTime)} */}
                      <Select
                        value={values.toTime}
                        style={{ marginTop: 5, marginLeft: 5, width: "45%" }}
                        placeholder="To"
                        onSelect={(index: any) => {
                          setFieldValue("toTime", timeStamp[index.row]);
                        }}
                        label={(evaProps: any) => <Text {...evaProps}></Text>}
                      >
                        {timeStamp &&
                          timeStamp.length > 0 &&
                          timeStamp.map((_timeStamp, index) => {
                            return (
                              <SelectItem
                                key={index}
                                title={_timeStamp || ""}
                              />
                            );
                          })}
                      </Select>
                    </View>
                  </>
                )}
                {timeSelectedIndex === 2 && (
                  <>
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
                          style={[styles.selectSettings, { width: "60%" }]}
                          label="From*"
                          placeholder="From"
                          date={values.from}
                          onSelect={(date: Date | null) => {
                            setFieldValue("from", date);
                            setFieldValue("to", date);
                          }}
                        />
                        <Select
                          value={values.fromTime}
                          style={{
                            marginTop: 5,
                            marginLeft: 5,
                            width: "45%",
                          }}
                          placeholder="From"
                          onSelect={(index: any) => {
                            setFieldValue("fromTime", timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          {timeStamp &&
                            timeStamp.length > 0 &&
                            timeStamp.map((_timeStamp, index) => {
                              return (
                                <SelectItem
                                  key={index}
                                  title={_timeStamp || ""}
                                />
                              );
                            })}
                        </Select>
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
                          disabled={values?.noEnd}
                          min={new Date(1900, 0, 0)}
                          style={[styles.selectSettings, { width: "60%" }]}
                          label="To*"
                          placeholder="To"
                          date={values.to}
                          onSelect={(date: Date | null) => {
                            setFieldValue("to", date);
                          }}
                        />
                        {/* {console.log("values", values.toTime)} */}
                        <Select
                          disabled={values?.noEnd}
                          value={values.toTime}
                          style={{
                            marginTop: 5,
                            marginLeft: 5,
                            width: "45%",
                          }}
                          placeholder="To"
                          onSelect={(index: any) => {
                            setFieldValue("toTime", timeStamp[index.row]);
                          }}
                          label={(evaProps: any) => <Text {...evaProps}></Text>}
                        >
                          {timeStamp &&
                            timeStamp.length > 0 &&
                            timeStamp.map((_timeStamp, index) => {
                              return (
                                <SelectItem
                                  key={index}
                                  title={_timeStamp || ""}
                                />
                              );
                            })}
                        </Select>
                      </View>
                    </>

                    <View
                      style={{
                        flexDirection: "row",

                        alignItems: "center",
                      }}
                    >
                      <Text style={{ marginHorizontal: 15, marginTop: 10 }}>
                        No end
                      </Text>
                      <CheckBox
                        style={[{ flex: 1, marginTop: 15 }]}
                        checked={values?.noEnd}
                        onChange={(checked) => {
                          setFieldValue("noEnd", checked);

                          console.log("checked", checked);
                          // if (checked) {
                          //   Alert.alert(checked);
                          // } else {
                          //   Alert.alert(checked);
                          // }
                        }}
                      >
                        {""}
                      </CheckBox>
                    </View>

                    <Text
                      style={{
                        color: "#000",
                        marginTop: 15,
                        marginLeft: 15,
                        alignSelf: "flex-start",
                      }}
                    >
                      Every
                    </Text>
                    <ScrollView
                      style={{ flexDirection: "row" }}
                      contentContainerStyle={{ alignItems: "center" }}
                      horizontal
                    >
                      {days &&
                        days.map((day) => (
                          <TouchableOpacity
                            style={
                              day.selected ? styles.selectedDay : styles.day
                            }
                            onPress={() => {
                              const data = [...days];
                              const index = data.findIndex(
                                (i) => i.name === day.name
                              );
                              data[index].selected = !day.selected;
                              setDays(data);
                            }}
                          >
                            <Text
                              style={{
                                color: day.selected ? "#fff" : "#000",
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: 18,
                      fontWeight: "700",
                      marginVertical: 10,
                      alignSelf: "flex-start",
                      marginLeft: "5%",
                    }}
                  >
                    {selectedIndex === 0 ? "At*" : "From*"}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",

                      alignItems: "center",
                    }}
                  >
                    <Text style={{ marginRight: 20, marginTop: 10 }}>
                      Use my address
                    </Text>
                    <CheckBox
                      disabled={toCheckBox}
                      style={[{ flex: 1, marginTop: 15 }]}
                      checked={fromCheckBox}
                      onChange={(checked) => {
                        setFromCheckBox(checked);
                        if (!fromCheckBox) {
                          setFieldValue("fromVenueName", currentUser?.name);
                          setFieldValue("fromAddress", currentUser?.address);

                          setFieldValue("fromState", currentUser?.state);

                          setFieldValue("fromCountry", currentUser?.country);
                          setFieldValue("fromCity", currentUser?.city);
                          setFieldValue("fromZipCode", currentUser?.zipcode);
                        } else {
                          setFieldValue("fromVenueName", "");
                          setFieldValue("fromAddress", "");

                          setFieldValue("fromState", "");

                          setFieldValue("fromCountry", "");
                          setFieldValue("fromCity", "");
                          setFieldValue("fromZipCode", "");
                        }
                        console.log("checked", checked);
                        // if (checked) {
                        //   Alert.alert(checked);
                        // } else {
                        //   Alert.alert(checked);
                        // }
                      }}
                    >
                      {""}
                    </CheckBox>
                  </View>
                </View>

                <View
                  style={{
                    padding: 15,
                    borderWidth: 1,
                    borderRadius: 20,
                    borderColor: Colors.primary,
                    width: "100%",
                    marginLeft: "5%",
                    marginVertical: 10,
                  }}
                >
                  <Input
                    style={{ marginRight: 20, width: "100%" }}
                    placeholder="Venue name*"
                    onChangeText={handleChange("fromVenueName")}
                    value={values.fromVenueName}
                  />
                  {errors.venueName && touched.venueName && (
                    <Text style={styles.errorText}>{errors.venueName}</Text>
                  )}
                  <Input
                    style={{ marginRight: 20, marginTop: 10, width: "100%" }}
                    placeholder="Address*"
                    onChangeText={handleChange("fromAddress")}
                    value={values.fromAddress}
                  />
                  {errors.address && touched.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}
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
                    value={values?.fromCountry}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    onChangeText={(query) => {
                      setFieldValue("fromCountry", query);
                      setCountriesData(
                        countries.filter((item) => filterCountries(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedCountry = countriesData[query];
                      console.log("000000", selectedCountry.name);
                      setFieldValue("fromCountry", selectedCountry.name);
                      setFieldValue("selectedCountry", selectedCountry.name);
                      setFieldValue("fromSelectedState", "");
                      setFieldValue("fromState", "");
                      setStates([]);
                      GetAllStates(selectedCountry.name.replace(/ /g, "")).then(
                        (res) => {
                          setStates(res.data);
                          setStatesData(states);
                        }
                      );
                    }}
                  >
                    {countriesData?.map((item, index) => {
                      return <AutocompleteItem key={index} title={item.name} />;
                    })}
                  </Autocomplete>
                  <Autocomplete
                    placeholder="State"
                    value={values.fromState}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>State</Text>}
                    onChangeText={(query) => {
                      setFieldValue("fromState", query);
                      setStatesData(
                        states.filter((item) => filterStates(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedState = statesData[query];
                      setFieldValue("fromState", selectedState);
                      setFieldValue("fromSelectedState", selectedState);
                      setFieldValue("fromSelectedCity", "");
                      setFieldValue("fromCity", "");
                      setCities([]);
                      GetAllCities(values.selectedCountry, selectedState).then(
                        (res) => {
                          setCities(res.data);
                        }
                      );
                    }}
                  >
                    {statesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>
                  <Autocomplete
                    placeholder="City"
                    value={values.fromCity}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>City</Text>}
                    onChangeText={(query) => {
                      setFieldValue("fromCity", query);
                      setCitiesData(
                        cities.filter((item) => filterCities(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      setFieldValue("fromCity", citiesData[query]);
                      setFieldValue("fromSelectedCity", citiesData[query]);
                    }}
                  >
                    {citiesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>
                  <Input
                    style={{ width: "100%" }}
                    placeholder="Zip/Post Code"
                    onChangeText={handleChange("fromZipCode")}
                    value={values.fromZipCode}
                  />
                </View>
                {selectedIndex === 2 && (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.primary,
                          fontSize: 18,
                          fontWeight: "700",
                          marginVertical: 10,
                          alignSelf: "flex-start",
                          marginLeft: "5%",
                        }}
                      >
                        To*
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",

                          alignItems: "center",
                        }}
                      >
                        <Text style={{ marginRight: 20, marginTop: 10 }}>
                          Use my address
                        </Text>
                        <CheckBox
                          disabled={fromCheckBox}
                          style={[{ flex: 1, marginTop: 15 }]}
                          checked={toCheckBox}
                          onChange={(checked) => {
                            setToCheckBox(checked);
                            if (!toCheckBox) {
                              setFieldValue("venueName", currentUser?.name);
                              setFieldValue("address", currentUser?.address);

                              setFieldValue("state", currentUser?.state);

                              setFieldValue("country", currentUser?.country);
                              setFieldValue("city", currentUser?.city);
                              setFieldValue("zipCode", currentUser?.zipcode);
                            } else {
                              setFieldValue("venueName", "");
                              setFieldValue("address", "");

                              setFieldValue("state", "");

                              setFieldValue("country", "");
                              setFieldValue("city", "");
                              setFieldValue("zipCode", "");
                            }
                            console.log("checked", checked);
                            // if (checked) {
                            //   Alert.alert(checked);
                            // } else {
                            //   Alert.alert(checked);
                            // }
                          }}
                        >
                          {""}
                        </CheckBox>
                      </View>
                    </View>
                    <View
                      style={{
                        padding: 15,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: Colors.primary,
                        width: "100%",
                        marginLeft: "5%",
                        marginVertical: 10,
                      }}
                    >
                      <Input
                        style={{ marginRight: 20, width: "100%" }}
                        placeholder="Venue name"
                        onChangeText={handleChange("venueName")}
                        value={values.venueName}
                      />
                      <Input
                        style={{
                          marginRight: 20,
                          marginTop: 10,
                          width: "100%",
                        }}
                        placeholder="Address"
                        onChangeText={handleChange("address")}
                        value={values.address}
                      />

                      <Autocomplete
                        placeholder="Country*"
                        value={values.country}
                        placement="bottom"
                        style={{ marginVertical: 5 }}
                        // label={evaProps => <Text {...evaProps}>Country*</Text>}
                        onChangeText={(query) => {
                          setFieldValue("country", query);
                          setCountriesData(
                            countries.filter((item) =>
                              filterCountries(item, query)
                            )
                          );
                        }}
                        onSelect={(query) => {
                          const selectedCountry = countriesData[query];
                          console.log("000000", selectedCountry.name);
                          setFieldValue("country", selectedCountry.name);
                          setFieldValue(
                            "selectedCountry",
                            selectedCountry.name
                          );
                          setFieldValue("toSelectedState", "");
                          setFieldValue("state", "");
                          setStates([]);
                          GetAllStates(
                            selectedCountry.name.replace(/ /g, "")
                          ).then((res) => {
                            setStates(res.data);
                            setStatesData(states);
                          });
                        }}
                      >
                        {countriesData?.map((item, index) => {
                          return (
                            <AutocompleteItem key={index} title={item.name} />
                          );
                        })}
                      </Autocomplete>
                      <Autocomplete
                        placeholder="State"
                        value={values.state}
                        placement="bottom"
                        style={{ marginVertical: 5 }}
                        // label={evaProps => <Text {...evaProps}>State</Text>}
                        onChangeText={(query) => {
                          setFieldValue("state", query);
                          setStatesData(
                            states.filter((item) => filterStates(item, query))
                          );
                        }}
                        onSelect={(query) => {
                          const selectedState = statesData[query];
                          setFieldValue("state", selectedState);
                          setFieldValue("toSelectedState", selectedState);
                          setFieldValue("toSelectedCity", "");
                          setFieldValue("city", "");
                          setCities([]);
                          GetAllCities(
                            values.selectedCountry,
                            selectedState
                          ).then((res) => {
                            setCities(res.data);
                          });
                        }}
                      >
                        {statesData.map((item, index) => {
                          return <AutocompleteItem key={index} title={item} />;
                        })}
                      </Autocomplete>
                      <Autocomplete
                        placeholder="City"
                        value={values.city}
                        placement="bottom"
                        style={{ marginVertical: 5 }}
                        // label={evaProps => <Text {...evaProps}>City</Text>}
                        onChangeText={(query) => {
                          setFieldValue("city", query);
                          setCitiesData(
                            cities.filter((item) => filterCities(item, query))
                          );
                        }}
                        onSelect={(query) => {
                          setFieldValue("city", citiesData[query]);
                          setFieldValue("toSelectedCity", citiesData[query]);
                        }}
                      >
                        {citiesData.map((item, index) => {
                          return <AutocompleteItem key={index} title={item} />;
                        })}
                      </Autocomplete>

                      <Input
                        style={{ width: "100%" }}
                        placeholder="Zip/Post Code"
                        onChangeText={handleChange("zipCode")}
                        value={values.zipCode}
                      />
                    </View>
                  </>
                )}

                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120 }}
                  placeholder="Instructions"
                  onChangeText={handleChange("instructions")}
                  value={values.instructions}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120 }}
                  placeholder="Disclaimer"
                  onChangeText={handleChange("disclaimer")}
                  value={values.disclaimer}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120 }}
                  placeholder="Agreement"
                  onChangeText={handleChange("agreement")}
                  value={values.agreement}
                  multiline={true}
                  maxLength={500}
                />
                {students && students.length > 0 && (
                  <View
                    style={{ width: "100%", marginTop: 15, marginLeft: "5%" }}
                  >
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 18,
                        fontWeight: "700",
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
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingVertical: 2.5,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
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
                    width: "90%",
                    marginHorizontal: "5%",
                  }}
                  value={values?.students?.toString()}
                  selectedIndex={
                    selectedStudentIndex && selectedStudentIndex.length > 0
                      ? selectedStudentIndex
                      : selectedStudentIndexNew
                  }
                  multiSelect={true}
                  onSelect={(indexes) => {
                    if (indexes.length === 0) {
                      setSelectedStudentIndex([]);
                    }
                    selectedStudentIndex = indexes;
                    setFieldValue("students", "");
                    const _students = studentsData;
                    let newValue: string[] = [];
                    indexes.forEach((index) => {
                      newValue.push(
                        _students[index.row]?.firstname +
                          " " +
                          _students[index.row]?.lastname
                      );
                    });
                    setFieldValue("students", newValue);
                  }}
                >
                  {studentsData &&
                    studentsData
                      ?.map((c, index) => ({
                        id: index + 1,
                        title: c?.firstname + " " + c?.lastname,
                      }))
                      .map((student, index) => {
                        return (
                          <SelectItem key={index} title={student?.title} />
                        );
                      })}
                </Select>
                {groups && groups.length > 0 && (
                  <View
                    style={{ width: "100%", marginTop: 15, marginLeft: "5%" }}
                  >
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 18,
                        fontWeight: "700",
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
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingVertical: 2.5,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
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
                      {"Request Permission from Parents/Guardian"}
                    </CheckBox>
                  </View>
                  <View
                    style={[
                      styles.background,
                      {
                        backgroundColor:
                          values?.name?.length < 3 || values?.name?.length > 20
                            ? Colors.lightgray
                            : Colors.primary,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.background,
                        {
                          backgroundColor:
                            values?.name?.length < 3 ||
                            values?.name?.length > 20
                              ? Colors.lightgray
                              : Colors.primary,
                        },
                      ]}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.button}>I'm done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.background]}>
                    <TouchableOpacity
                      style={[styles.background]}
                      disabled={!isValid}
                      onPress={() => navigation.navigate("HomeScreen")}
                    >
                      <Text style={styles.button}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </Formik>
      </ScrollView>
    </>
  );
};

export default CreateParentActivityScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 20,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  background: {
    width: "90%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "center",
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
    width: "95%",
    alignItems: "center",
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
    marginTop: 10,
  },
  selectSettings: {
    width: "100%",
  },
  day: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  selectedDay: {
    paddingHorizontal: 5,
    height: 40,
    backgroundColor: Colors.primary,
    borderWidth: 0.5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#fff",
    marginLeft: 5,
  },
});
