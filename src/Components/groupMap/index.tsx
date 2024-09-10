import Colors from '@/Theme/Colors';
import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Fontisto from 'react-native-vector-icons/Fontisto';

const CustomMapView = ({ newParticipnatsArr, trackingList, groups, onClick, isChildren }: any) => {
  // console.log('new particpant---', newParticipnatsArr);
  return (
    <MapView style={{ flex: 1 }}>
      {newParticipnatsArr?.map((item1: any, index: any) => {
        const latitude = trackingList[isChildren ? item1?.childDevice : item1?.childDeviceId]?.lat;
        const longitude =
          trackingList[isChildren ? item1?.childDevice : item1?.childDeviceId]?.lang;

        if (latitude && longitude) {
          return (
            <Marker
              key={`${item1?.childDeviceId}-${index}`}
              identifier={item1?.email}
              coordinate={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }}
            >
              {!item1?.group ? (
                <Image
                  source={{
                    uri: isChildren ? item1.studentImage : item1?.image || 'default-image-url', // Replace with a valid default image URL
                  }}
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity onPress={() => onClick(item1?.groupName)}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      position: 'absolute',
                      zIndex: 3,
                      color: Colors.primary,
                      fontSize: groups[item1?.groupName]?.participants?.length > 9 ? 10 : 20,
                      left: 6,
                      top: 5,
                    }}
                  >
                    {groups[item1?.groupName]?.participants?.length}
                  </Text>
                  <Fontisto name="map-marker-alt" size={35} color={Colors.white} />
                </TouchableOpacity>
              )}
            </Marker>
          );
        }
        return null;
      })}
    </MapView>
  );
};

export default CustomMapView;
