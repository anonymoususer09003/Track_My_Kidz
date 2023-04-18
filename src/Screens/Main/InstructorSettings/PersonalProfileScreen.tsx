import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  Alert,
} from "react-native";
import { useTheme } from "@/Theme";
import { ProfileAvatarPicker } from "@/Components";
import ImagePicker from "react-native-image-crop-picker";
import { ImagePickerModal } from "@/Modals";
import { useIsFocused } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ChangeUserState from "@/Store/User/FetchOne";
import fetchOneUserService from "@/Services/User/FetchOne";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Spinner,
  Text,
  Autocomplete,
  AutocompleteItem,
  Icon,
} from "@ui-kitten/components";
import { AppHeader } from "@/Components";
import { loadUserId } from "@/Storage/MainAppStorage";
import { UpdateUser } from "../../../Services/SettingsServies";
import { Formik } from "formik";
// @ts-ignore
import { useSelector, useDispatch } from "react-redux";
import { UserState } from "@/Store/User";
import { PlaceState } from "@/Store/Places";
import { GetAllCities, GetAllStates } from "@/Services/PlaceServices";
import FetchOne from "@/Store/User/FetchOne";
import Colors from "@/Theme/Colors";
import { CountryDTO } from "@/Models/CountryDTOs";

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};
const filterStates = (item: string, query: string) => {
  return item?.toLowerCase().includes(query.toLowerCase());
};
const filterCities = (item: string, query: string) => {
  return item?.toLowerCase()?.includes(query.toLowerCase());
};

