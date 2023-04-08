import React, { useEffect, useState, useContext } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import {
  Button,
  Icon,
  Input,
  Layout,
  StyleService,
  Text,
  useStyleSheet,
  Select,
  SelectItem,
  CheckBox,
} from "@ui-kitten/components";
import { Formik } from "formik";

import DeviceInfo from "react-native-device-info";
import { Spinner } from "@/Components";
import { getDeviceId } from "react-native-device-info";
import { useIsFocused } from "@react-navigation/native";
import * as yup from "yup";
import { Login } from "@/Services/LoginServices";
import { Normalize } from "../../../Utils/Shared/NormalizeDisplay";
import LoginStore from "@/Store/Authentication/LoginStore";
// import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import messaging from "@react-native-firebase/messaging";
import { authenticateAsync } from "expo-local-authentication";
import { loadBiometricToken, storeToken } from "@/Storage/MainAppStorage";
import { UpdateDeviceToken } from "@/Services/User";

import { GetAllVariables } from "@/Services/Settings";
import { AuthContext } from "../../../Navigators/Auth/AuthProvider";
import { LinearGradientButton } from "@/Components";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FastImage from "react-native-fast-image";
import Colors from "@/Theme/Colors";
import UserType from "@/Store/UserType";
import { useSelector, useDispatch } from "react-redux";
import ChangeCountryState from "@/Store/Places/FetchCountries";
import FetchCountries from "@/Store/Places/FetchCountries";
import { GetAllCountries } from "@/Services/PlaceServices";

