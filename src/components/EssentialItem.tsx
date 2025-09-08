import React, { useState } from 'react'
import { Link } from 'react-router'
import type { AppMenuItemProps } from 'src/types'


function EssentialList(props: AppMenuItemProps) {
  const [activeMenu, setActiveMenu] = useState('')
  const item = props.item
  const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index)
  const active = activeMenu === key || activeMenu.startsWith(key + '-')

  const itemClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    //avoid processing disabled items
    if (item!.disabled) {
      event.preventDefault()
      return
    }

    //execute command
    if (item!.command) {
      item!.command({ originalEvent: event, item: item })
    }

    // toggle active state
    if (item!.items) setActiveMenu(active ? (props.parentKey as string) : key)
    else setActiveMenu(key)
  }

  const subMenu = item!.items && (
    <ul className='list-none m-0 p-0'>
      {item!.items.map((child, i) => {
        return <EssentialList item={child} index={i} parentKey={key} key={child.label} />
      })}
    </ul>
  )

  return (
    <li className={'my-px ml-4'}>
      {(!item!.to || item!.items) ? (
        <a onClick={(e) => itemClick(e)} className={'flex items-center py-2 cursor-pointer bg-amber-100 hover:bg-amber-200'} target={item!.target} tabIndex={0}>
          <i className={`${item?.icon} mr-2`}></i>
          <span className="mr-auto">{item!.label}</span>
          {item!.items && <i className="pi pi-fw pi-angle-down mr-3"></i>}
        </a>
      ) : null}

      {item!.to && !item!.items ? (
        <Link to={item!.to} replace={item!.replaceUrl} target={item!.target} onClick={(e) => itemClick(e)} className={'py-2 flex items-center cursor-pointer bg-amber-100 hover:bg-amber-200'} tabIndex={0}>
          <i className={`${item?.icon} mr-2`}></i>
          <span className="mr-auto">{item!.label}</span>
          {item!.items && <i className="pi pi-fw pi-angle-down"></i>}
        </Link>
      ) : null}

      {subMenu}
    </li>
  )
}

export default EssentialList
