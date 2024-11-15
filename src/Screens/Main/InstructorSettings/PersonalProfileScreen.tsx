import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/Theme';
import { AppHeader, LinearGradientButton, ProfileAvatarPicker } from '@/Components';
import ImagePicker from 'react-native-image-crop-picker';
import { ImagePickerModal } from '@/Modals';
import { useIsFocused } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ChangeUserState from '@/Store/User/FetchOne';
import FetchOne from '@/Store/User/FetchOne';
import fetchOneUserService from '@/Services/User/FetchOne';
import Autocomplete from '@/Components/CustomAutocomplete';
import {
  // Autocomplete,
  AutocompleteItem,
  Button,
  ButtonElement,
  ButtonProps,
  Icon,
  Input,
  Text,
} from '@ui-kitten/components';
import { loadUserId } from '@/Storage/MainAppStorage';
import { UpdateUser } from '../../../Services/SettingsServies';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { UserState } from '@/Store/User';
import { PlaceState } from '@/Store/Places';
import { GetAllCities, GetAllStates } from '@/Services/PlaceServices';
import Colors from '@/Theme/Colors';
import { CountryDTO } from '@/Models/CountryDTOs';
import BackgroundLayout from '@/Components/BackgroundLayout';
import FA5 from 'react-native-vector-icons/FontAwesome5';
import AutocompleteInput from 'react-native-autocomplete-input';

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
  const userIcon = require('@/Assets/Images/approval_icon2.png');
  const phone = require('@/Assets/Images/phone.png');
  const marker = require('@/Assets/Images/marker.png');
  const email = require('@/Assets/Images/email.png');
  const { Layout } = useTheme();
  const isFocused = useIsFocused();
  const countries = useSelector((state: { places: PlaceState }) => state.places.countries);
  const [isEditMode, setisEditMode] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isSending, setisSending] = useState<boolean>(false);
  const user: any = useSelector((state: { user: UserState }) => state.user.item);
  const [userId, setuserId] = useState<any>(null);
  const isLoading = useSelector((state: { user: UserState }) => state.user.fetchOne.loading);
  const dispatch = useDispatch();
  const [showResult, setShowResult] = useState(false);
  const [placement, setPlacement] = React.useState<string>('bottom');
  const [countriesData, setCountriesData] = React.useState(countries);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [statesData, setStatesData] = React.useState<any[]>([]);
  const [citiesData, setCitiesData] = React.useState<any[]>([]);
  const currentUser: any = useSelector((state: { user: UserState }) => state.user.item);
  const [selectedImage, setSelectedImage] = React.useState<string>('');

  const [uploadedImage, setUploadedImage] = React.useState<any>();
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
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
      loadingLabelText: 'Loading image',
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
      loadingLabelText: 'Loading image',
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
    const buttonElement: React.ReactElement<ButtonProps> = renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  const renderPersonIcon = () => (
    <Image
      source={userIcon}
      style={{ height: 18, width: 18, marginRight: 10 }}
      resizeMode="contain"
    />
  );
  const renderLocationIcon = () => (
    <Image source={marker} style={{ height: 20, width: 20 }} resizeMode="contain" />
  );
  const renderEmailIcon = () => (
    <Image source={email} style={{ height: 18, width: 18, marginRight: 12 }} resizeMode="contain" />
  );
  const renderPhoneIcon = () => (
    <Image source={phone} style={{ height: 20, width: 20, marginRight: 10 }} resizeMode="contain" />
  );
  const renderSchoolIcon = () => (
    <FA5
      name="school"
      size={15}
      style={{ height: 20, width: 20, marginRight: 10 }}
      color={Colors.secondaryDark}
      adjustsFontSizeToFit
    />
  );

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  useEffect(() => {
    // getUserId();

    // if (!res?.childTrackHistory) {
    //   // await BackgroundService.stop();
    // }
    // await BackgroundService.stop();

    GetAllStates(currentUser?.country?.trim()).then((res) => {
      setStates(res.data);
      setStatesData(states);
    });
    GetAllCities(currentUser?.country?.trim(), currentUser?.state?.trim()).then((res) => {
      setCities(res.data);
    });
  }, []);
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
      let res = await GetAllCities(currentUser?.country, currentUser?.state);
      setCities(res.data);
      setCitiesData(res.data);
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    if (currentUser && isEditMode) {
      fetchState();
      fetchCity();
    }
  }, [currentUser && isEditMode]);
  return (
    <>
      {visible && (
        <ImagePickerModal
          openCamera={imageCameraLaunch}
          openGallery={imageGalleryLaunch}
          close={() => setVisible(false)}
        />
      )}
      <AppHeader hideCenterIcon hideCalendar={true} />

      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>{/* <Spinner status="primary" /> */}</View>
        </View>
      ) : (
        <BackgroundLayout title="Profile">
          <View style={{ width: '100%', marginBottom: 20 }}>
            {(selectedImage != '' || currentUser?.imageurl?.length > 0) && (
              <ProfileAvatarPicker
                style={styles.profileImage}
                // resizeMode='center'
                source={{
                  uri: selectedImage || currentUser?.imageurl + '?time' + new Date().getTime(),
                  headers: { Pragma: 'no-cache' },
                }}
                editButton={isEditMode ? renderEditAvatarButton : null}
              />
            )}
            {currentUser?.imageurl == null && selectedImage == '' && (
              <View
                style={[
                  styles.profileImage,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: Colors.lightgray,
                  },
                ]}
              >
                <Text style={{ fontSize: 30 }}>
                  {currentUser?.firstname?.substring(0, 1)?.toUpperCase()}{' '}
                  {currentUser?.lastname?.substring(0, 1)?.toUpperCase()}
                </Text>
                {isEditMode && renderEditButtonElement()}
              </View>
            )}
          </View>
          <KeyboardAwareScrollView
            style={styles.layout}
            enableAutomaticScroll
            keyboardShouldPersistTaps={'handled'}
            // extraScrollHeight={10}
          >
            <View style={[[Layout.column, Layout.justifyContentCenter]]}>
              {isFocused && (
                <Formik
                  validateOnMount={true}
                  initialValues={{
                    username: currentUser?.username || '',
                    firstName: currentUser?.firstname || '',
                    lastName: currentUser?.lastname || '',
                    address: currentUser?.address || '',
                    country: currentUser?.country || '',
                    email: currentUser?.email || '',
                    zipcode: currentUser?.zipcode || '',
                    city: currentUser?.city || '',
                    state: currentUser?.state || '',
                    phone: currentUser?.phone || '',

                    selectedCountry: '',
                    selectedState: '',
                    selectedCity: '',
                    schoolName: currentUser?.schoolName || '',
                  }}
                  onSubmit={(values, { resetForm }) => {
                    setisSending(true);

                    let formData = new FormData();
                    formData.append(
                      'image',
                      uploadedImage
                        ? {
                            uri: uploadedImage?.path,
                            name: uploadedImage.mime,
                            type: uploadedImage.mime,
                          }
                        : {
                            uri:
                              currentUser?.imageurl ||
                              'https://pictures-tmk.s3.amazonaws.com/images/image/man.png',
                            name: 'avatar',
                            type: 'image/png',
                          }
                    );
                    formData.append('firstname', values.firstName);
                    formData.append('lastname', values.lastName);
                    formData.append('phone', values.phone);
                    formData.append('school', values?.schoolName);
                    formData.append('address', values?.address || '');
                    formData.append('email', currentUser?.email || '');
                    formData.append('state', values.state);
                    formData.append('city', values.city);
                    formData.append('country', values.country);
                    formData.append('zipcode', values.zipcode);

                    formData.append('term', true);
                    formData.append('isAdmin', currentUser?.isAdmin);
                    formData.append('id', currentUser?.instructorId);
                    formData.append('schoolId', currentUser?.schoolId || '');
                    formData.append('orgId', currentUser?.orgId || '');

                    UpdateUser(formData, 'instructor')
                      .then(async (response: any) => {
                        if (response.status == 200) {
                          // setisSent(true)
                          setisEditMode(false);
                          setisSending(false);
                          getUserId();
                        }
                        let res = await fetchOneUserService();

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
                        console.log('Error', error);
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
                  {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
                    <>
                      {isSending ? (
                        <View style={styles.sppinerContainer}>
                          {/* <Spinner status="primary" /> */}
                        </View>
                      ) : (
                        <>
                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.editLabel}>Email</Text>
                            <View style={[styles.editField]}>
                              {renderEmailIcon()}
                              <Text style={{ fontSize: 15, opacity: 0.2 }}>{values.email}</Text>
                            </View>
                          </View>
                          <View
                            style={{
                              width: '100%',
                            }}
                          >
                            {!isEditMode ? (
                              <View
                                style={{
                                  flexDirection: 'column',
                                  width: '100%',
                                }}
                              >
                                <Text style={styles.editLabel}>First Name</Text>

                                <View style={styles.editField}>
                                  {renderPersonIcon()}
                                  <Text style={{ fontSize: 15 }}> {values.firstName}</Text>
                                </View>
                              </View>
                            ) : (
                              <Input
                                accessoryLeft={renderPersonIcon}
                                style={[styles.inputSettings, { width: '45%' }]}
                                autoCapitalize="none"
                                label={(evaProps) => <Text {...evaProps}>First Name</Text>}
                                value={values.firstName}
                                onChangeText={handleChange('firstName')}
                              />
                            )}
                          </View>
                          {!isEditMode ? (
                            <View
                              style={{
                                flexDirection: 'column',
                                width: '100%',
                              }}
                            >
                              <Text style={styles.editLabel}>Last Name</Text>

                              <View style={styles.editField}>
                                {renderPersonIcon()}
                                <Text style={{ fontSize: 15 }}>{values.lastName}</Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              accessoryLeft={renderPersonIcon}
                              style={[styles.inputSettings, { width: '45%' }]}
                              autoCapitalize="none"
                              label={(evaProps) => <Text {...evaProps}>Last Name</Text>}
                              value={values.lastName}
                              onChangeText={handleChange('lastName')}
                            />
                          )}
                          {!isEditMode ? (
                            <View style={{ flexDirection: 'column' }}>
                              <Text style={styles.editLabel}>Phone Number</Text>
                              <View style={styles.editField}>
                                {renderPhoneIcon()}
                                <Text style={{ fontSize: 15 }}>{values.phone}</Text>
                              </View>
                            </View>
                          ) : (
                            <Input
                              keyboardType="number-pad"
                              style={styles.inputSettings}
                              accessoryLeft={renderPhoneIcon}
                              autoCapitalize="none"
                              label={(evaProps) => <Text {...evaProps}>Phone Number</Text>}
                              value={values.phone}
                              onChangeText={handleChange('phone')}
                            />
                          )}

                          {false && !isEditMode && (
                            <>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.editLabel}>School Name</Text>
                                <View style={styles.editField}>
                                  {renderSchoolIcon()}
                                  <Text style={{ fontSize: 15 }}>{values?.schoolName}</Text>
                                </View>
                              </View>
                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.editLabel}> Street Address</Text>
                                <View style={styles.editField}>
                                  {renderLocationIcon()}
                                  <Text style={{ fontSize: 15 }}>{values.address}</Text>
                                </View>
                              </View>
                              <Autocomplete
                                data={[]}
                                label={() => (
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      color: '#8f9bb3',
                                      marginBottom: 4,

                                      fontWeight: 'bold',
                                    }}
                                  >
                                    City
                                  </Text>
                                )}
                                disabled={!isEditMode}
                                placeholder="Enter City"
                                value={values.city}
                                icon={renderLocationIcon}
                                // label={evaProps => <Text {...evaProps}>City</Text>}

                                onSelect={(query) => {
                                  setFieldValue('city', citiesData[query]);
                                  setFieldValue('selectedCity', citiesData[query]);
                                }}
                              />

                              <Autocomplete
                                label={() => (
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      color: '#8f9bb3',
                                      marginBottom: 4,

                                      fontWeight: 'bold',
                                    }}
                                  >
                                    State
                                  </Text>
                                )}
                                disabled={!isEditMode}
                                placeholder="Enter State*"
                                value={values.state}
                                icon={renderLocationIcon}
                                // label={evaProps => <Text {...evaProps}>State</Text>}
                                data={[]}
                                onSelect={(query) => {
                                  const selectedState = statesData[query];
                                  setFieldValue('state', selectedState);
                                  setFieldValue('selectedState', selectedState);
                                  setFieldValue('selectedCity', '');
                                  setFieldValue('city', '');
                                  setCities([]);
                                  GetAllCities(
                                    values.selectedCountry.trim(),
                                    selectedState.trim()
                                  ).then((res) => {
                                    setCities(res.data);
                                  });
                                }}
                              />

                              <View style={{ flexDirection: 'column' }}>
                                <Text style={styles.editLabel}> Zip/Post code</Text>
                                <View style={styles.editField}>
                                  {renderLocationIcon()}
                                  <Text style={{ fontSize: 15, marginLeft: 10 }}>
                                    {values.zipcode}
                                  </Text>
                                </View>
                              </View>
                              <Autocomplete
                                label={() => (
                                  <Text
                                    style={{
                                      fontSize: 15,
                                      color: '#8f9bb3',
                                      marginBottom: 4,

                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Country
                                  </Text>
                                )}
                                disabled={!isEditMode}
                                placeholder="Enter Country*"
                                value={values.country}
                                data={[]}
                                icon={renderLocationIcon}
                                onSelect={(query) => {
                                  const selectedCountry = countriesData[query];
                                  setFieldValue('country', selectedCountry.name);
                                  setFieldValue('selectedCountry', selectedCountry.name);
                                  setFieldValue('selectedState', '');
                                  setFieldValue('state', '');
                                  setFieldValue('city', '');
                                  setStates([]);
                                  GetAllStates(selectedCountry.name.trim()).then((res) => {
                                    setStates(res.data);
                                    setStatesData(states);
                                  });
                                }}
                              />
                            </>
                          )}

                          {false && isEditMode && (
                            <>
                              <Input
                                disabled={true}
                                accessoryLeft={renderSchoolIcon()}
                                style={styles.inputSettings}
                                autoCapitalize="none"
                                label={(evaProps) => <Text {...evaProps}>School Information</Text>}
                                value={values?.schoolName}
                                onChangeText={handleChange('schoolName')}
                              />
                              {/* <Input
                                disabled={true}
                                style={[
                                  styles.inputSettings,
                                  {marginBottom: 5},
                                ]}
                                accessoryLeft={renderLocationIcon}
                                autoCapitalize="none"
                         
                                value={values.address}
                                onChangeText={handleChange('address')}
                              /> */}
                            </>
                          )}

                          {false && isEditMode && (
                            <>
                              {/* <Autocomplete
                                disabled={!currentUser?.isAdmin}
                                label={evaProps => (
                                  <Text {...evaProps}>Country</Text>
                                )}
                                placeholder="Enter Country*"
                                value={values.country}
                                placement={placement}
                                style={{
                                  marginVertical: 5,
                                  backgroundColor: Colors.white,
                                  borderRadius: 12,
                                  elevation: 1,
                                  marginTop: 10,
                                }}
                                accessoryLeft={renderLocationIcon}
                                onChangeText={query => {
                                  setFieldValue('country', query);
                                  setCountriesData(
                                    countries.filter(item =>
                                      filterCountries(item, query),
                                    ),
                                  );
                                }}
                                onSelect={query => {
                                  const selectedCountry = countriesData[query];
                                  setFieldValue(
                                    'country',
                                    selectedCountry.name,
                                  );
                                  setFieldValue(
                                    'selectedCountry',
                                    selectedCountry.name,
                                  );
                                  setFieldValue('selectedState', '');
                                  setFieldValue('state', '');
                                  setFieldValue('city', '');
                                  setStates([]);
                                  GetAllStates(
                                    selectedCountry.name.trim(),
                                  ).then(res => {
                                    setStates(res.data);
                                    setStatesData(states);
                                  });
                                }}>
                                {countriesData.map((item, index) => {
                                  return (
                                    <AutocompleteItem
                                    style={styles.autoCompleteItem}
                                      key={index}
                                      title={item.name}
                                    />
                                  );
                                })}
                              </Autocomplete> */}
                              <Autocomplete
                                disabled={true}
                                placeholder="Enter Country*"
                                data={countriesData}
                                onSelect={(item) => {
                                  const selectedCountry = item;
                                  setFieldValue('country', selectedCountry.name);
                                  setFieldValue('selectedCountry', selectedCountry.name);
                                  setFieldValue('selectedState', '');
                                  setFieldValue('state', '');
                                  setFieldValue('city', '');
                                  setStates([]);
                                  GetAllStates(selectedCountry.name.trim()).then((res) => {
                                    setStates(res.data);
                                    setStatesData(res.data);
                                  });
                                }}
                                icon={() => renderLocationIcon()}
                                value={values.country}
                              />
                              {/* <AutocompleteInput
                               inputContainerStyle={{
                                marginVertical: 5,
                                backgroundColor: Colors.white,
                                borderRadius: 5,
                                elevation: 1,
                                borderWidth:0.3,
                                overflow:'hidden'
                                // marginBottom: 40,
                              }}
                              // containerStyle={{minHeight:200}}
      data={countriesData.filter((item)=>item.name.startsWith(values.country))}
      value={values.country}
      onChangeText={(text) =>  setFieldValue('country', text)}
      flatListProps={{
        keyExtractor: (_, idx):any => idx,
        renderItem: ({ item }) =>{return <Text><TouchableOpacity> {item.name}</TouchableOpacity></Text>}
      }}
      onFocus={()=>setShowResult(false)}
      onBlur={()=>setShowResult(true)}
      hideResults={showResult}
    /> */}

                              <Autocomplete
                                data={statesData}
                                disabled={true}
                                placeholder="Enter State*"
                                onSelect={(item) => {
                                  const selectedState = item;

                                  setFieldValue('state', selectedState);
                                  setFieldValue('selectedState', selectedState);
                                  setFieldValue('selectedCity', '');
                                  setFieldValue('city', '');
                                  setCities([]);
                                  GetAllCities(
                                    values.selectedCountry.trim(),
                                    selectedState.trim()
                                  ).then((res) => {
                                    setCitiesData(res.data);
                                  });
                                }}
                                icon={() => renderLocationIcon()}
                                value={values.state}
                              />

                              {/* <Autocomplete
                                disabled={!currentUser?.isAdmin}
                                label={evaProps => (
                                  <Text {...evaProps}>State</Text>
                                )}
                                placeholder="Enter State*"
                                value={values.state}
                                placement={placement}
                                style={{
                                  marginVertical: 5,
                                  backgroundColor: Colors.white,
                                  borderRadius: 12,
                                  elevation: 1,
                                }}
                                accessoryLeft={renderLocationIcon}
                                // label={evaProps => <Text {...evaProps}>State</Text>}
                                onChangeText={query => {
                                  setFieldValue('state', query);
                                  setStatesData(
                                    states.filter(item =>
                                      filterStates(item, query),
                                    ),
                                  );
                                }}
                                onSelect={query => {
                                  const selectedState = statesData[query];
                                  setFieldValue('state', selectedState);
                                  setFieldValue('selectedState', selectedState);
                                  setFieldValue('selectedCity', '');
                                  setFieldValue('city', '');
                                  setCities([]);
                                  GetAllCities(
                                    values.selectedCountry.trim(),
                                    selectedState.trim(),
                                  ).then(res => {
                                    setCities(res.data);
                                  });
                                }}>
                                {statesData.map((item, index) => {
                                  return (
                                    <AutocompleteItem
                                    style={styles.autoCompleteItem}
                                      key={index}
                                      title={item}
                                    />
                                  );
                                })}
                              </Autocomplete> */}
                              {/* <AutocompleteInput
      data={statesData.filter((item)=>item?.name?.startsWith(values.state))}
      value={values.state}
      onChangeText={(text) =>  setFieldValue('state', text)}
      flatListProps={{
        keyExtractor: (_, idx):any => idx,
        renderItem: ({ item }) => <Text>{item.name}</Text>,
      }}
      onFocus={()=>setShowResult(false)}
      onBlur={()=>setShowResult(true)}
      hideResults={false}
    /> */}
                              {/* <Autocomplete
                                disabled={!currentUser?.isAdmin}
                                label={evaProps => (
                                  <Text {...evaProps}>City</Text>
                                )}
                                placeholder="Enter City"
                                value={values.city}
                                placement={placement}
                                style={{
                                  marginVertical: 5,
                                  backgroundColor: Colors.white,
                                  borderRadius: 12,
                                  elevation: 1,
                                }}
                                accessoryLeft={renderLocationIcon}
                                // label={evaProps => <Text {...evaProps}>City</Text>}
                                onChangeText={query => {
                                  setFieldValue('city', query);
                                  setCitiesData(
                                    cities.filter(item =>
                                      filterCities(item, query),
                                    ),
                                  );
                                }}
                                onSelect={query => {
                                  setFieldValue('city', citiesData[query]);
                                  setFieldValue(
                                    'selectedCity',
                                    citiesData[query],
                                  );
                                }}>
                                {citiesData.map((item, index) => {
                                  return (
                                    <AutocompleteItem
                                    style={styles.autoCompleteItem}
                                      key={index}
                                      title={item}
                                    />
                                  );
                                })}
                              </Autocomplete> */}

                              <Autocomplete
                                data={citiesData}
                                disableColor="transparent"
                                disabled={true}
                                placeholder="Enter City*"
                                onSelect={(item) => {
                                  setFieldValue('city', item);
                                  setFieldValue('selectedCity', item.name);
                                }}
                                icon={() => renderLocationIcon()}
                                value={values.city}
                              />

                              {/* <AutocompleteInput
      data={countriesData.filter((item)=>item?.name?.startsWith(values.city))}
      value={values.city}
      onChangeText={(text) =>  setFieldValue('city', text)}
      flatListProps={{
        keyExtractor: (_, idx):any => idx,
        renderItem: ({ item }) => <Text>{item.name}</Text>,
      }}
      onFocus={()=>setShowResult(false)}
      onBlur={()=>setShowResult(true)}
      hideResults={showResult}
    /> */}
                              <Input
                                disabled={true}
                                accessoryLeft={renderLocationIcon}
                                style={styles.inputSettings}
                                autoCapitalize="none"
                                value={values.zipcode}
                                onChangeText={handleChange('zipcode')}
                              />
                            </>
                          )}
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
                            <View style={{ marginVertical: 10 }}>
                              <LinearGradientButton onPress={handleSubmit}>
                                Submit
                              </LinearGradientButton>

                              <TouchableOpacity
                                onPress={() => {
                                  setFieldValue('firstName', user?.firstname);
                                  setFieldValue('lastName', user?.lastname);
                                  setFieldValue('country', user?.country);
                                  setFieldValue('state', user?.state);
                                  setFieldValue('city', user?.city);
                                  setisEditMode(false);
                                }}
                                style={{ width: '100%', marginTop: 10 }}
                              >
                                <Text
                                  style={{
                                    color: Colors.primary,
                                    textAlign: 'center',
                                  }}
                                >
                                  Cancel
                                </Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={{ marginTop: 10 }}>
                              <LinearGradientButton onPress={() => setisEditMode(true)}>
                                Edit
                              </LinearGradientButton>
                              <View style={styles.background}></View>
                            </View>
                          )}
                          <View style={{ height: 100 }} />
                        </>
                      )}
                    </>
                  )}
                </Formik>
              )}
              {isKeyboardVisible && <View style={{ height: 100 }} />}
            </View>
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
    //backgroundColor: 'background-basic-color-1',
  },
  layout: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
    padding: 20,
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  // todo check which styles are right one
  // profileAvatar: {
  //   width: 116,
  //   height: 116,
  //   borderRadius: 58,
  //   alignSelf: 'center',
  //   backgroundColor: '#3AA5A2',
  //   tintColor: '#ECF1F7',
  // },
  // profileImage: {
  //   width: 126,
  //   height: 126,
  //   borderRadius: 63,
  //   alignSelf: 'center',
  // },
  // editAvatarButton: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  // },
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
    color: 'black',
    tintColor: 'black',
  },

  background: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editField: {
    paddingLeft: 10,
    backgroundColor: Colors.white,
    elevation: 2,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  editLabel: {
    fontSize: 15,
    color: '#8f9bb3',
    marginBottom: 4,
    marginTop: 8,
    fontWeight: 'bold',
  },
  professionalCheckbox: {
    marginTop: 10,
  },
  termsCheckBox: {
    marginTop: 24,
  },
  termsCheckBoxText: {
    color: 'text-hint-color',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 13,
    color: 'red',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.fieldLabel,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
    backgroundColor: 'color-primary-default',
    tintColor: 'background-basic-color-1',
  },
  profileImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
  },
  editAvatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
    top: 70,
    left: 80,
  },
  editButton: {},
  autoCompleteItem: {
    // elevation: 2,

    width: Dimensions.get('screen').width * 0.9,
  },
});
