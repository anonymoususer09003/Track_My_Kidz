import handleError from '@/Services/utils/handleError';
import { loadUserId, loadUserType } from '@/Storage/MainAppStorage';
import { GetInstructor } from '@/Services/Instructor';
import { GetParent } from '@/Services/Parent';
import { GetStudent } from '@/Services/Student';

export default async () => {
  const userId = await loadUserId();
  const userType = await loadUserType();

  if (!userId || userId === 'null') {
    return handleError({ message: 'User ID is required' });
  }
  if (userType?.toLowerCase() === 'parent') {
    return await GetParent(userId);
  } else if (userType?.toLowerCase() === 'instructor') {
    return await GetInstructor(userId);
  } else if (userType?.toLowerCase() === 'student') {
    return await GetStudent(userId);
  }
};
