import { useState, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { retrieveUsers } from 'src/api/users'
import type { User } from 'src/types'


export default function Index() {
  const [rows, setRows] = useState<User[]>([]);

  useEffect(() => {
    retrieveUsers({ page: 0, size: 10 }).then(res => {
      if (res.content) {
        setRows(res.content);
      }
    })
  }, []);

  return (
    <div className="card">
      <DataTable value={rows} stripedRows paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
        <Column field="username" header="Username"></Column>
        <Column field="fullname" header="Fullname"></Column>
        <Column field="email" header="Email"></Column>
        <Column field="accountNonLocked" header="Account Non Locked"></Column>
      </DataTable>
    </div>
  )
}