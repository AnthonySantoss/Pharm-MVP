import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/interactions')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h1>Interações Medicamentosas (pharmIA)</h1>
      <ul>
        {data.map((item, idx) => (
          <li key={idx}>{item['Drug 1']} + {item['Drug 2']}: {item['Interaction Description']}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
