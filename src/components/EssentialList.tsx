import EssentialItem from './EssentialItem'
import type { AppMenuItem } from 'src/types'


function EssentialList(props: { items: AppMenuItem[] }) {

  return (
    <ul className="list-none m-0 p-0">
      {props.items.map((item, i) => {
        return !item?.seperator ? <EssentialItem item={item} root={true} index={i} key={item.label} /> :
          null
      })}
    </ul>
  )
}

export default EssentialList
