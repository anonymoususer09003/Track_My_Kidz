import React, { FC, ReactElement, useState } from 'react';
import { Image, KeyboardAvoidingView, TouchableWithoutFeedback, View } from 'react-native';
import { Icon, Input, Layout,StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Normalize } from '@/Utils/Shared/NormalizeDisplay';
import { ResetPasswordVerify } from '@/Services/LoginServices';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { useDispatch } from 'react-redux';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackNavigatorParamsList } from '@/Navigators/Auth/AuthNavigator';
import { RouteProp } from '@react-navigation/native';
import {  TouchableOpacity,  } from 'react-native'
type ReportProblemScreenProps = {
  navigation: StackNavigationProp<AuthStackNavigatorParamsList, 'ResetPassword'>;
  route: RouteProp<AuthStackNavigatorParamsList, 'ResetPassword'>;
};


const ResetPasswordScreen: FC<ReportProblemScreenProps> = ({ route, navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const [code, setCode] = useState('');
  const [isValidCode, setIsValid] = useState(false);
  const arrowBackIcon = require('@/Assets/Images/arrow_back.png');
  const [inValidCode, setInvalidCode] = useState(false);
  const { emailAddress, user_type } = route.params;
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    React.useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const dispatch = useDispatch();

  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate('SignUp1');
  };
  console.log('route.params', route.params);
  const onLoginButtonPress = (): void => {
    navigation && navigation.navigate('Login');
  };
  const renderConfirmPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onConfirmPasswordIconPress}>
      <Icon {...props} name={confirmPasswordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };
  const onConfirmPasswordIconPress = (): void => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  const validateCode = () => {
    console.log('route', route.params);
    if (route?.params?.code == code) {
      setInvalidCode(false);
      setIsValid(true);
    } else {
      setInvalidCode(true);
    }
  };
  const forgotPassValidationSchema = yup.object().shape({
    activationCode: yup
      .string()
      .min(
        6,
        ({ min }) => `Verification code must be at least ${min} characters`,
      )
      .max(
        6,
        ({ max }) => `Verification code must be at least ${max} characters`,
      )
      .required('Verification code is required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .test('password-match', 'Password & Confirm Password do not match', function(value) {
        const password = this.resolve(yup.ref('password'));
        return value === password;
      })
      .when('password', (password, schema) => password && schema.required('Re-Password is required')),
  });

  return (
    <KeyboardAvoidingView style={styles.container}>
         <TouchableOpacity onPress={() => {

navigation.goBack();

}}>

  <Image
    source={arrowBackIcon}
    style={{ height: 25, width: 25 }}
  />

</TouchableOpacity>
      <View style={styles.headerContainer}>
        <Image
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: Normalize(160),
            maxWidth: Normalize(160),
          }}
          source={require('@/Assets/Images/new-logo.png')}
          resizeMode="contain"
        />
      </View>
      <Formik
        validationSchema={forgotPassValidationSchema}
        validateOnMount={true}
        initialValues={{
          code: '',
          password: '',
          confirmPassword: '',
          activationCode: '',
        }}
        onSubmit={(values, { resetForm }) => {
          let resetPasswordObject = {
            newPassword: values.password,
            token: values.activationCode,

            // activationNumber: values.activationCode,
            // password: values.password,
          };
          dispatch(ChangeModalState.action({ loading: true }));

          ResetPasswordVerify(resetPasswordObject)
            .then((response) => {
              console.log('response', response);
              Toast.show({
                type: 'info',
                position: 'top',
                text1: 'Password reset successfully',
              });

              resetForm();
              navigation.navigate('Login');
            })
            .catch((err) => {
              Toast.show({
                type: 'info',
                position: 'top',
                text1:
                  err.status == 404
                    ? 'Invalid Activation code'
                    : `An error occured`,
              });
              console.log('err', err);
            })
            .finally(() => {
              dispatch(ChangeModalState.action({ loading: false }));
            });
          // resetForm();
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
            {console.log('error', errors)}
            <Layout style={styles.formContainer}>
              <Input

                style={[styles.inputSettings,{borderColor:Colors.white,borderWidth:0.9,color:Colors.white}]} 
                placeholder="Activation Code"
                placeholderTextColor={Colors.white}
                textStyle={{color:Colors.white}}
                // accessoryRight={renderPersonIcon}
                value={values.activationCode}
                onChangeText={(text) => {
                  setCode(text);
                  setFieldValue('activationCode', text);
                }}
                onBlur={handleBlur('activationCode')}
                keyboardType="number-pad"
              />

              {errors.activationCode && touched.activationCode && (
                <Text style={styles.errorText}>{errors.activationCode}</Text>
              )}

              <Input
                  placeholderTextColor={Colors.white}
                disabled={values.activationCode.length < 6 ? true : false}
                style={styles.inputSettings}
                autoCapitalize="none"
                secureTextEntry={!passwordVisible}
                placeholder="New Password"
                // accessoryRight={renderPasswordIcon}
                value={values.password}
                textStyle={{color:Colors.white}}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />
              {errors.password && touched.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Input
                  placeholderTextColor={Colors.white}
                disabled={values.activationCode.length < 6 ? true : false}
                style={styles.inputSettings}
                autoCapitalize="none"
                textStyle={{color:Colors.white}}
                secureTextEntry={!confirmPasswordVisible}
                placeholder="Confirm New Password"
                // accessoryRight={renderConfirmPasswordIcon}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <View style={{ marginBottom: !inValidCode ? 18 : 0 }} />

              <LinearGradientButton
                style={styles.resetButton}
                appearance="filled"
                size="medium"
                onPress={handleSubmit}
                disabled={!isValid}
              >
                Reset Password
              </LinearGradientButton>

              {/* <Button
                appearance="ghost"
                status="basic"
                size="small"
                onPress={onLoginButtonPress}
              >
                {() => <Text style={styles.buttonMessage}>Login</Text>}
              </Button>
              <Button
                style={styles.logInButton}
                appearance="outline"
                size="medium"
              >
                Login
              </Button> */}

              {inValidCode && (
                <Text
                  style={[
                    styles.errorText,
                    { marginBottom: 18, marginTop: 10 },
                  ]}
                >
                  Invalid code
                </Text>
              )}
              {false && (
                <LinearGradientButton
                  style={[
                    styles.resetButton,
                    { backgroundColor: !isValid && Colors.gray },
                  ]}
                  appearance="filled"
                  size="medium"
                  onPress={validateCode}
                  disabled={!isValid}
                >
                  Confirm
                </LinearGradientButton>
              )}
              {/* <Button
                style={styles.signUpButton}
                size="medium"
                appearance="outline"
                onPress={onSignUpButtonPress}
              >
                Sign Up
              </Button> */}
            </Layout>
          </>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};
export default ResetPasswordScreen;
const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.primary,
    padding:20
  },
  inputSettings: {
    marginTop: 7,
    backgroundColor: Colors.primary,
    color:'white',
    marginBottom:10
    // maxHeight: 35
  },
  headerContainer: {
    marginTop: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    backgroundColor: Colors.primary,
  },
  formContainer: {
    flex: 3,
    backgroundColor: Colors.primary,
    
  },
  welcomeMessage: {
    marginTop: 16,
    color: Colors.primary,
  },
  signUpButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  resetButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    // marginVertical: 10,
    // height: 40,
    // marginTop: 20,
    // marginBottom: 55,
  },
  logInButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    marginBottom: 15,
  },
  buttonMessage: {
    color: Colors.primary,
    fontSize: 17,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
  },
});
