import { LinearGradientButton } from "@/Components";

import Colors from "@/Theme/Colors";
import { useIsFocused } from "@react-navigation/native";
import {

   Card, CheckBox, Input, Modal, Radio,
  RadioGroup, Text
} from "@ui-kitten/components";

import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useStateValue } from '@/Context/state/State';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DeleteScehdule from "../Services/Schedule/DeleteScheduleById";
import { ModalState } from '@/Store/Modal';
import { useSelector } from "react-redux";

const DeleteScheduleModal = ({
title,
  hide,
  visible,
  onSubmit,
}: {
title:string
  hide: any;
  visible: any;
  onSubmit: any;
}) => {
  const deleteAllSchedules = useSelector(
    (state: { modal: ModalState }) => state.modal.deleteAllSchedules,
  );
 
  return (
    <Modal
      style={styles.container}
      visible={visible}
      backdropStyle={styles.backdrop}
      onBackdropPress={() => {
      hide()
      }}
    >
      <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
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
                {deleteAllSchedules?'Delete all schedules': `Delete this ${title} schedules`}
              </Text>
              <View style={{marginVertical:10}}/>
              <LinearGradientButton onPress={()=>onSubmit()}>
                Yes
              </LinearGradientButton>
              <View style={{marginVertical:10}}/>
              <LinearGradientButton onPress={()=>hide()}>
                No
              </LinearGradientButton>
            </View>
          </View>
     
        </Card>
      </KeyboardAwareScrollView>
    </Modal>
  );
};
export default DeleteScheduleModal;

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


  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },


  errorText: {
    fontSize: 13,
    color: "red",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
