//Activiation code
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, View } from 'react-native';
import { Button, Input, Layout, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { Formik } from 'formik';
import * as yup from 'yup';
import { GetActivationCode } from '@/Services/ActivationCode';
import { Normalize } from '@/Utils/Shared/NormalizeDisplay';
import { LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import BackgroundLayout from '@/Components/BackgroundLayout';
import CustomDropdown from '@/Components/CustomDropDown';
import { VerifyCode } from '@/Services/LoginServices';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const user_types = [
  { id: 1, label: 'Parent', value: 'Parent' },
  { id: 2, label: 'Instructor', value: 'Instructor' },
  { id: 3, label: 'Student', value: 'Student' },
];
interface EmailConfirmationScreenProps {
  route: any;
  navigation: any;
}

const EmailConfirmationScreen = ({ route, navigation }: EmailConfirmationScreenProps) => {
  const styles = useStyleSheet(themedStyles);
  const [resendCode, setResendCode] = useState(false);
  const { emailAddress, user_type, activation_code, student, isDesignatedAdmin } = route.params;

  const [activationCode, setActivationCode] = useState(activation_code);
  const { reactivate } = route.params;

  const codeValidationSchema = yup.object().shape({
    code: yup
      .string()
      .test('code', 'Must be exactly 6 characters', (val) => val?.length === 6)
      .required('Code is required'),
  });
  const codeValidationSchemaStudents = yup.object().shape({
    code: yup
      .string()
      .test('code', 'Must be exactly 32 characters', (val) => val?.length === 36)
      .required('Code is required'),
  });

  const onResendButtonPress = async () => {
    if (emailAddress) {
      let res = await GetActivationCode({ email: emailAddress }, user_type);
      setResendCode(true);

      setActivationCode(res.activation_code);
    }
  };
  const openLogin = () => {
    navigation && navigation.navigate('Login');
  };

  const openSignUp = () => {
    navigation && navigation.navigate('SignUp1');
  };

  const verifyOtpCode = async (code: any) => {
    try {
      let res = await VerifyCode(user_type, {
        activationCode: code,
        message: emailAddress,
      });

      return true;
    } catch (err) {
      console.log('err', err);
    }
  };

  useEffect(() => {
    return () => {
      setActivationCode('');
    };
  }, []);

  return (
    <BackgroundLayout>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        style={styles.container}
      >
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

          <Text style={styles.logoText}>Email Confirmation</Text>
        </View>

        <Formik
          validationSchema={
            user_type == 'Student' ? codeValidationSchemaStudents : codeValidationSchema
          }
          initialValues={{
            code: user_type == 'Student' && activationCode ? activationCode : '',
          }}
          validateOnMount={true}
          onSubmit={async (values, { resetForm }) => {
            // console.log("isDesignatedAdmin", isDesignatedAdmin);

            let res = await verifyOtpCode(values.code);

            if (isDesignatedAdmin) {
              if (res) {
                navigation.navigate('FinalOrgRegistrationScreen', {
                  emailAddress: emailAddress,
                  registrationId: 'test',
                  user_type: user_type,
                  activation_code: values.code,
                });
              }
              resetForm();
            } else {
              if (!reactivate) {
                if (res) {
                  navigation &&
                    navigation.navigate('FinalRegistrationScreen', {
                      emailAddress: emailAddress,
                      registrationId: 'test',
                      user_type: user_type,
                      activation_code: values.code,
                      student: student,
                    });
                }
              } else {
                // let object = {
                //   activationCode: values.code,
                //   email: emailAddress,
                // };
              }
              resetForm();
            }
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
                <View style={{ marginTop: 80, marginBottom: 30 }}>
                  <CustomDropdown
                    disable={true}
                    placeholder="Select User"
                    value={user_type}
                    onSelect={(index: any) => {
                      setFieldValue('user_type', user_type[index].value).catch(console.error);
                    }}
                    dropDownList={user_types}
                  />
                </View>

                <Input
                  selectionColor={Colors.white}
                  placeholderTextColor={Colors.white}
                  placeholder="Activation Code"
                  value={values.code}
                  onChangeText={handleChange('code')}
                  onBlur={handleBlur('code')}
                  keyboardType="numeric"
                  textStyle={{ color: Colors.white }}
                  style={styles.selectSettings}
                />
                {errors.code && touched.code && (
                  <Text style={styles.errorText}>{String(errors.code)}</Text>
                )}

                <Text
                  style={[
                    styles.errorText,
                    { textAlign: 'center', fontSize: 15, marginBottom: 10 },
                  ]}
                >
                  Check email for activation code
                </Text>
                <LinearGradientButton
                  gradient={[Colors.secondary, Colors.primaryLight]}
                  style={styles.signUpButton}
                  size="medium"
                  onPress={handleSubmit}
                  disabled={!isValid || values.code.length === 0}
                >
                  Confirm
                </LinearGradientButton>
              </Layout>
            </>
          )}
        </Formik>

        {resendCode && (
          <Text style={[styles.buttonMessage, { textAlign: 'center', color: 'red' }]}>
            {' '}
            Check email for activation code*
          </Text>
        )}
        <View style={styles.bottomView}>
          <Button appearance="ghost" status="basic" size="medium" onPress={openLogin}>
            {() => <Text style={styles.buttonMessage}> Login </Text>}
          </Button>
          <Button appearance="ghost" status="basic" size="medium" onPress={openSignUp}>
            {() => <Text style={styles.buttonMessage}> Register </Text>}
          </Button>
          {emailAddress.length > 0 && (
            <Button appearance="ghost" status="basic" size="medium" onPress={onResendButtonPress}>
              {() => <Text style={styles.buttonMessage}> Resend Code </Text>}
            </Button>
          )}
        </View>
      </KeyboardAwareScrollView>
    </BackgroundLayout>
  );
};
export default EmailConfirmationScreen;
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
    marginBottom: 30,
  },
  logoText: {
    color: Colors.white,
    fontSize: 30,
  },
  formContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  welcomeMessage: {
    marginTop: 16,
    color: 'color-primary-default',
  },
  signUpButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  errorText: {
    fontSize: 10,
    color: 'red',
  },
  bottomView: {
    flex: 3,
    marginTop: 20,
  },
  buttonMessage: {
    color: Colors.white,
    fontSize: 17,
  },
  selectSettings: {
    marginTop: 18,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    color: Colors.white,
    marginBottom: 50,
  },
});
