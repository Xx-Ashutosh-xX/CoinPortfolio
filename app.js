function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim().length);
  // Find header row with "PERIOD/COUNTRY"
  let headerIdx = lines.findIndex(l => l.toLowerCase().includes('period/country'));
  if (headerIdx === -1) return {headers:[], data:[]};
  const headers = lines[headerIdx].split(',').map(h => h.trim());
  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; ++i) {
    const parts = lines[i].split(',').map(p => p.trim());
    // Skip if country is empty
    if (!parts[2]) continue;
    rows.push(parts);
  }
  return {headers, data: rows};
}

function unique(arr) {
  return [...new Set(arr)];
}

function renderTable(data, filter) {
  const tbody = document.getElementById('coins-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';
  data.forEach(row => {
    // adapt indices per your csv: country = 2, year = 3, denom = 4, desc = 5, metal = 6, value = 7
    if (filter !== 'All' && row[2] !== filter) return;
    const tr = document.createElement('tr');
    [
      row[2] || '-', // Country
      row[3] || '-', // Year
      row[4] || '-', // Denomination
      row[5] || '-', // Description
      row[6] || '-', // Metal
      row[7] || '-', // Value 2025
    ].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function populateFilter(data) {
  const select = document.getElementById('country-filter');
  const countries = data.map(r => r[2]).filter(Boolean);
  unique(countries).sort().forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('coins.csv')
    .then(resp => resp.text())
    .then(text => {
      const { data } = parseCSV(text);
      populateFilter(data);
      renderTable(data, 'All');
      document.getElementById('country-filter').addEventListener('change', function() {
        renderTable(data, this.value);
      });
    });
});
