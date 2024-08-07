import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Avatar, AvatarProps, ButtonElement, ButtonProps } from '@ui-kitten/components';

export interface ProfileAvatarPickerProps extends AvatarProps {
  editButton?: () => ButtonElement;
}

const ProfileAvatarPicker = (props: any): React.ReactElement<ViewProps> => {
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> = props.editButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  const { style, editButton, ...restProps } = props;

  return (
    <View style={style}>
      <Avatar key={new Date().getTime()} style={[style, styles.avatar]} {...restProps} />
      {props.editButton && props.editButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    // alignSelf: "center",
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 0,
  },
});

export default ProfileAvatarPicker;
