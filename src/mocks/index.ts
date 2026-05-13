import { usersHandlers } from './system/users'
import {privilegesHandlers} from './system/privileges'

export const handlers = [
  ...usersHandlers,
  ...privilegesHandlers
]
