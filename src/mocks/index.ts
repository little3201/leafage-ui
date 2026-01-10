import { accessLogsHandlers } from './access-logs'
import { auditLogsHandlers } from './audit-logs'
import { authenticationHandlers } from './authentication'
import { connectionsHandlers } from './connections'
import { dictionariesHandlers } from './dictionaries'
import { fileRecordsHandlers } from './file-records'
import { groupsHandlers } from './groups'
import { operationLogsHandlers } from './operation-logs'
import { privilegesHandlers } from './privileges'
import { regionsHandlers } from './regions'
import { samplesHandlers } from './samples'
import { schedulerLogsHandlers } from './scheduler-logs'
import { schemesHandlers } from './schemes'
import { scriptsHandlers } from './scripts'
import { usersHandlers } from './users'

export const handlers = [
  ...accessLogsHandlers,
  ...auditLogsHandlers,
  ...authenticationHandlers,
  ...connectionsHandlers,
  ...dictionariesHandlers,
  ...fileRecordsHandlers,
  ...groupsHandlers,
  ...operationLogsHandlers,
  ...privilegesHandlers,
  ...regionsHandlers,
  ...samplesHandlers,
  ...schedulerLogsHandlers,
  ...schemesHandlers,
  ...scriptsHandlers,
  ...usersHandlers
]
