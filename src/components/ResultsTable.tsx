// src/components/ResultsTable.tsx
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer
} from '@mui/material'

type SearchResult = {
  title: string
  link: string
  snippet: string
}

type ResultsTableProps = {
  results: SearchResult[]
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Snippet</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.title}</TableCell>
              <TableCell>
                <a href={result.link} target='_blank' rel='noopener noreferrer'>
                  {result.link}
                </a>
              </TableCell>
              <TableCell>{result.snippet}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ResultsTable
