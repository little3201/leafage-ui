import { auditLogsHandlers } from './audits/logs'
import { auditPatrolsHandlers } from './audits/patrols'
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
import { operationLogsHandlers } from './logs/operation-logs'
import { messagesHandlers } from './messages'
import { messageInboxHandlers } from './messages/inbox'
import { regionsHandlers } from './regions'
import { schedulersHandlers } from './scheduler'
import { schedulerLogsHandlers } from './scheduler/logs'
import { dictionariesHandlers } from './system/dictionaries'
import { groupsHandlers } from './system/groups'
import { privilegesHandlers } from './system/privileges'
import { rolesHandlers } from './system/roles'
import { usersHandlers } from './system/users'

export const handlers = [
  ...accessLogsHandlers,
  ...auditLogsHandlers,
  ...auditPatrolsHandlers,
  ...authenticationHandlers,
  ...calendarEventHandlers,
  ...connectionsHandlers,
  ...dictionariesHandlers,
  ...fileRecordsHandlers,
  ...fragmentsHandlers,
  ...groupsHandlers,
  ...messagesHandlers,
  ...messageInboxHandlers,
  ...modulesHandlers,
  ...operationLogsHandlers,
  ...privilegesHandlers,
  ...regionsHandlers,
  ...rolesHandlers,
  ...samplesHandlers,
  ...sectionsHandlers,
  ...schedulersHandlers,
  ...schedulerLogsHandlers,
  ...schemesHandlers,
  ...scriptsHandlers,
  ...usersHandlers,
  ...archivesHandlers,
  ...reportsHandlers,
  ...templatesHandlers,
]
