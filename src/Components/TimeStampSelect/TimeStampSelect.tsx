import React, { FC } from 'react';
import { SelectItem } from '@ui-kitten/components';
import { Alert } from 'react-native';

interface TimeStampSelectProps {
  timeStamp: string[];
  onPress:any
}

export const TimeStampSelect: FC<TimeStampSelectProps> = ({ timeStamp,onPress }) => {
  return (
    <>
      {timeStamp && timeStamp.length > 0 && (
        timeStamp.map((_timeStamp, index) => {
          return (
            <SelectItem
      
              key={index}
              title={_timeStamp || ''}
            />
          );
        })
      )}
    </>
  );
};
