import { useState, useEffect } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="users table">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align="right">Fullname</TableCell>
            <TableCell align="right">Email</TableCell>
            <TableCell align="right">NonLocked</TableCell>
            <TableCell align="right">avatar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.username}
              </TableCell>
              <TableCell align="center">
                {row.fullname}
              </TableCell>
              <TableCell align="left">{row.email}</TableCell>
              <TableCell align="right">{row.accountNonLocked}</TableCell>
              <TableCell align="left">{row.avatar}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}