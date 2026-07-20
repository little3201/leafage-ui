import { http, HttpResponse } from "msw";
import { actionTypes, SERVER_URL } from "@/constants";
import type { Privilege, PrivilegeAction, PrivilegeTreeNode } from "@/types";
import { applyFilters, randomInt } from "../../util";
import { root_system, nodes_system, tree_system } from "./system";
import { root_messages, nodes_messages, tree_messages } from "./messages";
import { root_logs, nodes_logs, tree_logs } from "./logs";
import { root_regions, nodes_regions, tree_regions } from "./regions";
import { root_files, nodes_files, tree_files } from "./file-records";
import { root_docs, nodes_docs, tree_docs } from "./docs";
import { root_audits, nodes_audits, tree_audits } from "./audits";
import {
  root_schedulers,
  nodes_schedulers,
  tree_schedulers
} from "./schedulers";
import {
  root_exploiters,
  nodes_exploiters,
  tree_exploiters
} from "./exploiters";

const datas: Privilege[] = [
  root_system,
  root_exploiters,
  root_docs,
  root_messages,
  root_logs,
  root_regions,
  root_files,
  root_schedulers,
  root_audits
];
const subDatas: Privilege[] = [
  ...nodes_system,
  ...nodes_exploiters,
  ...nodes_docs,
  ...nodes_messages,
  ...nodes_logs,
  ...nodes_regions,
  ...nodes_files,
  ...nodes_schedulers,
  ...nodes_audits
];
const treeNodes: PrivilegeTreeNode[] = [
  ...tree_system,
  ...tree_exploiters,
  ...tree_docs,
  ...tree_messages,
  ...tree_logs,
  ...tree_regions,
  ...tree_files,
  ...tree_schedulers,
  ...tree_audits
];

const privilegeActions: PrivilegeAction[] = [];
const actions: string[] = [
  "create",
  "modify",
  "remove",
  "clear",
  "import",
  "export",
  "upload",
  "download",
  "unlock",
  "relation",
  "authorize",
  "config",
  "execute"
];

for (let i = 1; i < 25; i++) {
  const count = randomInt(actions.length) + 1;
  for (let j = 1; j <= count; j++) {
    const row: PrivilegeAction = {
      id: j + 1,
      privilegeId: i,
      name: actions[j - 1] || "",
      type: actionTypes[actions[j - 1] ?? ""] || null,
      enabled: randomInt(2) > 0
    };
    privilegeActions.push(row);
  }
}

export const privilegesHandlers = [
  http.get(`/api${SERVER_URL.PRIVILEGE}/tree`, () => {
    return HttpResponse.json(treeNodes);
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/actions`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(
        privilegeActions.filter(item => item.privilegeId === Number(id))
      );
    }
    return HttpResponse.json();
  }),
  http.get(
    `/api${SERVER_URL.PRIVILEGE}/:id/actions/:actionId`,
    ({ params }) => {
      const { id, actionId } = params;
      if (id && actionId) {
        const filtered = privilegeActions.find(
          item =>
            item.privilegeId === Number(id) && item.id === Number(actionId)
        );
        return HttpResponse.json(filtered);
      }
      return HttpResponse.json();
    }
  ),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      let res = datas.find(item => item.id === Number(id));
      if (!res) {
        res = subDatas.find(item => item.id === Number(id));
      }
      return HttpResponse.json(res);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id/subset`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json(
      subDatas.filter(item => item.superiorId === Number(id))
    );
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    const { id } = params;
    if (id) {
      let res = datas.find(item => item.id === Number(id));
      if (!res) {
        res = subDatas.find(item => item.id === Number(id));
      }
      return HttpResponse.json(res);
    } else {
      return HttpResponse.json();
    }
  }),
  http.get(`/api${SERVER_URL.PRIVILEGE}`, ({ request }) => {
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
  http.post(`/api${SERVER_URL.PRIVILEGE}/import`, async ({ request }) => {
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
    return HttpResponse.json();
  }),
  http.put(`/api${SERVER_URL.PRIVILEGE}/:id`, async ({ params, request }) => {
    const { id } = params;
    // Read the intercepted request body as JSON.
    const newData = (await request.json()) as Privilege;

    if (id && newData) {
      // Don't forget to declare a semantic "201 Created"
      // response and send back the newly created Row!
      return HttpResponse.json({ ...newData, id: id }, { status: 202 });
    } else {
      return HttpResponse.error();
    }
  }),
  http.patch(`/api${SERVER_URL.PRIVILEGE}/:id/enable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.patch(`/api${SERVER_URL.PRIVILEGE}/:id/disable`, ({ params }) => {
    const { id } = params;
    if (id) {
      return HttpResponse.json(true);
    } else {
      return HttpResponse.error();
    }
  }),
  http.delete(`/api${SERVER_URL.PRIVILEGE}/:id`, ({ params }) => {
    // All request path params are provided in the "params"
    // argument of the response resolver.
    const { id } = params;

    // Let's attempt to grab the Row by its ID.
    const deletedData = treeNodes.filter(item => item.id === Number(id));

    // Respond with a "404 Not Found" response if the given
    // Row ID does not exist.
    if (!deletedData) {
      return new HttpResponse(null, { status: 404 });
    }

    // Delete the Row from the "allRow" map.
    treeNodes.pop();

    // Respond with a "200 OK" response and the deleted Row.
    return HttpResponse.json();
  })
];
