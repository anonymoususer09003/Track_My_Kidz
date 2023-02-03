import { Card, Input, Modal, Text } from "@ui-kitten/components";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import {
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { LinearGradientButton } from "@/Components";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ModalState } from "@/Store/Modal";
import SetupTwoFAService from "@/Services/TwoFAServices/SetupTwoFAService";
import FastImage from "react-native-fast-image";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import ConfirmTwoFA from "@/Services/TwoFAServices/ConfirmTwoFA";
import LoginStore from "@/Store/Authentication/LoginStore";
import { UserState } from "@/Store/User";
import Clipboard from "@react-native-clipboard/clipboard";
import Toast from "react-native-toast-message";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Theme/Colors";

const TwoFactorAuthenticationModal = () => {
  const dispatch = useDispatch();
  const isVisible = useSelector(
    (state: { modal: ModalState }) =>
      state.modal.twoFactorAuthenticationModalVisibility
  );
  const user = useSelector((state: { user: UserState }) => state.user.item);
  const [qrUrl, setQrUrl] = useState(
    "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=&choe=UTF-8"
  );
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState("");
  const [changingTwoFA, setChangingTwoFa] = useState(false);
  const [totpUniversalLink, setTotpUniversalLink] = useState("");
  useEffect(() => {
    if (!user?.isTwoFAConfirmed) {
      if (isVisible) {
        dispatch(ChangeModalState.action({ loading: true }));
        SetupTwoFAService("").then((data) => {
          setQrUrl(data.qrCodeUrl);
          setSecret(data.secret);
          setTotpUniversalLink(decodeURIComponent(data.totpUniversalLink));
          dispatch(ChangeModalState.action({ loading: false }));
        });
      }
    } else {
      dispatch(ChangeModalState.action({ loading: false }));
    }
  }, [isVisible]);

  const confirmSave = (code: any) => {
    dispatch(ChangeModalState.action({ loading: true }));
    if (user?.isTwoFAConfirmed && !changingTwoFA) {
      SetupTwoFAService(code).then((data) => {
        setQrUrl(data.qrCodeUrl);
        setTotpUniversalLink(decodeURIComponent(data.totpUniversalLink));
        setChangingTwoFa(true);
        dispatch(ChangeModalState.action({ loading: false }));
        setCode("");
      });
    } else {
      ConfirmTwoFA(code).then((data) => {
        dispatch(ChangeModalState.action({ loading: false }));
        dispatch(LoginStore.action(data.token));
        dispatch(
          ChangeModalState.action({
            twoFactorAuthenticationModalVisibility: false,
          })
        );
        setCode("");
      });
    }
  };

  if (!isVisible) return <></>;
  // @ts-ignore
  return (
    <Modal
      style={styles.container}
      visible={isVisible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
        dispatch(
          ChangeModalState.action({
            twoFactorAuthenticationModalVisibility: false,
          })
        );
      }}
    >
      <Card style={styles.modal} disabled={true}>
        <ScrollView>
          <TouchableOpacity
            style={{ position: "absolute", top: 10, right: 0, zIndex: 10 }}
            onPress={() => {
              dispatch(
                ChangeModalState.action({
                  twoFactorAuthenticationModalVisibility: false,
                })
              );
            }}
          >
            <AntDesign name="close" size={20} color={Colors.black} />
          </TouchableOpacity>
          <View style={styles.body}>
            <View style={{ width: "85%", alignItems: "center" }}>
              <Text style={{ justifyContent: "center", alignSelf: "center" }}>
                Enter Code
              </Text>
              <>
                <Text style={styles.label}>
                  You need to download Google or Microsoft Authenticator before
                  enabling 2 Factor Authentication
                </Text>
                <FastImage
                  source={{
                    uri: qrUrl,
                  }}
                  accessibilityLabel="Image"
                  resizeMode={"contain"}
                  style={styles.img}
                />
                <LinearGradientButton
                  style={{ height: 45 }}
                  appearance="ghost"
                  size="medium"
                  status="control"
                  onPress={() => {
                    if (totpUniversalLink) {
                      Linking.openURL(totpUniversalLink).then();
                    }
                  }}
                >
                  Open Authenticator
                </LinearGradientButton>
                <Text style={styles.label}>Or Click Below To Copy Secret</Text>
                <View style={{ flexDirection: "row" }}>
                  <Input
                    style={{ width: "70%" }}
                    placeholder="secret"
                    value={secret}
                    disabled={true}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(secret);
                      Toast.show({
                        type: "info",
                        position: "top",
                        text1: "Info",
                        text2: `Secret Copied`,
                        visibilityTime: 2000,
                        autoHide: true,
                        topOffset: 30,
                        bottomOffset: 40,

                        onShow: () => {},
                        onHide: () => {},
                        onPress: () => {},
                      });
                    }}
                  >
                    <View pointerEvents="none" style={{ marginLeft: 10 }}>
                      <LinearGradientButton
                        style={{ width: "100%", height: 40 }}
                        appearance="ghost"
                        size="small"
                        status="control"
                      >
                        Copy
                      </LinearGradientButton>
                    </View>
                  </TouchableOpacity>
                </View>

                <OTPInputView
                  style={{ height: 100 }}
                  pinCount={6}
                  code={code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                  onCodeChanged={(code) => {
                    setCode(code);
                  }}
                  autoFocusOnLoad
                  codeInputFieldStyle={styles.underlineStyleBase}
                  codeInputHighlightStyle={styles.underlineStyleHighLighted}
                  onCodeFilled={(code) => {}}
                />
              </>
              <OTPInputView
                style={{ height: 200 }}
                pinCount={6}
                code={code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
                onCodeChanged={(code) => {
                  setCode(code);
                }}
                autoFocusOnLoad
                codeInputFieldStyle={styles.underlineStyleBase}
                codeInputHighlightStyle={styles.underlineStyleHighLighted}
                onCodeFilled={(code) => {}}
              />
            </View>
          </View>
          <View style={styles.bottom}>
            <View style={styles.buttonText}>
              <LinearGradientButton
                style={styles.buttonText}
                appearance="ghost"
                size="medium"
                status="control"
                onPress={() => confirmSave(code)}
              >
                {user.isTwoFAConfirmed && !changingTwoFA
                  ? "Change Device"
                  : "Submit"}
              </LinearGradientButton>
            </View>
          </View>
        </ScrollView>
      </Card>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </Modal>
  );
};
export default TwoFactorAuthenticationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    height: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    width: "100%",
    zIndex: 1,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  body: {
    flex: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  img: {
    minHeight: 220,
    width: 220,
    height: 220,
    padding: 0,
  },
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
  label: {
    marginHorizontal: 5,
    marginTop: 15,
    marginBottom: 10,
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
  },
  bottom: {
    // flex: 1,
    flexDirection: "row",
    height: 45,
    justifyContent: "center",
    marginTop: -20,
  },
  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    color: Colors.primary,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: Colors.primary,
  },
  buttonText: {
    flex: 1,
    height: 45,
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
