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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledCell = (props: any) => (
  <TableCell
    sx={{
      textWrap: 'wrap',
      wordBreak: 'break-all',
      minWidth: 300
    }}
    {...props}
  />
)

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid #ececec'
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 40,
                maxWidth: 80
              }}
            >
              検索
              <br />
              順位
            </TableCell>
            <StyledCell>Title</StyledCell>
            <StyledCell>Link</StyledCell>
            <StyledCell>Snippet</StyledCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}位</TableCell>
              <StyledCell>{result.title}</StyledCell>
              <StyledCell>
                <a href={result.link} target='_blank' rel='noopener noreferrer'>
                  {result.link}
                </a>
              </StyledCell>
              <StyledCell>{result.snippet}</StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ResultsTable
