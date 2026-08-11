import { http, HttpResponse } from "msw";
import { SERVER_URL } from "@/constants";

export const authenticationHandlers = [
  http.post(`/api${SERVER_URL.LOGIN}`, () => {
    return HttpResponse.json();
  }),

  http.post(`/api${SERVER_URL.LOGOUT}`, () => {
    return new HttpResponse();
  })
];
