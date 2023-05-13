import {
  Card,
  IndexPath,
  Modal,
  Input,
  Text,
  Select,
  SelectItem,
} from "@ui-kitten/components";
import api from "@/Services";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useTheme } from "@/Theme";
import { LinearGradientButton } from "@/Components";
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import Colors from "@/Theme/Colors";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { navigate } from "@/Navigators/Functions";
import { GetStudent } from "@/Services/Student";
import QRCode from "react-native-qrcode-svg";

const StudentActivationCodeModal = ({
  student,
  setStudent,
}: {
  student: any;
  setStudent: () => {};
}) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.studentActivationCodeModal
  );
  console.log("student", student);
  const [activationCode, setActivationCode] = useState("");
  const dispatch = useDispatch();
  const getActivationCode = async () => {
    try {
      const response = await api.get(`/user/student/${student.studentId}`);
      setActivationCode(response?.data?.referenceCode);
    } catch (err) {
      console.log("err", err);
    }
    //  GetStudent()
    //     .then((res) => {
    //       setActivationCode(res?.activation_code);
    //     })
    //     .catch((err) => console.log("Error:", err));
  };

  useEffect(() => {
    if (student) {
      getActivationCode();
    }
  }, [isVisible]);

  console.log(activationCode);

  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({ studentActivationCodeModal: false })
        );
        setStudent(null);
        setActivationCode("");
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
              {`${student && student.firstname}'s Reference Code`}
            </Text>
          </View>
        </View>
        <View style={{ marginVertical: 30 }}>
          <Text style={{ fontSize: 15, textAlign: "center" }}>
            {activationCode}
          </Text>
          <View style={{ marginVertical: 15, alignItems: "center" }}>
            <QRCode
              value={activationCode || "test"}
              color={"#000"}
              backgroundColor="white"
              size={200}
              logoMargin={2}
              logoSize={20}
              logoBorderRadius={10}
              logoBackgroundColor="transparent"
            />
          </View>
          <Text style={{ fontSize: 15, textAlign: "center" }}>
            Student can use this activation code or scan QR code for sign up
          </Text>
        </View>
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
                ChangeModalState.action({ studentActivationCodeModal: false })
              );
              setStudent(null);
              setActivationCode("");
            }}
          >
            Close
          </LinearGradientButton>
        </View>
      </Card>
    </Modal>
  );
};
export default StudentActivationCodeModal;

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
  modal: { borderRadius: 10, backgroundColor: Colors.newBackgroundColor },
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
