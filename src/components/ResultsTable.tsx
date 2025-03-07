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
import theme from '../util/theme'

type SearchResult = {
    title: string
    link: string
    snippet: string
}

type ResultsTableProps = {
    results: SearchResult[]
    searchKeyword: string
}

const StyledCell = ({ children }: { children: React.ReactNode }) => (
    <TableCell
        sx={{
            textWrap: 'wrap',
            wordBreak: 'break-all',
            minWidth: 300,
            maxWidth: 800,
            fontSize: '0.875rem',
            p: 1,
        }}
    >
        {children}
    </TableCell>
)

const ResultsTable = ({ results, searchKeyword }: ResultsTableProps) => {
    // 検索結果をCSV形式に変換する関数

    // CSVダウンロードのハンドラー関数
    const handleDownloadCSV = () => {
        // BOMを追加してUTF-8で正しく認識されるようにする
        const BOM = '\uFEFF'
        const headers = ['順位', 'タイトル', 'リンク', '説明']
        const csvContent = results.map((result, index) => [
            index + 1,
            result.title.replace(/"/g, '""'), // ダブルクォートをエスケープ
            result.link,
            result.snippet.replace(/"/g, '""'),
        ])

        const csvString =
            BOM +
            [
                headers.join(','),
                ...csvContent.map((row) =>
                    row.map((cell) => `"${cell}"`).join(',')
                ),
            ].join('\n')

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `search_results_${searchKeyword}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                border: '1px solid ',
                borderColor: theme.palette.grey[300],
            }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                minWidth: 40,
                                maxWidth: 80,
                                width: 70,
                                fontSize: '0.875rem',
                                lineHeight: '1.2rem',
                                textWrap: 'nowrap',
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
                    {results.map((result) => (
                        <TableRow key={result.link || result.title}>
                            <TableCell>
                                {results.indexOf(result) + 1}位
                            </TableCell>
                            <StyledCell>{result.title}</StyledCell>
                            <StyledCell>
                                <a
                                    href={result.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    {result.link}
                                </a>
                            </StyledCell>
                            <StyledCell>{result.snippet}</StyledCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {results.length === 0 ? null : (
                <Box
                    sx={{
                        textAlign: 'right',
                        p: 2,
                        position: 'fixed',
                        bottom: 2,
                        right: 2,
                    }}
                >
                    <Button
                        onClick={handleDownloadCSV}
                        variant='contained'
                        color='success'
                        size='large'
                    >
                        Download CSV
                    </Button>
                </Box>
            )}
        </TableContainer>
    )
}

export default ResultsTable
