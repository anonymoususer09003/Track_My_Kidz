import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { WelcomeMessageModal } from '@/Modals';
import LogicComponent from '@/Components/LogicComponent';
import { ModalState } from '@/Store/Modal';
import RightDrawerNavigator from '@/Navigators/Main/RightDrawerNavigator';

const Screen = () => {
  const welcomeMessageModal = useSelector(
    (state: { modal: ModalState }) => state.modal.welcomeMessageModal,
  );
  console.log('MainNavigator.tsx line 14 welcomeMessageModal', welcomeMessageModal);

  return (
    <>
      {welcomeMessageModal && <WelcomeMessageModal />}
      <RightDrawerNavigator />
    </>
  );
};

// @refresh reset
const MainNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={Screen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
