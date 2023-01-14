import React, { useState, ReactElement, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/Theme";
import { Text, Icon, Input, Spinner } from "@ui-kitten/components";
import { loadToken, loadUserId } from "@/Storage/MainAppStorage";

import { ResetPasswordVerify } from "@/Services/LoginServices";
import { ResetPassword } from "@/Services/Settings";
import { Formik } from "formik";
// @ts-ignore
import * as yup from "yup";
import { loadUserType } from "@/Storage/MainAppStorage";
import Toast from "react-native-toast-message";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { UserState } from "@/Store/User";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { ChangePassword } from "@/Services/LoginServices";
import LogoutStore from "@/Store/Authentication/LogoutStore";
import { AppHeader } from "@/Components";
import Colors from "@/Theme/Colors";
import { navigationRef } from "@/Navigators/Functions";

const ChangePasswordScreen = () => {
  const { Layout } = useTheme();
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const [showCodeField, setShowField] = useState(false);
  const user = useSelector((state: { user: UserState }) => state.user.item);
  console.log("user", user);
  const [oldPasswordVisible, setOldPasswordVisible] =
    React.useState<boolean>(false);
  const [newPasswordVisible, setNewPasswordVisible] =
    React.useState<boolean>(false);
  const [isEditMode, setisEditMode] = useState(false);
  const [verificationMode, setVerificationMode] = useState(false);
  const [isSending, setisSending] = useState(false);

  const isLoading = useSelector(
    (state: { user: UserState }) => state.user.fetchOne.loading
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
      .then((response) => {
        console.log("response", response.data);
        Toast.show({
          type: "success",
          position: "top",
          text1: "Activation Code sent successfully",
        });
      })
      .catch((err) => {
        Toast.show({
          type: "success",
          position: "top",
          text1: "Error",
        });
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };
  const loginValidationSchema = yup.object().shape({
    oldPassword: yup.string().required("Old Password is required"),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required("Password is required"),
    newPassword: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .oneOf([yup.ref("password"), null], "Passwords don't match")
      .required("Password is required"),
    verificationCode: yup.string(),
  });
  const CodeValidationSchema = yup.object().shape({
    oldPassword: yup.string().required("Old Password is required"),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required("Password is required"),
    newPassword: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .oneOf([yup.ref("password"), null], "Passwords don't match")
      .required("Password is required"),
    verificationCode: yup
      .string()
      .min(6, ({ min }) => `Activation must be at least ${min} characters`)
      .max(6, ({ max }) => `Activation code must be at least ${max} characters`)
      .required("Activation Code is required"),
  });

  const onOldPasswordIconPress = (): void => {
    setOldPasswordVisible(!passwordVisible);
  };

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const renderOldPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onOldPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  const renderPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  const onNewPasswordIconPress = (): void => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const renderNewPasswordIcon = (props: any): ReactElement => (
    <TouchableWithoutFeedback onPress={onNewPasswordIconPress}>
      <Icon {...props} name={newPasswordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  const verifyActivationCode = async (resetPasswordObject: any) => {
    ResetPasswordVerify(resetPasswordObject)
      .then((response) => {
        console.log("response", response);
        Toast.show({
          type: "info",
          position: "top",
          text1: "Password reset successfully",
        });
      })
      .catch((err) => {
        Toast.show({
          type: "info",
          position: "top",
          text1:
            err.status == 404 ? "Invalid Activation code" : `An error occured`,
        });
        console.log("err", err);
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };

  return (
    <>
      <AppHeader title="Reset Password" isBack />
      {isLoading ? (
        <View style={styles.sppinerContainer}>
          <View style={styles.sppinerContainer}>
            <Spinner status="primary" />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={[[Layout.column, Layout.justifyContentCenter]]}>
            <Formik
              validationSchema={
                showCodeField ? CodeValidationSchema : loginValidationSchema
              }
              //   validateOnMount={true}
              initialValues={{
                oldPassword: "",
                password: "",
                newPassword: "",
                verificationCode: "",
              }}
              onSubmit={async (values, { resetForm }) => {
                dispatch(ChangeModalState.action({ loading: true }));
                if (!showCodeField) {
                  ResetPassword(values.oldPassword)
                    .then(async (res) => {
                      setShowField(true);
                      getActivationCode();
                      console.log("res", res);
                    })
                    .catch((err) => {
                      console.log("err", err);
                      Toast.show({
                        type: "success",
                        position: "top",
                        text1: "Verify That your Old password is correct",
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
                  dispatch(LogoutStore.action());
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
              }}
            >
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
                  {console.log("errors", errors)}
                  {isSending ? (
                    <View style={styles.sppinerContainer}>
                      <Spinner status="primary" />
                    </View>
                  ) : (
                    <>
                      <View style={styles.inputSettings}>
                        <Input
                          textStyle={{ fontSize: 16 }}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!oldPasswordVisible}
                          label={(evaProps) => (
                            <Text {...evaProps} style={{ fontSize: 16 }}>
                              Old password
                            </Text>
                          )}
                          placeholder="Old password"
                          accessoryRight={renderOldPasswordIcon}
                          value={values.oldPassword}
                          onBlur={handleBlur("oldPassword")}
                          onChangeText={handleChange("oldPassword")}
                        />
                        {errors.oldPassword && touched.oldPassword && (
                          <Text style={styles.errorText}>
                            {errors.oldPassword}
                          </Text>
                        )}
                      </View>
                      <View style={styles.inputSettings}>
                        <Input
                          textStyle={{ fontSize: 16 }}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!passwordVisible}
                          label={(evaProps) => (
                            <Text {...evaProps} style={{ fontSize: 16 }}>
                              New password
                            </Text>
                          )}
                          placeholder="New password"
                          accessoryRight={renderPasswordIcon}
                          value={values.password}
                          onBlur={handleBlur("password")}
                          onChangeText={handleChange("password")}
                        />
                        {errors.password && touched.password && (
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        )}
                      </View>
                      <View style={styles.inputSettings}>
                        <Input
                          textStyle={{ fontSize: 16 }}
                          disabled={verificationMode}
                          autoCapitalize="none"
                          secureTextEntry={!newPasswordVisible}
                          label={(evaProps) => (
                            <Text {...evaProps} style={{ fontSize: 16 }}>
                              Confirm new password
                            </Text>
                          )}
                          placeholder="Confirm new password"
                          accessoryRight={renderNewPasswordIcon}
                          value={values.newPassword}
                          onBlur={handleBlur("newPassword")}
                          onChangeText={handleChange("newPassword")}
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
                            label={(evaProps) => (
                              <Text {...evaProps} style={{ fontSize: 16 }}>
                                Activation code
                              </Text>
                            )}
                            placeholder="Activation Code"
                            value={values.verificationCode}
                            onBlur={handleBlur("verificationCode")}
                            onChangeText={handleChange("verificationCode")}
                          />
                          {errors.verificationCode &&
                            touched.verificationCode && (
                              <Text style={styles.errorText}>
                                {errors.verificationCode}
                              </Text>
                            )}
                        </View>
                      )}
                      {!showCodeField && (
                        <View style={styles.background}>
                          <TouchableOpacity
                            style={styles.background}
                            onPress={handleSubmit}
                          >
                            <Text style={styles.button}>
                              Send Activation Code
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {showCodeField && (
                        <View
                          style={[
                            styles.background,
                            {
                              backgroundColor: !isValid
                                ? Colors.gray
                                : Colors.primary,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            style={[
                              styles.background,
                              {
                                backgroundColor: !isValid
                                  ? Colors.gray
                                  : Colors.primary,
                              },
                            ]}
                            disabled={!isValid ? true : false}
                            onPress={handleSubmit}
                          >
                            <Text style={styles.button}>Verify</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </>
              )}
            </Formik>
            {!verificationMode && (
              <TouchableOpacity
                style={styles.backgroundTextButton}
                onPress={() => getActivationCode()}
              >
                <Text style={styles.buttonText}>Resend Activation Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 30,
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
    width: 116,
    height: 116,
    borderRadius: 58,
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
    marginBottom: 25,
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
  backgroundTextButton: {
    width: "100%",
    borderRadius: 10,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "bold",
  },
  buttonText: {
    paddingVertical: 5,
    fontSize: 16,
    color: Colors.primary,
    borderRadius: 10,
    fontWeight: "bold",
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 11,
    color: "red",
  },
  editField: {
    paddingLeft: 20,
    backgroundColor: Colors.white,
    borderRadius: 5,
    paddingVertical: 10,
  },
  editLabel: {
    fontSize: 12,
    color: "rgba(143, 155, 179, 0.48)",
    marginBottom: 4,
    marginTop: 8,
  },
});
