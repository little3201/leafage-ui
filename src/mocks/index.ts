import { dictionariesHandlers } from './dictionaries'
import { authenticationHandlers } from './authentication'
import { groupsHandlers } from './groups'
import { regionsHandlers } from './regions'
import { rolesHandlers } from './roles'
import { usersHandlers } from './users'
import { privilegesHandlers } from './privileges'
import { operationLogsHandlers } from './operation-logs'
import { accessLogsHandlers } from './access-logs'
import { auditLogsHandlers } from './audit-logs'
import { schedulerLogsHandlers } from './scheduler-logs'
import { fileRecordsHandlers } from './file-records'
import { schemesHandlers } from './schemes'
import { scriptsHandlers } from './scripts'
import { samplesHandlers } from './samples'
import { connectionsHandlers } from './connections'
import { calendarEventHandlers } from './calendar-events'

export const handlers = [
  ...authenticationHandlers,
  ...dictionariesHandlers,
  ...groupsHandlers,
  ...regionsHandlers,
  ...rolesHandlers,
  ...usersHandlers,
  ...privilegesHandlers,
  ...operationLogsHandlers,
  ...accessLogsHandlers,
  ...auditLogsHandlers,
  ...schedulerLogsHandlers,
  ...fileRecordsHandlers,
  ...schemesHandlers,
  ...scriptsHandlers,
  ...samplesHandlers,
  ...connectionsHandlers,
  ...calendarEventHandlers
]
