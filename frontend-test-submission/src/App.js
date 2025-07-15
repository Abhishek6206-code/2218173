import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('http://localhost:3001/list');
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const shortenUrl = async () => {
    try {
      const response = await fetch('http://localhost:3001/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      setShortUrl(data.shortUrl);
      setUrl('');
      fetchUrls();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStats = async (code) => {
    try {
      const response = await fetch(`http://localhost:3001/stats/${code}`);
      const data = await response.json();
      setStats({...stats, [code]: data});
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <h1>URL Shortener</h1>
      
      <div className="shorten-form">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to shorten"
        />
        <button onClick={shortenUrl}>Shorten</button>
      </div>

      {shortUrl && (
        <div className="result">
          <p>Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a></p>
        </div>
      )}

      <div className="urls-list">
        <h2>All URLs</h2>
        {urls.map((item) => (
          <div key={item.code} className="url-item">
            <div>
              <strong>Original:</strong> {item.url}
            </div>
            <div>
              <strong>Short:</strong> <a href={`http://localhost:3001/${item.code}`} target="_blank" rel="noopener noreferrer">localhost:3001/{item.code}</a>
            </div>
            <div>
              <strong>Clicks:</strong> {item.clicks}
            </div>
            <button onClick={() => getStats(item.code)}>Show Stats</button>
            {stats[item.code] && (
              <div className="stats">
                <p>Created: {new Date(stats[item.code].created).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
