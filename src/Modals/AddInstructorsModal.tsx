import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Text, Input } from "@ui-kitten/components";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Colors from "@/Theme/Colors";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Modal from "react-native-modal";
import PreviewInstructorsModal from "./PreviewInstructorsModal";
import DocumentPicker from "react-native-document-picker";
import Papa from "papaparse";
import AntDesign from "react-native-vector-icons/AntDesign";
import AddInstructorFormModal from "./AddInstructorFormModal";
import EditInstructorsModal from "./EditInstructorModal";
import { Instructor } from "@/Models/UserDTOs";
import { LinearGradientButton } from "@/Components";
interface InstructorModal {
  instructors: Array<Instructor>;
  setInstructors: (data: Array<Instructor>) => {};
}

const AddInstructorsModal = ({
  instructors,
  setInstructors,
}: InstructorModal) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedInstructor, setSelectedInstructor] = useState({});
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.addInstructorModalVisibility
  );

  // @ts-ignore
  return (
    <Modal
      propagateSwipe={true}
      coverScreen={true}
      isVisible={isVisible}
      style={{ margin: 0, marginTop: 50 }}
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
        <AddInstructorFormModal
          instructors={instructors}
          setInstructors={setInstructors}
        />
        <EditInstructorsModal
          selectedInstructor={selectedInstructor}
          instructors={instructors}
          setInstructors={setInstructors}
        />
        <PreviewInstructorsModal
          setSelectedInstructor={(item, index) =>
            setSelectedInstructor({ ...item, index })
          }
          instructors={instructors}
          setInstructors={setInstructors}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.newBackgroundColor,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          }}
        >
          <View style={styles.layout}>
            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "93%" }}>
                  <Text
                    style={{ fontSize: 14 }}
                  >{`Click the Plus button to add instructors. (Or use webapp for bulk import after registration)`}</Text>
                </View>
                <AntDesign
                  name="pluscircle"
                  style={{ marginLeft: 10 }}
                  size={25}
                  color={Colors.secondaryDark}
                  onPress={() =>
                    dispatch(
                      ChangeModalState.action({
                        addInstructorFormModalVisibility: true,
                      })
                    )
                  }
                />
              </View>
              <View style={{ marginTop: 10, maxHeight: 150 }}>
                <View
                  style={{
                    marginVertical: 2,
                    padding: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      width: "33.33%",
                      alignItems: "center",
                      backgroundColor: Colors.lightgray,
                      padding: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      First Name
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "33.33%",
                      alignItems: "center",
                      backgroundColor: Colors.lightgray,
                      padding: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Last Name
                    </Text>
                  </View>
                  <View
                    style={{
                      width: "33.33%",
                      alignItems: "center",
                      backgroundColor: Colors.lightgray,
                      padding: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Email
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={instructors}
                  style={{ minHeight: 320 }}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        marginVertical: 2,
                        padding: 2,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          width: "33.33%",
                          backgroundColor:
                            index % 2 === 0 ? "#cccccc" : "#ffffff",
                        }}
                      >
                        <Input
                          style={{
                            margin: 5,
                            backgroundColor:
                              index % 2 === 0 ? "#cccccc" : "#ffffff",
                          }}
                          autoCapitalize="none"
                          value={item?.firstName}
                          textStyle={{ fontSize: 12 }}
                        />
                      </View>
                      <View
                        style={{
                          width: "33.33%",
                          backgroundColor:
                            index % 2 === 0 ? "#cccccc" : "#ffffff",
                        }}
                      >
                        <Input
                          style={{
                            margin: 5,
                            backgroundColor:
                              index % 2 === 0 ? "#cccccc" : "#ffffff",
                          }}
                          autoCapitalize="none"
                          value={item?.lastName}
                          textStyle={{ fontSize: 12 }}
                        />
                      </View>
                      <View
                        style={{
                          width: "33.33%",
                          backgroundColor:
                            index % 2 === 0 ? "#cccccc" : "#ffffff",
                        }}
                      >
                        <Input
                          style={{
                            margin: 5,
                            backgroundColor:
                              index % 2 === 0 ? "#cccccc" : "#ffffff",
                          }}
                          autoCapitalize="none"
                          value={item?.email}
                          textStyle={{ fontSize: 12 }}
                        />
                      </View>
                    </View>
                  )}
                />
                {/* <View style={styles.bottomButton}>
                  <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={() =>
                      DocumentPicker.pickSingle({
                        type: [DocumentPicker.types.csv],
                      })
                        .then((res) => {
                          Papa.parse(res[0].fileCopyUri, {
                            download: true,
                            delimiter: ",",
                            complete: function (results: any) {
                              const _data: any = [];
                              if (results.data && results.data.length > 0) {
                                results.data.map((item: any, index: number) => {
                                  if (index !== 0) {
                                    const items = item[0].split(",");
                                    _data.push({
                                      firstName: items[0],
                                      lastName: items[1],
                                      email: items[2],
                                    });
                                  }
                                });
                                setInstructors(_data);
                              }
                            },
                            error: function (error: any) {},
                          });
                        })
                        .catch((err) => {})
                    }
                  >
                    <Text style={styles.button}>Import from CSV</Text>
                  </TouchableOpacity>
                </View> */}
                {/* <TouchableOpacity
                  style={{ marginTop: 20, alignSelf: "center" }}
                  onPress={() =>
                    Linking.openURL(
                      "https://csv-tmk.s3.us-east-2.amazonaws.com/Instructor.csv"
                    )
                  }
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      textDecorationLine: "underline",
                      fontSize: 14,
                    }}
                  >
                    Download Template
                  </Text>
                </TouchableOpacity> */}
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 30,
                left: 0,
                right: 0,
                alignItems: "center",
                width: "100%",
                paddingHorizontal: "5%",
              }}
            >
              <LinearGradientButton
                gradient={[Colors.primaryLight, Colors.primary]}
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      // previewInstructorModalVisibility: false,
                      previewInstructorModalVisibility: true,
                    })
                  );
                }}
              >
                Preview
              </LinearGradientButton>
              <View style={{ marginVertical: 10 }} />
              <LinearGradientButton
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      addInstructorModalVisibility: false,
                    })
                  );
                }}
              >
                I'll do it later
              </LinearGradientButton>
            </View>
          </View>
        </View>
      </>
    </Modal>
  );
};
export default AddInstructorsModal;

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
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
