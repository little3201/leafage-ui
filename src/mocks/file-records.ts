import { http, HttpResponse } from 'msw'
import { SERVER_URL } from 'src/constants'
import type { FileRecord } from 'src/types'

const datas: FileRecord[] = [
]

for (let i = 1; i < 28; i++) {
  const data: FileRecord = {
    id: i,
    name: 'name_' + i + (i % 3 > 0 ? '' : (i % 2 > 0 ? '.jpg':'.zip')),
    type: i % 3 > 0 ? 'directory' : 'file',
    mimeType:  i % 3 > 0 ? 'folder' : (i % 2 > 0 ? 'jpg' : 'zip'),
    size: Math.floor(Math.random() * 100000),
    path: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg',
    lastModifiedDate: new Date()
  }
  datas.push(data)
}

export const fileRecordsHandlers = [
  http.get(`/api${SERVER_URL.FILE}/:id`, ({ params }) => {
    const { id } = params
    if (id) {
      return HttpResponse.json(datas.filter(item => item.id === Number(id))[0])
    } else {
      return HttpResponse.json()
    }
  }),
  http.get(`/api${SERVER_URL.FILE}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams
    const page = searchParams.get('page')
    const size = searchParams.get('size')
    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: Array.from(datas.slice(Number(page) * Number(size), (Number(page) + 1) * Number(size))),
      page: {
        totalElements: datas.length
      }
    }

    return HttpResponse.json(data)
  }),
  http.post(`/api${SERVER_URL.FILE}`, async ({ request }) => {
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

    return HttpResponse.json(datas[0])
  }),
  http.delete(`/api${SERVER_URL.FILE}`, ({ params }) => {
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
