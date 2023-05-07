import { StyleSheet, View, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button, ButtonProps, Text } from "@ui-kitten/components";
import React, { ReactText } from "react";
import Colors from "@/Theme/Colors";

const LinearGradientButton = (props: any) => {
  // if (props.disabled) return <Button {...props}>{props.children}</Button>;
  console.log("props", props.textStyle);
  return (
    <TouchableOpacity
      style={{ width: "100%", alignItems: "center" }}
      onPress={() => props.onPress()}
    >
      <LinearGradient
        colors={props.gradient || [Colors.primary, "#EC5ADD"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearGradient}
      >
        <Text
          style={[styles.buttonText, props.textStyle && { ...props.textStyle }]}
        >
          {props.children == null ? "" : props.children.toString()}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
    // <View style={[props.style, { backgroundColor: Colors.primary }]}>
    //   <Button {...props} status="control" appearance="ghost">
    //     {props.children == null ? "" : props.children.toString()}
    //   </Button>
    // </View>
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
    height: 95,
  },
  linearGradient: {
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 20,
    width: "100%",
    height: 40,
    borderColor: "black",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Gill Sans",
    textAlign: "center",
    marginTop: 8,
    color: "#ffffff",
    backgroundColor: "transparent",
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
