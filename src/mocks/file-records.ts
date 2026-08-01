import { http, HttpResponse } from "msw";
import { SERVER_URL } from "@/constants";
import type { FileRecord, FileCategory, FileStatistics } from "@/types";
import { applyFilters, randomInt } from "./util";

const datas: FileRecord[] = [];
const statistics: FileStatistics[] = [];

for (let i = 1; i < 18; i++) {
  const random = randomInt(7);
  const data: FileRecord = {
    id: i,
    superiorId: random || null,
    name:
      "test" +
        i +
        [".jpg", ".png", ".pdf", ".zip", ".docx", ".xlsx", ""][random] || "",
    contentType:
      [
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/zip",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel"
      ][random] || "",
    size: randomInt(99999999),
    path: random > 5 ? "" : "/path/to/test" + i,
    directory: random === 6 ? true : false,
    enabled: i % 2 > 0,
    lastModifiedDate: new Date()
  };
  datas.push(data);
}

const categories: FileCategory[] = ["image", "video", "document", "other"];
for (const key of categories) {
  statistics.push({
    key,
    count: randomInt(99),
    size: randomInt(10000000000)
  });
}

export const fileRecordsHandlers = [
  http.get(`/api${SERVER_URL.FILE}/statistics`, () => {
    return HttpResponse.json(statistics);
  }),
  http.get(`/api${SERVER_URL.FILE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      const filtered = datas.find(item => item.id === Number(id));
      return HttpResponse.json(filtered);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.FILE}`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const size = url.searchParams.get("size");

    const filtersStr = url.searchParams.get("filters");
    const filtered = applyFilters(datas, filtersStr);

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
  http.post(`/api${SERVER_URL.FILE}/upload`, async ({ request }) => {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return new HttpResponse("Missing document", { status: 400 });
    }

    if (!(file instanceof File)) {
      return new HttpResponse("Uploaded document is not a File", {
        status: 400
      });
    }

    return HttpResponse.json(datas[0]);
  }),
  http.patch(`/api${SERVER_URL.FILE}/:id/enable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.patch(`/api${SERVER_URL.FILE}/:id/disable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.delete(`/api${SERVER_URL.FILE}/:id`, ({ params }) => {
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

    // Delete the Row from the "allRow" map.
    datas.pop();

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json();
  })
];
