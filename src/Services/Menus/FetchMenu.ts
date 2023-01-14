import api from '@/Services'
import { Menu } from '@/Models/MenuDTOs/menu.interface'

export default async (serviceProviderSetup: boolean = false) => {
  const response = await api.get<Array<Menu>>(
    `menu?serviceProviderSetup=${serviceProviderSetup}`,
  )
  return response.data
}
