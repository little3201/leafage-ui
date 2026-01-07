import { dictionariesHandlers } from './dictionaries'
import { authenticationHandlers } from './authentication'
import { groupsHandlers } from './groups'
import { regionsHandlers } from './regions'
import { usersHandlers } from './users'
import { privilegesHandlers } from './privileges'
import { operationLogsHandlers } from './operation-logs'
import { accessLogsHandlers } from './access-logs'
import { auditLogsHandlers } from './audit-logs'
import { schedulerLogsHandlers } from './scheduler-logs'
import { fileRecordsHandlers } from './file-records'
import { schemasHandlers } from './schemas'
import { scriptsHandlers } from './scripts'
import { samplesHandlers } from './samples'
import { connectionsHandlers } from './connections'

export const handlers = [
  ...authenticationHandlers,
  ...dictionariesHandlers,
  ...groupsHandlers,
  ...regionsHandlers,
  ...usersHandlers,
  ...privilegesHandlers,
  ...operationLogsHandlers,
  ...accessLogsHandlers,
  ...auditLogsHandlers,
  ...schedulerLogsHandlers,
  ...fileRecordsHandlers,
  ...schemasHandlers,
  ...scriptsHandlers,
  ...samplesHandlers,
  ...connectionsHandlers
]
