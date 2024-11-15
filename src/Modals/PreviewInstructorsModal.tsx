import { LinearGradientButton } from "@/Components";
import { Instructor } from "@/Models/UserDTOs";
import { ModalState } from "@/Store/Modal";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import Colors from "@/Theme/Colors";
import { useNavigation } from "@react-navigation/native";
import { Text } from "@ui-kitten/components";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
interface InstructorModal {
  instructors: Array<Instructor>;
  setInstructors: (data: Array<Instructor>) => {};
  setSelectedInstructor: (data: any) => {};
}

const PreviewInstructorsModal = ({
  instructors,
  setInstructors,
  setSelectedInstructor,
}: InstructorModal) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.previewInstructorModalVisibility
  );
  const [selectedItem, setSelectedItem] = useState({});
  const handleDelete = (index) => {
    let temp = [...instructors];
    temp.splice(index, 1);
    setInstructors(temp);
  };
  const handleEdit = (item: any, index: any) => {
    setSelectedInstructor(item, index);
    dispatch(
      ChangeModalState.action({
        // previewInstructorModalVisibility: false,
        editInstructorFormModalVisibility: true,
      })
    );
    // );
    // let temp = [...instructors];
    // temp.splice(index, 1);
    // setInstructors(temp);
  };
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
          ChangeModalState.action({ previewInstructorModalVisibility: false })
        );
      }}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ previewInstructorModalVisibility: false })
        );
      }}
      onBackButtonPress={() => {
        dispatch(
          ChangeModalState.action({ previewInstructorModalVisibility: false })
        );
      }}
    >
      <>
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
              <View style={{ marginTop: 10 }}>
                <Text
                  style={{ textAlign: "center" }}
                >{`Preview Instructors`}</Text>
              </View>
              <View style={{ marginTop: 10, maxHeight: 150 }}>
                <FlatList
                  data={instructors}
                  style={{ minHeight: 320 }}
                  keyExtractor={(item, index) => index}
                  renderItem={({ item, index }) => (
                    <View
                      key={index}
                      style={{
                        marginVertical: 2,
                        padding: 2,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ width: "30%" }}>
                        <Text
                          style={{ fontSize: 14 }}
                        >{`${item?.firstName} ${item?.lastName}`}</Text>
                      </View>
                      <View style={{ width: "55%" }}>
                        <Text style={{ fontSize: 14 }}>{`${item?.email}`}</Text>
                      </View>
                      <View
                        style={{
                          width: "15%",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-evenly",
                        }}
                      >
                        {/* <TouchableOpacity
                          onPress={() => handleEdit(item, index)}
                        >
                          <Feather
                            name="edit"
                            color={Colors.primary}
                            size={20}
                          />
                        </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => handleDelete(index)}>
                          <AntDesign
                            name="delete"
                            color={Colors.primary}
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
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
              }}
            >
              <LinearGradientButton
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      addInstructorModalVisibility: false,
                      previewInstructorModalVisibility: false,
                    })
                  );
                  setTimeout(() => {
                    dispatch(
                      ChangeModalState.action({
                        addButInformationModalVisibility: true,
                        // addInstructorModalVisibility: false,
                        // previewInstructorModalVisibility: false,
                      })
                    );
                  }, 200);
                }}
              >
                Add Bus Information
              </LinearGradientButton>
              <View style={{ marginVertical: 10 }} />

              <LinearGradientButton
                gradient={["#EC5ADD", Colors.primary]}
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      previewInstructorModalVisibility: false,
                      addInstructorModalVisibility: false,
                    })
                  );
                }}
              >
                Continue without Bus Information
              </LinearGradientButton>

              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    ChangeModalState.action({
                      previewInstructorModalVisibility: false,
                      addInstructorModalVisibility: false,
                    })
                  );
                }}
              >
                <Text style={{ color: Colors.primary, fontSize: 16 }}>
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    </Modal>
  );
};
export default PreviewInstructorsModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
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
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
