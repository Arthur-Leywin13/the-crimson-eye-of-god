import ResultsClient from "./results-client";

type Props = {
  searchParams: Promise<{ username?: string; platform?: string }>;
};

export default async function ResultsPage({ searchParams }: Props) {
  const params = await searchParams;
  const username = (params.username || "").trim().replace(/^@/, "");
  const platform = params.platform || undefined;
  return <ResultsClient username={username} platform={platform} />;
}
