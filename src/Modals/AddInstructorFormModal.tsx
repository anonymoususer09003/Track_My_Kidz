import { Input, Text, Layout, Button } from "@ui-kitten/components";
// import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "@/Theme/Colors";
import { Instructor } from "@/Models/UserDTOs";
import { Modal } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { LinearGradientButton } from "@/Components";

interface InstructorModal {
  instructors: Array<Instructor>;
  setInstructors: (data: Array<Instructor>) => {};
}

const AddInstructorFormModal = ({
  instructors,
  setInstructors,
}: InstructorModal) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addInstructorFormModalVisibility
  );
  const dispatch = useDispatch();

  const shoppingListValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
  });

  return (
    <Modal
      // isVisible={isVisible}
      visible={isVisible}
      style={styles.modal}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ addInstructorFormModalVisibility: false })
        );
      }}
    >
      <>
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
        >
          <Formik
            validationSchema={shoppingListValidationSchema}
            validateOnMount={true}
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
            }}
            onSubmit={(values, { resetForm }) => {
              const item = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
              };
              const data = instructors.length > 0 ? [...instructors] : [];
              data.push(item);
              setInstructors(data);
              resetForm();
            }}
          >
            {({
              handleChange,
              setFieldValue,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <Layout style={styles.formContainer} level="1">
                  <Input
                    value={values.firstName}
                    style={styles.textInput}
                    placeholder="First Name"
                    label={(evaProps: any) => (
                      <Text style={styles.inputLabels}>First Name</Text>
                    )}
                    onChangeText={handleChange("firstName")}
                  />

                  <Input
                    value={values.lastName}
                    style={styles.textInput}
                    placeholder="Last Name"
                    onChangeText={handleChange("lastName")}
                    label={(evaProps: any) => (
                      <Text style={styles.inputLabels}>Last Name</Text>
                    )}
                  />

                  <Input
                    value={values.email}
                    style={styles.textInput}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange("email")}
                    label={(evaProps: any) => (
                      <Text style={styles.inputLabels}>Email</Text>
                    )}
                  />
                </Layout>
                <View
                  style={{ marginTop: 40, width: "100%", alignItems: "center" }}
                >
                  <LinearGradientButton
                    onPress={handleSubmit}
                    gradient={["#EC5ADD", Colors.primary]}
                  >
                    Add one more
                  </LinearGradientButton>
                  <View style={{ height: 20 }} />
                  <LinearGradientButton
                    onPress={() => {
                      handleSubmit();
                      dispatch(
                        ChangeModalState.action({
                          addInstructorFormModalVisibility: false,
                        })
                      );
                    }}
                  >
                    I'm Done
                  </LinearGradientButton>

                  <TouchableOpacity
                    onPress={() => {
                      dispatch(
                        ChangeModalState.action({
                          addInstructorFormModalVisibility: false,
                        })
                      );
                    }}
                  >
                    <Text style={styles.button}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
      </>
    </Modal>
  );
};
export default AddInstructorFormModal;

const styles = StyleSheet.create({
  modal: {
    width: "90%",
    backgroundColor: Colors.white,
    elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 5,
    shadowRadius: 5,
    shadowOpacity: 0.3,
    zIndex: 10,
    marginTop: "30%",
  },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
  },
  topNav: {
    color: Colors.white,
    marginTop: 35,
  },
  container: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: {
    fontWeight: "bold",
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "30%",
  },
  modalButton: {
    width: "95%",
    marginTop: 10,
  },
  selectInput: {
    marginTop: 10,
  },
  mainAsset: {
    alignItems: "center",
    height: 300,
    width: "100%",
    flex: 3,
  },
  mainContent: {
    flex: 4,
  },
  textContent: {
    fontSize: 16,
    padding: 10,
    width: "100%",
    borderBottomColor: Colors.lightgray,
    borderBottomWidth: 1,
  },
  extraImages: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    height: 100,
  },
  centerItems: {
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 10,
    color: "red",
  },
  formView: {
    flex: 9,
  },
  bottomView: {
    width: "100%",
    flexDirection: "row",
    position: "absolute",
    justifyContent: "center",
    backgroundColor: Colors.transparent,
    bottom: 0,
    height: 50,
  },
  linearBottom: {
    width: "100%",

    height: 50,
  },
  createPostButton: {
    margin: 3,
    width: "50%",

    height: 50,
    right: 0,
    backgroundColor: Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
  },
  ghostButton: {
    margin: 8,
    width: "100%",
    alignSelf: "center",
  },
  buttonSettings: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  formContainer: {
    flex: 1,
    marginVertical: 20,
  },

  backgroundButton: {
    width: "80%",
    borderRadius: 10,
    paddingBottom: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: Colors.primary,
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
  selectSettings: {
    marginTop: 18,
  },
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "95%",

    borderRadius: 8,
    elevation: 2,
  },
  inputLabels: {
    color: Colors.black,
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    paddingTop: 5,
    fontSize: 18,
    color: Colors.primaryTint,
    borderRadius: 10,
    marginVertical: 7,
  },
});
