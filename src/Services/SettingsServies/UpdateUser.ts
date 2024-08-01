import api from '@/Services';
import { Config } from '@/Config';
export default async (user: any, type: string) => {
  if (type === 'parent') {
    const response = await fetch(Config.API_URL + 'user/parent/update', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        accept: '*/*',
      },
      body: JSON.stringify(user),
    });

    // Awaiting response.json()
    const resData = await response.json();
    return resData;
    // return await api.put(
    //     '/user/parent/update',
    //     user,
    // )
  } else if (type === 'instructor') {
    return await api.put('/user/instructor/update', user);
  } else if (type === 'school') {
    return await api.put('/user/school/update', user);
  } else {
    return await api.put('/user/student/update', user);
  }
};
