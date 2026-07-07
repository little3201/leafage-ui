import { icons } from '@iconify-json/material-symbols'
import { addIcon, iconLoaded } from '@iconify/vue'
import { actionIcons, pageIcons } from '@/constants'


/**
 * load action icon
 * @param action action 
 * @returns icon
 */
export function actionIcon(action: string) {
  const iconName = actionIcons[action]

  if (!iconName) {
    return ''
  }

  return loadIcon(iconName)
}

/**
 * load page icon
 * @param page page 
 * @returns icon
 */
export function pageIcon(page: string) {
  const iconName = pageIcons[page]

  if (!iconName) {
    return ''
  }

  return loadIcon(iconName)
}


/**
 * load rounded icon
 * @param iconName icon name not contants prefix 
 * @returns icon
 */
export function loadIcon(iconName: string) {
  if (!iconName) {
    return ''
  }

  const fullIconName = `material-symbols:${iconName}`

  if (iconLoaded(fullIconName)) {
    return fullIconName
  }

  const singleIconData = icons.icons[iconName]

  if (singleIconData) {
    addIcon(fullIconName, {
      body: singleIconData.body,
      width: icons.width || 24,
      height: icons.height || 24
    })
  }

  return fullIconName
}
