import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, View } from "react-native";
import { Input, Text } from "@ui-kitten/components";
import { AppHeader } from "@/Components";
import { useDispatch } from "react-redux";
import ChangeModalState from "@/Store/Modal/ChangeModalState";
import SearchBar from "@/Components/SearchBar/SearchBar";
import Entypo from "react-native-vector-icons/Entypo";
import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import { QRCodeModal, ImportDependentsModal } from "@/Modals";
import { LinearGradientButton } from "@/Components";
import MaskInput from "react-native-mask-input";
import { ReferenceCodeRegex, ReferenceCodeStyle } from "@/Theme/Variables";
import FetchOne from "@/Services/Parent/GetParentChildrens";
import { ImportAllChildren, ImportSingleChildren } from "@/Services/Student";
import { useSelector } from "react-redux";
import { UserState } from "@/Store/User";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { StackActions } from "@react-navigation/native";

import {
  GetAuthStudentByActivationCode,
  GetStudentByActivationCode,
} from "@/Services/Student";
const ImportDependent = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const user = useSelector((state: { user: UserState }) => state.user.item);
  console.log("user", user);
  const [searchParam, setSearchParam] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [children, setChildren] = useState([]);
  const [singleChild, setSingleChild] = useState(false);
  const handleQR = (show = true) => {
    setShowQR(show);
    dispatch(
      ChangeModalState.action({
        qrcodeModalVisibility: show,
      })
    );
  };
  const onScan = (e: any) => {
    setReferenceCode(e);
  };

  const goBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Home",
        },
      ],
    });
  };
  const fetchChildrens = async (referenceCode: any) => {
    // setReferenceCode(referenceCode);
    console.log("refernececode", referenceCode);

    dispatch(ChangeModalState.action({ loading: true }));
    setShowQR(false);
    dispatch(
      ChangeModalState.action({
        qrcodeModalVisibility: false,
      })
    );
    FetchOne(referenceCode)
      .then((res) => {
        setSingleChild(false);
        // setUser(res);
        console.log("res-children--", res);
        setChildren(res);
        dispatch(ChangeModalState.action({ loading: false }));
        dispatch(
          ChangeModalState.action({
            importDependentsModalVisibility: true,
          })
        );
      })
      .catch((err) => {
        console.log("err---", err);
        childReference(referenceCode);
      });
  };
  const childReference = async (childReference: any) => {
    GetAuthStudentByActivationCode(childReference)
      .then((res) => {
        setSingleChild(true);
        setChildren([res]);
        dispatch(ChangeModalState.action({ loading: false }));
        dispatch(
          ChangeModalState.action({
            importDependentsModalVisibility: true,
          })
        );
      })
      .catch((err) => {
        console.log("err---", err);

        dispatch(ChangeModalState.action({ loading: false }));
        Toast.show({
          type: "success",
          position: "top",
          text1: `Error`,
        });
      });
  };
  const importSingleChildren = () => {
    let body = {
      referenceCode: referenceCode,
      // email: user?.email,
    };
    console.log("referncecode", referenceCode);
    ImportSingleChildren(referenceCode)
      .then((res) => {
        Toast.show({
          type: "success",
          position: "top",
          text1: `Child Imported Successfully`,
        });
        setReferenceCode("");
        setChildren([]);
        goBackToHome();
        //  setSingleChild(false)
        console.log("response", res);
      })
      .catch((err) => {
        Toast.show({
          type: "success",
          position: "top",
          text1: `Error`,
        });
        console.log("err", err);
      });
  };
  const importChildrens = () => {
    let body = {
      referenceCode: referenceCode,
      // email: user?.email,
    };
    ImportAllChildren(body)
      .then((res) => {
        setReferenceCode("");
        setChildren([]);
        Toast.show({
          type: "success",
          position: "top",
          text1: `Children Imported Successfully`,
        });
        goBackToHome();
        //  setSingleChild(false)
        console.log("response", res);
      })
      .catch((err) => {
        Toast.show({
          type: "success",
          position: "top",
          text1: `Error`,
        });
        console.log("err", err);
      });
  };
  const removeDependent = async (child: any) => {
    let filterArray = children.filter(
      (item) => item?.studentId != child.studentId
    );
    setChildren(filterArray);
  };

  useEffect(() => {
    if (referenceCode.length == 36) {
      fetchChildrens(referenceCode);
    }
    if (!isFocused) {
      console.log("log");
      setReferenceCode("");
      setChildren([]);
      dispatch(
        ChangeModalState.action({
          importDependentsModalVisibility: false,
        })
      );
    }
  }, [referenceCode, isFocused]);

  return (
    <>
      <QRCodeModal
        showQR={showQR}
        setShowQR={handleQR}
        onScan={(e: any) => onScan(e)}
        hideQr={(value: any) => {
          //   navigation.goBack();
          setShowQR(false);
        }}
      />
      <ImportDependentsModal
        children={children}
        removeChild={(item: any) => {
          removeDependent(item);
        }}
        importChildrens={() => {
          singleChild ? importSingleChildren() : importChildrens();
        }}
      />
      <AppHeader
        isBack={route?.params ? true : false}
        title="Import Dependent"
        isStack={false}
      />
      <View style={styles.layout}>
        {/* <SearchBar
          searchText={searchParam}
          onChangeText={(value) => setSearchParam(value)}
        /> */}
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ marginVertical: 20 }}>
            <Text style={{ fontWeight: "600", fontSize: 20 }}>
              To add all dependents at once:
            </Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>
              Enter your partner's reference code from your partner's phone or
              scan qr code.
            </Text>
            <Text style={{ fontWeight: "600", fontSize: 20, marginTop: 20 }}>
              To add dependents individually:
            </Text>
            <Text style={{ fontSize: 16, marginTop: 10 }}>
              Enter reference code of dependent from your partner's phone or
              scan qr code.
            </Text>
          </View>
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              Enter Reference Code
            </Text>
            <MaskInput
              value={referenceCode}
              placeholderTextColor={Colors.textInputPlaceholderColor}
              style={ReferenceCodeStyle}
              onChangeText={(masked, unmasked) => {
                setReferenceCode(masked); // you can use the unmasked value as well
              }}
              mask={ReferenceCodeRegex}
            />
          </View>
          <View
            style={{
              marginVertical: 10,
              width: "100%",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <Entypo
              name="camera"
              size={30}
              color={Colors.primary}
              onPress={handleQR}
            />
          </View>
        </View>
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <LinearGradientButton
            size="medium"
            onPress={() =>
              dispatch(
                ChangeModalState.action({
                  importDependentsModalVisibility: true,
                })
              )
            }
            style={{ borderRadius: 20 }}
          >
            Import
          </LinearGradientButton>
        </View>
        <View style={{ marginVertical: 10, paddingHorizontal: 20 }}>
          <LinearGradientButton
            onPress={() => navigation.goBack()}
            size="medium"
            style={{ borderRadius: 20 }}
          >
            Not ready to import
          </LinearGradientButton>
        </View>
      </View>
    </>
  );
};

export default ImportDependent;

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    flexDirection: "column",
  },
});
