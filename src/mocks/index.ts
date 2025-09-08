import { authenticationHandlers } from './authentication'
import { usersHandlers } from './users'
import { privilegesHandlers } from './privileges'
import { groupsHandlers } from './groups'


export const handlers = [
  ...authenticationHandlers,
  ...usersHandlers,
  ...privilegesHandlers,
  ...groupsHandlers
]
