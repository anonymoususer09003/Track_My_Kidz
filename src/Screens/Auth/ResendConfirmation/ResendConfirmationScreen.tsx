import React, { useState, useEffect } from "react";
import { Image, View, Dimensions } from "react-native";
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
import { KeyboardAvoidingView } from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { Normalize } from "../../../Utils/Shared/NormalizeDisplay";
import { ResendRegistrationCode } from "@/Services/SignUpServices";
import { GetActivationCode } from "@/Services/ActivationCode";
import Toast from "react-native-toast-message";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { useDispatch } from "react-redux";
import { LinearGradientButton } from "@/Components";
import FastImage from "react-native-fast-image";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
// @ts-ignore
const screenHeight = Dimensions.get("screen").height;
const ResendConfirmationScreen = ({ navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useDispatch();
  const [selectedUserType, setSelectedUserType] = useState("");
  const onSignUpButtonPress = (): void => {
    navigation && navigation.navigate("SignUp1");
  };
  const isFocuesed = useIsFocused();
  const [reRender, setRerender] = useState(false);
  const user_type = [
    { id: 1, label: "Parent", value: "Parent" },
    { id: 2, label: "Instructor", value: "Instructor" },
    { id: 3, label: "Student", value: "Student" },
  ];
  // @ts-ignore
  const renderPersonIcon = (props: any) => (
    <Icon {...props} name="person-outline" />
  );
  const reactivateValidationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Please enter valid email")
      .required("Email is required"),
  });
  const [isDesignatedAdmin, setIsDesignatedAdmin] = useState(false);

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
      {isFocuesed && (
        <Formik
          validationSchema={reactivateValidationSchema}
          validateOnMount={true}
          initialValues={{ email: "", user_type: "" }}
          onSubmit={(values, { resetForm }) => {
            dispatch(ChangeModalState.action({ loading: true }));
            // resetForm();
            GetActivationCode({ email: values.email }, values.user_type)
              .then((res) => {
                console.log("res----", res);
                navigation.navigate("EmailConfirmation", {
                  emailAddress: values.email,
                  user_type: values.user_type,
                  isDesignatedAdmin: isDesignatedAdmin ? true : false,
                });
                resetForm();
                // setActivationCode(res?.activation_code);
              })
              .catch((err) => {
                console.log("err", err);
                Toast.show({
                  type: "info",
                  position: "top",
                  text1: "Info",
                  text2: "Please check your email address and try again ",
                  visibilityTime: 4000,
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

            // ResendRegistrationCode({
            //   email: values.email,
            // })
            //   .then((res) => {
            //     console.log("response", res);
            //     navigation.navigate("EmailConfirmation", {
            //       emailAddress: values.email,
            //     });
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
                  accessoryRight={renderPersonIcon}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                />
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
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
                      onChange={() => setIsDesignatedAdmin(!isDesignatedAdmin)}
                    >
                      {""}
                    </CheckBox>
                    <Text style={{ marginLeft: 20, width: "90%" }}>
                      I'm a designated admin for my organisation
                    </Text>
                  </View>
                )}

                <View style={{ marginTop: 20 }}>
                  <LinearGradientButton
                    style={styles.sendConfirmationButton}
                    appearance="filled"
                    size="medium"
                    onPress={handleSubmit}
                    disabled={!isValid}
                  >
                    Send
                  </LinearGradientButton>
                </View>
              </Layout>
              <View style={{ flex: 1 }}>
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
      )}
    </KeyboardAvoidingView>
  );
};
export default ResendConfirmationScreen;
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
    // flex: 1,
    height: screenHeight * 0.25,
    width: "100%",
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
    // flex: 1,
    marginHorizontal: 2,
    borderRadius: 20,
    marginTop: 35,
  },
  sendConfirmationButton: {
    marginHorizontal: 2,
    borderRadius: 20,
  },
  buttonMessage: {
    color: Colors.primary,
    fontSize: 17,
  },

  errorText: {
    fontSize: 10,
    color: "red",
  },
});
