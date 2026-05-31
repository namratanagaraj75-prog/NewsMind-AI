import { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

function App() {
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const summarizeNews = async () => {
    if (!article.trim()) {
      alert("Please enter article");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/summarize", {
        article,
      });

      setData(response.data.data);
    } catch (error) {
      console.error(error);
      alert("Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const downloadReport = () => {
    if (!data) return;

    const report = `
NEWSMIND AI REPORT

50 WORD SUMMARY
${data.summary50}

100 WORD SUMMARY
${data.summary100}

KEY HIGHLIGHTS
${data.highlights.join("\n")}

IMPORTANT FACTS
${data.facts.join("\n")}

SEO HEADLINES
${data.seoHeadlines.join("\n")}

SOCIAL MEDIA POST
${data.socialPost}

ESTIMATED READING TIME
${data.readingTime}
`;

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    saveAs(blob, "NewsMindAI_Report.txt");
  };

  const loadSampleArticle = () => {
    setArticle(`
India's Ministry of Railways on Monday announced the launch of a new high-speed rail corridor connecting Bengaluru, Chennai, and Hyderabad.

The project, estimated to cost ₹1.2 lakh crore, aims to significantly reduce travel time between the three major cities and improve regional economic connectivity.

According to government officials, trains on the corridor will operate at speeds of up to 320 km/h, reducing travel time between Bengaluru and Chennai to less than two hours.

Construction is expected to begin in early 2027 and will be completed in phases over the next eight years.

The project is expected to generate thousands of direct and indirect jobs during both construction and operation.

Authorities stated that the corridor will incorporate advanced signaling systems, renewable energy integration, and modern passenger amenities.

Experts believe the rail network could boost tourism, attract investments, and encourage the growth of industrial clusters along the route.

However, some environmental groups have raised concerns about land acquisition, ecological impact, and displacement of local communities.

The government has assured that environmental assessments will be conducted and compensation packages will be provided to affected residents.
`);
  };

  const clearAll = () => {
    setArticle("");
    setData(null);
  };

  const wordCount =
    article.trim() === "" ? 0 : article.trim().split(/\s+/).length;

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto p-6">
          <h1 className="text-4xl font-bold">NewsMind AI</h1>

          <p className="text-slate-400">AI Editorial & Summarization Suite</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 p-5 rounded-xl">
            <p className="text-slate-400">Words</p>
            <h2 className="text-3xl font-bold">{wordCount}</h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl">
            <p className="text-slate-400">Reading Time</p>
            <h2 className="text-3xl font-bold">{readingTime} min</h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl">
            <p className="text-slate-400">Characters</p>
            <h2 className="text-3xl font-bold">{article.length}</h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl">
            <p className="text-slate-400">Generated Sections</p>
            <h2 className="text-3xl font-bold">7</h2>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">News Article Input</h2>

          <textarea
            rows="8"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            className="w-full bg-slate-800 p-4 rounded-xl"
            placeholder="Paste article..."
          />

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={summarizeNews}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              {loading ? "Generating..." : "Generate Summary"}
            </button>

            <button
              onClick={loadSampleArticle}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg"
            >
              Sample Article
            </button>

            <button
              onClick={clearAll}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-8 grid gap-5">
            <div className="flex justify-end">
              <button
                onClick={downloadReport}
                className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg"
              >
                📥 Download Report
              </button>
            </div>

            <Card
              title="50 Word Summary"
              content={data.summary50}
              copyText={copyText}
            />

            <Card
              title="100 Word Summary"
              content={data.summary100}
              copyText={copyText}
            />

            <ListCard title="Key Highlights" items={data.highlights} />

            <ListCard title="Important Facts" items={data.facts} />

            <ListCard title="SEO Headlines" items={data.seoHeadlines} />

            <Card
              title="Social Media Post"
              content={data.socialPost}
              copyText={copyText}
            />

            <Card
              title="Estimated Reading Time"
              content={data.readingTime}
              copyText={copyText}
            />
          </div>
        )}
      </div>

      <footer className="text-center text-slate-500 py-10">
        <p>Powered by Gemini 2.5 Flash</p>
        <p>Built with React, Node.js, Express & Google GenAI</p>
        <p className="mt-2">NewsMind AI © 2026</p>
      </footer>
    </div>
  );
}

function Card({ title, content, copyText }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-bold text-blue-400">{title}</h3>

        <button
          onClick={() => copyText(content)}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
        >
          📋 Copy
        </button>
      </div>

      <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg">
      <h3 className="text-xl font-bold text-blue-400 mb-4">{title}</h3>

      <ul className="space-y-2">
        {items?.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
