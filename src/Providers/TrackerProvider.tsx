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

  const updateCoordinates = (messageBody:MessageBody) => {
    setTrackedDevicesCoordinates(prevCoordinates => ({
      ...prevCoordinates,
      [messageBody.deviceId]: {
        lat: messageBody.latitude,
        lang: messageBody.longitude,
      }
    }));
  }

  return (
    <TrackerContext.Provider value={{ trackedDevicesCoordinates, updateCoordinates }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const trackerContext = useContext(TrackerContext);
  if (!trackerContext) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return trackerContext;
};
