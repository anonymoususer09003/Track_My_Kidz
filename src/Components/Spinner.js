import Colors from '@/Theme/Colors';
import React from 'react';
import {View, ActivityIndicator} from 'react-native';

// import { Spinner } from "@ui-kitten/components";
export default function SpinnerComponent() {
  return (
    <View
      style={{
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'row',
        Bottom: 10,
      }}>
      <ActivityIndicator size={'small'} color={Colors.primary} />
      {/* <Spinner status="primary" /> */}
      <View style={{height: 50}} />
    </View>
  );
}
