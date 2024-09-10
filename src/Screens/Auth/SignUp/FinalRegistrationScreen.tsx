import { RouteProp, useIsFocused } from '@react-navigation/native';

import {
  AutocompleteItem,
  Button,
  ButtonElement,
  ButtonProps,
  CheckBox,
  Icon,
  Input,
  Layout,
  Select,
  SelectItem,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import ChangeUserState from '@/Store/User/FetchOne';
import { ThunkDispatch } from '@reduxjs/toolkit';
import { storeIsSubscribed } from '@/Storage/MainAppStorage';
import { UpdateUser } from '@/Services/SettingsServies';
import Autocomplete from '@/Components/CustomAutocomplete';
import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { UpdateStudent } from '@/Services/Student';
import { CustomTextDropDown } from '@/Components';
import { getDeviceId } from 'react-native-device-info';
import { Formik } from 'formik';
import * as yup from 'yup';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { Dimensions } from 'react-native';
import { CompleteRegistration, Register } from '@//Services/SignUpServices';
import { LocationIcon, PersonIcon, PhoneIcon } from '@/Components/SignUp/icons';
import { RegisterDTO } from '@/Models/UserDTOs';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { CountryDTO } from '@/Models/CountryDTOs';
import { GetOrgByFilters } from '@/Services/Org';
import { GetAllCities, GetAllStates } from '@/Services/PlaceServices';
import { GetSchoolByFilters } from '@/Services/School';
import { storeToken, storeUserType } from '@/Storage/MainAppStorage';
import LoginStore from '@/Store/Authentication/LoginStore';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { PlaceState } from '@/Store/Places';
import Colors from '@/Theme/Colors';
import { LinearGradientButton, ProfileAvatarPicker } from '@/Components';
import { ImagePickerModal, ParentPaymentModal } from '@/Modals';
import { Login } from '@/Services/LoginServices';
import { ORGANISATIONS, USER_TYPES } from '@/Constants';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackNavigatorParamsList } from '@/Navigators/Auth/AuthNavigator';

const filterCountries = (item: CountryDTO, query: string) => {
  return item.name.toLowerCase().includes(query.toLowerCase());
};

const isItemMatchQuery = (item: string, query: string) => {
  if (!query) return true;
  return item?.toLowerCase().includes(query.toLowerCase());
};

const user_types = USER_TYPES;

const organisations = ORGANISATIONS;

type FinalRegistrationScreenProps = {
  navigation: StackNavigationProp<AuthStackNavigatorParamsList, 'FinalRegistrationScreen'>;
  route: RouteProp<AuthStackNavigatorParamsList, 'FinalRegistrationScreen'>;
};

