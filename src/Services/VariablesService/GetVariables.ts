import api from '@/Services'
import { VariablesGetDTO } from '@/Models/VariablesDTOs/variables.interface'

export default async () => {
  const response = await api.get<VariablesGetDTO>('variables')
  return response.data
}
