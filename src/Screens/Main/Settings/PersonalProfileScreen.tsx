import {
  AppHeader,
  LinearGradientButton
} from "@/Components";
import { loadUserId } from "@/Storage/MainAppStorage";
import { useTheme } from "@/Theme";
import {
  Autocomplete,
  AutocompleteItem, Button, Icon,
  Input, Spinner,
  Text
} from "@ui-kitten/components";
import { Formik } from "formik";
import React, { ReactText, useEffect, useState } from "react";
import {
  Alert, Image, ScrollView,
  StyleSheet,
  TouchableOpacity, View
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as yup from "yup";
import { UpdateUser } from "../../../Services/SettingsServies";
// @ts-ignore
import BackgroundLayout from "@/Components/BackgroundLayout";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import { PlaceState } from "@/Store/Places";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { useDispatch, useSelector } from "react-redux";

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
  const userIcon = require("@/Assets/Images/approval_icon2.png");
  const phone = require("@/Assets/Images/phone.png");
  const marker = require("@/Assets/Images/marker.png");
  const email = require("@/Assets/Images/email.png");
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
  const renderPersonIcon = (props: any) => (
    <Image
      source={userIcon}
      style={{ height: 18, width: 18, marginRight: 10 }}
      resizeMode="contain"
    />
  );
  const renderLocationIcon = (props: any) => (
    <Image
      source={marker}
      style={{ height: 20, width: 20 }}
      resizeMode="contain"
    />
  );
  const renderEmailIcon = (props: any) => (
    <Image
      source={email}
      style={{ height: 18, width: 18, marginRight: 12 }}
      resizeMode="contain"
    />
  );
  const renderPhoneIcon = (props: any) => (
    <Image
      source={phone}
      style={{ height: 20, width: 20, marginRight: 10 }}
      resizeMode="contain"
    />
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
      <AppHeader hideCenterIcon hideCalendar={true} />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            <Spinner status="primary" />
          </View>
        </View>
      ) : (
        <BackgroundLayout title="Profile">
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
                    apt: user?.apt || "",
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
                      apt: values?.apt,
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
                            <View style={styles.editField}>
                              {renderEmailIcon()}
                              <Text style={{ fontSize: 15 }}>
                                {values.email}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            {!isEditMode ? (
                              <View
                                style={{
                                  flexDirection: "column",
                                  width: "45%",
                                }}
                              >
                                <Text style={styles.editLabel}>First Name</Text>

                                <View style={styles.editField}>
                                  {renderPersonIcon()}
                                  <Text style={{ fontSize: 15 }}>
                                    {" "}
                                    {values.firstName}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <Input
                                accessoryLeft={renderPersonIcon}
                                style={[styles.inputSettings, { width: "45%" }]}
                                autoCapitalize="none"
                                label={(evaProps) => (
                                  <Text {...evaProps}>First Name</Text>
                                )}
                                value={values.firstName}
                                onChangeText={handleChange("firstName")}
                              />
                            )}

                            {!isEditMode ? (
                              <View
                                style={{
                                  flexDirection: "column",
                                  width: "45%",
                                }}
                              >
                                <Text style={styles.editLabel}>Last Name</Text>

                                <View style={styles.editField}>
                                  {renderPersonIcon()}
                                  <Text style={{ fontSize: 15 }}>
                                    {" "}
                                    {values.lastName}
                                  </Text>
                                </View>
                              </View>
                            ) : (
                              <Input
                                accessoryLeft={renderPersonIcon}
                                style={[styles.inputSettings, { width: "45%" }]}
                                autoCapitalize="none"
                                label={(evaProps) => (
                                  <Text {...evaProps}>Last Name</Text>
                                )}
                                value={values.lastName}
                                onChangeText={handleChange("lastName")}
                              />
                            )}
                          </View>

                          {!isEditMode ? (
                            <View style={{ flexDirection: "column" }}>
                              <Text style={styles.editLabel}>Phone Number</Text>
                              <View style={styles.editField}>
                                {renderPhoneIcon()}
                                <Text style={{ fontSize: 15 }}>
                                  {values.phone}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              keyboardType="number-pad"
                              style={styles.inputSettings}
                              autoCapitalize="none"
                              label={(evaProps) => (
                                <Text {...evaProps}>Phone Number</Text>
                              )}
                              value={values.phone}
                              onChangeText={handleChange("phone")}
                            />
                          )}

                          {!isEditMode ? (
                            <View style={{ flexDirection: "column" }}>
                              <Text style={styles.editLabel}>
                                Street Address
                              </Text>

                              <View style={styles.editField}>
                                {renderLocationIcon()}
                                <Text style={{ marginLeft: 8, fontSize: 15 }}>
                                  {" "}
                                  {values.address}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              accessoryLeft={renderLocationIcon}
                              style={styles.inputSettings}
                              autoCapitalize="none"
                              label={(evaProps) => (
                                <Text {...evaProps}>Street Address</Text>
                              )}
                              value={values.address}
                              onChangeText={handleChange("address")}
                            />
                          )}

                          {!isEditMode ? (
                            <View
                              style={{
                                flexDirection: "column",
                                marginBottom: 5,
                              }}
                            >
                              <Text style={styles.editLabel}> Ste/Apt</Text>
                              <View style={styles.editField}>
                                {renderLocationIcon()}
                                <Text style={{ fontSize: 15 }}>
                                  {values?.apt}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              style={[
                                styles.inputSettings,
                                { marginBottom: 5 },
                              ]}
                              accessoryLeft={renderLocationIcon}
                              autoCapitalize="none"
                              label={(evaProps) => (
                                <Text {...evaProps}>Ste/Apt</Text>
                              )}
                              value={values?.apt}
                              onChangeText={handleChange("apt")}
                            />
                          )}
                          {!isEditMode && (
                            <Autocomplete
                              label={(evaProps) => (
                                <Text {...evaProps} style={styles.editLabel}>
                                  City
                                </Text>
                              )}
                              accessoryLeft={renderLocationIcon}
                              placeholder="Enter City"
                              value={values.city}
                              placement={placement}
                              style={{
                                // marginBottom: 5,
                                backgroundColor: Colors.white,
                                borderRadius: 10,
                                elevation: 1,
                              }}
                              // label={evaProps => <Text {...evaProps}>City</Text>}
                              onChangeText={(query) => {
                                setFieldValue("city", query);
                                setCitiesData(
                                  cities.filter((item) =>
                                    filterCities(item, query)
                                  )
                                );
                              }}
                              onSelect={(query) => {
                                setFieldValue("city", citiesData[query]);
                                setFieldValue(
                                  "selectedCity",
                                  citiesData[query]
                                );
                              }}
                            >
                              {citiesData.map((item, index) => {
                                return (
                                  <AutocompleteItem key={index} title={item} />
                                );
                              })}
                            </Autocomplete>
                          )}

                          {isEditMode && (
                            <Autocomplete
                              label={(evaProps) => (
                                <Text
                                  {...evaProps}
                                  style={[styles.editLabel, { marginTop: 4 }]}
                                >
                                  Country
                                </Text>
                              )}
                              placeholder="Enter Country*"
                              value={values.country}
                              accessoryLeft={renderLocationIcon}
                              placement={placement}
                              style={{
                                // marginTop: 10,
                                // marginBottom: 5,
                                backgroundColor: Colors.white,
                                borderRadius: 10,
                                elevation: 1,
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
                                  <AutocompleteItem
                                    key={index}
                                    title={item.name}
                                  />
                                );
                              })}
                            </Autocomplete>
                          )}
                          <Autocomplete
                            label={(evaProps) => (
                              <Text {...evaProps} style={styles.editLabel}>
                                State
                              </Text>
                            )}
                            accessoryLeft={renderLocationIcon}
                            placeholder="Enter State*"
                            value={values.state}
                            placement={placement}
                            style={{
                              // marginBottom: 5,
                              backgroundColor: Colors.white,
                              borderRadius: 10,
                              elevation: 1,
                            }}
                            // label={evaProps => <Text {...evaProps}>State</Text>}
                            onChangeText={(query) => {
                              setFieldValue("state", query);
                              setStatesData(
                                states.filter((item) =>
                                  filterStates(item, query)
                                )
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
                          {isEditMode && (
                            <Autocomplete
                              label={(evaProps) => (
                                <Text {...evaProps} style={styles.editLabel}>
                                  City
                                </Text>
                              )}
                              accessoryLeft={renderLocationIcon}
                              placeholder="Enter City"
                              value={values.city}
                              placement={placement}
                              style={{
                                // marginBottom: 5,
                                backgroundColor: Colors.white,
                                borderRadius: 10,
                                elevation: 1,
                              }}
                              // label={evaProps => <Text {...evaProps}>City</Text>}
                              onChangeText={(query) => {
                                setFieldValue("city", query);
                                setCitiesData(
                                  cities.filter((item) =>
                                    filterCities(item, query)
                                  )
                                );
                              }}
                              onSelect={(query) => {
                                setFieldValue("city", citiesData[query]);
                                setFieldValue(
                                  "selectedCity",
                                  citiesData[query]
                                );
                              }}
                            >
                              {citiesData.map((item, index) => {
                                return (
                                  <AutocompleteItem key={index} title={item} />
                                );
                              })}
                            </Autocomplete>
                          )}
                          {!isEditMode ? (
                            <View style={{ flexDirection: "column" }}>
                              <Text style={styles.editLabel}>
                                {" "}
                                Zip/Post code
                              </Text>
                              <View style={styles.editField}>
                                {renderLocationIcon()}
                                <Text style={{ fontSize: 15, marginLeft: 10 }}>
                                  {values.zipcode}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              accessoryLeft={renderLocationIcon}
                              style={[
                                styles.inputSettings,
                                { marginBottom: 10 },
                              ]}
                              autoCapitalize="none"
                              label={(evaProps) => (
                                <Text {...evaProps}>Zip/Post code</Text>
                              )}
                              value={values.zipcode}
                              onChangeText={handleChange("zipcode")}
                            />
                          )}
                          {!isEditMode && (
                            <Autocomplete
                              label={(evaProps) => (
                                <Text {...evaProps} style={styles.editLabel}>
                                  Country
                                </Text>
                              )}
                              placeholder="Enter Country*"
                              value={values.country}
                              accessoryLeft={renderLocationIcon}
                              placement={placement}
                              style={{
                                // marginTop: 10,
                                marginBottom: 5,
                                backgroundColor: Colors.white,
                                borderRadius: 10,
                                elevation: 1,
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
                                  <AutocompleteItem
                                    key={index}
                                    title={item.name}
                                  />
                                );
                              })}
                            </Autocomplete>
                          )}

                          {isEditMode ? (
                            <View style={{ marginVertical: 10 }}>
                              <LinearGradientButton onPress={handleSubmit}>
                                Submit
                              </LinearGradientButton>

                              <TouchableOpacity
                                onPress={() => {
                                  setFieldValue("firstName", user?.firstname);
                                  setFieldValue("lastName", user?.lastname);
                                  setFieldValue("country", user?.country);
                                  setFieldValue("state", user?.state);
                                  setFieldValue("city", user?.city);
                                  setisEditMode(false);
                                }}
                                style={{ width: "100%", marginTop: 10 }}
                              >
                                <Text
                                  style={{
                                    color: Colors.primary,
                                    textAlign: "center",
                                  }}
                                >
                                  Cancel
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={{ marginTop: 10 }}>
                              <LinearGradientButton
                                onPress={() => setisEditMode(true)}
                              >
                                Edit
                              </LinearGradientButton>
                              <View style={styles.background}></View>
                            </View>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Formik>
              </View>
              <View style={{ height: 80 }} />
            </ScrollView>
          </KeyboardAwareScrollView>
        </BackgroundLayout>
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
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
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
    width: "100%",
    elevation: 1,
    borderRadius: 10,
    // maxHeight: 35
  },
  inputText: {
    fontSize: 12,
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
    paddingLeft: 10,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
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
