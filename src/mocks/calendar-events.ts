import { http, HttpResponse } from "msw";
import { SERVER_URL } from "@/constants";
import { randomInt } from "./util";
import type { CalendarEvent } from "@/types";

const events: CalendarEvent[] = [];

const today = new Date();
for (let i = 1; i < randomInt(30); i++) {
  const event: CalendarEvent = {
    id: i,
    title: "Event title_" + i,
    startDate: new Date(today.getTime() + randomInt(5) * 86400000),
    endDate: new Date(today.getTime() + randomInt(7 * 86400000)),
    type:
      ["primary", "success", "warning", "danger", "info"][randomInt(6)] ||
      "primary"
  };
  events.push(event);
}

export const calendarEventHandlers = [
  http.get(`/api${SERVER_URL.CALENDAR_EVENT}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      const res = {
        title: "法定假期",
        startDate: new Date().toISOString().split("T")[0] || "",
        endDate:
          new Date(new Date().getTime() + randomInt(7 * 86400000))
            .toISOString()
            .split("T")[0] || "",
        type: "primary"
      };
      return HttpResponse.json(res);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.CALENDAR_EVENT}`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const month = searchParams.get("month");
    if (!month) {
      return HttpResponse.json([]);
    }
    // Construct a JSON response with the list of all Row
    // as the response body.

    return HttpResponse.json(events);
  }),
  http.post(`/api${SERVER_URL.CALENDAR_EVENT}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = (await request.json()) as CalendarEvent;

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 });
  }),
  http.put(
    `/api${SERVER_URL.CALENDAR_EVENT}/:id`,
    async ({ params, request }) => {
      const { id } = params;
      // Read the intercepted request body as JSON.
      const newData = (await request.json()) as CalendarEvent;

      if (id && newData) {
        // Don't forget to declare a semantic "201 Created"
        // response and send back the newly created Row!
        return HttpResponse.json({ ...newData, id: id }, { status: 202 });
      } else {
        return HttpResponse.error();
      }
    }
  ),
  http.delete(`/api${SERVER_URL.CALENDAR_EVENT}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params;

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!id) {
      return new HttpResponse(null, { status: 404 });
    }

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json();
  })
];
