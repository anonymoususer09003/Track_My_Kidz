import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import React, { FC } from 'react';

interface SubmitButtonProps extends TouchableOpacityProps {
  onSubmit: () => void;
}

export const SubmitButton: FC<SubmitButtonProps> = ({ onSubmit, ...props }) => {
  const handleSubmit = (event: GestureResponderEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <TouchableOpacity {...props} onPress={handleSubmit} />
  );
};
