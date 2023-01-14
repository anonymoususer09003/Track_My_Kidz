import React, { useState } from "react";
import { Image, KeyboardAvoidingView, View } from "react-native";
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
} from "@ui-kitten/components";
import { Formik } from "formik";
import * as yup from "yup";
import { Normalize } from "../../../Utils/Shared/NormalizeDisplay";
import { ForgotPassword } from "@/Services/LoginServices";
import { useDispatch } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Toast from "react-native-toast-message";
import { LinearGradientButton } from "@/Components";
import FastImage from "react-native-fast-image";
import Colors from "@/Theme/Colors";
import { GetActivationCode } from "@/Services/ActivationCode";
import { ChangePassword } from "@/Services/LoginServices";
// @ts-ignore
const ForgotPasswordScreen = ({ navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const [selectedUserType, setSelectedUserType] = useState("");
  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate("SignUp1");
  };
  const user_type = [
    { id: 1, label: "Parent", value: "Parent" },
    { id: 2, label: "Instructor", value: "Instructor" },
    { id: 3, label: "Student", value: "Student" },
  ];
  const onLoginButtonPress = (): void => {
    navigation && navigation.navigate("Login");
  };
  // @ts-ignore
  const renderPersonIcon = (props: any) => (
    <Icon {...props} name="person-outline" />
  );
  const forgotPassValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
  });

  return (
    <KeyboardAvoidingView style={styles.container}>
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
        validationSchema={forgotPassValidationSchema}
        validateOnMount={true}
        initialValues={{ email: "", user_type: "" }}
        onSubmit={(values, { resetForm }) => {
          let resetPasswordObject = {
            email: values.email,
            type: values.user_type.toLowerCase(),
            // activationNumber: values.activationCode,
            // password: values.password,
          };
          dispatch(ChangeModalState.action({ loading: true }));
          ChangePassword(resetPasswordObject)
            .then((response) => {
              console.log("response", response.data);

              navigation.navigate("ResetPassword", {
                emailAddress: values.email,
                user_type: values.user_type,
              });
            })
            .finally(() => {
              dispatch(ChangeModalState.action({ loading: false }));
            });

          // GetActivationCode({ email: values.email }, values.user_type)
          //   .then((res) => {
          //     console.log("res----", res);
          //     // navigation.navigate("EmailConfirmation", {
          //     //   emailAddress: values.email,
          //     //   user_type: values.user_type,
          //     // });
          //     navigation.navigate("ResetPassword", {
          //       emailAddress: values.email,
          //       user_type: values.user_type,
          //       code: res?.activation_code,
          //     });
          //     // setActivationCode(res?.activation_code);
          //   })
          //   .catch((err) => {
          //     console.log("err", err);
          //     Toast.show({
          //       type: "info",
          //       position: "top",
          //       text1: "Info",
          //       text2: "Please check your email address and try again ",
          //       visibilityTime: 4000,
          //       autoHide: true,
          //       topOffset: 30,
          //       bottomOffset: 40,
          //       onShow: () => {},
          //       onHide: () => {},
          //       onPress: () => {},
          //     });
          //   })
          //   .finally(() => {
          //     dispatch(ChangeModalState.action({ loading: false }));
          //   });
          // ForgotPassword(emailObject)
          //   .then((response: any) => {
          //     if (response.status == 200) {
          //       navigation.navigate("ResetPassword", {
          //         emailAddress: values.email,
          //       });
          //     }
          //   })
          //   .catch((err) => {
          //     Toast.show({
          //       type: "info",
          //       position: "top",
          //       text1: "Info",
          //       text2: "Please check your email address and try again ",
          //       visibilityTime: 4000,
          //       autoHide: true,
          //       topOffset: 30,
          //       bottomOffset: 40,
          //       onShow: () => {},
          //       onHide: () => {},
          //       onPress: () => {},
          //     });
          //   })
          //   .finally(() => {
          //     dispatch(ChangeModalState.action({ loading: false }));
          //   });
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
            <Layout style={styles.formContainer}>
              <Select
                style={{ marginBottom: 18 }}
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
              <Input
                placeholder="Email"
                autoCapitalize="none"
                autoCorrect={false}
                accessoryRight={renderPersonIcon}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                keyboardType="email-address"
              />
              {errors.email && touched.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              <View style={styles.resetButtonContainer}>
                <LinearGradientButton
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
              <Button
                appearance="ghost"
                status="basic"
                size="small"
                onPress={onLoginButtonPress}
              >
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
  );
};
export default ForgotPasswordScreen;
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
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
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
    color: Colors.primary,
    fontSize: 17,
  },

  bottomView: {
    flex: 2,
  },
  errorText: {
    fontSize: 10,
    color: "red",
  },
});
