import React, { useState, useEffect } from "react";
import {
  Image,
  KeyboardAvoidingView,
  View,
  Linking,
  Dimensions,
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
import { useIsFocused } from "@react-navigation/native";
import * as yup from "yup";
import { StartRegistration } from "@//Services/SignUpServices";
import { Normalize } from "@/Utils/Shared/NormalizeDisplay";
import { useDispatch } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Toast from "react-native-toast-message";
import { LinearGradientButton } from "@/Components";
import FastImage from "react-native-fast-image";
import Entypo from "react-native-vector-icons/Entypo";
import Colors from "@/Theme/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import {
  GetAuthStudentByActivationCode,
  GetStudentByActivationCode,
} from "@/Services/Student";
import MaskInput from "react-native-mask-input";
import { ReferenceCodeRegex, ReferenceCodeStyle } from "@/Theme/Variables";

const user_type = [
  { id: 1, label: "Parent", value: "Parent" },
  { id: 2, label: "Instructor", value: "Instructor" },
  { id: 3, label: "Student", value: "Student" },
];

// @ts-ignore
const screenHeight = Dimensions.get("screen").height;
const FirstSignUpScreen = ({ navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const isFocuesed = useIsFocused();
  let values = { email: "", user_type: "" };
  const [initialValues, setInitialValues] = useState({ ...values });
  const [showQR, setShowQR] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [isDesignatedAdmin, setIsDesignatedAdmin] = useState(false);

  // @ts-ignore
  const renderPersonIcon = (props: any) => (
    <Icon {...props} name="person-outline" />
  );
  const emailValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
  });
  const activationCodeValidationSchema = yup.object().shape({
    email: yup.string().min(12).required("Activation Code is required"),
  });
  const getStudentQrApiCall = async (email: any, user_type: any) => {
    dispatch(ChangeModalState.action({ loading: true }));
    GetAuthStudentByActivationCode(email)
      .then((res) => {
        setShowQR(false);
        navigation &&
          navigation.navigate("FinalRegistrationScreen", {
            student: res,
            registrationId: "test",
            user_type,
            activation_code: email,
          });
      })
      .catch((err) => {
        console.log("Student Error", err);
        Toast.show({
          type: "info",
          position: "top",
          text1: `Invalid Reference code`,
        });
      })
      .finally(() => {
        dispatch(ChangeModalState.action({ loading: false }));
      });
  };
  useEffect(() => {
    // return () => setInitialValues(intitialValues);
    if (!isFocuesed) {
      setInitialValues(values);
    }
    // dispatch(FetchCountries.action());
    // console.log("alert");
    // Alert.alert("kk");
    // MainNavigator = null;
  }, [isFocuesed]);
  return (
    <KeyboardAvoidingView style={styles.container}>
      {!showQR ? (
        <>
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

          <Formik
            validationSchema={
              selectedUserType === "Student"
                ? activationCodeValidationSchema
                : emailValidationSchema
            }
            initialValues={initialValues}
            validateOnMount={true}
            onSubmit={(values, { resetForm }) => {
              // navigation && navigation.navigate('EmailConfirmation', { emailAddress: values.email, user_type: values.user_type, activation_code: '' })
              let emailObject = {
                email: values.email,
                user_type: values.user_type,
              };
              if (emailObject.user_type === "Student") {
                dispatch(ChangeModalState.action({ loading: true }));

                getStudentQrApiCall(emailObject.email, values.user_type);
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
                    console.log("res", res.data);
                    if (isDesignatedAdmin) {
                      navigation &&
                        navigation.navigate("EmailConfirmation", {
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
                    } else if (values.user_type.toLowerCase() === "student") {
                      navigation &&
                        navigation.navigate("FinalRegistrationScreen", {
                          emailAddress: "",
                          registrationId: "test",
                          user_type: values.user_type,
                          activation_code: values.email,
                        });
                    } else {
                      navigation &&
                        navigation.navigate("EmailConfirmation", {
                          emailAddress: values.email,
                          user_type: values.user_type,
                          activation_code: res.data?.activation_code,
                        });
                    }
                    resetForm();
                  })
                  .catch((err) => {
                    console.log("err", err);
                    Toast.show({
                      type: "info",
                      position: "top",

                      text1: err.data?.message
                        ? err.data?.message
                        : "Please try again later",
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
                  <Select
                    style={{ marginTop: 18 }}
                    value={values.user_type}
                    placeholder="Select User"
                    onSelect={(index: any) => {
                      setFieldValue("user_type", user_type[index.row].value);
                      setSelectedUserType(user_type[index.row].value);
                    }}
                    label={(evaProps: any) => <Text {...evaProps}></Text>}
                  >
                    {user_type.map((type, index) => {
                      return <SelectItem key={index} title={type?.label} />;
                    })}
                  </Select>
                  {values.user_type === "Student" && (
                    <View style={{ marginVertical: 10 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginTop: 10,
                        }}
                      >
                        Enter your 32-digit reference code from your parent's
                        Dependent Information or scan the QR code corresponding
                        to your name.
                      </Text>
                    </View>
                  )}
                  {!(values.user_type.toLowerCase() === "student") && (
                    <Input
                      placeholder={"Email"}
                      accessoryRight={renderPersonIcon}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                      keyboardType={"email-address"}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={{ marginTop: 20 }}
                    />
                  )}
                  {values.user_type.toLowerCase() === "student" && (
                    <MaskInput
                      value={values.email}
                      placeholderTextColor={Colors.textInputPlaceholderColor}
                      style={ReferenceCodeStyle}
                      onChangeText={(masked, unmasked) => {
                        setFieldValue("email", masked); // you can use the unmasked value as well
                      }}
                      mask={ReferenceCodeRegex}
                    />
                  )}
                  {errors.email &&
                    touched.email &&
                    values.user_type === "Student" && (
                      <Text style={[styles.errorText, { marginTop: 20 }]}>
                        Reference Code is required
                      </Text>
                    )}
                  {errors.email &&
                    touched.email &&
                    values.user_type !== "Student" && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  <View style={{ marginTop: 10 }}>
                    {values.user_type === "Student" && (
                      <View
                        style={{
                          marginVertical: 5,
                          marginBottom: 20,
                          width: "100%",
                          alignItems: "flex-end",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Entypo
                          name="camera"
                          size={30}
                          color={Colors.primary}
                          onPress={() => setShowQR(true)}
                        />
                      </View>
                    )}
                    {values.user_type === "Instructor" && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginVertical: 20,
                        }}
                      >
                        <CheckBox
                          checked={isDesignatedAdmin}
                          onChange={() =>
                            setIsDesignatedAdmin(!isDesignatedAdmin)
                          }
                        >
                          {""}
                        </CheckBox>
                        <Text style={{ marginLeft: 20, width: "90%" }}>
                          I am designated admin for my organisation
                        </Text>
                      </View>
                    )}
                  </View>
                  <LinearGradientButton
                    style={[styles.signUpButton]}
                    size="medium"
                    onPress={handleSubmit}
                    disabled={!isValid}
                  >
                    Sign Up
                  </LinearGradientButton>
                </Layout>
                {values.user_type !== "Student" ? (
                  <View style={styles.bottomView}>
                    <Button
                      appearance="ghost"
                      status="basic"
                      size="medium"
                      onPress={
                        () => navigation.navigate("Login")
                        // openActivationCode(values.email, values.user_type)
                      }
                    >
                      {() => <Text style={styles.buttonMessage}> Log in</Text>}
                    </Button>
                  </View>
                ) : (
                  <View style={styles.bottomView}></View>
                )}
              </>
            )}
          </Formik>
        </>
      ) : (
        <QRCodeScanner
          onRead={(e) => {
            console.log("edata", e);
            dispatch(ChangeModalState.action({ loading: true }));
            getStudentQrApiCall(e.data, "Student");
          }}
          flashMode={RNCamera.Constants.FlashMode.torch}
          bottomContent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: "5%",
              }}
            >
              <View style={{ width: "48%" }}>
                <LinearGradientButton style={styles.signUpButton} size="medium">
                  Rescan
                </LinearGradientButton>
              </View>
              <View style={{ width: "48%" }}>
                <LinearGradientButton
                  style={styles.signUpButton}
                  size="medium"
                  onPress={() => {
                    navigation &&
                      navigation.navigate("EmailConfirmation", {
                        emailAddress: "",
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
    </KeyboardAvoidingView>
  );
};
export default FirstSignUpScreen;
const themedStyles = StyleService.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "background-basic-color-1",
  },
  headerContainer: {
    marginTop: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    height: screenHeight * 0.25,
    width: "100%",
    // flex: 2,
    backgroundColor: "#fff",
  },
  formContainer: {
    // flex: 3,
    paddingHorizontal: 16,
    justifyContent: "space-evenly",
  },
  welcomeMessage: {
    marginTop: 16,
    color: "color-primary-default",
  },
  signUpButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  errorText: {
    fontSize: 10,
    color: "red",
  },
  bottomView: {
    flex: 3.7,
  },
  buttonMessage: {
    color: "color-primary-default",
    fontSize: 17,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: "#777",
  },
  textBold: {
    fontWeight: "500",
    color: "#000",
  },
  buttonText: {
    fontSize: 21,
    color: "rgb(0,122,255)",
  },
  buttonTouchable: {
    padding: 16,
  },
});
