import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { Script } from 'src/types'

const datas: Script[] = [
  {
    id: 1,
    name: 'MySQL',
    icon: '/svgs/mysql.svg',
    version: '8.0.34',
    type: 'Connection',
    content: '#!/bin/bash\necho \\"Starting PostgreSQL...\\"\nservice postgresql start\necho \\"PostgreSQL is now running.\\"\n',
    lastModifiedDate: new Date()
  }, {
    id: 2,
    name: 'Nginx',
    icon: '/svgs/nginx.svg',
    version: '1.8.12',
    type: 'Middleware',
    content: '#!/bin/bash\necho \\"Starting Nginx...\\"\nservice nginx start\necho \\"Nginx is now running.\\"\n',
    lastModifiedDate: new Date()
  },
  {
    id: 3,
    name: 'Nodejs',
    icon: '/svgs/nodejs.svg',
    version: '20.5.6',
    type: 'Middleware',
    content: 'npm install',
    lastModifiedDate: new Date()
  },
  {
    id: 4,
    name: 'PostgreSql',
    icon: '/svgs/postgresql.svg',
    version: '16.2.3',
    type: 'Connection',
    content: '#!/bin/bash\necho \\"Starting PostgreSQL...\\"\nservice postgresql start\necho \\"PostgreSQL is now running.\\"\n',
    lastModifiedDate: new Date()
  },
  {
    id: 5,
    name: 'Redis',
    icon: '/svgs/redis.svg',
    version: '6.0.1',
    type: 'Middleware',
    content: '#!/bin/bash\necho \\"Starting Redis...\\"\nservice redis-server start\necho \\"Redis is now running.\\"\n',
    lastModifiedDate: new Date()
  },
  {
    id: 6,
    name: 'Redis',
    icon: '/svgs/redis.svg',
    version: '7.0.1',
    type: 'Middleware',
    content: '#!/bin/bash\necho \\"Starting Redis...\\"\nservice redis-server start\necho \\"Redis is now running.\\"\n',
    lastModifiedDate: new Date()
  },
  {
    id: 7,
    name: 'Redis',
    icon: '/svgs/redis.svg',
    version: '3.0.1',
    type: 'Middleware',
    content: '#!/bin/bash\necho \\"Starting Redis...\\"\nservice redis-server start\necho \\"Redis is now running.\\"\n',
    lastModifiedDate: new Date()
  }
]

export const scriptsHandlers = [
  http.get(`/api${SERVER_URL.SCRIPT}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.SCRIPT}`, () => {
    // Construct a JSON response with the list of all Row
    // as the response body.

    return HttpResponse.json(datas)
  }),
  http.post(`/api${SERVER_URL.SCRIPT}/import`, async ({ request }) => {
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
  http.post(`/api${SERVER_URL.SCRIPT}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Script

    // Push the new Row to the map of all Row.
    datas.push(newData)

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 })
  }),
  http.put(`/api${SERVER_URL.SCRIPT}/:id`, async ({ params, request }) => {
    const { id } = params
    // Read the intercepted request body as JSON.
    const newData = await request.json() as Script

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 })
    } else {
      return HttpResponse.error()
    }

  }),
  http.patch(`/api${SERVER_URL.SCRIPT}/:id`, async({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json()
    } else {
      return HttpResponse.error()
    }
  }),
  http.delete(`/api${SERVER_URL.SCRIPT}/:id`, ({ params }) => {
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
    return HttpResponse.json(deletedData)
  })
]
