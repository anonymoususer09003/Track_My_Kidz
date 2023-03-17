import { Card, Modal, Text, Button } from "@ui-kitten/components";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import { UserState } from "@/Store/User";

import moment from "moment";
import Colors from "@/Theme/Colors";

interface AvailableBoost {
  freeBoostEligible: boolean;
  freeBoostActive: any;
  message: string;
}

const ImagePickerModal = ({ openCamera, openGallery, close }) => {
  const isVisible = useSelector(
    (state: { modal: ModalState }) => state.modal.imagePickerModal
  );
  const [freeBoostAvailable, setFreeBoostAvailable] =
    useState<AvailableBoost | null>(null);
  const dispatch = useDispatch();
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const user_type = "Parent";

  //@ts-ignore
  const Header = (props) => (
    <View {...props}>
      <Text category="h6" style={{ textAlign: "center" }}>
        Upload Picture
      </Text>
    </View>
  );

  //@ts-ignore
  const Footer = (props) => (
    <View {...props} style={[props.style, styles.footerContainer]}>
      <View>
        <TouchableOpacity
          style={[styles.button, { paddingHorizontal: 10 }]}
          onPress={() => close()}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={() => close()}
      style={{
        position: "absolute",
        height: "100%",
        width: "100%",
        backgroundColor: "#FFFFFF50",
        zIndex: 1000,
      }}
    >
      <Card style={styles.card}>
        {/* <Text textBreakStrategy={'highQuality'} style={{ flexShrink: 1, textAlign: 'center' }}>Welcome to TrackMyKidz</Text> */}
        <View
          style={{
            borderWidth: 1,
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            height: 300,
          }}
        >
          <View style={{ marginVertical: 10 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                openCamera();
                close();
                // navigation.navigate("ImportDependentScreen");
              }}
            >
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>
          </View>
          <Text
            textBreakStrategy={"highQuality"}
            style={{ flexShrink: 1, textAlign: "center" }}
          >
            {/* Import if your partner already created dependent in their account */}
          </Text>
          <View style={{ marginVertical: 10, marginTop: 30 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                openGallery();
                close();
              }}
            >
              <Text style={styles.buttonText}>Open Gallery</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.footerContainer]}>
            <View>
              <TouchableOpacity
                style={[
                  styles.button,
                  { paddingHorizontal: 10, marginTop: 20 },
                ]}
                onPress={() => close()}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default ImagePickerModal;

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
    opacity: 2,
    justifyContent: "center",
    zIndex: 20000,

    backgroundColor: "#FFFFFF50",
  },
  footerContainer: {
    // width: "100%",
    // backgroundColor: "red",
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
    // width: "100%",
    // paddingHorizontal: 40,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: Colors.primary,
  },
});
