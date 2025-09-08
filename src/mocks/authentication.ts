import { http, HttpResponse } from 'msw'


export const authenticationHandlers = [
  http.post('/api/login', async ({ request }) => {
    const formData = await request.formData()
    if (formData.get('username')) {
      return HttpResponse.json({ message: 'Login successful' }, { status: 200 })
    } else {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
  })
]