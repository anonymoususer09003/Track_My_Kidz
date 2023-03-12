import { Input, Text, Layout, Button } from "@ui-kitten/components";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { Formik } from "formik";
import * as yup from "yup";
import Colors from "@/Theme/Colors";
import { Instructor } from "@/Models/UserDTOs";
import { SafeAreaView } from 'react-native'
interface InstructorModal {
  instructors: Array<Instructor>;
  setInstructors: (data: Array<Instructor>) => {};
  selectedInstructor: any;
}

const EditInstructorFormModal = ({
  instructors,
  setInstructors,
  selectedInstructor,
}: InstructorModal) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.editInstructorFormModalVisibility
  );
  const dispatch = useDispatch();

  const shoppingListValidationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
  });
  console.log("instructor", selectedInstructor);
  return (
    <Modal
      visible={isVisible}
      style={styles.modal}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ editInstructorFormModalVisibility: false })
        );
      }}
    >
 <View style={{height:'80%'}}>
        <ScrollView
          style={{
            height:'50%',
            backgroundColor: Colors.white,
            marginHorizontal:20,
            padding: 20,
            borderRadius: 5,
         
          }}
        >
          <Text style={[styles.heading, { textAlign: "center" }]}>
            Edit Instructor Detail
          </Text>
          <Formik
            validationSchema={shoppingListValidationSchema}
            validateOnMount={true}
            initialValues={{
              firstName: selectedInstructor.firstName || "",
              lastName: selectedInstructor.lastName || "",
              email: selectedInstructor.email || "",
            }}
            onSubmit={(values, { resetForm }) => {
              const item = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
              };

              let temp = [...instructors];
              let tempValue = temp[selectedInstructor.index];
              tempValue = item;
              temp[selectedInstructor.index] = tempValue;
              //   temp.splice(selectedInstructor.index, 1);
              //   const data = instructors.length > 0 ? [...instructors] : [];
              //   data.push(item);
              setInstructors(temp);
              resetForm();
              dispatch(
                ChangeModalState.action({
                  editInstructorFormModalVisibility: false,
                })
              );
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
                  <Text style={styles.heading}>First Name</Text>
                  <Input
                    value={values.firstName}
                    style={{ marginTop: 10 }}
                    placeholder="First Name"
                    onChangeText={handleChange("firstName")}
                  />
                  <Text style={styles.heading}>Last Name</Text>
                  <Input
                    value={values.lastName}
                    style={{ marginTop: 10 }}
                    placeholder="Last Name"
                    onChangeText={handleChange("lastName")}
                  />
                  <Text style={styles.heading}>Email</Text>
                  <Input
                    value={values.email}
                    style={{ marginTop: 10 }}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange("email")}
                  />
                </Layout>
                <View
                  style={{ marginTop: 40, width: "100%", alignItems: "center" }}
                >
                  {/* <Button
                                        style={styles.modalButton}
                                        size="small"
                                        onPress={handleSubmit}
                                    >
                                        Continue
                                    </Button> */}
                  <Button
                    style={styles.modalButton}
                    size="small"
                    onPress={() => {
                      handleSubmit();
                      dispatch(
                        ChangeModalState.action({
                          editInstructorFormModalVisibility: false,
                        })
                      );
                    }}
                  >
                    I'm Done
                  </Button>
                  <Button
                    style={[
                      styles.modalButton,
                      {
                        backgroundColor: Colors.lightgray,
                        borderColor: Colors.primary,
                      },
                    ]}
                    size="small"
                    onPress={() => {
                      dispatch(
                        ChangeModalState.action({
                          editInstructorFormModalVisibility: false,
                        })
                      );
                    }}
                  >
                    Cancel
                  </Button>
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
        </View>
     
    </Modal>
  );
};
export default EditInstructorFormModal;

const styles = StyleSheet.create({
  modal: {
    margin:0,
    width: "100%",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // height: 300,
    // elevation: 5,
 
    // shadowColor: Colors.primaryGray,
    // shadowOffset: {
    //   height: 5,
    //   width: 2,
    // },
    // borderRadius: 5,
    // shadowRadius: 5,
    // shadowOpacity: 0.3,
    // zIndex: 166,

    // marginTop: "13%",
  },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: 1,
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
  button: {
    paddingTop: 5,
    fontSize: 15,
    color: Colors.white,
    borderRadius: 10,
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
});
