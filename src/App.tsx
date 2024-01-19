// src/App.tsx
import { useState } from 'react'
import SearchForm from './components/SearchForm'
import ResultsTable from './components/ResultsTable'
import { Container, Typography } from '@mui/material'
import { Analytics } from '@vercel/analytics/react'

const App = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any[]>([]) // 検索結果を格納する状態
  // 検索中にローディングスピナーを表示するための状態 (後述)
  const [loading, setLoading] = useState(false)
  // クエリ消費数を格納する状態
  const [queriesUsed, setQueriesUsed] = useState(0)

  const handleSearch = async (apiKey: string, cx: string, query: string) => {
    setLoading(true)
    setResults([]) // 検索結果をリセット

    // 最初の10件の結果を取得
    const firstPageResponse = await fetchResults(apiKey, cx, query, 1)
    const firstPageResults = firstPageResponse.items || []
    // 次の10件の結果を取得
    const secondPageResponse = await fetchResults(apiKey, cx, query, 11)
    const secondPageResults = secondPageResponse.items || []
    // 結果を結合して状態を更新
    setResults([...firstPageResults, ...secondPageResults])
    setLoading(false)

    // クエリ消費数を更新
    // キーワード数を取得（スペース区切りで単語数をカウント）
    const keywordCount = query.trim().split(/\s+/).length
    // 2回のリクエストで20件の結果を取得するため、2クエリ消費する
    const newQueries = 2 * keywordCount
    // クエリ消費数を更新
    setQueriesUsed((prev) => prev + newQueries)
  }
  // 残りのクエリ数を計算
  // const remainingQueries = 1000 - queriesUsed
  const remainingQueries = queriesUsed * 20

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
      )
      if (!response.ok) {
        throw new Error('Search API request failed')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching search results:', error)
      return {}
    }
  }

  return (
    <>
      <Typography
        variant="h3"
        component="h1"
        mt={'4vw'}
        fontSize={'3vw'}
        fontWeight={'bold'}
        textAlign={'center'}
        color={'#3f51b5'}
      >
        Google Search Best 10
      </Typography>
      <Typography
        textAlign={'center'}
        variant="subtitle2"
        mt={1}
        color={'#abc'}
      >
        一日に使える検索回数には制限(1000クエリ | 24時間 |
        17時リセット)がありますのでご注意ください
      </Typography>

      <Container
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
          border: '1px solid #ececec',
          borderRadius: 4,
          margin: '2vw auto',
        }}
      >
        <p
          style={{
            color: remainingQueries < 0 ? 'red' : 'black',
            margin: '0 0 1vw 0',
          }}
        >
          利用クエリ数 = 目安：
          {remainingQueries > 0 ? remainingQueries : null} <br />
          <small>※Google Search APIの仕様 / 正確な数値ではありません</small>
        </p>
        <SearchForm onSearch={handleSearch} />
        {loading ? <p>Loading...</p> : <ResultsTable results={results} />}
      </Container>
      <Analytics />
    </>
  )
}

export default App
