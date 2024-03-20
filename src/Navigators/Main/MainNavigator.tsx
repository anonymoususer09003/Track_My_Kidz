import React from 'react';
import LeftDrawerNavigator from '@/Navigators/Main/LeftDrawerNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { WelcomeMessageModal } from '@/Modals';
import TwoFACodeModal from '../../Modals/TwoFACodeModal';
import LogicComponent from '@/Components/LogicComponent';
import { ModalState } from '@/Store/Modal';

const DrawerScreen = ({ navigation }: { navigation: any }) => {
  const welcomeMessageModal = useSelector(
    (state: { modal: ModalState }) => state.modal.welcomeMessageModal,
  );
  console.log('MainNavigator.tsx line 14 welcomeMessageModal', welcomeMessageModal);

  return (
    <>
      {welcomeMessageModal && <WelcomeMessageModal />}
      <LeftDrawerNavigator />
      <LogicComponent />
    </>
  );
};

// @refresh reset
const MainNavigator = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Drawer" component={DrawerScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
