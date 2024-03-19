import handleError from '@/Services/utils/handleError';
import { loadUserId, loadUserType } from '@/Storage/MainAppStorage';
import { GetInstructor } from '@/Services/Instructor';
import { GetParent } from '@/Services/Parent';
import { GetStudent } from '@/Services/Student';


export default async () => {
  const userId = await loadUserId();
  const userType = await loadUserType();
  console.log('FetchOne.ts line 9 userId', userId, typeof userId);
  console.log('FetchOne.ts line 10 userType', userType, typeof userType);
  if (!userId || userId === 'null') {
    return handleError({ message: 'User ID is required' });
  }
  if (userType?.toLowerCase() === 'parent' || userId) {
    return await GetParent(userId);
  } else if (userType?.toLowerCase() === 'instructor' || userId) {
    return await GetInstructor(userId);
  } else if (userType?.toLowerCase() === 'student' || userId) {
    return await GetStudent(userId);
  }
};
