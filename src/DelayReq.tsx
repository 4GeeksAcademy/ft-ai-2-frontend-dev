import { useState } from "react";

export default function DelayReq() {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const getData = () => {
    setLoading(true);
    fetch("https://httpbin.io/delay/3")
      .then(resp => resp.json())
      .then(data => {
        setApiData(data);
        setLoading(false);
      })
  }

  return <div className="flex-col">
    <h2>Long-running Request</h2>
    <button disabled={loading} onClick={loading ? () => null : getData}>
      {loading ? "Waiting..." : "Send Request"}
    </button>
    <code>
      {JSON.stringify(apiData)}
    </code>
  </div>;
}
