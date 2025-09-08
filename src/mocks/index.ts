import { authenticationHandlers } from './authentication'
import { usersHandlers } from './users'


export const handlers = [
  ...authenticationHandlers,
  ...usersHandlers
]
