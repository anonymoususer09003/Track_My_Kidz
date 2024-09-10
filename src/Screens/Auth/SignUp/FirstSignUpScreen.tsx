import { StartRegistration } from '@//Services/SignUpServices';
import { LinearGradientButton } from '@/Components';
import BackgroundLayout from '@/Components/BackgroundLayout';
import CustomDropdown from '@/Components/CustomDropDown';
import { GetAuthStudentByActivationCode } from '@/Services/Student';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import Colors from '@/Theme/Colors';
import { ReferenceCodeRegex, ReferenceCodeStyle } from '@/Theme/Variables';
import { Normalize } from '@/Utils/Shared/NormalizeDisplay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useIsFocused } from '@react-navigation/native';
import {
  Button,
  CheckBox,
  Input,
  Layout,
  StyleService,
  Text,
  useStyleSheet,
} from '@ui-kitten/components';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import MaskInput from 'react-native-mask-input';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';

const user_type = [
  { id: 1, label: 'Parent', value: 'Parent' },
  { id: 2, label: 'Instructor', value: 'Instructor' },
  { id: 3, label: 'Student', value: 'Student' },
];

// @ts-ignore
const screenHeight = Dimensions.get('screen').height;
interface FirstSignUpScreenProps {
  navigation: any;
}
const FirstSignUpScreen = ({ navigation }: FirstSignUpScreenProps) => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const isFocuesed = useIsFocused();
  let values = { email: '', user_type: '' };
  const [initialValues, setInitialValues] = useState({ ...values });
  const [studentInitialValues, setStudentnitialValues] = useState({
    parentEmail: '',
    studentEmail: '',
    code: '',
  });
  const [showQR, setShowQR] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [isDesignatedAdmin, setIsDesignatedAdmin] = useState(false);

  // @ts-ignore

  const emailValidationSchema = yup.object().shape({
    email: yup.string().email('Please enter valid email').required('Email is required'),
  });
  const activationCodeValidationSchema = yup.object().shape({
    code: yup.string().min(6).required('Activation Code is required'),
    studentEmail: yup.string().required('Student Email is required'),
    parentEmail: yup.string().required('Parent Email is required'),
  });
  const getStudentQrApiCall = async (values: any, user_type: any) => {
    dispatch(ChangeModalState.action({ loading: true }));
    GetAuthStudentByActivationCode(values)
      .then((res) => {
        setShowQR(false);
        navigation &&
          navigation.navigate('FinalRegistrationScreen', {
            student: res,
            registrationId: 'test',
            user_type,
            activation_code: values.code,
          });
      })
      .catch((err) => {
        console.log('Student Error', err);
        Toast.show({
          type: 'info',
          position: 'top',
          text1: `Invalid Reference code`,
        });
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };

  const renderPersonIcon = (props: any) => (
    <Image
      source={require('@/Assets/Images/email.png')}
      style={{ height: 20, width: 20 }}
      resizeMode="contain"
    />
  );

  useEffect(() => {
    // return () => setInitialValues(intitialValues);
    if (!isFocuesed) {
      setInitialValues(values);
    } else {
      setIsDesignatedAdmin(false);
      setSelectedUserType('');
    }
    // dispatch(FetchCountries.action());
    // console.log("alert");
    // Alert.alert("kk");
    // MainNavigator = null;
  }, [isFocuesed]);
  return (
    <BackgroundLayout>
      <KeyboardAwareScrollView
        extraHeight={10}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
        style={styles.container}
      >
        {!showQR ? (
          <>
            <View style={styles.headerContainer}>
              <Image
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  maxHeight: Normalize(120),
                  maxWidth: Normalize(120),
                }}
                source={require('@/Assets/Images/logo1.png')}
                resizeMode="contain"
              />

              <Text style={styles.logoText}>Register</Text>
            </View>
            {isFocuesed && (
              <Formik
                validationSchema={
                  selectedUserType != 'Student'
                    ? emailValidationSchema
                    : activationCodeValidationSchema
                }
                initialValues={
                  selectedUserType === 'Student' ? studentInitialValues : initialValues
                }
                validateOnMount={true}
                onSubmit={(values, { resetForm }) => {
                  // navigation && navigation.navigate('EmailConfirmation', { emailAddress: values.email, user_type: values.user_type, activation_code: '' })
                  let emailObject = {
                    email: values.email,
                    user_type: values.user_type,
                  };
                  if (emailObject.user_type === 'Student') {
                    dispatch(ChangeModalState.action({ loading: true }));

                    getStudentQrApiCall(values, values.user_type);
                    // GetAuthStudentByActivationCode(emailObject.email)
                    //   .then((res) => {
                    //     navigation &&
                    //       navigation.navigate("FinalRegistrationScreen", {
                    //         student: res,
                    //         registrationId: "test",
                    //         user_type: values.user_type,
                    //         activation_code: values.email,
                    //       });
                    //   })
                    //   .catch((err) => {
                    //     console.log("Student Error", err);
                    //     Toast.show({
                    //       type: "info",
                    //       position: "top",
                    //       text1: `Invalid Reference code`,
                    //     });
                    //   })
                    //   .finally(() => {
                    //     dispatch(ChangeModalState.action({ loading: false }));
                    //   });
                  } else {
                    dispatch(ChangeModalState.action({ loading: true }));
                    StartRegistration(emailObject.email, emailObject.user_type)
                      .then((res) => {
                        console.log('res', res.data);
                        if (isDesignatedAdmin) {
                          navigation &&
                            navigation.navigate('EmailConfirmation', {
                              emailAddress: values.email,
                              user_type: values.user_type,
                              activation_code: res.data?.activation_code,
                              isDesignatedAdmin: true,
                            });
                          // navigation.navigate('FinalOrgRegistrationScreen', {
                          //     emailAddress: values.email,
                          //     registrationId: 'test',
                          //     user_type: user_type,
                          //     activation_code: res.data?.activation_code
                          // })
                        } else if (values.user_type.toLowerCase() === 'student') {
                          navigation &&
                            navigation.navigate('FinalRegistrationScreen', {
                              emailAddress: '',
                              registrationId: 'test',
                              user_type: values.user_type,
                              activation_code: values.email,
                            });
                        } else {
                          navigation &&
                            navigation.navigate('EmailConfirmation', {
                              emailAddress: values.email,
                              user_type: values.user_type,
                              activation_code: res.data?.activation_code,
                            });
                        }
                      })
                      .catch((err) => {
                        console.log('err', err);
                        Toast.show({
                          type: 'info',
                          position: 'top',

                          text1: err.data?.message ? err.data?.message : 'Please try again later',
                          visibilityTime: 2000,
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
                  }
                  resetForm();
                }}
              >
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
                      <View style={{ height: 30 }} />
                      <CustomDropdown
                        placeholder="Select User"
                        value={values.user_type}
                        onSelect={(index: any) => {
                          setFieldValue('user_type', user_type[index].value);
                          setSelectedUserType(user_type[index].value);
                        }}
                        dropDownList={user_type}
                      />
                      <View style={{ height: 30 }} />
                      {values.user_type === 'Student' && (
                        <View style={{ marginVertical: 10, zIndex: -20 }}>
                          <Input
                            selectionColor={Colors.white}
                            placeholderTextColor={Colors.white}
                            placeholder={'Student Email'}
                            accessoryLeft={renderPersonIcon}
                            onChangeText={handleChange('studentEmail')}
                            onBlur={handleBlur('studentEmail')}
                            value={values.studentEmail}
                            keyboardType={'email-address'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textStyle={{ color: Colors.white }}
                            style={styles.selectSettings}
                          />

                          <Input
                            selectionColor={Colors.white}
                            placeholderTextColor={Colors.white}
                            placeholder={'Parent Email'}
                            accessoryLeft={renderPersonIcon}
                            onChangeText={handleChange('parentEmail')}
                            onBlur={handleBlur('parentEmail')}
                            value={values.parentEmail}
                            keyboardType={'email-address'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textStyle={{ color: Colors.white }}
                            style={styles.selectSettings}
                          />

                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              marginTop: 10,
                              color: Colors.white,
                            }}
                          >
                            Enter your 6-digit reference code from your parent's Dependent
                            Information or scan the QR code corresponding to your name.
                          </Text>
                        </View>
                      )}
                      {!(values.user_type.toLowerCase() === 'student') && (
                        <Input
                          selectionColor={Colors.white}
                          placeholderTextColor={Colors.white}
                          placeholder={'Email'}
                          accessoryLeft={renderPersonIcon}
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          value={values.email}
                          keyboardType={'email-address'}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textStyle={{ color: Colors.white }}
                          style={styles.selectSettings}
                        />
                      )}
                      <View style={{ width: '100%', alignItems: 'center' }}>
                        {values.user_type === 'Student' && (
                          <Input
                            selectionColor={Colors.black}
                            placeholderTextColor={Colors.black}
                            // placeholder={'Code'}
                            // accessoryLeft={renderPersonIcon}
                            onChangeText={handleChange('code')}
                            onBlur={handleBlur('code')}
                            value={values.code}
                            keyboardType={'email-address'}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textStyle={{ color: Colors.black, textAlign: 'center' }}
                            style={{ height: 50, width: '50%' }}
                            maxLength={6}
                          />
                        )}

                        {/* {values.user_type.toLowerCase() === 'student' && (
                          <MaskInput
                            selectionColor={Colors.white}
                            value={values.email}
                            placeholderTextColor={Colors.textInputPlaceholderColor}
                            style={ReferenceCodeStyle}
                            onChangeText={(masked, unmasked) => {
                              setFieldValue('email', masked); // you can use the unmasked value as well
                            }}
                            mask={ReferenceCodeRegex}
                          />
                        )}
                        {errors.email && touched.email && values.user_type === 'Student' && (
                          <Text style={[styles.errorText, { marginTop: 20 }]}>
                            Reference Code is required
                          </Text>
                        )}
                        {errors.email && touched.email && values.user_type !== 'Student' && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )} */}
                      </View>
                      <View style={{ marginTop: 10, zIndex: -10 }}>
                        {/* {values.user_type === 'Student' && (
                          <View
                            style={{
                              marginVertical: 5,
                              marginBottom: 20,
                              width: '100%',
                              alignItems: 'flex-end',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <Entypo
                              name="camera"
                              size={30}
                              color={Colors.white}
                              onPress={() => setShowQR(true)}
                            />
                          </View>
                        )} */}
                        {values.user_type === 'Instructor' && (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginVertical: 20,
                            }}
                          >
                            <CheckBox
                              checked={isDesignatedAdmin}
                              onChange={() => setIsDesignatedAdmin(!isDesignatedAdmin)}
                            >
                              {''}
                            </CheckBox>
                            <Text
                              style={{
                                marginLeft: 20,
                                width: '90%',
                                color: Colors.white,
                              }}
                            >
                              I'm a designated admin for my organisation
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ height: 80 }} />
                      <LinearGradientButton
                        gradient={[Colors.secondaryTint, Colors.primaryLight]}
                        style={[styles.signUpButton]}
                        size="medium"
                        onPress={handleSubmit}
                        disabled={!isValid}
                      >
                        Sign Up
                      </LinearGradientButton>
                    </Layout>
                    {values.user_type !== 'Student' ? (
                      <View style={styles.bottomView}>
                        <Button
                          appearance="ghost"
                          status="basic"
                          size="medium"
                          onPress={
                            () => navigation.navigate('Login')
                            // openActivationCode(values.email, values.user_type)
                          }
                        >
                          {() => (
                            <Text style={styles.buttonMessage}>
                              {' '}
                              Alread have an aacount?{' '}
                              <Text style={{ color: Colors.secondaryTint }}>Login</Text>
                            </Text>
                          )}
                        </Button>
                      </View>
                    ) : (
                      <View style={styles.bottomView}></View>
                    )}
                  </>
                )}
              </Formik>
            )}
          </>
        ) : (
          <QRCodeScanner
            onRead={(e) => {
              console.log('edata', e);
              dispatch(ChangeModalState.action({ loading: true }));
              getStudentQrApiCall(e.data, 'Student');
            }}
            flashMode={RNCamera.Constants.FlashMode.torch}
            bottomContent={
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  paddingHorizontal: '5%',
                }}
              >
                <View style={{ width: '48%' }}>
                  <LinearGradientButton style={styles.signUpButton} size="medium">
                    Rescan
                  </LinearGradientButton>
                </View>
                <View style={{ width: '48%', zIndex: -2 }}>
                  <LinearGradientButton
                    style={styles.signUpButton}
                    size="medium"
                    onPress={() => {
                      navigation &&
                        navigation.navigate('EmailConfirmation', {
                          emailAddress: '',
                          user_type: selectedUserType,
                        });
                      setShowQR(false);
                    }}
                  >
                    Continue
                  </LinearGradientButton>
                </View>
              </View>
            }
          />
        )}
      </KeyboardAwareScrollView>
    </BackgroundLayout>
  );
};
export default FirstSignUpScreen;
const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  headerContainer: {
    // flex: 2,
    height: screenHeight * 0.18,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    // flex: 3,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  welcomeMessage: {
    color: 'color-primary-default',
  },
  signUpButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    zIndex: -2,
    marginTop: 10,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
  },
  bottomView: {
    flex: 3.7,
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  buttonMessage: {
    marginTop: 16,
    color: Colors.white,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  logoText: {
    color: Colors.white,
    fontSize: 30,
  },
  selectSettings: {
    marginTop: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    color: Colors.white,
    zIndex: -1000,
  },
});
