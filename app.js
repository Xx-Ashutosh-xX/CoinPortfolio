let globalData = []; // will hold original CSV data for sorting/filtering

function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim().length);
  let headerIdx = lines.findIndex(l => l.toLowerCase().includes('country'));
  if (headerIdx === -1) return { headers: [], data: [] };
  const headers = lines[headerIdx].split(',').map(h => h.trim());
  const data = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim());

    // Handle description field containing commas (join excess parts)
    if (parts.length > headers.length) {
      const beforeDesc = parts.slice(0, 4);
      const afterDesc = parts.slice(5);
      const descParts = parts.slice(4, parts.length - afterDesc.length);
      const description = descParts.join(',');
      parts.length = 0;
      parts.push(...beforeDesc, description, ...afterDesc);
    }
    
    if (!parts[1]) continue; // Skip rows without country

    data.push(parts);
  }
  return { headers, data };
}

function unique(arr) {
  return [...new Set(arr)];
}

function renderTable(data, filter) {
  const tbody = document.getElementById('coins-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  data.forEach(row => {
    if (filter !== 'All' && row[1] !== filter) return;
    const tr = document.createElement('tr');
    [
      row[1] || '-',  // Country
      row[2] || '-',  // Year
      row[3] || '-',  // Denomination
      row[4] || '-',  // Description
      row[5] || '-',  // Metal
      row[6] || '-',  // Value 2025
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
  const countries = data.map(r => r[1]).filter(Boolean);
  unique(countries).sort().forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}

function sortData(data, order) {
  const sorted = [...data];
  sorted.sort((a, b) => {
    const valA = parseFloat(a[6]) || 0; // "Value AS ON 2025"
    const valB = parseFloat(b[6]) || 0;
    if (order === 'asc') return valA - valB;
    if (order === 'desc') return valB - valA;
    return 0;
  });
  return sorted;
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('coins.csv')
    .then(response => response.text())
    .then(text => {
      const { data } = parseCSV(text);
      globalData = data;

      populateFilter(globalData);

      let currentFilter = 'All';
      let currentSortOrder = 'none';

      function updateTable() {
        let filteredSortedData = globalData;
        if (currentSortOrder !== 'none') {
          filteredSortedData = sortData(globalData, currentSortOrder);
        }
        renderTable(filteredSortedData, currentFilter);
      }

      updateTable();

      document.getElementById('country-filter').addEventListener('change', function () {
        currentFilter = this.value;
        updateTable();
      });

      document.getElementById('price-sort').addEventListener('change', function () {
        currentSortOrder = this.value;
        updateTable();
      });
    })
    .catch(err => {
      console.error("Error loading CSV: ", err);
      alert("Failed to load coins.csv! Make sure it's in the right folder and named correctly.");
    });
});