const FinalRegistrationScreen: FC<FinalRegistrationScreenProps> = ({ navigation, route }) => {
  const [, setRerender] = useState(false);
  const isFocuesed = useIsFocused();
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = React.useState<boolean>(false);
  const countries = useSelector((state: { places: PlaceState }) => state.places.countries);

  const [countriesData, setCountriesData] = React.useState<CountryDTO[]>(countries);
  const [states, setStates] = useState<string[]>([]);
  const [dropdownStates, setDropdownStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [dropdownCities, setDropdownCities] = useState<string[]>([]);

  const [schoolsData, setSchoolsData] = React.useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [orgData, setOrgData] = React.useState<any[]>([]);
  const [org, setOrg] = useState<any[]>([]);
  const [visibleImagePicker, setVisibleImagePicker] = useState<boolean>(false);

  const [phoneCode, setPhoneCode] = useState<string>('');
  const [placement] = React.useState('bottom');
  const [phoneCodeNumber, setPhoneCodeNumber] = useState<string>('');

  const styles = useStyleSheet(themedStyles);
  const { emailAddress, user_type, student, activation_code } = route.params; //correct here

  const [selectedImage, setSelectedImage] = React.useState<string | undefined>('');

  const [uploadedImage, setUploadedImage] = React.useState<any>(null);
  const [, setSelectedGrades] = useState<string[]>([]);
  const [, setSelectedSubjects] = useState<any[]>([]);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const [loginObj, setLoginObj] = useState<any>(null);
  const _user_type = user_types.find((u) => u.label === user_type);

  const signUpValidationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    address: yup.string(),
    apartment: yup.string(),
    zipcode: yup.string().required('Zip code is required'),
    country: yup.string().required('Country is required'),
    selectedCountry: yup.string(),
    selectedState: yup.string(),
    selectedCity: yup.string(),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    phoneNumber: yup.string(),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .test('password-match', 'Password & Confirm Password do not match', function (value) {
        const password = this.resolve(yup.ref('password'));
        return value === password;
      })
      .when(
        'password',
        (password, schema) => password && schema.required('Re-Password is required')
      ),
    termsAccepted: yup.boolean().required(),
  });

  const signUpStudentValidationSchema = yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    address: yup.string(),
    apartment: yup.string(),
    selectedCountry: yup.string(),
    selectedState: yup.string(),
    selectedCity: yup.string(),
    phoneNumber: yup.string(),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .test('password-match', 'Password & Confirm Password do not match', function (value) {
        const password = this.resolve(yup.ref('password'));
        return value === password;
      })
      .when(
        'password',
        (password, schema) => password && schema.required('Re-Password is required')
      ),
    termsAccepted: yup.boolean().required(),
  });

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const onConfirmPasswordIconPress = (): void => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} color={Colors.secondary} />
    </TouchableWithoutFeedback>
  );

  const renderConfirmPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onConfirmPasswordIconPress}>
      <Icon {...props} name={confirmPasswordVisible ? 'eye-off' : 'eye'} color={Colors.secondary} />
    </TouchableWithoutFeedback>
  );

  const studentCountryName = student?.parents[0].country;
  const codeNumber = countries?.find((item) => item.name === studentCountryName);

  useEffect(() => {
    if (codeNumber) {
      const formattedPhoneCode = codeNumber.phone_code.toString().startsWith('+')
        ? codeNumber.phone_code.toString()
        : '+' + codeNumber.phone_code;
      setPhoneCodeNumber(formattedPhoneCode);
    } else {
      setPhoneCodeNumber('');
    }
  }, [codeNumber]);

  const CheckboxLabel = (evaProps: any) => {
    return (
      <Text {...evaProps} style={styles.termsCheckBoxText}>
        I have read and agree to the{' '}
        <Text
          style={{ color: Colors.primary, fontSize: 13 }}
          onPress={() => {
            Linking.openURL('https://trackmykidz.com/terms/').then(() => {});
          }}
        >
          {' '}
          Terms of Use{' '}
        </Text>{' '}
        and
        <Text
          style={{ color: Colors.primary, fontSize: 13 }}
          onPress={() => {
            Linking.openURL('https://trackmykidz.com/privacy-policy').then(() => {});
          }}
        >
          {' '}
          Privacy Policy{' '}
        </Text>
        of TrackMyKidz
      </Text>
    );
  };

  const getSchoolsByFilter = (country = '', state = '', city = '', schoolName = '') => {
    const query = {
      country: country,
      state: state,
      city: city,
      schoolName: schoolName,
    };
    GetSchoolByFilters(query)
      .then((res) => {
        const _schools = [...res];

        setSchools(_schools);
        setSchoolsData(_schools);
      })
      .catch((err) => {
        console.log('GetSchoolByFilters', err);
      });
  };

  const getOrgByFilter = (country = '', state = '', city = '', orgName = '') => {
    let query = {
      country: country,
      state: state,
      city: city,
      orgName: orgName,
    };
    GetOrgByFilters(query)
      .then((res) => {
        // const _data = {
        //   schoolId: 0,
        //   name: 'Other',
        // };
        const _org = [...res];
        // _org.unshift(_data);
        setOrg(_org);
        setOrgData(_org);
      })
      .catch((err) => {
        console.log('GetOrgByFilters', err);
      });
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
        setUploadedImage(image);
        setSelectedImage(source.uri);
      }
    });
  };

  const renderEditAvatarButton = (): React.ReactElement => (
    <Button
      style={styles.editAvatarButton}
      status="basic"
      accessoryRight={<Icon name="edit" />}
      onPress={() => setVisibleImagePicker(true)}
    />
  );
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> = renderEditAvatarButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  useEffect(() => {
    if (!isFocuesed) {
      setRerender(false);
    } else {
      setRerender(true);
    }
  }, [isFocuesed]);

  const updateUser = async (user: any) => {
    try {
      let data = {
        id: user?.parentId,
        email: user?.email,
        firstname: user?.firstname,
        lastname: user?.lastname,
        apt: user?.apt || '',
        address: user?.address || '',
        state: user?.state || '',
        country: user?.country || '',
        city: user?.city || '',
        zipcode: user?.zipcode || '',
        phone: user?.phone,
        status: null,
        activationCode: user?.referenceCode,
        term: null,
      };

      let res = await UpdateUser({ ...data, isSubscribed: true }, 'parent');

      await storeIsSubscribed(true);
    } catch (err) {
      console.log('err', err);
    }
  };

  const studentParams = route?.params?.student?.parents[0]?.students.find(
    (item: any) => item.email === route?.params?.student?.email
  );

  return (
    <BackgroundLayout title="Registration">
      {_user_type?.id == 2 && (
        <View style={{ width: '100%' }}>
          {selectedImage != '' && (
            <ProfileAvatarPicker
              style={styles.profileImage}
              source={
                Platform.OS == 'android'
                  ? {
                      uri: selectedImage + '?time' + new Date().getTime(),
                      headers: { Pragma: 'no-cache' },
                    }
                  : { uri: selectedImage }
              }
              editButton={renderEditAvatarButton}
            />
          )}
          {selectedImage == '' && (
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor: Colors.lightgray,
                },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  marginTop: 70,
                  marginLeft: 75,
                }}
              >
                {renderEditButtonElement()}
              </View>
            </View>
          )}
        </View>
      )}

      {_user_type?.id == 3 && (
        <View style={{ width: '100%' }}>
          {selectedImage != '' && (
            <ProfileAvatarPicker
              style={styles.profileImage}
              source={
                Platform.OS == 'android'
                  ? {
                      uri: selectedImage + '?time' + new Date().getTime(),
                      headers: { Pragma: 'no-cache' },
                    }
                  : { uri: selectedImage }
              }
              editButton={renderEditAvatarButton}
            />
          )}
          {selectedImage == '' && (
            <View
              style={[
                styles.profileImage,
                {
                  backgroundColor: Colors.lightgray,
                },
              ]}
            >
              {studentParams?.studentPhoto && (
                <ProfileAvatarPicker
                  style={styles.profileImage}
                  source={
                    Platform.OS == 'android'
                      ? {
                          uri: studentParams?.studentPhoto,
                          headers: { Pragma: 'no-cache' },
                        }
                      : { uri: studentParams?.studentPhoto }
                  }
                  editButton={renderEditAvatarButton}
                />
              )}

              {!studentParams?.studentPhoto && (
                <View
                  style={{
                    position: 'absolute',
                    marginTop: 70,
                    marginLeft: 75,
                  }}
                >
                  {renderEditButtonElement()}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <KeyboardAwareScrollView
        extraHeight={10}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        {visibleImagePicker && (
          <ImagePickerModal
            openCamera={imageCameraLaunch}
            openGallery={imageGalleryLaunch}
            close={() => setVisibleImagePicker(false)}
          />
        )}

        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          {_user_type?.id === 1 ? (
            <Formik
              validationSchema={signUpValidationSchema}
              validateOnMount={true}
              initialValues={{
                firstName: '',
                lastName: '',
                address: '',
                apartment: '',
                country: '',
                selectedCountry: '',
                selectedState: '',
                selectedCity: '',
                city: '',
                state: '',
                zipcode: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false,
              }}
              onSubmit={(values, {}) => {
                const registerObject: RegisterDTO = {
                  email: emailAddress,
                  password: values.password,
                  activationcode: activation_code,
                };

                const userObject = {
                  email: emailAddress,
                  firstname: values.firstName,
                  lastname: values.lastName,
                  address: values.address,
                  state: values.state,
                  country: values.country,
                  city: values.city,
                  zipcode: values.zipcode,
                  phone: values.phoneNumber,
                  status: '',
                  term: true,
                  apt: values?.apartment,
                  deviceId: getDeviceId(),
                  id: null,
                };

                dispatch(ChangeModalState.action({ loading: true }));
                // Alert.alert('call');
                Register(registerObject, 'parent')
                  .then(async (res) => {
                    const _token = res.data.token;
                    await storeToken(_token);
                    await storeUserType('parent');
                    CompleteRegistration(userObject, 'parent')
                      .then(async (response: any) => {
                        const obj = {
                          token: _token || '',
                          userType: 'parent',
                          id: response?.data?.parentId,
                          mainId: res.data?.userId,
                          isSubscribed: true,
                        };

                        // setLoginObj(obj);
                        if (response.status == 201) {
                          await updateUser(response?.data);
                          let res = await Login(
                            {
                              email: emailAddress,
                              password: values.password,
                            },
                            'parent'
                          );
                          const obj: UserLoginResponse = {
                            token: res?.data?.token,
                            userType: 'parent',
                            id: res?.data?.userTypeId,
                            mainId: res?.data?.userId,
                            ...((res?.data?.isSubscribed || res?.data?.isSubscribed == false) && {
                              isSubscribed: res?.data?.isSubscribed,
                            }),
                          };
                          dispatch(LoginStore.action(obj));
                          dispatch(ChangeModalState.action({ loading: false }));

                          dispatch(
                            ChangeModalState.action({
                              welcomeMessageModal: true,
                            })
                          );

                          // dispatch(
                          //   ChangeModalState.action({
                          //     parentPaymentModalVisibility: true,
                          //   }),
                          // );
                        }
                      })
                      .catch((error: any) => {
                        console.log(error);
                        Toast.show({
                          type: 'info',
                          position: 'top',
                          text1: error.title,
                          text2: error?.data?.statusDescription,
                          visibilityTime: 4000,
                          autoHide: true,
                          topOffset: 30,
                          bottomOffset: 40,
                          onShow: () => {},
                          onHide: () => {},
                          onPress: () => {},
                        });
                      })
                      .finally(() => {
                        dispatch(ChangeModalState.action({ loading: false }));
                      });
                  })
                  .catch((err) => {
                    Alert.alert(err?.data?.statusDescription);
                    dispatch(ChangeModalState.action({ loading: false }));
                    console.log(err);
                  });
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
                  <ParentPaymentModal
                    userEmail={emailAddress}
                    loginObj={loginObj}
                    onPay={() => {
                      // todo not a priority
                      // @ts-ignore

                      handleSubmit();
                      // dispatch(LoginStore.action(loginObj));
                      // dispatch(
                      //   ChangeModalState.action({
                      //     welcomeMessageModal: true,
                      //   }),
                      // );
                    }}
                    onCancel={() => {}}
                  />
                  <Layout style={styles.formContainer} level="1">
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      // accessoryRight={PersonIcon}
                      value={'Email: ' + emailAddress}
                      disabled={true}
                    />
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Parent's First Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                    />
                    {errors.firstName && touched.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Parent's Last Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                    />
                    {errors.lastName && touched.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                    <Input
                      // accessoryRight={LocationIcon}
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Parent's Street Address*`}
                      value={values.address}
                      onChangeText={handleChange('address')}
                      onBlur={handleBlur('address')}
                    />
                    {errors.address && touched.address && (
                      <Text style={styles.errorText}>{errors.address}</Text>
                    )}
                    <Input
                      // accessoryRight={LocationIcon}
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Ste/Apt`}
                      value={values.apartment}
                      onChangeText={handleChange('apartment')}
                      onBlur={handleBlur('apartment')}
                    />
                    {errors.apartment && touched.apartment && (
                      <Text style={styles.errorText}>{errors.apartment}</Text>
                    )}
                    <Autocomplete
                      data={countriesData}
                      icon={LocationIcon}
                      placeholder="Country*"
                      value={values.country}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      onSelect={(query) => {
                        const selectedCountry = query;
                        setFieldValue('country', selectedCountry.name);
                        setFieldValue('selectedCountry', selectedCountry.name);
                        setFieldValue('selectedState', '');
                        setFieldValue('state', '');
                        GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                          setStates(res.data);
                          setDropdownStates(res.data);
                        });
                        selectedCountry.phone_code.toString().startsWith('+')
                          ? setPhoneCode(selectedCountry.phone_code.toString())
                          : setPhoneCode('+' + selectedCountry.phone_code);
                      }}
                    />

                    <Autocomplete
                      data={dropdownStates}
                      icon={LocationIcon}
                      placeholder="State*"
                      value={values.state}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      onSelect={(query) => {
                        const selectedState = query;
                        setFieldValue('state', selectedState);
                        setFieldValue('selectedState', selectedState);
                        setFieldValue('selectedCity', '');
                        setFieldValue('city', '');
                        setCities([]);
                        setDropdownCities([]);
                        GetAllCities(values.selectedCountry, selectedState).then((res) => {
                          setCities(res.data);
                          setDropdownCities(res.data);
                        });
                      }}
                    />

                    {errors.state && touched.state && (
                      <Text style={styles.errorText}>{errors.state}</Text>
                    )}
                    <Autocomplete
                      icon={LocationIcon}
                      placeholder="City*"
                      value={values.city}
                      data={dropdownCities}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      onSelect={(query) => {
                        let city = query;

                        setFieldValue('city', city);
                        setOrgData([]);
                        setSchoolsData([]);
                        // setFieldValue('selectedCity', query);
                      }}
                    />

                    {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                    <Input
                      // accessoryRight={LocationIcon}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Zip/Post Code*`}
                      value={values.zipcode}
                      onChangeText={handleChange('zipcode')}
                      onBlur={handleBlur('zipcode')}
                    />
                    {errors.zipcode && touched.zipcode && (
                      <Text style={styles.errorText}>{errors.zipcode}</Text>
                    )}
                    <View style={styles.phoneNumber}>
                      <Input
                        style={styles.prefixStyle}
                        editable={false}
                        disabled={true}
                        selectTextOnFocus={false}
                        value={phoneCode?.toString()}
                        placeholder="Prefix"
                      />
                      <Input
                        style={styles.phoneStyle}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Phone Number"
                        // accessoryRight={PhoneIcon}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        onChangeText={handleChange('phoneNumber')}
                      />
                    </View>
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!passwordVisible}
                      placeholder="Password*"
                      // accessoryRight={renderPasswordIcon}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      secureTextEntry={!confirmPasswordVisible}
                      placeholder="Confirm Password*"
                      // accessoryRight={renderConfirmPasswordIcon}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                    <View style={{ flexDirection: 'row' }}>
                      <CheckBox
                        style={[styles.termsCheckBox, { flex: 1 }]}
                        checked={values.termsAccepted}
                        onChange={() => setFieldValue('termsAccepted', !values.termsAccepted)}
                      >
                        {''}
                      </CheckBox>
                      <View style={[styles.termsCheckBox, { flex: 15 }]}>
                        <CheckboxLabel />
                      </View>
                    </View>
                  </Layout>
                  {console.log('errors', errors)}
                  <View style={{ marginTop: 18, marginBottom: 20 }}>
                    <LinearGradientButton
                      style={styles.signUpButton}
                      size="medium"
                      onPress={() => {
                        dispatch(
                          ChangeModalState.action({
                            parentPaymentModalVisibility: true,
                          })
                        );
                      }}
                      disabled={!isValid || !values.termsAccepted}
                    >
                      Sign Up
                    </LinearGradientButton>
                  </View>
                </>
              )}
            </Formik>
          ) : _user_type?.id === 2 ? (
            <Formik
              validationSchema={signUpValidationSchema}
              validateOnMount={true}
              initialValues={{
                firstName: '',
                lastName: '',
                schoolName: '',

                organizationName: '',
                schoolAddress: '',
                country: '',
                selectedCountry: '',
                selectedState: '',
                selectedCity: '',
                city: '',
                state: '',
                zipcode: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                termsAccepted: false,
                school: '',
                organization: '',
                selected_entity: null,
                schoolId: null,

                orgId: null,
              }}
              onSubmit={(values, {}) => {
                dispatch(ChangeModalState.action({ loading: true }));
                const registerObject: RegisterDTO = {
                  email: emailAddress,
                  password: values.password,
                  activationcode: activation_code,
                };
                const loginObject = {
                  email: emailAddress,
                  password: values.password,
                };

                const formData = new FormData();

                formData.append(
                  'image',
                  uploadedImage
                    ? {
                        uri: uploadedImage?.path,
                        name: uploadedImage.mime,
                        type: uploadedImage.mime,
                      }
                    : {
                        uri: 'https://pictures-tmk.s3.amazonaws.com/images/image/man.png',
                        name: 'avatar',
                        type: 'image/png',
                      }
                );
                formData.append('firstname', values.firstName);
                formData.append('lastname', values.lastName);

                formData.append('address', values.schoolAddress || '');
                formData.append('email', emailAddress);
                formData.append('state', values.state);
                formData.append('city', values.city);
                formData.append('country', values.country);
                formData.append('zipcode', values.zipcode);
                formData.append('phone', values.phoneNumber);
                formData.append('password', values.password);
                formData.append('term', true);
                formData.append('isAdmin', false);
                formData.append('deviceId', getDeviceId());
                values.schoolId
                  ? formData.append('schoolId', values.schoolId)
                  : formData.append('schoolId', '');
                values.orgId
                  ? formData.append('orgId', values.orgId)
                  : formData.append('orgId', '');

                Register(registerObject, 'instructor')
                  .then(async (res) => {
                    await storeToken(res?.data?.token);

                    CompleteRegistration(formData, 'instructor')
                      .then(async (response: any) => {
                        await Login(loginObject, user_type.toLowerCase());
                        dispatch(
                          // todo not a priority
                          // @ts-ignore
                          LoginStore.action({
                            token: response?.data?.token,
                            userType: 'instructor',
                            id: response?.data.instructorId,
                            mainId: res?.data?.userId,
                          })
                        );
                        if (response.status == 201) {
                        }
                      })
                      .catch((error: any) => {
                        console.log('instructor err', error);
                        Toast.show({
                          type: 'info',
                          position: 'top',
                          text1: error.data?.title,
                          text2: error?.data?.statusDescription,
                          visibilityTime: 4000,
                          autoHide: true,
                          topOffset: 30,
                          bottomOffset: 40,
                          onShow: () => {},
                          onHide: () => {},
                          onPress: () => {},
                        });
                      })
                      .finally(() => {
                        dispatch(ChangeModalState.action({ loading: false }));
                      });
                  })
                  .catch((err) => {
                    console.log('err', err);
                    Toast.show({
                      type: 'info',
                      position: 'top',

                      visibilityTime: 4000,
                      autoHide: true,
                      topOffset: 30,
                      bottomOffset: 40,
                      onShow: () => {},
                      onHide: () => {},
                      onPress: () => {},
                    });
                    dispatch(ChangeModalState.action({ loading: false }));
                  });
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
                  <Layout style={styles.formContainer} level="1">
                    <Select
                      style={styles.inputSettings}
                      placeholder="Select Entity"
                      value={values.selected_entity || ''}
                      onSelect={(index: any) => {
                        // Alert.alert(JSON.stringify(organisations[index.row].value));
                        setFieldValue('selected_entity', organisations[index.row].value);
                        if (organisations[index.row].value === 'School') {
                          setFieldValue('organizationId', '');
                          setFieldValue('organization', '');
                          setFieldValue('organizationName', '');
                        } else {
                          setFieldValue('school', '');
                          setFieldValue('selectedSchool', '');

                          setFieldValue('schoolName', '');
                          setFieldValue('schoolAddress', '');
                        }
                      }}
                    >
                      {organisations.map((item) => {
                        return <SelectItem key={item.id} title={item.label} />;
                      })}
                    </Select>
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      // accessoryRight={PersonIcon}
                      value={'Email: ' + emailAddress}
                      disabled={true}
                    />
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Instructor's First Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                    />
                    {errors.firstName && touched.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="words"
                      autoCorrect={false}
                      placeholder={`Instructor's Last Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                    />
                    {errors.lastName && touched.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                    <Autocomplete
                      placeholder="Country*"
                      value={values.country}
                      data={countriesData}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      onSelect={(query) => {
                        const selectedCountry = query;
                        setFieldValue('country', selectedCountry.name);
                        setFieldValue('selectedCountry', selectedCountry.name);
                        setFieldValue('selectedState', '');
                        setFieldValue('state', '');
                        GetAllStates(selectedCountry.name.replace(/ /g, '')).then((res) => {
                          setStates(res.data);
                          setDropdownStates(res.data);
                        });
                        selectedCountry.phone_code.toString().startsWith('+')
                          ? setPhoneCode(selectedCountry.phone_code.toString())
                          : setPhoneCode('+' + selectedCountry.phone_code);
                        getSchoolsByFilter(selectedCountry.name);
                        getOrgByFilter(selectedCountry.name);
                      }}
                    />

                    <Autocomplete
                      placeholder="State*"
                      value={values.state}
                      data={dropdownStates}
                      disabled={!values.selectedCountry}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      onSelect={(query) => {
                        const selectedState = query;
                        setFieldValue('state', selectedState);
                        setFieldValue('selectedState', selectedState);
                        setFieldValue('selectedCity', '');
                        setFieldValue('city', '');
                        setCities([]);
                        setDropdownCities([]);
                        GetAllCities(values.selectedCountry, selectedState).then((res) => {
                          setCities(res.data);
                          setDropdownCities(res.data);
                        });
                        getSchoolsByFilter(values.country, selectedState);
                        getOrgByFilter(values.country, selectedState);
                      }}
                    />

                    <Autocomplete
                      placeholder="City*"
                      value={values.city}
                      disabled={!values.selectedState}
                      style={{
                        input: {
                          borderRadius: 10,
                          borderWidth: 0.3,
                          borderColor: Colors.borderGrey,
                        },
                      }}
                      data={dropdownCities}
                      onSelect={(query) => {
                        const selectedCity = query;
                        setFieldValue('city', selectedCity);
                        // setFieldValue('selectedCity', selectedCity);
                        getSchoolsByFilter(values.country, values.state, selectedCity);
                        getOrgByFilter(values.country, values.state, selectedCity);
                      }}
                    />

                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Zip/Post Code*`}
                      value={values.zipcode}
                      onChangeText={handleChange('zipcode')}
                      onBlur={handleBlur('zipcode')}
                    />
                    {values.selected_entity === 'School' ? (
                      // <Autocomplete
                      //   data={schoolsData}
                      //   placeholder="School Name"
                      //   value={values.school}
                      //   style={{
                      //     input: {
                      //       borderRadius: 10,
                      //       borderWidth: 0.3,
                      //       borderColor: Colors.borderGrey,
                      //     },
                      //   }}
                      //   onSelect={(query) => {
                      //     const selectedSchool = query;
                      //     setFieldValue('school', selectedSchool.name);
                      //     setFieldValue('schoolId', selectedSchool.schoolId);
                      //     setFieldValue('schoolName', selectedSchool.name);
                      //     setFieldValue('schoolAddress', 'School Address');
                      //     setFieldValue('schoolAddress', 'School Address');
                      //     setSelectedGrades(['1st']);
                      //     setSelectedSubjects(['Maths']);
                      //   }}
                      // />
                      <CustomTextDropDown
                        style={{
                          customDropDown: {
                            width: '100%',
                            marginTop: 10,
                            backgroundColor: 'white',
                          },
                        }}
                        disable={false}
                        placeholder="Select School*"
                        value={values.school}
                        onSelect={(index: any) => {
                          let school = schoolsData.find((item: any) => item?.name == index);

                          setFieldValue('school', school.name);
                          setFieldValue('selectedSchool', school.name);

                          setFieldValue('schoolName', school.name);
                          setFieldValue('schoolAddress', school.address);
                        }}
                        dropDownList={schoolsData}
                      />
                    ) : (
                      <CustomTextDropDown
                        style={{
                          customDropDown: {
                            width: '100%',
                            marginTop: 10,
                            backgroundColor: 'white',
                          },
                        }}
                        disable={false}
                        placeholder="Select Organization"
                        value={values.organization}
                        onSelect={(query) => {
                          const selectedOrg = orgData.find((item: any) => item?.name == query);

                          setFieldValue('organizationId', selectedOrg?.organizationId);
                          setFieldValue('organization', selectedOrg.name);
                          setFieldValue('organizationName', selectedOrg.name);
                        }}
                        dropDownList={orgData}
                      />

                      // <Autocomplete
                      //   data={orgData}
                      //   placeholder="Select Organization"
                      //   value={values.organization}
                      //   style={{
                      //     input: {
                      //       borderRadius: 10,
                      //       borderWidth: 0.3,
                      //       borderColor: Colors.borderGrey,
                      //     },
                      //   }}
                      //   label={() => <Text>Organization*</Text>}
                      //   onSelect={(query) => {
                      //     const selectedOrg = query;

                      //     setFieldValue('organizationId', selectedOrg?.organizationId);
                      //     setFieldValue('organization', selectedOrg.name);
                      //     setFieldValue('organizationName', selectedOrg.name);
                      //   }}
                      // />
                    )}
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Text style={{ fontSize: 13 }}>Can't find school/organization? </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            'Confirmation',
                            'By registering your school or organisation, you accept to be the admin for that entity.',
                            [
                              {
                                text: 'Cancel',
                              },
                              {
                                text: 'Confirm',
                                onPress: () =>
                                  navigation.navigate('FinalOrgRegistrationScreen', {
                                    emailAddress: emailAddress,
                                    registrationId: 'test',
                                    user_type: user_type,
                                    activation_code: activation_code,
                                    schoolData: schoolsData,
                                    orgData: orgData,
                                    details: {
                                      email: emailAddress,
                                      firstname: values.firstName,
                                      lastname: values.lastName,
                                      phoneNumber: values.phoneNumber,
                                      state: '',
                                      country: '',
                                      city: '',
                                      zipcode: '',
                                      selected_entity: values.selected_entity,
                                      photo: uploadedImage?.path,
                                    },
                                  }),
                              },
                            ]
                          )
                        }
                      >
                        <Text style={{ color: Colors.primary, fontSize: 13 }}>Register</Text>
                      </TouchableOpacity>
                    </View>
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder="Phone Number"
                      // accessoryRight={PhoneIcon}
                      value={values.phoneNumber}
                      keyboardType="number-pad"
                      onChangeText={handleChange('phoneNumber')}
                    />
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!passwordVisible}
                      placeholder="Password*"
                      // accessoryRight={renderPasswordIcon}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                    <Input
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      secureTextEntry={!confirmPasswordVisible}
                      placeholder="Confirm Password*"
                      // accessoryRight={renderConfirmPasswordIcon}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                    <View style={{ flexDirection: 'row' }}>
                      <CheckBox
                        style={[styles.termsCheckBox, { flex: 1 }]}
                        checked={values.termsAccepted}
                        onChange={() => setFieldValue('termsAccepted', !values.termsAccepted)}
                      >
                        {''}
                      </CheckBox>
                      <View style={[styles.termsCheckBox, { flex: 15 }]}>
                        <CheckboxLabel />
                      </View>
                    </View>
                  </Layout>
                  <View style={{ marginTop: 18, marginBottom: 20 }}>
                    <LinearGradientButton
                      style={styles.signUpButton}
                      size="medium"
                      onPress={handleSubmit}
                      disabled={!isValid || !values.termsAccepted}
                    >
                      SIGN UP
                    </LinearGradientButton>
                  </View>
                </>
              )}
            </Formik>
          ) : (
            <Formik
              validationSchema={signUpStudentValidationSchema}
              validateOnMount={true}
              initialValues={{
                firstName: student ? student.firstname : '',
                lastName: student ? student.lastname : '',
                school: student ? student.school : '',
                grade: student ? student.grade : '',
                parentName: student ? student?.parentemail1 : '',
                parentName2: student ? student?.parentemail2 : '',
                password: '',
                confirmPassword: '',
                termsAccepted: false,
                phoneNumber: student ? student.phone : '',
                parentId: student && student.parentIds ? student.parentIds[0] : 0,
              }}
              onSubmit={(values, {}) => {
                dispatch(ChangeModalState.action({ loading: true }));
                const registerObject: RegisterDTO = {
                  email: student.email,
                  password: values.password,
                  activationcode: activation_code,
                };
                const loginObject = {
                  email: student.email,
                  password: values.password,
                };

                Register(registerObject, 'student')
                  .then(async (response) => {
                    await Login(loginObject, user_type.toLowerCase());
                    dispatch(
                      // todo not a priority
                      // @ts-ignore
                      LoginStore.action({
                        token: response?.data?.token,
                        userType: 'student',
                        id: student.studentId,
                      })
                    );

                    if (uploadedImage) {
                      let formData = new FormData();
                      formData.append('image', {
                        uri: uploadedImage?.path,
                        name: uploadedImage.mime + new Date(),
                        type: uploadedImage.mime,
                      });
                      formData.append('id', student?.studentId);
                      formData.append(
                        'parentId1',
                        student?.parents[0]?.parentId ? parseInt(student?.parents[0]?.parentId) : ''
                      );
                      formData.append(
                        'parentId2',
                        student?.parents[1]?.parentId ? parseInt(student?.parents[1]?.parentId) : ''
                      );
                      // formData.append('parentId', parseInt(student?.parents[0]?.parentId));
                      formData.append('firstname', student?.firstname);
                      formData.append('lastname', student?.lastname);
                      formData.append('phone', student?.phone || '00');
                      formData.append('email', student?.email);
                      formData.append('school', student?.school);
                      formData.append('country', studentParams?.country);
                      formData.append('state', studentParams?.state);
                      formData.append('city', studentParams?.city);

                      formData.append('parentemail1', student?.parentemail1);
                      formData.append('parentemail2', student?.parentemail2 || 'nomi9303');

                      // setisSending(true);
                      // let objectToPass = {
                      //   firstName: values.firstName,
                      //   lastName: values.lastName,
                      //   id: userId,
                      //   country: values.country,
                      //   state: values.state,
                      //   city: values.city,
                      // };

                      UpdateStudent(formData)
                        .then(async (response: any) => {
                          dispatch(
                            ChangeUserState.action({
                              item: response,
                              fetchOne: { loading: false, error: null },
                            })
                          );
                        })
                        .catch((error: any) => {
                          console.log('err', error);
                          Alert.alert(error.response.data.title, error.response.data.detail, [
                            { text: 'OK', style: 'cancel' },
                          ]);
                        });
                    }

                    dispatch(
                      ChangeModalState.action({
                        welcomeMessageModal: true,
                      })
                    );
                  })
                  .catch((error) => {
                    Toast.show({
                      type: 'info',
                      position: 'top',
                      text1: error.data.title,
                      text2: error?.data?.statusDescription,
                      visibilityTime: 4000,
                      autoHide: true,
                      topOffset: 30,
                      bottomOffset: 40,
                      onShow: () => {},
                      onHide: () => {},
                      onPress: () => {},
                    });
                  })
                  .finally(() => {
                    dispatch(ChangeModalState.action({ loading: false }));
                    dispatch(ChangeModalState.action({ biometricRequestModal: true }));
                  });
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
                  <Layout style={styles.formContainer} level="1">
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      // accessoryRight={PersonIcon}
                      value={'Email: ' + (student?.email || '')}
                      disabled={true}
                    />
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Student's First Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.firstName}
                      onChangeText={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      placeholderTextColor={Colors.gray}
                      disabled
                    />
                    {errors.firstName && touched.firstName && (
                      <Text style={styles.errorText}>{String(errors.firstName)}</Text>
                    )}
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Student's Last Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.lastName}
                      onChangeText={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      placeholderTextColor={Colors.gray}
                      disabled
                    />
                    {errors.lastName && touched.lastName && (
                      <Text style={styles.errorText}>{String(errors.lastName)}</Text>
                    )}
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Student's School*`}
                      value={values.school}
                      onChangeText={handleChange('school')}
                      placeholderTextColor={Colors.gray}
                      onBlur={handleBlur('school')}
                      disabled
                    />
                    {errors.school && touched.school && (
                      <Text style={styles.errorText}>{String(errors.school)}</Text>
                    )}
                    {/* <Input
                    style={styles.inputSettings}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={`Student's Grade`}
                    value={values.grade}
                    onChangeText={handleChange("grade")}
                    onBlur={handleBlur("grade")}
                    disabled
                  />
                  {errors.grade && touched.grade && (
                    <Text style={styles.errorText}>{errors.grade}</Text>
                  )} */}
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Parent1/Guardian1 Name*`}
                      // accessoryRight={PersonIcon}
                      value={values.parentName}
                      onChangeText={handleChange('parentName')}
                      placeholderTextColor={Colors.gray}
                      onBlur={handleBlur('parentName')}
                      disabled
                    />
                    {errors.parentName && touched.parentName && (
                      <Text style={styles.errorText}>{String(errors.parentName)}</Text>
                    )}
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder={`Parent2/Guardian2 Email`}
                      // accessoryRight={PersonIcon}
                      value={values.parentName2}
                      onChangeText={handleChange('parentName2')}
                      placeholderTextColor={Colors.gray}
                      onBlur={handleBlur('parentName2')}
                      disabled
                    />
                    {errors.parentName2 && touched.parentName2 && (
                      <Text style={styles.errorText}>{String(errors.parentName2)}</Text>
                    )}
                    <View style={styles.phoneNumber}>
                      <Input
                        textStyle={{ color: Colors.gray }}
                        style={styles.prefixStyle}
                        editable={false}
                        disabled={true}
                        placeholderTextColor={Colors.gray}
                        selectTextOnFocus={false}
                        value={phoneCodeNumber.toString()}
                        placeholder="Prefix"
                      />
                      <Input
                        textStyle={{ color: Colors.gray }}
                        style={styles.phoneStyle}
                        autoCapitalize="none"
                        autoCorrect={false}
                        disabled={true}
                        placeholder="Phone Number"
                        placeholderTextColor={Colors.gray}
                        // accessoryRight={PhoneIcon}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        onChangeText={handleChange('phoneNumber')}
                      />
                    </View>
                    <View style={{ marginVertical: 10 }}>
                      <Text
                        style={{
                          color: 'red',
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        Do not proceed if any of the above information is not correct. Ensure your
                        parent/guardian has entered your correct information.
                      </Text>
                    </View>
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={!passwordVisible}
                      placeholder="Password*"
                      // accessoryRight={renderPasswordIcon}
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      placeholderTextColor={Colors.gray}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                    <Input
                      textStyle={{ color: Colors.gray }}
                      style={styles.inputSettings}
                      autoCapitalize="none"
                      secureTextEntry={!confirmPasswordVisible}
                      placeholder="Confirm Password*"
                      // accessoryRight={renderConfirmPasswordIcon}
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      placeholderTextColor={Colors.gray}
                    />
                    {/* {console.log("error", errors)} */}
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                    <View style={{ flexDirection: 'row' }}>
                      <CheckBox
                        style={[styles.termsCheckBox, { flex: 1 }]}
                        checked={values.termsAccepted}
                        onChange={() => setFieldValue('termsAccepted', !values.termsAccepted)}
                      >
                        {''}
                      </CheckBox>
                      <View style={[styles.termsCheckBox, { flex: 15 }]}>
                        <CheckboxLabel />
                      </View>
                    </View>
                  </Layout>
                  <View style={{ marginTop: 18, marginBottom: 20 }}>
                    <LinearGradientButton
                      style={styles.signUpButton}
                      size="medium"
                      onPress={handleSubmit}
                      disabled={!isValid || !values.termsAccepted}
                    >
                      SIGN UP
                    </LinearGradientButton>
                  </View>
                </>
              )}
            </Formik>
          )}
        </ScrollView>
      </KeyboardAwareScrollView>
    </BackgroundLayout>
  );
};
export default FinalRegistrationScreen;

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  content: {
    backgroundColor: 'red',
    width: 100,
    height: 100,
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
  },
  formContainer: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.newBackgroundColor,
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
    fontSize: 13,
  },
  signUpButton: {
    marginHorizontal: 16,
    borderRadius: 20,
  },
  createPostButton: {
    marginVertical: 12,
    marginHorizontal: 16,
  },
  selectSettings: {
    marginTop: 18,
  },
  errorText: {
    fontSize: 13,
    color: 'red',
  },
  textArea: {
    marginTop: 10,
    height: 80,
  },
  phoneNumber: {
    flexDirection: 'row',
  },
  prefixStyle: {
    marginTop: 10,
    width: '25%',
    marginRight: '2%',
    elevation: 1,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  phoneStyle: {
    width: '73%',
    marginTop: 10,
    elevation: 1,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.fieldLabel,
  },
  multiSelectMenuStyle: {
    backgroundColor: '#f7f9fc',
    borderColor: '#e4e9f2',
    borderWidth: 1,
    borderRadius: 3,
    paddingLeft: 16,
  },
  searchInputStyle: {
    color: '#000',
    backgroundColor: '#fff',
  },
  dropdownMenuStyle: {
    fontWeight: '400',
    fontSize: 16,
    color: Colors.primary,
  },
  selectedDropdownStyle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemsContainerStyle: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  selectorContainerStyle: {
    height: 200,
    backgroundColor: '#fff',
  },
  rowListStyle: {
    paddingVertical: 5,
  },
  inputSettings: {
    marginTop: 7,
    backgroundColor: Colors.white,
    width: '100%',
    elevation: 1,
    borderRadius: 10,
  },
  editButton: {},
  autoCompleteItem: {
    // elevation: 2,

    width: Dimensions.get('screen').width * 0.82,
  },
});
