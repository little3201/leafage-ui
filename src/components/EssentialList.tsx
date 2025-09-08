import { useNavigate } from "react-router"
import { PanelMenu } from 'primereact/panelmenu'
import { useEssential } from 'src/components/context/EssentialContext'
import { recursion } from 'src/utils'


function EssentialList() {
  const navigate = useNavigate()
  const { privileges } = useEssential()

  const items = recursion(privileges, navigate)

  return (
    <PanelMenu model={items} />
  )
}

export default EssentialList
