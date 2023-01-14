import { Card, Modal, Text, Button } from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import Colors from "@/Theme/Colors";
import { UserTypeState } from "@/Store/UserType";
interface AvailableBoost {
  freeBoostEligible: boolean;
  freeBoostActive: any;
  message: string;
}

const WelcomeMessageModal = () => {
  const navigation = useNavigation();
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.welcomeMessageModal
  );
  const [freeBoostAvailable, setFreeBoostAvailable] =
    useState<AvailableBoost | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: { user: UserState }) => state.user.item);
  // const user_type = "Parent";
  const user_type = useSelector(
    (state: { userType: UserTypeState }) => state.userType.userType
  );
  //@ts-ignore
  const Header = (props) => (
    <View {...props}>
      <Text category="h6" style={{ textAlign: "center" }}>
        {user_type && user_type.toLowerCase() === "parent"
          ? "Welcome to TrackMyKidz"
          : "Welcome"}
      </Text>
    </View>
  );

  //@ts-ignore
  const Footer = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <View>
        <TouchableOpacity
          style={[styles.button, { paddingHorizontal: 10 }]}
          onPress={() =>
            dispatch(
              ChangeModalState.action({
                welcomeMessageModal: false,
              })
            )
          }
        >
          <Text style={styles.buttonText}>I'll do this later</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const StudentFooter = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <View>
        <TouchableOpacity
          style={[styles.button, { paddingHorizontal: 10 }]}
          onPress={() =>
            dispatch(
              ChangeModalState.action({
                welcomeMessageModal: false,
              })
            )
          }
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      style={styles.container}
      visible={isVisible != null && isVisible}
      backdropStyle={styles.backdrop}
    >
      {user_type && user_type.toLowerCase() === "parent" ? (
        <Card style={styles.card} header={Header} footer={Footer}>
          {/* <Text textBreakStrategy={'highQuality'} style={{ flexShrink: 1, textAlign: 'center' }}>Welcome to TrackMyKidz</Text> */}
          <View style={{ marginVertical: 10 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                dispatch(
                  ChangeModalState.action({
                    welcomeMessageModal: false,
                  })
                );
                navigation.navigate("ImportDependentScreen", {
                  fromHome: true,
                });
              }}
            >
              <Text style={styles.buttonText}>
                Import dependent information
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            textBreakStrategy={"highQuality"}
            style={{ flexShrink: 1, textAlign: "center" }}
          >
            Import if your partner already created dependent in their account
          </Text>
          <View style={{ marginVertical: 10, marginTop: 30 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                dispatch(
                  ChangeModalState.action({
                    welcomeMessageModal: false,
                    addStudentModal: true,
                  })
                )
              }
            >
              <Text style={styles.buttonText}>Create new dependent</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <Card style={styles.card} header={Header} footer={StudentFooter}>
          <Text
            textBreakStrategy={"highQuality"}
            style={{ flexShrink: 1, textAlign: "center" }}
          >
            Welcome to TrackMyKidz
          </Text>
        </Card>
      )}
    </Modal>
  );
};

export default WelcomeMessageModal;

const styles = StyleSheet.create({
  container: {
    minHeight: 192,
    width: "95%",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    flex: 1,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: 10,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: Colors.primary,
  },
});
