import React, { createContext, FC, ReactNode, useContext, useState } from 'react';

type CoordinatesByDevice = Record<string, {
  lat: number,
  lang: number,
}>


export type MessageBody =  {deviceId: string, latitude: number, longitude: number}
type TrackerContextType = {
  trackedDevicesCoordinates: CoordinatesByDevice;
  updateCoordinates: (message: MessageBody)=>void

}

const TrackerContext = createContext<TrackerContextType>({
  trackedDevicesCoordinates: {},
  updateCoordinates: ()=>{},
});

type TrackerProviderProps = {
  children: ReactNode
}
export const TrackerProvider: FC<TrackerProviderProps> = ({ children }) => {

  const [trackedDevicesCoordinates, setTrackedDevicesCoordinates] = useState<CoordinatesByDevice>({});

  const updateCoordinates =(messageBody:MessageBody)=>{
    const devicesCoordinates = trackedDevicesCoordinates;

    devicesCoordinates[messageBody.deviceId] = {
      lat: messageBody.latitude,
      lang: messageBody.longitude,
    };

    setTrackedDevicesCoordinates(devicesCoordinates);
  }


  return (
    <TrackerContext.Provider value={{ trackedDevicesCoordinates, updateCoordinates }}>
      {children}
    </TrackerContext.Provider>
  );
};


export const useTracker = () => {
  const trackerFunction = useContext(TrackerContext);
  if (!trackerFunction) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return trackerFunction;
};
