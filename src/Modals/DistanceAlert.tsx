import { LinearGradientButton } from "@/Components";
import { CountryDTO } from "@/Models/CountryDTOs";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import {
  GetAllSchools
} from "@/Services/School";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { PlaceState } from "@/Store/Places";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import {
  Autocomplete,
  AutocompleteItem, Card, CheckBox, Input, Modal, Radio,
  RadioGroup, Text
} from "@ui-kitten/components";
import axios from "axios";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Geocoder from "react-native-geocoding";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

Geocoder.init("AIzaSyBBDJwlh5Mnc6Aa1l371eEOZ9G6Uc0ByWA");
const DistanceAlerttModal = ({
  selectedDependent,
  setSelectedDependent,
  hide,
  visible,
  onSubmit,
}: {
  selectedDependent: any;
  setSelectedDependent: Function;
  hide: any;
  visible: any;
  onSubmit: any;
}) => {
  const isFocused = useIsFocused();
  const [checkBox, setCheckBox] = useState(false);
  const [student, setStudent] = useState(null);
  const [schools, setSchools] = useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );

  const grades =
    schools &&
    schools.length > 0 &&
    schools.find((s) => s.name === selectedDependent?.school) &&
    schools?.find((s) => s.name === selectedDependent?.school)?.gradeEntities;
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  console.log("selectedepenedted", selectedDependent);
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  // const [dependents, setCities] = useState<Array<any>>([]);

  const [schoolsData, setSchoolsData] = React.useState(schools);
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.editDependentModalVisibility
  );
  const validationSchema = yup.object().shape({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string().required("Last Name is required"),
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
    country: yup.string().required("Please select country"),
    state: yup.string().required("Please select state"),
    school: yup.string().required("Please select school"),
  });
  const dispatch = useDispatch();

  const getSchools = () => {
    GetAllSchools(0, 30)
      .then((res) => {
        setSchools(res.result);
        setSchoolsData(res.result);
      })
      .catch((err) => {});
  };
  const getCoordinates = async ({
    address,
    selectedCity,
    selectedState,
    selectedCountry,
    distanceinkm,
    distance,
  }: {
    address: any;
    selectedCity: any;
    selectedState: any;
    selectedCountry: any;
    distanceinkm: any;
    distance: any;
  }) => {
    let location =
      address +
      " " +
      selectedCity +
      " " +
      selectedState +
      " " +
      selectedCountry;
    let res = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyBBDJwlh5Mnc6Aa1l371eEOZ9G6Uc0ByWA`
    );
    console.log("res", res.data.results[0].geometry.location);
    let coord = res.data.results[0].geometry.location;
    onSubmit({
      address,
      selectedCity,
      selectedState,
      selectedCountry,
      distanceinkm,
      location: {
        latitude: coord.lat,
        longitude: coord.lng,
      },
      student,
      distance,
    });

    return location;
    // let coordinates = Geocoder.from(location)
    //   .then((json) => {
    //     var location = json.results[0].geometry.location;
    //     console.log("location------------------------------", location);
    //     onSubmit({
    //       address,
    //       selectedCity,
    //       selectedState,
    //       selectedCountry,
    //       distanceinkm,
    //       location,
    //       student,
    //       distance,
    //     });

    //     return location;
    // })
    // .catch((error) => console.warn(error));
  };
  useEffect(() => {
    // getCoordinates("ajja");
    getSchools();
  }, [isVisible]);

  const handleSetStudent = () => {
    if (selectedDependent) {
      setStudent(selectedDependent);
    }
  };

  useEffect(() => {
    handleSetStudent();
  }, [isFocused]);

  //   console.log("student", student);
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ editDependentModalVisibility: false })
        );
        setSelectedDependent(null);
        setStudent(null);
      }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <Card style={styles.modal} disabled={true}>
          <View style={styles.body}>
            <View style={{ paddingBottom: 10, paddingTop: 10 }}>
              <Text
                textBreakStrategy={"highQuality"}
                style={{
                  textAlign: "center",
                  color: "#606060",
                  fontSize: 18,
                }}
              >
                Set Alert
              </Text>
            </View>
          </View>
          <Formik
            enableReinitialize
            validateOnMount={true}
            // validationSchema={validationSchema}
            initialValues={{
              address: "",
              // email: student?.email,
              country: student?.country || "",
              state: student?.state || "",
              city: student?.city || "",
              selectedCountry: student?.country || "",
              selectedState: student?.state || "",
              selectedCity: student?.city || "",
              distance: "",
              distanceinkm: false,
            }}
            onSubmit={async (values, { resetForm }) => {
              // if (Platform.OS === "android") {
              //   const granted = await PermissionsAndroid.request(
              //     PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
              //   );
              //   // const granted = await PermissionsAndroid.request(
              //   //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
              //   // );
              //   if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              //     let coordinates = getCoordinates(values);
              //   }
              // }
              let coordinates = getCoordinates(values);
              // console.log("coordinates", coordinates);
            }}
          >
            {({
              handleChange,
              setFieldValue,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <View style={{ marginTop: 30, padding: 20 }}>
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
                      style={[{ flex: 1, marginTop: 13 }]}
                      checked={checkBox}
                      onChange={(checked) => {
                        if (checked) {
                          setCheckBox(checked);
                          setFieldValue("address", currentUser?.address || "");
                          setFieldValue("country", currentUser?.country || "");
                          setFieldValue(
                            "selectedCountry",
                            currentUser?.country || ""
                          );
                          setFieldValue("state", currentUser?.state || "");
                          setFieldValue(
                            "selectedState",
                            currentUser?.state || ""
                          );
                          setFieldValue("city", currentUser?.city || "");
                          setFieldValue(
                            "selectedCity",
                            currentUser?.city || ""
                          );
                        } else {
                          setCheckBox(checked);
                          setFieldValue("address", "");
                          setFieldValue("country", "");
                          setFieldValue("selectedCountry", "");
                          setFieldValue("selectedCity", "");
                          setFieldValue("selectedState", "");
                          setFieldValue("state", "");
                          setFieldValue("city", "");
                        }
                        // if (checked) {
                        //   Alert.alert(checked);
                        // } else {
                        //   Alert.alert(checked);
                        // }
                      }}
                    ></CheckBox>
                  </View>
                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Address`}
                    value={values?.address}
                    onChangeText={handleChange("address")}
                    onBlur={handleBlur("address")}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     firstname: value,
                    //   })
                    // }
                  />
                  {errors.address && touched.address && (
                    <Text style={styles.errorText}>{errors.address}</Text>
                  )}

                  <Autocomplete
                    placeholder="Country*"
                    value={values?.country}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    // label={evaProps => <Text {...evaProps}>Country*</Text>}
                    // onChangeText={(query) => {
                    //   // setFieldValue("country", query);
                    //   setCountriesData(
                    //     countries.filter((item) => filterCountries(item, query))
                    //   );
                    // }}
                    onChangeText={(query) => {
                      setFieldValue("country", query);
                      setCountriesData(
                        countries.filter((item) => filterCountries(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedCountry = countriesData[query];
                      setFieldValue("country", selectedCountry.name);
                      setFieldValue("selectedCountry", selectedCountry.name);
                      setFieldValue("selectedState", "");
                      setFieldValue("state", "");
                      setStates([]);
                      GetAllStates(selectedCountry.name.replace(/ /g, "")).then(
                        (res) => {
                          setStates(res.data);
                          setStatesData(states);
                        }
                      );
                      // getSchoolsByFilter(selectedCountry.name);
                    }}
                  >
                    {countriesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item.name} />;
                    })}
                  </Autocomplete>
                  {errors.country && touched.country && (
                    <Text style={styles.errorText}>{errors.country}</Text>
                  )}
                  <Autocomplete
                    placeholder="State*"
                    value={values.state}
                    // value={student?.state}
                    placement="bottom"
                    style={{ marginVertical: 5 }}
                    disabled={!values.selectedCountry}
                    onChangeText={(query) => {
                      setFieldValue("state", query);
                      setStatesData(
                        states.filter((item) => filterStates(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedState = statesData[query];
                      setFieldValue("state", selectedState);
                      setFieldValue("selectedState", selectedState);
                      setFieldValue("selectedCity", "");
                      setFieldValue("city", "");
                      setCities([]);
                      GetAllCities(values.selectedCountry, selectedState).then(
                        (res) => {
                          setCities(res.data);
                        }
                      );
                      // getSchoolsByFilter(values.selectedCountry, selectedState);
                    }}
                  >
                    {statesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>

                  {errors.state && touched.state && (
                    <Text style={styles.errorText}>{errors.state}</Text>
                  )}
                  <Autocomplete
                    placeholder="City"
                    value={values?.city}
                    placement="bottom"
                    disabled={!values.selectedState}
                    // disabled={!student?.selectedState}
                    style={{ marginVertical: 5 }}
                    onChangeText={(query) => {
                      setFieldValue("city", query);
                      // setFieldValue("selectedCity", query);
                      setCitiesData(
                        cities.filter((item) => filterCities(item, query))
                      );
                    }}
                    onSelect={(query) => {
                      const selectedCity = citiesData[query];
                      setFieldValue("city", selectedCity);
                      setFieldValue("selectedCity", selectedCity);
                      // getSchoolsByFilter("", "", selectedCity);
                    }}
                  >
                    {citiesData.map((item, index) => {
                      return <AutocompleteItem key={index} title={item} />;
                    })}
                  </Autocomplete>

                  <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Distance`}
                    value={values?.distance}
                    onChangeText={handleChange("distance")}
                    onBlur={handleBlur("distance")}
                    // onChangeText={(value: string) =>
                    //   setStudent({
                    //     ...student,
                    //     firstname: value,
                    //   })
                    // }
                  />
                  {errors.distance && touched.distance && (
                    <Text style={styles.errorText}>{errors.distance}</Text>
                  )}

                  <RadioGroup
                    selectedIndex={selectedIndex}
                    onChange={(index) => setSelectedIndex(index)}
                  >
                    <Radio>Miles</Radio>
                    <Radio>Km</Radio>
                  </RadioGroup>
                </View>

                <View style={styles.buttonText}>
                  <LinearGradientButton
                    style={{
                      borderRadius: 25,
                      flex: 1,
                      backgroundColor: isValid ? Colors.primary : Colors.gray,
                    }}
                    appearance="ghost"
                    size="medium"
                    status="control"
                    onPress={() => handleSubmit()}
                  >
                    I'm done
                  </LinearGradientButton>
                </View>
                <View style={styles.buttonText}>
                  <LinearGradientButton
                    style={{
                      borderRadius: 25,
                      flex: 1,
                    }}
                    appearance="ghost"
                    size="medium"
                    status="control"
                    onPress={() => {
                      hide();
                    }}
                  >
                    Cancel
                  </LinearGradientButton>
                </View>
              </>
            )}
          </Formik>
        </Card>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default DistanceAlerttModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  inputSettings: {
    marginTop: 7,
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: "row",
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    marginTop: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
  },
  errorText: {
    fontSize: 13,
    color: "red",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
