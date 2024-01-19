// src/components/ResultsTable.tsx
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Button,
  Box,
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
      minWidth: 300,
    }}
    {...props}
  />
)

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  // 検索結果をCSV形式に変換する関数
  const convertToCSV = (data: SearchResult[]) => {
    const csvRows = data.map((result) =>
      [result.title, result.link, result.snippet].join(',')
    )
    return ['Title,Link,Snippet', ...csvRows].join('\n')
  }

  // CSVダウンロードのハンドラ
  const handleDownloadCSV = () => {
    const csvString = convertToCSV(results)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'search-results.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: '1px solid #ececec',
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                minWidth: 40,
                maxWidth: 80,
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
                <a href={result.link} target="_blank" rel="noopener noreferrer">
                  {result.link}
                </a>
              </StyledCell>
              <StyledCell>{result.snippet}</StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* CSVダウンロードボタンで */}
      <Box sx={{ textAlign: 'right', p: 2 }}>
        <Button
          onClick={handleDownloadCSV}
          variant="contained"
          color="success"
          size="large"
        >
          Download CSV
        </Button>
      </Box>
    </TableContainer>
  )
}

export default ResultsTable
