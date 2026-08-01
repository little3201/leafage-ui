import { http, HttpResponse } from "msw";
import { SERVER_URL } from "@/constants";
import type { SafetyPatrol } from "@/types";
import { applyFilters } from "../util";

const datas: SafetyPatrol[] = [];

for (let i = 1; i < 6; i++) {
  const row: SafetyPatrol = {
    id: i,
    username: ["admin", "zhangsan", "lisi", "wangmazi", "guangtouqiang"][i],
    fullName: "Name_" + i,
    email: "use***" + "@**t.com",
    role: "audit",
    enabled: i % 2 > 0
  };
  datas.push(row);
}

export const auditPatrolsHandlers = [
  http.get(`/api${SERVER_URL.AUDIT_PATROL}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      const filtered = datas.find(item => item.id === Number(id));
      return HttpResponse.json(filtered);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.AUDIT_PATROL}`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const size = url.searchParams.get("size");

    const filtersStr = url.searchParams.get("filters");
    const filtered = applyFilters(datas, filtersStr);

    // Construct a JSON response with the list of all Row
    // as the response body.
    const data = {
      content: filtered.slice(
        Number(page) * Number(size),
        (Number(page) + 1) * Number(size)
      ),
      page: {
        totalElements: filtered.length
      }
    };

    return HttpResponse.json(data);
  }),
  http.post(`/api${SERVER_URL.AUDIT_PATROL}`, async ({ request }) => {
    // Read the intercepted request body as JSON.
    const newData = (await request.json()) as SafetyPatrol;

    // Push the new Row to the map of all Row.
    datas.push(newData);

    // Don't forget to declare a semantic "201 Created"
    // response and send back the newly created Row!
    return HttpResponse.json(newData, { status: 201 });
  }),
  http.put(
    `/api${SERVER_URL.AUDIT_PATROL}/:id`,
    async ({ params, request }) => {
      const { id } = params;
      // Read the intercepted request body as JSON.
      const newData = (await request.json()) as SafetyPatrol;

      if (id && newData) {
        // Don't forget to declare a semantic "201 Created"
        // response and send back the newly created Row!
        return HttpResponse.json({ ...newData, id: id }, { status: 202 });
      } else {
        return HttpResponse.error();
      }
    }
  ),
  http.patch(`/api${SERVER_URL.AUDIT_PATROL}/:id/enable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.patch(`/api${SERVER_URL.AUDIT_PATROL}/:id/disable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.delete(`/api${SERVER_URL.AUDIT_PATROL}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params;

    // Let's attempt to grab the Row by its ID.
    const deletedData = datas.filter(item => item.id === Number(id));

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 });
    }

    // Remove the Row from the "allRow" map.
    datas.pop();

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json();
  })
];
