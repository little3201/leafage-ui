import { accessLogsHandlers } from './access-logs'
import { auditLogsHandlers } from './audit-logs'
import { authenticationHandlers } from './authentication'
import { calendarEventHandlers } from './calendar-events'
import { connectionsHandlers } from './connections'
import { dictionariesHandlers } from './dictionaries'
import { fileRecordsHandlers } from './file-records'
import { fragmentsHandlers } from './fragments'
import { groupsHandlers } from './groups'
import { modulesHandlers } from './modules'
import { operationLogsHandlers } from './operation-logs'
import { privilegesHandlers } from './privileges'
import { regionsHandlers } from './regions'
import { rolesHandlers } from './roles'
import { samplesHandlers } from './samples'
import { schedulerLogsHandlers } from './scheduler-logs'
import { schemesHandlers } from './schemes'
import { scriptsHandlers } from './scripts'
import { usersHandlers } from './users'

export const handlers = [
  ...accessLogsHandlers,
  ...auditLogsHandlers,
  ...authenticationHandlers,
  ...calendarEventHandlers,
  ...connectionsHandlers,
  ...dictionariesHandlers,
  ...fileRecordsHandlers,
  ...fragmentsHandlers,
  ...groupsHandlers,
  ...modulesHandlers,
  ...operationLogsHandlers,
  ...privilegesHandlers,
  ...regionsHandlers,
  ...rolesHandlers,
  ...samplesHandlers,
  ...schedulerLogsHandlers,
  ...schemesHandlers,
  ...scriptsHandlers,
  ...usersHandlers
]
