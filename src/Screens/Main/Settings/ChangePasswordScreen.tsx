import React, { ReactElement, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useTheme } from '@/Theme';
import { Icon, Input, Text } from '@ui-kitten/components';
import { loadUserType } from '@/Storage/MainAppStorage';

import { ChangePassword, ResetPasswordVerify } from '@/Services/LoginServices';
import { ResetPassword } from '@/Services/Settings';
import { Formik } from 'formik';
import * as yup from 'yup';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { UserState } from '@/Store/User';
import ChangeModalState from '@/Store/Modal/ChangeModalState';
import LogoutStore from '@/Store/Authentication/LogoutStore';
import { AppHeader, LinearGradientButton } from '@/Components';
import Colors from '@/Theme/Colors';
import BackgroundLayout from '@/Components/BackgroundLayout';

const ChangePasswordScreen = () => {
  const { Layout } = useTheme();
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [showCodeField, setShowField] = useState(false);
  const user = useSelector((state: { user: UserState }) => state.user.item);
  console.log('user', user);
  const [oldPasswordVisible, setOldPasswordVisible] =
    React.useState<boolean>(false);
  const [newPasswordVisible, setNewPasswordVisible] =
    React.useState<boolean>(false);
  const [isEditMode, setisEditMode] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [isSending, setisSending] = useState(false);

  const isLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading,
  );
  const dispatch = useDispatch();
  const getActivationCode = async () => {
    const type = await loadUserType();
    let body = {
      email: user?.email,
      type: type?.toLowerCase(),
      // activationNumber: values.activationCode,
      // password: values.password,
    };
    ChangePassword(body)
      .then(response => {
        console.log('response', response.data);
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Verification Code sent successfully',
        });
      })
      .catch(err => {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Error',
        });
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };
  const loginValidationSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    newPassword: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .oneOf([yup.ref('password')], 'Passwords don\'t match')
      .required('Password is required'),
    verificationCode: yup.string(),
  });
  const CodeValidationSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required('Password is required'),
    newPassword: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      // todo there were null [yup.ref('password'), null
      .oneOf([yup.ref('password')], 'Passwords don\'t match')
      .required('Password is required'),
    verificationCode: yup
      .string()
      .min(6, ({ min }) => `Verification must be at least ${min} characters`)
      .max(6, ({ max }) => `Verification code must be at least ${max} characters`)
      .required('Verification Code is required'),
  });

  const onOldPasswordIconPress = (): void => {
    setOldPasswordVisible(!passwordVisible);
  };

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const renderOldPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onOldPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const onNewPasswordIconPress = (): void => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const renderNewPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onNewPasswordIconPress}>
      <Icon {...props} name={newPasswordVisible ? 'eye-off' : 'eye'} />
    </TouchableWithoutFeedback>
  );
  const verifyActivationCode = async (resetPasswordObject: any) => {
    ResetPasswordVerify(resetPasswordObject)
      .then(response => {
        console.log('response', response);
        Toast.show({
          type: 'info',
          position: 'top',
          text1: 'Password reset successfully',
        });
        // todo solve this problem
        // @ts-ignore
        dispatch(LogoutStore.action());
      })
      .catch(err => {
        Toast.show({
          type: 'info',
          position: 'top',
          text1:
            err.status == 404
              ? 'Invalid Verification code'
              : `An error occured`,
        });
        console.log('err', err);
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };

  return (
    <BackgroundLayout title="Reset Password">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            {/* <Spinner status="primary" /> */}
          </View>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View>
            <Formik
              validationSchema={
                showCodeField ? CodeValidationSchema : loginValidationSchema
              }
              validateOnMount={true}
              initialValues={{
                oldPassword: '',
                password: '',
                newPassword: '',
                verificationCode: '',
              }}
              onSubmit={async (values, { resetForm }) => {
                dispatch(ChangeModalState.action({ loading: true }));
                if (!showCodeField) {
                  ResetPassword(values.oldPassword)
                    .then(async res => {
                      setShowField(true);
                      getActivationCode();
                      console.log('res', res);
                    })
                    .catch(err => {
                      console.log('err', err);
                      Toast.show({
                        type: 'success',
                        position: 'top',
                        text1: 'Verify That your Old password is correct',
                      });
                    })
                    .finally(() => {
                      dispatch(ChangeModalState.action({ loading: false }));
                    });
                } else {
                  let resetPasswordObject = {
                    newPassword: values.newPassword,
                    token: values.verificationCode,

                    // activationNumber: values.activationCode,
                    // password: values.password,
                  };
                  verifyActivationCode(resetPasswordObject);
                  resetForm();
                }
                // if (verificationMode) {
                //     const data = {
                //         oldPassword: values.oldPassword,
                //         newPassword: values.newPassword,
                //         token: values.verificationCode
                //     }
                //     VerifyPasswordChange(data).then(res => {
                //         setVerificationMode(true)
                //         Alert.alert('Password Updated', 'Password updated. Login with new password.', [
                //             {
                //                 text: 'OK',
                //                 onPress: () => {
                //                     dispatch(LogoutStore.action())
                //                 }
                //             }
                //         ])
                //     }).catch(err => console.log('Error', err))
                // } else {
                //     const data = {
                //         oldPassword: values.oldPassword,
                //         newPassword: values.newPassword
                //     };
                //     StartPasswordChange(data).then(res => {
                //         setVerificationMode(true)
                //     }).catch(err => console.log(err))
                // }
              }}>
              {({
                  handleChange,
                  handleSubmit,
                  handleBlur,
                  setFieldValue,
                  values,
                  errors,
                  touched,
                  isValid,
                }) => (
                <>
                  {console.log('errors', errors)}
                  {isSending ? (
                    <View style={styles.sppinerContainer}>
                      {/* <Spinner status="primary" /> */}
                    </View>
                  ) : (
                    <>
                      <View style={styles.inputSettings}>
                        <Input
                          style={styles.textInput}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!oldPasswordVisible}
                          label={evaProps => (
                            <Text style={styles.inputLabels}>Old password</Text>
                          )}
                          placeholder="Old password"
                          accessoryRight={renderOldPasswordIcon}
                          value={values.oldPassword}
                          onBlur={handleBlur('oldPassword')}
                          onChangeText={handleChange('oldPassword')}
                        />
                        {errors.oldPassword && touched.oldPassword && (
                          <Text style={styles.errorText}>
                            {errors.oldPassword}
                          </Text>
                        )}
                      </View>
                      <View style={styles.inputSettings}>
                        <Input
                          style={styles.textInput}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!passwordVisible}
                          label={evaProps => (
                            <Text style={styles.inputLabels}>New password</Text>
                          )}
                          placeholder="New password"
                          accessoryRight={renderPasswordIcon}
                          value={values.password}
                          onBlur={handleBlur('password')}
                          onChangeText={handleChange('password')}
                        />
                        {errors.password && touched.password && (
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        )}
                      </View>
                      <View style={styles.inputSettings}>
                        <Input
                          style={styles.textInput}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!newPasswordVisible}
                          label={evaProps => (
                            <Text style={styles.inputLabels}>
                              Confirm new password
                            </Text>
                          )}
                          placeholder="Confirm new password"
                          accessoryRight={renderNewPasswordIcon}
                          value={values.newPassword}
                          onBlur={handleBlur('newPassword')}
                          onChangeText={handleChange('newPassword')}
                        />
                        {errors.newPassword && touched.newPassword && (
                          <Text style={styles.errorText}>
                            {errors.newPassword}
                          </Text>
                        )}
                      </View>

                      {showCodeField && (
                        <View style={styles.inputSettings}>
                          <Input
                            textStyle={{ fontSize: 16 }}
                            autoCapitalize="none"
                            label={evaProps => (
                              <Text style={styles.inputLabels}>
                                Verification Code
                              </Text>
                            )}
                            style={styles.textInput}
                            placeholder="Verification Code"
                            value={values.verificationCode}
                            onBlur={handleBlur('verificationCode')}
                            onChangeText={handleChange('verificationCode')}
                          />
                          {errors.verificationCode &&
                            touched.verificationCode && (
                              <Text style={styles.errorText}>
                                {errors.verificationCode}
                              </Text>
                            )}
                        </View>
                      )}
                      {console.log('err', isValid)}
                      {!showCodeField && (
                        <View style={{ marginBottom: 10 }}>
                          <LinearGradientButton
                            disabled={isValid ? false : true}
                            onPress={handleSubmit}>
                            Send Verification Code
                          </LinearGradientButton>
                        </View>
                      )}
                      {showCodeField && (
                        <LinearGradientButton
                          // disabled={!isValid ? true : false}
                          onPress={handleSubmit}>
                          Verify
                        </LinearGradientButton>
                      )}
                    </>
                  )}
                </>
              )}
            </Formik>
            {!verificationMode && (
              <TouchableOpacity onPress={() => getActivationCode()}>
                <Text style={styles.buttonText}>Resend Verificaion Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </BackgroundLayout>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
    paddingTop: 20,
    //backgroundColor: 'background-basic-color-1',
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 5,
  },
  layout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayout: {
    flex: 9,
    marginTop: 40,
  },
  textInput: {
    marginTop: 4,
    alignSelf: 'center',
    width: '100%',

    borderRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignSelf: 'center',
    backgroundColor: '#3AA5A2',
    tintColor: '#ECF1F7',
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
  selectSettings: {
    marginTop: 18,
  },
  inputSettings: {
    marginBottom: 25,
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
  backgroundTextButton: {
    width: '100%',
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.primary,
    borderWidth: 1,
    // backgroundColor: Colors.white,
    color: Colors.primary,
  },
  button: {
    paddingTop: 10,
    fontSize: 16,
    color: Colors.white,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  buttonText: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.primary,
    textAlign: 'center',
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 11,
    color: 'red',
    marginLeft: 5,
    marginTop: 10,
  },
  editField: {
    paddingLeft: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingVertical: 10,
  },
  editLabel: {
    fontSize: 12,
    color: 'rgba(143, 155, 179, 0.48)',
    marginBottom: 4,
    marginTop: 8,
  },
});
