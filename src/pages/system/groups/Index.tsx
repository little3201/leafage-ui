import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { retrieveGroups } from 'src/api/groups'
import type { Group } from 'src/types'


export default function Index() {
  const [rows, setRows] = useState<Group[]>([]);

  useEffect(() => {
    retrieveGroups({ page: 0, size: 10 }).then(res => {
      if (res.content) {
        setRows(res.content);
      }
    })
  }, []);

  return (
    <div className="card">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="name" header="Name"></Column>
        <Column field="status" header="Status"></Column>
        <Column field="description" header="Description"></Column>
      </DataTable>
    </div>
  )
}