const user_type = [
  { id: 1, label: "Parent", value: "Parent" },
  { id: 2, label: "Instructor", value: "Instructor" },
  { id: 3, label: "Student", value: "Student" },
];
const screenHeight = Dimensions.get("screen").height;
// @ts-ignore
const SignInScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocuesed = useIsFocused();
  const [loading, setLoading] = useState(false);
  // const dispatch = useDispatch();
  const countries = useSelector(
    (state: { state: any }) => state.places.countries
  );
  let values = { email: "", password: "", user_type: "", is_default: false };
  const [intitialValues, setInitialValues] = useState({
    email: "",
    password: "",
    user_type: "",
    is_default: false,
  });
  // const deviceId = DeviceInfo.getUniqueID();
  // console.log("------deviceId", deviceId);
  const [passwordVisible, setPasswordVisible] = React.useState<boolean>(false);
  const { login, register } = useContext(AuthContext);
  const fetchCountries = async () => {
    try {
      console.log("usertype", countries);
      if (!countries) {
        let res = await GetAllCountries();
        dispatch(ChangeCountryState.action({ countries: res }));
      }
    } catch (err) {
      console.log("err fetch coutnries", err);
    }
  };
  console.log("getniqueid", getDeviceId());
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
    navigation && navigation.navigate("SignUp1");
  };
  const onForgotPasswordButtonPress = (): void => {
    navigation && navigation.navigate("ForgotPassword");
    // navigation && navigation.navigate('FinalOrgRegistrationScreen', {
    //   email: 'test@test.com'
    // })
  };
  const onResendActivationButtonPress = (value: boolean): void => {
    navigation &&
      navigation.navigate("ResendConfirmation", { resendCode: value });
  };
  const onReactivateButtonPress = (): void => {
    navigation && navigation.navigate("ReactivateAccount");
  };
  //#endregion

  const onPasswordIconPress = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  // @ts-ignore
  const renderPasswordIcon = (props) => (
    <TouchableWithoutFeedback onPress={onPasswordIconPress}>
      <Icon {...props} name={passwordVisible ? "eye-off" : "eye"} />
    </TouchableWithoutFeedback>
  );
  const renderPersonIcon = (props: any) => (
    <Icon {...props} name="person-outline" />
  );

  const loginValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
    password: yup
      .string()
      .min(8, ({ min }) => `Password must be at least ${min} characters`)
      .required("Password is required"),
    user_type: yup.string().required("User type is required"),
  });

  const saveTokenToDatabase = (token: string) => {
    UpdateDeviceToken(token)
      .then((data) => {})
      .catch((err) => {});
  };

  const requestUserPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();

    if (authorizationStatus) {
    }
  };

  return (
    <KeyboardAwareScrollView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Image
            style={{
              justifyContent: "center",
              alignItems: "center",
              maxHeight: Normalize(160),
              maxWidth: Normalize(160),
            }}
            source={require("@/Assets/Images/new-logo.png")}
            resizeMode="contain"
          />
        </View>
        {isFocuesed && (
          <Formik
            validationSchema={loginValidationSchema}
            validateOnMount={true}
            initialValues={intitialValues}
            onSubmit={(values) => {
              let objectToPass = {
                email: values.email,
                password: values.password,
              };
              setLoading(true);
              console.log("usertype", values.user_type);
              dispatch(ChangeModalState.action({ loading: true }));
              Login(objectToPass, values.user_type.toLowerCase())
                .then((res) => {
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
                  console.log(obj);
                  dispatch(LoginStore.action(obj));
                  dispatch(ChangeModalState.action({ loading: false }));
                  setLoading(false);
                })
                .catch((err) => {
                  setLoading(false);
                  console.log("err", err);
                  dispatch(ChangeModalState.action({ loading: false }));
                  if (
                    err?.data &&
                    err?.data?.detail === "Account is not active."
                  ) {
                    Toast.show({
                      type: "info",
                      position: "top",
                      text1: "Info",
                      text2:
                        "This account was temporarily deactivated. Reactivate below",
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
                      type: "info",
                      position: "top",
                      text1: "Info",
                      text2:
                        "Please check your email address or password and try again",
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
                  <View style={[styles.row]}>
                    <Select
                      style={{ width: "100%" }}
                      value={values.user_type}
                      placeholder="Select User"
                      onSelect={(index: any) =>
                        setFieldValue("user_type", user_type[index.row].value)
                      }
                      label={(evaProps: any) => <Text {...evaProps}></Text>}
                    >
                      {user_type.map((type, index) => {
                        return <SelectItem key={index} title={type?.label} />;
                      })}
                    </Select>
                  </View>
                  <Input
                    placeholder="Email"
                    style={styles.selectSettings}
                    accessoryRight={renderPersonIcon}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                  <Input
                    autoCapitalize="none"
                    style={styles.passwordInput}
                    placeholder="Password"
                    accessoryRight={renderPasswordIcon}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    secureTextEntry={!passwordVisible}
                  />
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <Layout style={styles.buttonSettings}>
                    <LinearGradientButton
                      style={styles.signInButton}
                      size="medium"
                      onPress={handleSubmit}
                      disabled={!isValid}
                    >
                      Login
                    </LinearGradientButton>
                    <View style={{ marginTop: 20 }}>
                      <LinearGradientButton
                        style={styles.registerButton}
                        size="medium"
                        onPress={OnRegisterButtonPress}
                      >
                        Create Account
                      </LinearGradientButton>
                    </View>
                  </Layout>
                </Layout>
              </>
            )}
          </Formik>
        )}
        <View style={styles.bottomView}>
          <Button
            appearance="ghost"
            status="basic"
            size="small"
            onPress={onForgotPasswordButtonPress}
          >
            {() => <Text style={styles.buttonMessage}> Forgot Password </Text>}
          </Button>
          <Button
            appearance="ghost"
            status="basic"
            size="small"
            onPress={() => onResendActivationButtonPress(true)}
          >
            {() => (
              <Text style={styles.buttonMessage}> Resend Activation Code </Text>
            )}
          </Button>
          {/* <Button
            appearance="ghost"
            status="basic"
            size="small"
            onPress={() => onResendActivationButtonPress(false)}
          >
            {() => (
              <Text style={styles.buttonMessage}> Enter Activation Code </Text>
            )}
          </Button> */}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
export default SignInScreen;
const themedStyles = StyleService.create({
  container: {
    // flex: 1,
    flexDirection: "column",
    backgroundColor: "background-basic-color-1",
    justifyContent: "flex-start",
  },
  headerContainer: {
    // flex: 2,
    height: screenHeight * 0.25,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  formContainer: {
    // flex: 4,
  },
  buttonSettings: {
    // flex: 1,
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  welcomeMessage: {
    marginTop: 16,
    color: Colors.primary,
  },
  buttonMessage: {
    color: Colors.primary,
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
  },
  errorText: {
    fontSize: 12,
    color: "red",
  },
  bottomView: {
    // flex: 2,
  },
  selectSettings: {
    marginTop: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  terms: {
    color: "text-hint-color",
  },
});
