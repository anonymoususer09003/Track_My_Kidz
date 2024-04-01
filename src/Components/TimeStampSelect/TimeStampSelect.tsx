import React, { FC } from 'react';
import { SelectItem } from '@ui-kitten/components';

interface TimeStampSelectProps {
  timeStamp: string[];
}

export const TimeStampSelect: FC<TimeStampSelectProps> = ({ timeStamp }) => {
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
