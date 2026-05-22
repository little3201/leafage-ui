import type { Section } from 'src/types'

// 工具函数：根据父级章节递归生成编号
export function generateNumbering(section: Section, numberingFormat: 'number' | 'alphabet', allSections: Section[]): string {
  let prefix = ''

  // 如果 level 为 null 或 undefined，设置默认值
  const level = section.level ?? 1

  if (numberingFormat === 'number') {
    prefix = generateNumber(section, allSections, level)
  } else if (numberingFormat === 'alphabet') {
    prefix = generateAlphabet(section, allSections, level)
  }

  return `${prefix} ${section.name}`
}

function generateNumber(section: Section, allSections: Section[], level: number): string {
  let numbering = ''
  const parentSections = getParentSections(section, allSections)

  parentSections.forEach((_, index) => {
    numbering += (index + 1) + '.'
  })

  return numbering + level
}

function generateAlphabet(section: Section, allSections: Section[], level: number): string {
  let alphabet = ''
  const parentSections = getParentSections(section, allSections)

  parentSections.forEach((_, index) => {
    alphabet += String.fromCharCode(65 + index) + '.' // 从 A 开始
  })

  return alphabet + String.fromCharCode(65 + level - 1) // 当前章节的字母编号
}

/**
 * 获取父级章节（递归或通过superiorId查找）
 * @param section 当前章节
 * @param allSections 所有章节数据
 * @returns 父级章节数组
 */
function getParentSections(section: Section, allSections: Section[]): Section[] {
  const parentSections: Section[] = []
  let currentSection = section

  while (currentSection.superiorId !== null) {
    // 获取父级章节
    currentSection = allSections.find(s => s.id === currentSection.superiorId)!
    parentSections.unshift(currentSection) // 逆序保存父级章节
  }

  return parentSections
}