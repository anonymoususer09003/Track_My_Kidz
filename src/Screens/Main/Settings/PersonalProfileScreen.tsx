import React, { ReactElement, ReactText, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "@/Theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Icon,
  Input,
  Select,
  SelectItem,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { AppHeader, ProfileAvatarPicker } from "@/Components";
import ImagePicker from "react-native-image-crop-picker";
import {
  ImagePickerResponse,
  launchImageLibrary,
} from "react-native-image-picker";
import { loadUserId } from "@/Storage/MainAppStorage";
import { UpdateUser } from "../../../Services/SettingsServies";
import { Formik } from "formik";
import * as yup from "yup";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
// @ts-ignore
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "@/Store/User";
import { PlaceState } from "@/Store/Places";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import FetchOne from "@/Store/User/FetchOne";
import Colors from "@/Theme/Colors";

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};

const PersonalProfileScreen = () => {
  const { Layout } = useTheme();
  const [selectedImage, setSelectedImage] = React.useState<string | undefined>(
    undefined
  );
  const [languages, setLanguages] = useState<Array<ReactText>>(["English"]);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [isEditMode, setisEditMode] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);
  const [userId, setuserId] = useState(null);
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const isLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading
  );
  const [placement, setPlacement] = React.useState("bottom");
  const [countriesData, setCountriesData] = React.useState(countries);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const dispatch = useDispatch();

  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);

  const getUserId = async () => {
    const id: any = await loadUserId();
    setuserId(id);
    // dispatch(FetchOne.action(id));
  };

  useEffect(() => {
    getUserId();
  }, []);

  function getUriSource(): any {
    return { uri: selectedImage };
  }
  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );

  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="plus" />}
      onPress={imageGalleryLaunch}
    />
  );

  const imageGalleryLaunch = () => {
    ImagePicker.openPicker({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: "Loading image",
    }).then((image) => {
      if (image != null) {
        const source = { uri: image?.path };
        setSelectedImage(source.uri);
      }
    });
  };

  const personalProfileValidationSchema = yup.object().shape({
    username: yup
      .string()
      .min(4, ({ min }) => `Username is not up to ${min} characters`)
      .required("Username is required"),
  });

  return (
    <>
      <AppHeader title="Profile" isBack />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            <Spinner status="primary" />
          </View>
        </View>
      ) : (
        <KeyboardAwareScrollView style={{ flex: 1 }} extraScrollHeight={150}>
          <ScrollView style={styles.container}>
            <View style={[[Layout.column, Layout.justifyContentCenter]]}>
              <Formik
                validateOnMount={true}
                initialValues={{
                  username: user?.username || "",
                  firstName: user?.firstname || "",
                  lastName: user?.lastname || "",
                  address: user?.address || "",
                  apartment: user?.apartment || "",
                  country: user?.country || "",
                  email: user?.email || "",
                  zipcode: user?.zipcode || "",
                  city: user?.city || "",
                  state: user?.state || "",
                  phone: user?.phone || "",
                  selectedCountry: user?.country || "",
                  seletedState: user?.state || "",
                  selectedCity: user?.city || "",
                }}
                onSubmit={(values, { resetForm }) => {
                  setisSending(true);
                  let objectToPass = {
                    firstname: values.firstName,
                    lastname: values.lastName,
                    id: userId,
                    address: values.address,
                    state: values.state,
                    country: values.country,
                    city: values.city,
                    zipcode: values.zipcode,
                    phone: values.phone,
                    term: true,
                  };
                  UpdateUser(objectToPass, "parent")
                    .then((response: any) => {
                      if (response.status == 200) {
                        setisEditMode(false);
                        setisSending(false);
                        getUserId();
                      }
                    })
                    .catch((error: any) => {
                      console.log("Error", error);
                      Alert.alert(error?.data.title, error?.data.detail, [
                        { text: "OK", style: "cancel" },
                      ]);
                      setisSending(false);
                      setisEditMode(!isEditMode);
                    });
                }}
              >
                {({
                  handleChange,
                  handleSubmit,
                  setFieldValue,
                  values,
                  errors,
                  touched,
                }) => (
                  <>
                    {isSending ? (
                      <View style={styles.sppinerContainer}>
                        <Spinner status="primary" />
                      </View>
                    ) : (
                      <>
                        <View style={{ flexDirection: "column" }}>
                          <Text style={styles.editLabel}>Email</Text>
                          <Text style={styles.editField}>{values.email}</Text>
                        </View>

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>First Name</Text>
                            <Text style={styles.editField}>
                              {values.firstName}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>First Name</Text>
                            )}
                            value={values.firstName}
                            onChangeText={handleChange("firstName")}
                          />
                        )}

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Last Name</Text>
                            <Text style={styles.editField}>
                              {values.lastName}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Last Name</Text>
                            )}
                            value={values.lastName}
                            onChangeText={handleChange("lastName")}
                          />
                        )}
                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Street Address</Text>
                            <Text style={styles.editField}>
                              {values.address}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Street Address</Text>
                            )}
                            value={values.address}
                            onChangeText={handleChange("address")}
                          />
                        )}
                        <Autocomplete
                          placeholder="Enter Country*"
                          value={values.country}
                          placement={placement}
                          style={{
                            marginTop: 10,
                            marginBottom: 5,
                            backgroundColor: Colors.white,
                          }}
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
                            setFieldValue("country", selectedCountry.name);
                            setFieldValue(
                              "selectedCountry",
                              selectedCountry.name
                            );
                            setFieldValue("selectedState", "");
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
                          {countriesData.map((item, index) => {
                            return (
                              <AutocompleteItem key={index} title={item.name} />
                            );
                          })}
                        </Autocomplete>
                        <Autocomplete
                          placeholder="Enter State*"
                          value={values.state}
                          placement={placement}
                          style={{
                            marginVertical: 5,
                            backgroundColor: Colors.white,
                          }}
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
                            setFieldValue("selectedState", selectedState);
                            setFieldValue("selectedCity", "");
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
                            return (
                              <AutocompleteItem key={index} title={item} />
                            );
                          })}
                        </Autocomplete>
                        <Autocomplete
                          placeholder="Enter City"
                          value={values.city}
                          placement={placement}
                          style={{
                            marginVertical: 5,
                            backgroundColor: Colors.white,
                          }}
                          // label={evaProps => <Text {...evaProps}>City</Text>}
                          onChangeText={(query) => {
                            setFieldValue("city", query);
                            setCitiesData(
                              cities.filter((item) => filterCities(item, query))
                            );
                          }}
                          onSelect={(query) => {
                            setFieldValue("city", citiesData[query]);
                            setFieldValue("selectedCity", citiesData[query]);
                          }}
                        >
                          {citiesData.map((item, index) => {
                            return (
                              <AutocompleteItem key={index} title={item} />
                            );
                          })}
                        </Autocomplete>
                        {/* {
                            !isEditMode ?
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.editLabel}>
                                  Zip code
                                </Text>
                                <Text style={styles.editField}>
                                  {values.zipcode}
                                </Text>
                              </View>

                              :
                              <Input
                                style={styles.inputSettings}
                                autoCapitalize='none'
                                label={evaProps => <Text {...evaProps}>Zip code</Text>}
                                value={values.zipcode}
                                onChangeText={handleChange('zipcode')}
                              />

                          } */}
                        {isEditMode ? (
                          <View style={{ marginTop: 10 }}>
                            <View style={styles.background}>
                              <TouchableOpacity
                                style={styles.background}
                                onPress={handleSubmit}
                              >
                                <Text style={styles.button}>Submit</Text>
                              </TouchableOpacity>
                            </View>
                            <Button
                              size="small"
                              appearance="outline"
                              onPress={() => {
                                setFieldValue("firstName", user?.firstname);
                                setFieldValue("lastName", user?.lastname);
                                setFieldValue("country", user?.country);
                                setFieldValue("state", user?.state);
                                setFieldValue("city", user?.city);
                                setisEditMode(false);
                              }}
                              style={{ borderRadius: 10, width: "100%" }}
                            >
                              Cancel
                            </Button>
                          </View>
                        ) : (
                          <View style={{ marginTop: 10 }}>
                            <View style={styles.background}>
                              <TouchableOpacity
                                style={styles.background}
                                onPress={() => setisEditMode(true)}
                              >
                                <Text style={styles.button}>Edit</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </>
                    )}
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
      )}
    </>
  );
};

export default PersonalProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    //backgroundColor: 'background-basic-color-1',
  },
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
    backgroundColor: "#3AA5A2",
    tintColor: "#ECF1F7",
  },
  profileImage: {
    width: 126,
    height: 126,
    borderRadius: 63,
    alignSelf: "center",
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectSettings: {
    marginTop: 18,
  },
  inputSettings: {
    marginTop: 7,
    backgroundColor: Colors.white,
    // maxHeight: 35
  },
  disabledInputSettings: {
    marginTop: 7,
    borderColor: Colors.transparent,
    backgroundColor: Colors.transparent,
    color: "black",
    tintColor: "black",
  },

  background: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  button: {
    paddingTop: 10,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  editField: {
    paddingLeft: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingVertical: 10,
  },
  editLabel: {
    fontSize: 15,
    color: "#8f9bb3",
    marginBottom: 4,
    marginTop: 8,
    fontWeight: "bold",
  },
  professionalCheckbox: {
    marginTop: 10,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: "text-hint-color",
    marginLeft: 10,
  },
  errorText: {
    fontSize: 13,
    color: "red",
  },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.fieldLabel,
  },
});
