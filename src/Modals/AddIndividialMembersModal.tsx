import { LinearGradientButton } from "@/Components";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from "@/Theme/Colors";
import { Input, Layout, Modal, Text } from "@ui-kitten/components";
import { Formik } from "formik";
import Papa from "papaparse";
import React, { FC } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";

type AddIndividialMembersModalProps = {
  individuals?: any,
  setIndividuals?: any,
  hideImport?: any,
}
const AddIndividialMembersModal: FC<AddIndividialMembersModalProps> = ({
  individuals,
  setIndividuals,
  hideImport,
}) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.addIndividualMemberModalVisibility
  );
  const dispatch = useDispatch();

  const validationSchema = yup.object().shape({
    first_name: yup.string().required("First Name is required"),
    last_name: yup.string().required("Last Name is required"),
    parent1_email: yup
      .string()
      .email("Please enter valid email")
      .required("Parent1 Email is required"),
    parent2_email: yup.string().email("Please enter valid email"),
  });

  const handleImport = () => {
    DocumentPicker.pickSingle({
      type: DocumentPicker.types.csv,
    })
      .then((res: any) => {
        Papa.parse(res[0].fileCopyUri, {
          download: true,
          delimiter: ",",
          complete: function (results: any) {
            const _data: any = [...individuals];
            if (results.data && results.data.length > 0) {
              let i = 1;
              results.data.map((item: any) => {
                const items = item[0].split(";");
                _data.push({
                  id: i,
                  firstName: items[0],
                  lastName: items[1],
                  parent1_email: items[2],
                  parent2_email: items[2],
                  name: items[0] + " " + items[1],
                });
                i = i + 1;
              });
              setIndividuals(_data);
            }
          },
          error: function (error: any) {},
        });
      })
      .catch((err) => {});
  };
  const hidemodal = () => {
    dispatch(
      ChangeModalState.action({
        addIndividualMemberModalVisibility: false,
      })
    );
  };
  return (
    <Modal
      visible={isVisible}
      style={styles.modal}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ addIndividualMemberModalVisibility: false })
        );
      }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            flex: 1,
            backgroundColor: Colors.white,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
        >
          <Text
            style={{ textAlign: "center", marginTop: 13, fontWeight: "bold" }}
          >
            Add Students
          </Text>
          <Formik
            validationSchema={validationSchema}
            initialValues={{
              first_name: "",
              last_name: "",
              parent1_email: "",
              parent2_email: "",
            }}
            onSubmit={(values, { resetForm }) => {
              const item = {
                name: values.first_name + " " + values.last_name,
                parent1_email: values.parent1_email,
                parent2_email: values.parent2_email,
              };
              const data = [...individuals];
              data.push(item);
              setIndividuals(data);
              resetForm();
            }}
          >
            {({
              handleChange,
              setFieldValue,
              handleBlur,
              handleSubmit,
              resetForm,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <>
                <Layout style={styles.formContainer} level="1">
                  <Input
                    value={values.first_name}
                    style={styles.textInput}
                    placeholder="First Name"
                    onChangeText={handleChange("first_name")}
                  />
                  <Input
                    style={styles.textInput}
                    value={values.last_name}
                    placeholder="Last Name"
                    onChangeText={handleChange("last_name")}
                  />
                  <Input
                    value={values.parent1_email}
                    style={styles.textInput}
                    placeholder="Parent1 Email"
                    onChangeText={handleChange("parent1_email")}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Input
                    value={values.parent2_email}
                    style={styles.textInput}
                    placeholder="Parent2 Email (Optional)"
                    onChangeText={handleChange("parent2_email")}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Layout>
                <View
                  style={{
                    marginTop: 20,
                    width: "100%",
                    alignItems: "center",
                    paddingLeft: 40,
                  }}
                >
                  <View
                    style={{
                      height: 50,
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <LinearGradientButton
                      size="medium"
                      onPress={handleSubmit}
                      disabled={isValid&&values.first_name&&values.last_name&&values.parent1_email ? false : true }
                    >
                      Add one more
                    </LinearGradientButton>
                  </View>
                  <View
                    style={{
                      height: 50,
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <LinearGradientButton
                      size="medium"
                      onPress={() => {
                        handleSubmit();
                        hidemodal();
                      }}
                      disabled={isValid&&values.first_name&&values.last_name&&values.parent1_email ? false : true }
                    >
                      I'm done
                    </LinearGradientButton>
                  </View>
                  <View
                    style={{
                      height: 50,
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <LinearGradientButton
                      style={styles.modalButton}
                      size="medium"
                      onPress={() => {
                        hidemodal();
                      }}
                    >
                      Cancel
                    </LinearGradientButton>
                  </View>
                </View>
                {false && (
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={handleImport}
                  >
                    <Text style={styles.button}>Import from CSV</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Formik>
        </ScrollView>
      </View>
    </Modal>
  );
};
export default AddIndividialMembersModal;

const styles = StyleSheet.create({
  modal: {
    width: "90%",
    height: "63%",
    backgroundColor: Colors.white,
    elevation: 5,
    shadowColor: Colors.primaryGray,
    shadowOffset: {
      height: 5,
      width: 2,
    },
    borderRadius: 10,
    shadowRadius: 5,
    shadowOpacity: 0.3,
  },
  bottomButton: {
    width: "60%",
    borderRadius: 10,
    paddingBottom: 17,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    backgroundColor: Colors.primary,
    alignSelf: "center",
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
    backgroundColor: Colors.primary,
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
    alignItems: "center",
    justifyContent: "center",
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
  textInput: {
    marginTop: 10,
    alignSelf: "center",
    width: "95%",
    marginLeft: "5%",
    borderRadius: 8,
    elevation: 2,
  },
});
