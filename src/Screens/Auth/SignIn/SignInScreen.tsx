import {
  Button,
  Input,
  Layout,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import {Formik} from 'formik';
import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import CustomDropdown from '@/Components/CustomDropDown';
import {Login} from '@/Services/LoginServices';
import LoginStore from '@/Store/Authentication/LoginStore';
import {useIsFocused} from '@react-navigation/native';
import {getDeviceId} from 'react-native-device-info';
import * as yup from 'yup';
import {Normalize} from '../../../Utils/Shared/NormalizeDisplay';
// import { useDispatch } from "react-redux";
import {UpdateDeviceToken} from '@/Services/User';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
// import messaging from "@react-native-firebase/messaging";
import Toast from 'react-native-toast-message';

import {LinearGradientButton} from '@/Components';
import {ParentPaymentModal} from '@/Modals';
import {GetAllCountries} from '@/Services/PlaceServices';
import ChangeCountryState from '@/Store/Places/FetchCountries';
import Colors from '@/Theme/Colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useDispatch, useSelector} from 'react-redux';
import {AuthContext} from '../../../Navigators/Auth/AuthProvider';

const user_type = [
  {id: 1, label: 'Parent', value: 'Parent'},
  {id: 2, label: 'Instructor', value: 'Instructor'},
  {id: 3, label: 'Student', value: 'Student'},
];
const screenHeight = Dimensions.get('screen').height;
// @ts-ignore
const SignInScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const isFocuesed = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [loginObj, setLoginObj] = useState(null);
  // const dispatch = useDispatch();
  const countries = useSelector(
    (state: {state: any}) => state.places.countries,
  );
  let values = {email: '', password: '', user_type: '', is_default: false};
  const [intitialValues, setInitialValues] = useState({
    email: '',
    password: '',
    user_type: '',
    is_default: false,
  });
  // const deviceId = DeviceInfo.getUniqueID();
  // console.log("------deviceId", deviceId);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const {login, register} = useContext(AuthContext);
  const fetchCountries = async () => {
    try {
      if (!countries) {
        let res = await GetAllCountries();
        dispatch(ChangeCountryState.action({countries: res}));
      }
    } catch (err) {
      console.log('err fetch coutnries', err);
    }
  };
  console.log('getniqueid', getDeviceId());
  useEffect(() => {
    fetchCountries();
    // return () => setInitialValues(intitialValues);
    if (!isFocuesed) {
      setInitialValues(values);
    }
    // dispatch(FetchCountries.action());
    // console.log("alert");
    // Alert.alert("kk");
    // MainNavigator = null;
  }, [isFocuesed]);

  // useEffect(() => {
  //   loadBiometricToken().then((token) => {
  //     if (token) {
  //       authenticateAsync().then((result) => {
  //         if (result.success) {
  //           dispatch(LoginStore.action(token));
  //         }
  //       });
  //     }
  //   });
  // });
  const styles = useStyleSheet(themedStyles);

  //#region Button functions
  const OnRegisterButtonPress = (): void => {
    navigation && navigation.navigate('SignUp1');
  };
  const onForgotPasswordButtonPress = (): void => {
    navigation && navigation.navigate('ForgotPassword');
    // navigation && navigation.navigate('FinalOrgRegistrationScreen', {
    //   email: 'test@test.com'
    // })
  };
  const onResendActivationButtonPress = (value: boolean): void => {
    navigation &&
      navigation.navigate('ResendConfirmation', {resendCode: value});
  };
  const onReactivateButtonPress = (): void => {
    navigation && navigation.navigate('ReactivateAccount');
  };
  //#endregion

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  // @ts-ignore
  const renderPasswordIcon = props => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Image
        source={require('@/Assets/Images/lock.png')}
        style={{height: 20, width: 20}}
        resizeMode="contain"
      />
    </TouchableWithoutFeedback>
  );
  const renderPersonIcon = (props: any) => (
    <Image
      source={require('@/Assets/Images/email.png')}
      style={{height: 20, width: 20}}
      resizeMode="contain"
    />
  );

  const loginValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email('Please enter valid email')
      .required('Email is required'),
    password: yup
      .string()
      .min(8, ({min}) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    user_type: yup.string().required('User type is required'),
  });

  const saveTokenToDatabase = (token: string) => {
    UpdateDeviceToken(token)
      .then(data => {})
      .catch(err => {});
  };

  const requestUserPermission = async () => {
    // const authorizationStatus = await messaging().requestPermission();
    // if (authorizationStatus) {
    // }
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors.primary}}>
      <ImageBackground
        style={{flex: 1}}
        source={require('../../../Assets/Images/childBackground.png')}
        resizeMode="stretch">
        <KeyboardAwareScrollView style={{flex: 1}}>
          <ParentPaymentModal
            onPay={() => {
              dispatch(LoginStore.action(loginObj));
              dispatch(ChangeModalState.action({loading: false}));
            }}
            onCancel={() => {
              dispatch(ChangeModalState.action({loading: false}));
            }}
          />
          <View style={{flex: 1}}>
            <View style={styles.headerContainer}>
              <Image
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxHeight: Normalize(160),
                  maxWidth: Normalize(160),
                }}
                source={require('@/Assets/Images/logo1.png')}
                resizeMode="contain"
              />

              <Text style={styles.logoText}>Login</Text>
            </View>
            {isFocuesed && (
              <Formik
                validationSchema={loginValidationSchema}
                validateOnMount={true}
                initialValues={intitialValues}
                onSubmit={values => {
                  console.log('values.user_type', values.user_type);
                  let objectToPass = {
                    email: values.email,
                    password: values.password,
                  };
                  setLoading(true);

                  dispatch(ChangeModalState.action({loading: true}));
                  Login(objectToPass, values.user_type.toLowerCase())
                    .then(res => {
                      // console.log('res',res.data);
                      const obj = {
                        token: res.data?.token,
                        userType: values.user_type.toLowerCase(),
                        id: res.data.userTypeId,
                        mainId: res.data?.userId,
                        ...((res.data?.isSubscribed ||
                          res.data?.isSubscribed == false) && {
                          isSubscribed: res.data?.isSubscribed,
                        }),
                      };
                      setLoginObj(obj);
                      //show the modal if not subscribed
                      if (
                        !res.data?.isSubscribed &&
                        values.user_type === 'Parent'
                      ) {
                        dispatch(
                          ChangeModalState.action({
                            parentPaymentModalVisibility: true,
                          }),
                        );
                      } else {
                        console.log(obj);
                        dispatch(LoginStore.action(obj));
                        dispatch(ChangeModalState.action({loading: false}));
                      }
                      setLoading(false);
                    })
                    .catch(err => {
                      setLoading(false);
                      console.log('err', err);
                      dispatch(ChangeModalState.action({loading: false}));
                      if (
                        err?.data &&
                        err?.data?.detail === 'Account is not active.'
                      ) {
                        Toast.show({
                          type: 'info',
                          position: 'top',
                          text1: 'Info',
                          text2:
                            'This account was temporarily deactivated. Reactivate below',
                          visibilityTime: 4000,
                          autoHide: true,
                          topOffset: 30,
                          bottomOffset: 40,
                          onShow: () => {},
                          onHide: () => {},
                          onPress: () => {},
                        });
                      } else {
                        Toast.show({
                          type: 'info',
                          position: 'top',
                          text1: 'Info',
                          text2:
                            'Please check your email address or password and try again',
                          visibilityTime: 4000,
                          autoHide: true,
                          topOffset: 30,
                          bottomOffset: 40,
                          onShow: () => {},
                          onHide: () => {},
                          onPress: () => {},
                        });
                      }
                    });
                }}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  values,
                  errors,
                  touched,
                  isValid,
                }) => (
                  <>
                    <Layout style={styles.formContainer}>
                      <CustomDropdown
                        placeholder="Select User"
                        value={values.user_type}
                        onSelect={(index: any) => {
                          console.log('index', index);
                          setFieldValue('user_type', user_type[index].value);
                        }}
                        dropDownList={user_type}
                      />

                      <Input
                        selectionColor={Colors.white}
                        placeholderTextColor={Colors.white}
                        placeholder="Email"
                        style={styles.selectSettings}
                        accessoryLeft={renderPersonIcon}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textStyle={{color: Colors.white}}
                        autoCorrect={false}
                      />
                      {errors.email && touched.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}
                      <Input
                        selectionColor={Colors.white}
                        placeholderTextColor={Colors.white}
                        autoCapitalize="none"
                        style={styles.passwordInput}
                        placeholder="Password"
                        accessoryLeft={renderPasswordIcon}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={!passwordVisible}
                        textStyle={{color: Colors.white}}
                      />
                      {errors.password && touched.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}
                      <Button
                        style={{alignSelf: 'flex-end', marginTop: 10}}
                        appearance="ghost"
                        status="basic"
                        size="small"
                        onPress={onForgotPasswordButtonPress}>
                        {() => (
                          <Text
                            style={[
                              styles.buttonMessage,
                              {textAlign: 'right'},
                            ]}>
                            {' '}
                            Forgot Password{' '}
                          </Text>
                        )}
                      </Button>
                      <Layout style={styles.buttonSettings}>
                        <LinearGradientButton
                          gradient={[Colors.secondaryTint, Colors.primaryLight]}
                          style={styles.signInButton}
                          size="medium"
                          onPress={handleSubmit}
                          disabled={!isValid}>
                          Login
                        </LinearGradientButton>
                      </Layout>
                    </Layout>
                  </>
                )}
              </Formik>
            )}
            <View style={styles.bottomView}>
              {/* <Button
                appearance="ghost"
                status="basic"
                size="small"
                onPress={() => onResendActivationButtonPress(true)}
              >
                {() => (
                  <Text style={styles.buttonMessage}>
                    {" "}
                    Resend Activation Code{" "}
                  </Text>
                )}
              </Button> */}
            </View>
          </View>
        </KeyboardAwareScrollView>
        <View
          style={{
            paddingBottom: 20,
          }}>
          <Button
            appearance="ghost"
            status="basic"
            size="small"
            onPress={OnRegisterButtonPress}>
            {() => (
              <Text style={styles.buttonMessage}>
                {' '}
                Don't have an account?{' '}
                <Text style={{color: Colors.secondary}}>Sign up</Text>
              </Text>
            )}
          </Button>
        </View>
      </ImageBackground>
    </View>
  );
};
export default SignInScreen;
const themedStyles = StyleService.create({
  container: {
    // flex: 1,
    flexDirection: 'column',
    backgroundColor: 'background-basic-color-1',
    justifyContent: 'flex-start',
  },
  background: {
    backgroundColor: Colors.green,
  },
  headerContainer: {
    // flex: 2,
    height: screenHeight * 0.25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    // flex: 4,
  },
  buttonSettings: {
    backgroundColor: 'transparent',
    // flex: 1,
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  welcomeMessage: {
    marginTop: 16,
    color: Colors.primary,
  },
  buttonMessage: {
    color: Colors.white,
    fontSize: 17,
  },
  signInButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  registerButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  passwordInput: {
    marginTop: 10,
    maxHeight: 40,
    borderColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
  },
  bottomView: {
    backgroundColor: 'transparent',
    // zIndex: 1,
    // flex: 2,
  },
  selectSettings: {
    marginTop: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    color: Colors.white,
    zIndex: -2,
    caretColor: 'red',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  terms: {
    color: 'text-hint-color',
  },
  logoText: {
    color: Colors.white,
    fontSize: 30,
  },
  dropdownContainer: {
    width: '100%',
    height: 40,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  dropdown: {
    // backgroundColor: "#fafafa",
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: Colors.white,
    borderBottomWidth: 2,
  },
  dropdownItem: {
    justifyContent: 'flex-start',
  },
  dropdownDropdown: {
    backgroundColor: '#fafafa',
  },
  placeholder: {
    color: Colors.white,
    fontSize: 15,
  },
});
