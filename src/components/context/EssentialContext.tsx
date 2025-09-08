import { createContext, useState, useEffect, useContext } from 'react'
import type { ReactNode } from 'react'
import { retrievePrivilegeTree } from 'src/api/privileges'
import type { PrivilegeTreeNode } from 'src/types'


// 创建 Context
const EssentialContext = createContext({ privileges: [] as PrivilegeTreeNode[] });

// 创建 Provider
export const EssentialProvider = ({ children }: { children: ReactNode }) => {
  const [privileges, setPrivileges] = useState([])

  useEffect(() => {
    retrievePrivilegeTree().then(res => {
      if (res) {
        setPrivileges(res);
      }
    })
  }, []);

  return (
    <EssentialContext.Provider value={{ privileges }}>
      {children}
    </EssentialContext.Provider>
  );
};

// 创建自定义 Hook 用于获取菜单数据
export const useEssential = () => useContext(EssentialContext);
