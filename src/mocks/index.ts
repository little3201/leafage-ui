import { authenticationHandlers } from './authentication'
import { calendarEventHandlers } from './calendar-events'
import { archivesHandlers } from './docs/archives'
import { reportsHandlers } from './docs/reports'
import { sectionsHandlers } from './docs/sections'
import { templatesHandlers } from './docs/templates'
import { connectionsHandlers } from './exploiters/connections'
import { fragmentsHandlers } from './exploiters/fragments'
import { modulesHandlers } from './exploiters/modules'
import { samplesHandlers } from './exploiters/samples'
import { schemesHandlers } from './exploiters/schemes'
import { scriptsHandlers } from './exploiters/scripts'
import { fileRecordsHandlers } from './file-records'
import { accessLogsHandlers } from './logs/access-logs'
import { auditLogsHandlers } from './logs/audit-logs'
import { operationLogsHandlers } from './logs/operation-logs'
import { schedulerLogsHandlers } from './logs/scheduler-logs'
import { regionsHandlers } from './regions'
import { dictionariesHandlers } from './system/dictionaries'
import { groupsHandlers } from './system/groups'
import { privilegesHandlers } from './system/privileges'
import { rolesHandlers } from './system/roles'
import { usersHandlers } from './system/users'

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
  ...sectionsHandlers,
  ...schedulerLogsHandlers,
  ...schemesHandlers,
  ...scriptsHandlers,
  ...usersHandlers,
  ...archivesHandlers,
  ...reportsHandlers,
  ...templatesHandlers
]
