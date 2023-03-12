import React, { useEffect, useState } from "react";
import {
  useFocusEffect,
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";
import { Text, Input } from "@ui-kitten/components";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from "@/Theme/Colors";
import { Formik } from "formik";
import { AppHeader } from "@/Components";
import { useStateValue } from "@/Context/state/State";
import { actions } from "@/Context/state/Reducer";
import { GetOptInGroup } from "@/Services/Group";
import * as yup from "yup";

import { GetGroup } from "@/Services/Group";
const CreateGroupScreen = ({ route }) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [, _dispatch] = useStateValue();
  const dispatch = useDispatch();
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [groupDetail, setGroupDetail] = useState({});
  const ValidationSchema = yup.object().shape({
    name: yup.string().min(3).max(20).required("Name is required"),
  });
  const [infomation, setInformation] = useState({});
  const getGroupsOptInDetail = async () => {
    try {
      let res = await GetOptInGroup(route?.params?.data?.groupId);
      setInformation({ ...res, groupName: route?.params?.data?.groupName });
    } catch (err) {
      console.log("err", err);
    }
  };

  const getGroupDetail = async () => {
    GetGroup(route?.params?.data?.groupId)
      .then((res) => {
        console.log("groupinfo", res);

        let students = res?.studentsGroupList?.map((item) => ({
          name: item?.firstName + " " + item.lastName,

          parent1_email: item.parentEmail1,
          parent2_email: item.parentEmail2,
          studentId: item?.studentsGroupId,
        }));
        let instructors = res?.instructorsGroupList?.map((item, index) => ({
          firstname: item?.firstName,
          lastname: item?.lastName,
          email: item?.email,
          instructorId: item?.instructorGroupId,
          isEdit: true,
        }));
        console.log("instructors", instructors);
        setGroupDetail({ instructors, students });
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  useEffect(() => {
    if (isFocused && route?.params) {
      getGroupsOptInDetail();
      getGroupDetail();
    } else {
      setInformation({});
    }
  }, [isFocused]);

  useEffect(() => {
    if (selectedDependent) {
      dispatch(ChangeModalState.action({ editDependentModalVisibility: true }));
    }
  }, [selectedDependent]);
  console.log("9099090099099", infomation);
  return (
    <ScrollView>
      <AppHeader
        title={route?.params ? "Edit Group" : "Create Group"}
        hideCalendar={true}
        hideApproval={true}
      />
      <View style={styles.layout}>
        <Text
          textBreakStrategy={"highQuality"}
          style={{
            textAlign: "center",
            color: "#606060",
            fontSize: 18,
          }}
        >
          Create a name for your Group
        </Text>
        <Formik
          enableReinitialize
          validationSchema={ValidationSchema}
          // validateOnMount={true}
          initialValues={{
            name: infomation?.groupName || "",
            instructions: infomation?.instructions || "",
            disclaimer: infomation?.disclaimer || "",
            agreement: infomation?.agreement || "",
          }}
          onSubmit={(values, { resetForm }) => {
            const data = {
              name: values.name,
              optin: {
                instructions: values.instructions,
                disclaimer: values.disclaimer,
                agreement: values.agreement,
                status: true,
              },
              isEdit: route?.params
                ? { ...route?.params?.data, ...groupDetail }
                : false,
            };
            _dispatch({
              type: actions.SET_GROUP,
              payload: data,
            });

            navigation.navigate("AddMembers", {
              isEdit: route?.params ? true : false,
              data: { ...route?.params?.data, ...groupDetail },
            });
            resetForm();
          }}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            errors,
            isValid,
            touched,
            handleBlur,
          }) => (
            <>
              {console.log("values9999", values)}
              <View style={styles.formContainer}>
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 30, textAlignVertical: "center" }}
                  placeholder="Group name*"
                  onBlur={handleBlur("name")}
                  onChangeText={handleChange("name")}
                  value={values.name}
                />
                {errors.name && touched.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120, textAlignVertical: "top" }}
                  placeholder="Instructions"
                  onChangeText={handleChange("instructions")}
                  value={values.instructions}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120, textAlignVertical: "top" }}
                  placeholder="Disclaimer"
                  onChangeText={handleChange("disclaimer")}
                  value={values.disclaimer}
                  multiline={true}
                  maxLength={500}
                />
                <Input
                  style={{ marginRight: 20, marginTop: 10, marginLeft: "5%" }}
                  textStyle={{ minHeight: 120 }}
                  placeholder="Agreement"
                  onChangeText={handleChange("agreement")}
                  value={values.agreement}
                  multiline={true}
                  maxLength={500}
                />
                {console.log("error", errors)}
                <View style={styles.buttonSettings}>
                  <View
                    style={[
                      styles.background,
                      {
                        backgroundColor: !isValid
                          ? Colors.lightgray
                          : Colors.primary,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.background,
                        {
                          backgroundColor: !isValid
                            ? Colors.lightgray
                            : Colors.primary,
                        },
                      ]}
                      disabled={!isValid}
                      onPress={handleSubmit}
                    >
                      <Text style={styles.button}>
                        {route?.params ? "Edit Members" : "Add Members"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.background,
                      {
                        backgroundColor:
                          //   values?.name?.length < 3 || values?.name?.length > 20
                          //   !
                          Colors.primary,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.background]}
                      //   disabled={!isValid}
                      onPress={() => navigation.navigate("InstructorActivity")}
                    >
                      <Text style={styles.button}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    paddingTop: 20,
  },
  mainLayout: {
    flex: 1,
    marginTop: 40,
  },
  sppinerContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  sent: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
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
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
  },
  formContainer: {
    flex: 1,
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  errorText: {
    fontSize: 10,
    color: "red",
    marginLeft: 20,
    marginTop: 10,
  },
});
