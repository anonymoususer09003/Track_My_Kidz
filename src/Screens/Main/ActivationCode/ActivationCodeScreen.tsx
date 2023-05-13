import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "@ui-kitten/components";
import { AppHeader } from "@/Components";
import { useDispatch, useSelector } from "react-redux";
import { GetActivationCode } from "@/Services/ActivationCode";
import QRCode from "react-native-qrcode-svg";
import { UserState } from "@/Store/User";
import Colors from "@/Theme/Colors";
import { GetParent } from "@/Services/Parent";
import { loadUserId } from "@/Storage/MainAppStorage";
import BackgroundLayout from "@/Components/BackgroundLayout";
import { ScrollView } from "react-native-gesture-handler";

const ActivationCodeScreen = () => {
  const [activationCode, setActivationCode] = useState("");

  const getUser = async () => {
    const id = await loadUserId();
    GetParent(parseInt(id, 0)).then((response) => {
      setActivationCode(response?.referenceCode);
    });
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <BackgroundLayout title="Parent's Reference Code">
      <AppHeader hideCalendar={true} hideCenterIcon={true} />

      <View style={styles.layout}>
        <ScrollView style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              width: "100%",
              letterSpacing: 1.5,
            }}
          >
            Share ALL your dependents' information with partner using the
            reference code or have him/her scan the QR code
          </Text>
          <View style={{ marginTop: 30, width: "100%" }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", alignSelf: "center" }}
            >
              {activationCode || ""}
            </Text>
            <TouchableOpacity>
              <View style={{ marginVertical: 15, alignItems: "center" }}>
                <QRCode
                  value={activationCode || "test"}
                  color={"#000"}
                  backgroundColor="transparent"
                  size={300}
                  logoMargin={2}
                  logoSize={20}
                  logoBorderRadius={10}
                  logoBackgroundColor="transparent"
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                width: "100%",
                color: "red",
              }}
            >
              To share a particular dependent's information, have partner scan
              only that dependent's QR code.
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                width: "100%",
                color: "red",
                marginTop: 10,
              }}
            >
              Go to "Dependent Information" in settings.
            </Text>
          </View>
        </ScrollView>
      </View>
    </BackgroundLayout>
  );
};

export default ActivationCodeScreen;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
    padding: 10,
    paddingTop: 50,
    backgroundColor: Colors.newBackgroundColor,
    borderRadius: 25,
  },
  item: {
    borderRadius: 10,
    width: "96%",
    backgroundColor: "#fff",
    marginVertical: 10,
    marginHorizontal: "2%",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
});
