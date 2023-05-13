import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useTheme } from "@/Theme";
import {
  Card,
  Text,
  Radio,
  RadioGroup,
  Spinner,
  Input,
} from "@ui-kitten/components";
// @ts-ignore
import { ReportAProblem } from "../../../Services/SettingsServies";
import LinearGradient from "react-native-linear-gradient";
import * as yup from "yup";
import { Formik } from "formik";
import { AppHeader, LinearGradientButton } from "@/Components";
import { useHeaderHeight } from "react-native-screens/native-stack";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Colors from "@/Theme/Colors";
import { loadUserId } from "@/Storage/MainAppStorage";
import CreateReport from "@/Services/Settings/CreateReport";
import BackgroundLayout from "@/Components/BackgroundLayout";
const Divider = () => (
  <View
    style={{
      borderBottomColor: "#E0E0E0",
      borderBottomWidth: 1,
    }}
  />
);

const issues = [
  "User interface issues",
  "",
  "App performance and response",
  "",
  "Functionality missing or not working properly",
  "",
  "Device compatibility",
  "",
  "Other",
];

const RadioOptions = ({
  selectedIndex,
  setSelectedIndex,
}: {
  selectedIndex: any;
  setSelectedIndex: any;
}) => {
  return (
    <React.Fragment>
      <RadioGroup
        selectedIndex={selectedIndex}
        onChange={(index) => setSelectedIndex(index)}
      >
        {issues.map((item, index) => {
          if (item != "") {
            return (
              <Radio
                key={index}
                style={[
                  styles.radio,
                  index == selectedIndex && {
                    borderColor: Colors.primaryTint,
                    borderWidth: 1.5,
                  },
                ]}
              >
                {(evaProps) => (
                  <Text {...evaProps} style={styles.radioText}>
                    {item}
                  </Text>
                )}
              </Radio>
            );
          } else {
            return <></>;
          }
        })}
      </RadioGroup>
    </React.Fragment>
  );
};

const ReportProblemScreen = ({ navigation }) => {
  const { Layout } = useTheme();
  const reportAProblemValidationSchema = yup.object().shape({
    message: yup
      .string()
      .max(200, "Message cannot be more than 200 characters")
      .min(20, ({ min }) => `Message needs to be at least ${min} characters`)
      .required("Message is required"),
  });

  const [userId, setUserId] = useState();

  const getUserId = async () => {
    const _id = await loadUserId();
    setUserId(_id);
  };

  useEffect(() => {
    getUserId();
  }, []);

  const [isTouched, setisTouched] = useState(false);
  const [isSending, setisSending] = useState(false);
  const [isSent, setisSent] = useState(false);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  return (
    <BackgroundLayout title="Report a Problem">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />
      <KeyboardAwareScrollView
        extraHeight={10}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.layout}>
            <View style={[styles.mainLayout]}>
              {isSent ? (
                <View style={styles.sppinerContainer}>
                  <Text style={styles.sent}>
                    The problem you are experiencing has been successfully
                    reported
                  </Text>
                </View>
              ) : (
                // : (
                //   <View style={styles.sppinerContainer}>
                //     <Spinner status="primary" />
                //   </View>
                // )
                <>
                  <RadioOptions
                    selectedIndex={selectedIndex}
                    setSelectedIndex={setSelectedIndex}
                  />
                  <View style={styles.formikContainer}>
                    <Text
                      style={{
                        marginVertical: 20,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      Explain (Min 20 & Max 200 Characters)
                    </Text>
                    <Formik
                      validationSchema={reportAProblemValidationSchema}
                      validateOnMount={true}
                      initialValues={{ message: "" }}
                      onSubmit={(values, { resetForm }) => {
                        setisSending(true);
                        setisSent(true);
                        let objectToPass = {
                          userId: userId,
                          subject: issues[selectedIndex],
                          description: values.message,
                        };
                        CreateReport(objectToPass)
                          .then((response: any) => {
                            console.log("res", response.status);
                            if (response.status == 201) {
                              setisSent(true);
                              setTimeout(() => {
                                setisSent(false);

                                setisSending(false);
                              }, 400);
                            }
                          })
                          .catch((error: any) => {
                            Alert.alert(
                              error.data.title,

                              error.message,
                              [{ text: "OK", style: "cancel" }]
                            );
                            setisSending(false);
                          });
                        resetForm();
                        setSelectedIndex(0);
                      }}
                    >
                      {({
                        handleChange,
                        handleSubmit,
                        values,
                        errors,
                        isValid,
                      }) => (
                        <>
                          <View style={styles.formContainer}>
                            <Input
                              style={styles.textInput}
                              textStyle={styles.textArea}
                              placeholder="Type your feedback"
                              onChangeText={handleChange("message")}
                              value={values.message}
                              multiline={true}
                              maxLength={500}
                              status={
                                isTouched && errors.message ? "danger" : ""
                              }
                            />
                            {errors.message && isTouched ? (
                              <Text style={styles.errorText}>
                                {errors.message}
                              </Text>
                            ) : null}
                            <View style={styles.buttonSettings}>
                              <View style={{ width: "90%" }}>
                                <LinearGradientButton
                                  disabled={!isValid}
                                  onPress={handleSubmit}
                                >
                                  Send
                                </LinearGradientButton>
                              </View>

                              <View style={styles.cancelBackground}>
                                <TouchableOpacity
                                  style={styles.cancelBackground}
                                  onPress={() => navigation.goBack()}
                                >
                                  <Text style={styles.cancelButton}>
                                    Cancel
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                            <View style={{ height: 100 }} />
                          </View>
                        </>
                      )}
                    </Formik>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </BackgroundLayout>
  );
};

export default ReportProblemScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  radio: {
    flexDirection: "row",

    // paddingLeft: 20,
    marginVertical: 5,

    borderRadius: 10,
    paddingVertical: 10,
    width: "90%",
    paddingHorizontal: 20,
    alignSelf: "center",
    backgroundColor: Colors.white,
  },
  radioText: {
    fontSize: 14,
    marginLeft: 10,
  },
  formikContainer: {
    width: "100%",
    paddingLeft: 20,
  },
  textInput: {
    marginRight: 20,
    textAlignVertical: "top",
    // minHeight: 200,
    borderRadius: 10,
    elevation: 1,
  },
  textArea: {
    minHeight: 100,

    marginLeft: -1,
    textAlignVertical: "top",
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
    fontWeight: "bold",
    color: Colors.gray,
    textAlign: "center",
  },
  background: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
  },
  cancelBackground: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  cancelButton: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.primary,
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: -20,
  },

  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
    marginTop: 10,
  },
});
