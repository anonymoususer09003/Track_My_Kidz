import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import { WelcomeMessageModal } from '@/Modals';
import { ModalState } from '@/Store/Modal';
import RightDrawerNavigator from '@/Navigators/Main/RightDrawerNavigator';
import { TrackerProvider } from '@/Providers/TrackerProvider';

const Screen = () => {
  const welcomeMessageModal = useSelector(
    (state: { modal: ModalState }) => state.modal.welcomeMessageModal,
  );

  return (
    <TrackerProvider>
      {welcomeMessageModal && <WelcomeMessageModal />}
      <RightDrawerNavigator />
    </TrackerProvider>
  );
};

// @refresh reset
const MainNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainNavigation" component={Screen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
