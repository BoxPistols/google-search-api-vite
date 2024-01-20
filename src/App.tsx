// src/App.tsx
import { useState } from "react";
import SearchForm from "./components/SearchForm";
import ResultsTable from "./components/ResultsTable";
import { Box, Container, Typography } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import theme from "./util/theme";

const App = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]); // 検索結果を格納する状態
  // 検索中にローディングスピナーを表示するための状態 (後述)
  const [loading, setLoading] = useState(false);
  // クエリ消費数を格納する状態
  const [queriesUsed, setQueriesUsed] = useState(0);

  const handleSearch = async (apiKey: string, cx: string, query: string) => {
    setLoading(true);
    setResults([]); // 検索結果をリセット

    // 最初の10件の結果を取得
    const firstPageResponse = await fetchResults(apiKey, cx, query, 1);
    const firstPageResults = firstPageResponse.items || [];
    // 次の10件の結果を取得
    const secondPageResponse = await fetchResults(apiKey, cx, query, 11);
    const secondPageResults = secondPageResponse.items || [];
    // 結果を結合して状態を更新
    setResults([...firstPageResults, ...secondPageResults]);
    setLoading(false);

    // クエリ消費数を更新
    // キーワード数を取得（スペース区切りで単語数をカウント）
    const keywordCount = query.trim().split(/\s+/).length;
    // 2回のリクエストで20件の結果を取得するため、2クエリ消費する
    const newQueries = 2 * keywordCount;
    // クエリ消費数を更新
    setQueriesUsed((prev) => prev + newQueries);
  };
  // 残りのクエリ数を計算
  // const remainingQueries = 1000 - queriesUsed
  const remainingQueries = queriesUsed;

  // Google Custom Search APIへのリクエストを行う関数
  const fetchResults = async (
    apiKey: string,
    cx: string,
    query: string,
    start: number
  ) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
          query
        )}&start=${start}`
      );
      if (!response.ok) {
        throw new Error("Search API request failed");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching search results:", error);
      return {};
    }
  };

  return (
    <>
      <Typography
        component="h1"
        variant="h2"
        mt={"2vw"}
        textAlign={"center"}
        color={theme.palette.primary.main}
        sx={{
          fontSize: { md: "2rem", xs: "1.5rem" },
        }}
      >
        Google Search Ranking Checker
      </Typography>
      <Typography
        textAlign={"center"}
        variant="subtitle1"
        m={1}
        mb={0.25}
        color={theme.palette.secondary.main}
        sx={{
          fontSize: { md: "0.75rem", xs: "0.5rem" },
          textAlign: { md: "center", xs: "left" },
        }}
      >
        このサービスは、Google純正のSearch
        APIを利用し特定の検索ワードにおける検索順位結果を調べ、簡潔にレポーティングするサービスです
      </Typography>
      <Typography
        textAlign={"center"}
        variant="subtitle2"
        mx={1}
        color={theme.palette.secondary.main}
      >
        現在20件(1位から10位、11位から20位)の検索結果を結合して取得しています
      </Typography>

      <Container
        sx={{
          margin: "2vh auto",
          p: 3,
          pb: 4,
          boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
          border: "2px solid #ececec",
          borderRadius: 2,
          background: "linear-gradient(135deg, #6e88cf33, #d55b5b33)"
        }}
      >
        <SearchForm onSearch={handleSearch} />
        <Box
          sx={{
            display: { md: "flex", xs: "block" },
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            color={theme.palette.secondary.main}
            sx={{
              verticalAlign: "middle",
            }}
          >
            利用クエリ数{"："}
            <Typography
              component="span"
              fontWeight={theme.typography.fontWeightBold}
              color={theme.palette.primary.main}
            >
              {remainingQueries > 0 ? remainingQueries : null}
            </Typography>{" "}
            (目安)
          </Typography>
          <Typography variant="subtitle2" color={theme.palette.secondary.main}>
            Google Search API基準 = 1回の検索で2クエリ以上消費。 1クエリ /
            キーワード x 2ページ分 / 1日に100クエリまで(24時間でリセット)
          </Typography>
        </Box>
        {loading ? <p>Loading...</p> : <ResultsTable results={results} />}
      </Container>
      <Analytics />
    </>
  );
};

export default App;
