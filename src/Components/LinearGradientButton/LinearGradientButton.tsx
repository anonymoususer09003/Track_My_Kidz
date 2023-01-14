import { StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button, ButtonProps, Text } from "@ui-kitten/components";
import React, { ReactText } from "react";
import Colors from "@/Theme/Colors";

const LinearGradientButton = (props: ButtonProps) => {
  if (props.disabled) return <Button {...props}>{props.children}</Button>;
  return (
    <View style={[props.style, { backgroundColor: Colors.primary }]}>
      <Button {...props} status="control" appearance="ghost">
        {props.children == null ? "" : props.children.toString()}
      </Button>
    </View>
  );
};
export default LinearGradientButton;
const styles = StyleSheet.create({
  topNav: {
    color: Colors.white,
  },
  text: {
    color: Colors.white,
  },
  bottom: {
    height: 45,
  },
  // buttonText: {
  //     flex: 1,
  //     borderRadius: 25,
  //     fontFamily: 'Gill Sans',
  //     textAlign: 'center',
  //     color: Colors.white,
  //     shadowColor: 'rgba(0,0,0, .4)', // IOS
  //     shadowOffset: { height: 1, width: 1 }, // IOS
  //     shadowOpacity: 1, // IOS
  //     shadowRadius: 1, //IOS
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     flexDirection: 'row',
  // },
});
