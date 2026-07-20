import { http, HttpResponse } from "msw";
import { SERVER_URL } from "@/constants";
import type { Message, User, MessageInbox } from "@/types";
import { applyFilters, randomInt } from "../util";

const messages: Message[] = [];
const users: User[] = [];
const datas: MessageInbox[] = [];

for (let i = 1; i < 5; i++) {
  const row: User = {
    id: i,
    username:
      ["admin", "zhangsan", "lisi", "wangmazi", "guangtouqiang"][
        randomInt(5)
      ] || "admin",
    fullName: "Name_" + i,
    email: "use***" + "@**t.com"
  };
  users.push(row);
}

for (let i = 1; i < 18; i++) {
  const random = randomInt(3);
  const row: Message = {
    id: i,
    title: "The message title_" + i,
    sender: "admin",
    scope: "ALL",
    type: ["系统公告", "部门通知", "全员信", "通知"][randomInt(4)] || "",
    receiver:
      random / 2 > 0 ? null : users.filter((_, index) => index < randomInt(5)),
    status: ["DRAFT", "PUBLISHED", "REVOKED"][random] || "DRAFT",
    body: "This is the message body, Do you know what append with the system, it'is very nice, do you like it?",
    publishedAt: new Date(new Date().setDate(new Date().getDate() - i))
  };
  messages.push(row);
}

for (let i = 1; i < 18; i++) {
  const random = randomInt(2);
  const row: MessageInbox = {
    id: i,
    message: messages[random],
    receiver: "admin",
    status: ["READ", "UNREAD"][random] || "READ",
    readAt: new Date()
  };
  datas.push(row);
}

export const messageInboxHandlers = [
  http.get(`/api${SERVER_URL.MESSAGE_INBOX}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      const filtered = datas.find(item => item.id === Number(id));
      return HttpResponse.json(filtered);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.MESSAGE_INBOX}`, ({ request }) => {
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
      totalElements: filtered.length
    };

    return HttpResponse.json(data);
  }),
  http.patch(`/api${SERVER_URL.MESSAGE_INBOX}/read`, () => {
    return HttpResponse.json(true);
  }),
  http.patch(`/api${SERVER_URL.MESSAGE_INBOX}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.delete(`/api${SERVER_URL.MESSAGE_INBOX}/:id`, ({ params }) => {
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
