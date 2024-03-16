import React from 'react';
import { StyleSheet, View, ViewProps, Text } from 'react-native';
import { Avatar, AvatarProps, ButtonElement, ButtonProps } from '@ui-kitten/components';
import BottomBar from "../BottomBar/BottomBar";
import FastImage from "react-native-fast-image";

export interface ProfileAvatarProps extends AvatarProps {
  editButton?: () => ButtonElement;
}

export const ProfileAvatar = (props: any): React.ReactElement<ViewProps> => {

  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> = props.editButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  const { style, editButton, isSignup, ...restProps } = props;

  return (
    <>
    <View style={style}>
      <Avatar
          ImageComponent={FastImage}
        style={[style, styles.avatar]}
        {...restProps}
      />
      {editButton && renderEditButtonElement()}

    </View>
    {isSignup && <View style={{justifyContent: 'flex-end', alignItems: 'center'}}>
        <Text style={{fontWeight: '200', marginTop: 10, color: 'red'}}>Profile image is required</Text>
      </View>}
    </>
  );
};
export default ProfileAvatar

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 0,
  },
});

