export const shceduleStatus: {
  [key: string]: 'primary' | 'success' | 'info' | 'warning' | 'error'
} = {
  PENDING: 'info',
  RUNNING: 'primary',
  SUCCESS: 'success',
  FAILED: 'error',
  CANCELED: 'warning',
}

export const userStatus: {
  [key: string]: 'primary' | 'success' | 'info' | 'warning' | 'error'
} = {
  ACTIVE: 'success',
  LOCKED: 'primary',
  EXPIRED: 'warning',
  CREDENTIALS_EXPIRED: 'info',
  DISABLED: 'error',
}

export const schemaStatus: { [key: string]: 'primary' | 'success' | 'info' } = {
  DRAFT: 'primary',
  PUBLISHED: 'success',
  ARCHIVED: 'info',
}

export const messageStatus: {
  [key: string]: 'primary' | 'success' | 'warning'
} = {
  DRAFT: 'primary',
  PUBLISHED: 'success',
  REVOKED: 'warning',
}
