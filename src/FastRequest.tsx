import { useState } from "react";

interface ApiResp {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

export default function FastRequest() {
  const [apiData, setApiData] = useState<ApiResp | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getData = async () => {
    setLoading(true);
    const resp = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random");
    const data = await resp.json()
    setApiData(data);
    setLoading(false);
  }

  return <div className="flex-col">
    <h2>Fast Request</h2>
    <button disabled={loading} onClick={getData}>
      {loading ? "Waiting..." : "Send Request"}
    </button>
    <p>
      {apiData?.text}
    </p>
  </div>;
}
