// src/components/ResultsTable.tsx
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
} from "@mui/material";
import theme from "../util/theme";

type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

type ResultsTableProps = {
  results: SearchResult[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledCell = (props: any) => (
  <TableCell
    sx={{
      textWrap: "wrap",
      wordBreak: "break-all",
      minWidth: 300,
      maxWidth: 800,
      fontSize: "0.875rem",
      p: 1,
    }}
    {...props}
  />
);

const ResultsTable = ({ results }: ResultsTableProps) => {
  // 検索結果をCSV形式に変換する関数
  const convertToCSV = (data: SearchResult[]) => {
    const csvRows = data.map(
      (result, index) =>
        // 連番を追加しています。ここで1を加えるのは、indexが0から始まるためです。
        `${index + 1},${result.title},${result.link},${result.snippet}`
    );
    // CSVのヘッダーに「検索順位」カラムを追加します。
    return ["順位,Title,Link,Snippet", ...csvRows].join("\n");
  };

  // CSVダウンロードのハンドラ
  const handleDownloadCSV = () => {
    const csvString = convertToCSV(results);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // 現在の日時を取得し、フォーマットする
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 19).replace(/-|:|T/g, "");
    const fileName = `search-results_${formattedDate}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid ",
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
                fontSize: "0.875rem",
                lineHeight: "1.2rem",
                textWrap: "nowrap",
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
      {
        // このコンポーネントは、検索結果がある場合にのみ表示される
        results.length === 0 ? null : (
          <Box
            sx={{
              textAlign: "right",
              p: 2,
              position: "fixed",
              bottom: 2,
              right: 2,
            }}
          >
            <Button
              onClick={handleDownloadCSV}
              variant="contained"
              color="success"
              size="large"
            >
              Download CSV
            </Button>
          </Box>
        )
      }
    </TableContainer>
  );
};

export default ResultsTable;