const PersonalProfileScreen = () => {
  const { Layout } = useTheme();
  const isFocused = useIsFocused();
  const countries = useSelector(
    (state: { places: PlaceState }) => state.places.countries
  );
  const [isEditMode, setisEditMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSending, setisSending] = useState(false);
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const [userId, setuserId] = useState(null);
  const isLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading
  );
  const dispatch = useDispatch();

  const [placement, setPlacement] = React.useState("bottom");
  const [countriesData, setCountriesData] = React.useState(countries);
  const [states, setStates] = useState<Array<any>>([]);
  const [cities, setCities] = useState<Array<any>>([]);
  const [statesData, setStatesData] = React.useState<Array<any>>([]);
  const [citiesData, setCitiesData] = React.useState<Array<any>>([]);
  const currentUser = useSelector(
    (state: { user: UserState }) => state.user.item
  );
  const [selectedImage, setSelectedImage] = React.useState("");

  const [uploadedImage, setUploadedImage] = React.useState();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const getUserId = async () => {
    const id: any = await loadUserId();
    setuserId(id);
    dispatch(FetchOne.action(id));
  };

  const imageCameraLaunch = () => {
    ImagePicker.openCamera({
      cropping: true,
      cropperCircleOverlay: true,
      width: 139,
      height: 130,
      compressImageQuality: 0.2,
      loadingLabelText: "Loading image",
    }).then((image) => {
      if (image != null) {
        const source = { uri: image?.path };
        setUploadedImage(image);
        setSelectedImage(source.uri);
        // uploadAvatarToAWS(source.uri).then(r => { console.log('here', r) }).catch((err) => { console.log('Errorr', err) })
      }
    });
  };
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
  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="edit" />}
      onPress={() => setVisible(true)}
    />
  );
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> =
      renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  useEffect(() => {
    // getUserId();

    GetAllStates(currentUser?.country?.trim()).then((res) => {
      setStates(res.data);
      setStatesData(states);
    });
    GetAllCities(currentUser?.country?.trim(), currentUser?.state?.trim()).then(
      (res) => {
        setCities(res.data);
      }
    );
  }, []);
  console.log("current user", currentUser);
  return (
    <>
      {visible && (
        <ImagePickerModal
          openCamera={imageCameraLaunch}
          openGallery={imageGalleryLaunch}
          close={() => setVisible(false)}
        />
      )}
      <AppHeader title="Profile" isBack />

      <View style={{ width: "100%" }}>
        {(selectedImage != "" || currentUser?.imageurl?.length > 0) && (
          <ProfileAvatarPicker
            style={styles.profileImage}
            // resizeMode='center'
            source={{
              uri:
                selectedImage ||
                currentUser?.imageurl + "?time" + new Date().getTime(),
              headers: { Pragma: "no-cache" },
            }}
            editButton={isEditMode ? renderEditAvatarButton : null}
          />
        )}
        {currentUser?.imageurl == null && selectedImage == "" && (
          <View
            style={[
              styles.profileImage,
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: Colors.lightgray,
              },
            ]}
          >
            <Text style={{ fontSize: 30 }}>
              {currentUser?.firstname?.substring(0, 1)?.toUpperCase()}{" "}
              {currentUser?.lastname?.substring(0, 1)?.toUpperCase()}
            </Text>
            {isEditMode && renderEditButtonElement()}
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            <Spinner status="primary" />
          </View>
        </View>
      ) : (
        <KeyboardAwareScrollView style={{ flex: 1 }} extraScrollHeight={250}>
          <View style={[[Layout.column, Layout.justifyContentCenter]]}>
            {isFocused && (
              <Formik
                validateOnMount={true}
                initialValues={{
                  username: currentUser?.username || "",
                  firstName: currentUser?.firstname || "",
                  lastName: currentUser?.lastname || "",
                  address: currentUser?.address || "",
                  country: currentUser?.country || "",
                  email: currentUser?.email || "",
                  zipcode: currentUser?.zipcode || "",
                  city: currentUser?.city || "",
                  state: currentUser?.state || "",
                  phone: currentUser?.phone || "",
                  selectedCountry: "",
                  selectedState: "",
                  selectedCity: "",
                  schoolName: currentUser?.schoolName || "",
                }}
                onSubmit={(values, { resetForm }) => {
                  setisSending(true);
                  let objectToPass = {
                    firstname: values.firstName,
                    lastname: values.lastName,
                    id: currentUser?.instructorId,
                    address: values.address,
                    state: values.state,
                    country: values.country,
                    city: values.city,
                    zipcode: values.zipcode,
                    phone: values.phone,
                    schoolName: values?.schoolName || "",
                    schoolId: values.schoolId,
                    term: true,
                    grades: [],
                    isAdmin: currentUser?.isAdmin,
                  };

                  let formData = new FormData();
                  formData.append(
                    "image",
                    uploadedImage
                      ? {
                          uri: uploadedImage?.path,
                          name: uploadedImage.mime,
                          type: uploadedImage.mime,
                        }
                      : {
                          uri:
                            currentUser?.imageurl ||
                            "https://pictures-tmk.s3.amazonaws.com/images/image/man.png",
                          name: "avatar",
                          type: "image/png",
                        }
                  );
                  formData.append("firstname", values.firstName);
                  formData.append("lastname", values.lastName);

                  formData.append("address", values?.schoolName || "");
                  formData.append("email", currentUser?.email || "");
                  formData.append("state", values.state);
                  formData.append("city", values.city);
                  formData.append("country", values.country);
                  formData.append("zipcode", values.zipcode);

                  formData.append("term", true);
                  formData.append("isAdmin", currentUser?.isAdmin);
                  formData.append("id", currentUser?.instructorId);
                  formData.append("schoolId", currentUser?.schoolId || "");
                  formData.append("orgId", currentUser?.orgId || "");
                  console.log("form data", JSON.stringify(formData));
                  UpdateUser(formData, "instructor")
                    .then(async (response: any) => {
                      if (response.status == 200) {
                        // setisSent(true)
                        setisEditMode(false);
                        setisSending(false);
                        getUserId();
                      }
                      let res = await fetchOneUserService();
                      console.log("res", res);
                      // if (!res?.childTrackHistory) {
                      //   // await BackgroundService.stop();
                      // }
                      // await BackgroundService.stop();
                      dispatch(
                        ChangeUserState.action({
                          item: res,
                          fetchOne: { loading: false, error: null },
                        })
                      );
                    })
                    .catch((error: any) => {
                      console.log("Error", error);
                      // Alert.alert(
                      //   error?.data.title,
                      //   error?.data.detail,
                      //   [{ text: 'OK', style: 'cancel' }],
                      // )
                      // setisSent(true)
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
                            <Text style={styles.editLabel}>Phone Number</Text>
                            <Text style={styles.editField}>{values.phone}</Text>
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
                            <Text style={styles.editLabel}>Street Address</Text>
                            <Text style={styles.editField}>
                              {values.address}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={[styles.inputSettings, { marginBottom: 5 }]}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Street Address</Text>
                            )}
                            value={values.address}
                            onChangeText={handleChange("address")}
                          />
                        )}

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>School Name</Text>
                            <Text style={styles.editField}>
                              {values.schoolName}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>School Name</Text>
                            )}
                            value={values.schoolName}
                            onChangeText={handleChange("schoolName")}
                          />
                        )}

                        {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Zip/Post code</Text>
                            <Text style={styles.editField}>
                              {values.zipcode}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Zip/Post code</Text>
                            )}
                            value={values.zipcode}
                            onChangeText={handleChange("zipcode")}
                          />
                        )}

                        <Autocomplete
                          placeholder="Enter Country*"
                          value={values.country}
                          placement={placement}
                          style={{
                            marginVertical: 5,
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
                            setFieldValue("city", "");
                            setStates([]);
                            GetAllStates(selectedCountry.name.trim()).then(
                              (res) => {
                                setStates(res.data);
                                setStatesData(states);
                              }
                            );
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
                              values.selectedCountry.trim(),
                              selectedState.trim()
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
                        {/* {!isEditMode ? (
                          <View style={{ flexDirection: "column" }}>
                            <Text style={styles.editLabel}>Zip code</Text>
                            <Text style={styles.editField}>
                              {values.zipcode}
                            </Text>
                          </View>
                        ) : (
                          <Input
                            style={styles.inputSettings}
                            autoCapitalize="none"
                            label={(evaProps) => (
                              <Text {...evaProps}>Zip code</Text>
                            )}
                            value={values.zipcode}
                            onChangeText={handleChange("zipcode")}
                          />
                        )} */}
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
            )}
            {isKeyboardVisible && <View style={{ height: 400 }} />}
          </View>
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
    fontSize: 16,
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
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
    backgroundColor: "color-primary-default",
    tintColor: "background-basic-color-1",
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: "center",
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    top: 70,
    left: 80,
  },
});
