import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Group, TreeNode, GroupMembers, GroupRoles, GroupPrivileges } from 'src/types'

const datas: Group[] = []

for (let i = 1; i < 28; i++) {
  let superiorId: number | undefined
   if (i === 1) {
    superiorId = undefined // 根节点
  } else if (i <= 3) {
    superiorId = 1 // 第二层
  } else {
    superiorId = (i % 2 === 0) ? 2 : 3 // 第三层，交替归属到2或3
  }
  const row: Group = {
    id: i,
    superiorId: superiorId,
    name: 'group_' + i,
    enabled: true,
    description: 'This is region description about xxx'
  }
  datas.push(row)
}

const members: GroupMembers[] = []

for (let i = 1; i < 14; i++) {
  const row: GroupMembers = {
    id: i,
    username: 'username' + i,
    groupId: i
  }
  members.push(row)
}


const roles: GroupRoles[] = []

for (let i = 1; i < 14; i++) {
  const row: GroupRoles = {
    id: i,
    roleId: i,
    groupId: i
  }
  roles.push(row)
}

const privileges: GroupPrivileges[] = []

for (let i = 1; i < 17; i++) {
  const row: GroupPrivileges = {
    id: i,
    groupId: i,
    privilegeId: i,
    actions: ['create', 'modify', 'remove', 'import', 'export']
  }
  privileges.push(row)
}

// 将扁平数据转换为树形结构
function buildTree(groups: Group[]): TreeNode[] {
  const map = new Map<number, TreeNode>()
  const tree: TreeNode[] = []
  
  // 第一步：创建映射，只处理有 id 的节点
  groups.forEach(group => {
    if (group.id !== undefined) {
      map.set(group.id, {
        ...group,
        children: []
      })
    }
  })
  
  // 第二步：构建层级关系
  groups.forEach(group => {
    // 跳过没有 id 的节点
    if (group.id === undefined) return
    
    const currentNode = map.get(group.id)
    // 确保当前节点存在
    if (!currentNode) return
    
    // 处理上级关系
    if (group.superiorId === undefined || group.superiorId === null) {
      // 没有上级，作为根节点
      tree.push(currentNode)
    } else {
      // 有上级，尝试找到父节点
      const parentNode = map.get(group.superiorId)
      if (parentNode) {
        // 父节点存在，添加到父节点的 children
        parentNode.children!.push(currentNode)
      } else {
        // 父节点不存在，作为根节点
        tree.push(currentNode)
      }
    }
  })
  
  return tree
}

export const groupsHandlers = [
  http.get(`/api${SERVER_URL.GROUP}/tree`, () => {
    return HttpResponse.json(buildTree(datas))
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(members.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/roles`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(roles.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id/privileges`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(privileges.filter(item => item.groupId === Number(id)))
    } else {
      return HttpResponse.json([])
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      const array = datas.filter(item => item.id === Number(id))
      return HttpResponse.json(array[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.GROUP}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    const filters = searchParams.get('filters')
    const superiorId = filters?.split(':')[2]

    console.log('filters', filters)
    const filtered = datas.filter(item => { return item.superiorId === Number(superiorId) })
    let data = {
      content: Array.from(filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: filtered.length
      }
    }

    if (superiorId) {
      data = {
        content: Array.from(filtered.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
        page: {
          totalElements: filtered.length
        }
      }
    }
    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.GROUP}/import`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return new HttpResponse('Missing document', { status: 400 })
    }

    if (!(file instanceof File)) {
      return new HttpResponse('Uploaded document is not a File', {
        status: 400,
      })
    }
    return HttpResponse.json()
  }),
  http.post(`/api${SERVER_URL.GROUP}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Group

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.GROUP}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Group

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id`, async ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/members`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/roles`, async ({ params, request }) => {
    const { id } = params
    const data = await request.json()
    if (id && data) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.patch(`/api${SERVER_URL.GROUP}/:id/privileges/:privilegeId`, async ({ params }) => {
    const { id, privilegeId } = params
    if (id && privilegeId) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:groupId/privileges/:privilegeId`, async ({ params }) => {
    const { groupId, privilegeId } = params
    if (groupId && privilegeId) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:id/members`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.GROUP}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params

    // Let's attempt to grab the Row by its ID.
    const deletedData = datas.filter(item => item.id === Number(id))

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 })
    }

    // Delete the Row from the "allRow" map.
    datas.pop()

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json()
  })
]
