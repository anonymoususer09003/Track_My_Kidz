import React from 'react';
import { Image, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Fontisto from 'react-native-vector-icons/Fontisto';

const CustomMapView = ({ newParticipnatsArr, trackingList, groups }: any) => {
  console.log('new partivipants', newParticipnatsArr);
  return (
    <MapView style={{ flex: 1 }}>
      {newParticipnatsArr?.map((item1: any, index: any) => {
        const latitude = trackingList[item1?.childDeviceId]?.lat;
        const longitude = trackingList[item1?.childDeviceId]?.lang;

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
                    uri: item1?.image || 'default-image-url', // Replace with a valid default image URL
                  }}
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 15,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity>
                  <Text style={{ fontWeight: 'bold' }}>
                    {groups[item1?.groupName]?.participants?.length}
                  </Text>
                  <Fontisto name="map-marker-alt" size={25} color="red" />
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
