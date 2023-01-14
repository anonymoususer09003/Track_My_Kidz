import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  Input,
  Layout,
  Button,
  Select,
  SelectItem,
  Toggle,
} from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as yup from "yup";
import { Formik } from "formik";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { loadUserId, loadUserType, loadId } from "@/Storage/MainAppStorage";
import { useDispatch, useSelector } from "react-redux";
import { CompleteRegistration, Register } from "@//Services/SignUpServices";
import { UserRegistrationDTO, RegisterDTO } from "@/Models/UserDTOs";
import Colors from "@/Theme/Colors";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import { ScrollView } from "react-native";
import {
  DeleteInstructor,
  UpdateMultipleInstructor,
} from "@/Services/Instructor";
import { UpdateUser } from "@/Services/SettingsServies";
import { OrganisationInstructor } from "@/Models/UserDTOs";
import CreateMultipleInstructor from "@/Services/Instructor/CreateMultipleInstructor";
interface InstructorModal {
  instructors: Array<OrganisationInstructor>;
  //   setInstructors: (data: Array<OrganisationInstructor>) => {};
  orgInfo: any;
  visible: Boolean;
  setVisible: (data: Boolean) => {};
  getInstructor: any;
  isEdit: Boolean;
  updateInstructor: any;
  onEdit: any;
  setAdd: any;
}

const EditOrgInstructorsModal = ({
  instructors,
  visible,
  setVisible,
  getInstructor,
  orgInfo,
  isEdit,
  onEdit,
  isAdd,
  setRerender,
  userId,
  updateInstructor,
  setAdd,
}: any) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.addInstructorModalVisibility
  );

  const validationSchema = yup.object().shape({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required"),
  });
  // console.log("s--------------------------------------------------", orgInfo);
  const handleDelete = () => {
    DeleteInstructor(instructors?.instructorId)
      .then((res) => {
        console.log("res=========", res);
        setVisible(false, instructors?.instructorId);
      })
      .catch((err) => [console.log("err", err)]);
  };
  const handleUpdate = (values: any) => {
    // console.log("body", body);
    UpdateMultipleInstructor([values])
      .then((res) => {
        console.log("res", res);
        onEdit(values);
        // setRerender(values, "update");
        // setVisible(false,);
      })
      .catch((err) => [console.log("err", err)]);
  };
  const handleAdd = async (values: any, resetForm: any, addOneMore: any) => {
    // console.log("userObject", userObject);
    // console.log("dld");
    // console.log("values", values);
    const userId = await loadId();
    CreateMultipleInstructor(
      [
        {
          ...values,
        },
      ],
      userId
    )
      .then((_res) => {
        console.log("res", _res);

        if (addOneMore) {
          // setAdd(values);
          resetForm();
          setRerender(values, "add");
        } else {
          // setAdd(values);
          setRerender(values, "add");
          setVisible(false);
        }
        Toast.show({
          type: "success",
          position: "top",
          text1: `Instructor has been successfully added`,
        });
      })
      .catch((err) => {
        Toast.show({
          type: "success",
          position: "top",
          text1: `Error occured`,
        });
        // setRerender(values, "add");
        // setAdd(values);
        // resetForm();
        // console.log("err", err);
      });
  };
  // console.log("instrutcor", instructors);
  // @ts-ignore
  // const getUserId = async () => {
  //   const userId = await loadId();
  //   console.log("userId", userId);
  // };

  // React.useEffect(() => {
  //   getUserId();
  // }, []);
  return (
    <Modal
      propagateSwipe={true}
      coverScreen={true}
      isVisible={visible}
      style={{ margin: 0 }}
      swipeDirection="down"
      onSwipeComplete={() => {
        dispatch(
          ChangeModalState.action({ addInstructorModalVisibility: false })
        );
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ addInstructorModalVisibility: false })
        );
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({ addInstructorModalVisibility: false })
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
            paddingTop: 20,
          }}
        >
          <Text
            style={[
              styles.heading,
              { textAlign: "center", marginVertical: 30 },
            ]}
          >
            Instructor Information
          </Text>
          <Formik
            validationSchema={validationSchema}
            // validationSchema={shoppingListValidationSchema}
            validateOnMount={visible}
            initialValues={{
              firstName: instructors?.firstname || "",
              lastName: instructors?.lastname || "",
              email: instructors?.email || "",
              phoneNumber: instructors?.phoneNumber || "",
              isAdmin: instructors?.isAdmin || false,
            }}
            onSubmit={(values, { resetForm }) => {
              //   const item = {
              //     firstName: values.firstName,
              //     lastName: values.lastName,
              //     email: values.email,
              //   };
              //   const data = instructors.length > 0 ? [...instructors] : [];
              //   data.push(item);
              //   setInstructors(data);
              console.log("values", values);
              isEdit ? handleUpdate(values) : handleAdd(values, resetForm);
              // resetForm();
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
              resetForm,
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
                  {errors.firstName && touched.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                  <Text style={styles.heading}>Last Name</Text>
                  <Input
                    value={values.lastName}
                    style={{ marginTop: 10 }}
                    placeholder="Last Name"
                    onChangeText={handleChange("lastName")}
                  />
                  {errors.lastName && touched.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
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
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <Text style={styles.heading}>Phone</Text>
                  <Input
                    value={values.phoneNumber}
                    style={{ marginTop: 10 }}
                    placeholder="Phone"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange("phoneNumber")}
                  />
                  {errors.phoneNumber && touched.phoneNumber && (
                    <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                  )}
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      marginTop: 10,
                      // justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ marginRight: 10 }}>Admin</Text>
                    <Toggle
                      checked={values.isAdmin ? true : false}
                      onChange={(value) => {
                        setFieldValue("isAdmin", value);
                      }}
                    ></Toggle>
                  </View>
                </Layout>
                <View
                  style={{ marginTop: 40, width: "100%", alignItems: "center" }}
                >
                  <Button
                    style={styles.modalButton}
                    size="large"
                    onPress={handleSubmit}
                  >
                    I'm done
                  </Button>
                  {!isEdit && (
                    <Button
                      style={styles.modalButton}
                      size="large"
                      onPress={async () => {
                        if (isValid) {
                          isEdit
                            ? await handleUpdate(values)
                            : await handleAdd(values, resetForm, true);
                        }
                      }}
                    >
                      Add one more
                    </Button>
                  )}
                  {isEdit && (
                    <Button
                      style={styles.modalButton}
                      size="large"
                      onPress={handleDelete}
                    >
                      {/* instructorId */}
                      Delete
                    </Button>
                  )}
                  <Button
                    style={styles.modalButton}
                    size="large"
                    onPress={() => setVisible(false, null)}
                  >
                    Cancel
                  </Button>
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
      </>
    </Modal>
  );
};
export default EditOrgInstructorsModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
    zIndex: 0,
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 0,
    color: Colors.white,
    zIndex: -1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  topNav: {
    color: Colors.white,
  },
  layout: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginTop: 10,
    marginHorizontal: "2%",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  footer: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginHorizontal: "2%",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
  bottomButton: {
    width: "100%",
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
  errorText: {
    fontSize: 13,
    color: "red",
  },
  modalButton: {
    width: "95%",
    marginTop: 10,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
