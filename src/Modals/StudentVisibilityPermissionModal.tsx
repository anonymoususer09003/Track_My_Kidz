import {
  Card,
  Icon,
  Modal,
  Text,
} from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { LinearGradientButton } from "@/Components";
import Colors from "@/Theme/Colors";
import { GetActivationCode } from "@/Services/ActivationCode";

const _people = [
  {
    id: 1,
    name: 'Name One'
  },
  {
    id: 2,
    name: 'Name Two'
  },
  {
    id: 3,
    name: 'Name Three'
  },
]

const StudentVisibilityPermissionModal = ({
  student,
  setStudent,
}: {
  student: any;
  setStudent: () => {};
}) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.studentVisibilityPermissionModal
  );
  const [people, setPeople] = useState(_people);
  const dispatch = useDispatch();

  const handleRemovePerson = (id: number) => {
    setPeople(people.filter(item => item.id !== id))
  }

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ studentVisibilityPermissionModal: false })
        );
        setStudent(null);
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <View style={styles.body}>
          <View style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Text
              textBreakStrategy={"highQuality"}
              style={{
                textAlign: "center",
                color: "#606060",
                fontSize: 18,
              }}
            >
              {`People able to see ${student && student.firstname}`}
            </Text>
          </View>
        </View>
        <ScrollView style={{ marginVertical: 30, maxHeight: 300 }}>
          {people && people.length > 0 && people.map(item => (
            <View key={item.id} style={{ marginVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>{item.name}</Text>
              <TouchableOpacity
                style={{
                  padding: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => handleRemovePerson(item.id)}>
                <Icon
                  style={{ width: 23, height: 23 }} fill={Colors.primary}
                  name="trash" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.buttonText}>
          <LinearGradientButton
            style={{
              borderRadius: 25,
              flex: 1,
            }}
            appearance="ghost"
            size="medium"
            status="control"
            onPress={() => {
              dispatch(
                ChangeModalState.action({ studentVisibilityPermissionModal: false })
              );
              setStudent(null);
            }}
          >
            Close
          </LinearGradientButton>
        </View>
      </Card>
    </Modal>
  );
};
export default StudentVisibilityPermissionModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "90%",
  },
  inputSettings: {
    marginTop: 7,
  },
  modal: { borderRadius: 10 },
  header: { flex: 1, textAlign: "center", fontWeight: "bold", fontSize: 20 },
  body: { flex: 3 },
  background: {
    flex: 1,
    flexDirection: "row",
    color: Colors.white,
    zIndex: -1,
  },
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
  bottom: {
    flex: 1,
    flexDirection: "row",
    height: 45,
    marginTop: 10,
    justifyContent: "space-between",
  },
  buttonText: {
    flex: 1,
    borderRadius: 25,
    fontFamily: "Gill Sans",
    textAlign: "center",
    margin: 2,
    shadowColor: "rgba(0,0,0, .4)", // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    justifyContent: "center",
    backgroundColor: Colors.primary,
    alignItems: "center",
    flexDirection: "row",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
