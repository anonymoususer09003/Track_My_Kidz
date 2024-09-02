import React, { FC, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, View } from 'react-native';
import { Button, Input, Layout, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import CustomDropdown from '@/Components/CustomDropDown';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Normalize } from '../../../Utils/Shared/NormalizeDisplay';
import { ChangePassword } from '@/Services/LoginServices';
import { useDispatch } from 'react-redux';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import BackgroundLayout from '@/Components/BackgroundLayout';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackNavigatorParamsList } from '@/Navigators/Auth/AuthNavigator';

type ForgotPasswordScreenProps = {
  navigation: StackNavigationProp<AuthStackNavigatorParamsList, 'FinalRegistrationScreen'>;
};

const ForgotPasswordScreen: FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const [selectedUserType, setSelectedUserType] = useState<any>('');
  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate('SignUp1');
  };
  const user_type = [
    { id: 1, label: 'Parent', value: 'Parent' },
    { id: 2, label: 'Instructor', value: 'Instructor' },
    { id: 3, label: 'Student', value: 'Student' },
  ];
  const onLoginButtonPress = (): void => {
    navigation && navigation.navigate('Login');
  };
  // @ts-ignore

  const forgotPassValidationSchema = yup.object().shape({
    email: yup.string().email('Please enter valid email').required('Email is required'),
  });
  const renderPersonIcon = (props: any) => (
    <Image
      source={require('@/Assets/Images/email.png')}
      style={{ height: 20, width: 20 }}
      resizeMode="contain"
    />
  );
  return (
    <BackgroundLayout>
      <KeyboardAvoidingView style={styles.container}>
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

          <Text style={styles.logoText}>Forgot Password</Text>
        </View>

        <Formik
          validationSchema={forgotPassValidationSchema}
          validateOnMount={true}
          initialValues={{ email: '', user_type: '' }}
          onSubmit={(values, { resetForm }) => {
            let resetPasswordObject = {
              email: values.email,
              type: values.user_type.toLowerCase(),
              // activationNumber: values.activationCode,
              // password: values.password,
            };

            // dispatch(ChangeModalState.action({ loading: true }));
            ChangePassword(resetPasswordObject)
              .then((response) => {
                console.log('response', response.data);

                navigation.navigate('ResetPassword', {
                  emailAddress: values.email,
                  user_type: values.user_type,
                });
                dispatch(ChangeModalState.action({ loading: false }));
              })
              .catch((err) => {
                console.log('err', err);
              })
              .finally(() => {
                dispatch(ChangeModalState.action({ loading: false }));
              });
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
                <CustomDropdown
                  placeholder="Select User"
                  value={values.user_type}
                  onSelect={(index: any) => {
                    console.log('index', index);
                    setFieldValue('user_type', user_type[index].value);
                    setSelectedUserType(user_type[index].value);
                  }}
                  dropDownList={user_type}
                />
                <View style={{ marginBottom: 40 }} />
                <Input
                  selectionColor={Colors.white}
                  textStyle={{ color: Colors.white }}
                  style={styles.selectSettings}
                  placeholderTextColor={Colors.white}
                  placeholder="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessoryLeft={renderPersonIcon}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                />
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
                <View style={styles.resetButtonContainer}>
                  <LinearGradientButton
                    gradient={[Colors.secondaryTint, Colors.primaryLight]}
                    style={styles.resetButton}
                    appearance="filled"
                    size="medium"
                    onPress={handleSubmit}
                    disabled={!isValid}
                  >
                    Reset Password
                  </LinearGradientButton>
                </View>
              </Layout>
              <View style={styles.bottomView}>
                <Button appearance="ghost" status="basic" size="small" onPress={onLoginButtonPress}>
                  {() => <Text style={styles.buttonMessage}>Login</Text>}
                </Button>
                <Button
                  appearance="ghost"
                  status="basic"
                  size="small"
                  onPress={onSignUpButtonPress}
                >
                  {() => <Text style={styles.buttonMessage}>Sign Up</Text>}
                </Button>
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </BackgroundLayout>
  );
};
export default ForgotPasswordScreen;
const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
  },
  formContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    // flex: 1,
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
  },
  resetButtonContainer: {
    marginTop: 20,
    marginBottom: 55,
  },
  logInButton: {
    marginHorizontal: 2,
    borderRadius: 20,
    marginBottom: 15,
  },

  buttonMessage: {
    color: Colors.white,
    fontSize: 17,
  },

  bottomView: {
    flex: 2,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
  },
  logoText: {
    color: Colors.white,
    fontSize: 30,
  },
  selectSettings: {
    marginVertical: 15,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    color: Colors.white,
    zIndex: -2,
  },
});
