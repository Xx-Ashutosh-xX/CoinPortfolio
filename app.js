let globalData = [];

function clean(value) {
  return value ? value.trim().replace(/^-+$/, "").replace(/^"|"$/g, "") : "";
}

function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim().length);
  let headerIdx = lines.findIndex(l => l.toLowerCase().includes('country'));
  if (headerIdx === -1) return { headers: [], data: [] };
  const headers = lines[headerIdx].split(',').map(h => h.trim());
  const data = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    let parts = lines[i].split(',').map(p => p.trim());
    // Handle commas in description field (if parts length > expected 8)
    if (parts.length > headers.length) {
      const beforeDesc = parts.slice(0, 4);
      const afterDesc = parts.slice(5);
      const descParts = parts.slice(4, parts.length - afterDesc.length);
      parts = [...beforeDesc, descParts.join(','), ...afterDesc];
    }
    if (!clean(parts[2])) continue; // Skip if country missing (index 2)
    data.push(parts);
  }
  return { headers, data };
}

function unique(arr) {
  return [...new Set(arr)];
}

function populateFilters(data) {
  const countrySel = document.getElementById('country-filter');
  const yearSel = document.getElementById('year-filter');
  const metalSel = document.getElementById('metal-filter');

  const countries = {};
  const years = {};
  const metals = {};

  data.forEach(r => {
    const c = clean(r[2]);
    const y = clean(r[3]);
    const m = clean(r[6]);

    if (c && c.toLowerCase() !== "country" && c !== "-") countries[c] = true;
    if (y && y.toLowerCase() !== "mint year" && y !== "-") years[y] = true;
    if (m && m.toLowerCase() !== "metal" && m !== "-") metals[m] = true;
  });

  // Helper to add options
  function fillOptions(select, values) {
    // Remove except for "All"
    [...select.querySelectorAll('option:not([value="All"])')].forEach(opt => opt.remove());
    [...Object.keys(values)].sort((a,b)=>a.localeCompare(b, undefined, {numeric:true}))
      .forEach(v => {
        const opt = document.createElement('option');
        opt.value = v; opt.textContent = v;
        select.appendChild(opt);
      });
  }

  fillOptions(countrySel, countries);
  fillOptions(yearSel, years);
  fillOptions(metalSel, metals);
}

function renderTable(data, filters) {
  const tbody = document.getElementById('coins-table').getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  data.forEach(row => {
    if (filters.country !== 'All' && row[2] !== filters.country) return;
    if (filters.year !== 'All' && row[3] !== filters.year) return;
    if (filters.metal !== 'All' && row[6] !== filters.metal) return;

    const tr = document.createElement('tr');
    // Render columns: Coin Location(1), Country(2), Year(3), Denomination(4), Desc(5), Metal(6), Value(7)
    [
      row[1] || '-',
      row[2] || '-',
      row[3] || '-',
      row[4] || '-',
      row[5] || '-',
      row[6] || '-',
      row[7] || '-'
    ].forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function sortData(data, order) {
  const sorted = [...data];
  sorted.sort((a,b) => {
    const valA = parseFloat(a[7].replace(/[^\d.-]/g,'')) || 0; // Remove $ or other symbols
    const valB = parseFloat(b[7].replace(/[^\d.-]/g,'')) || 0;
    if(order === 'asc') return valA - valB;
    if(order === 'desc') return valB - valA;
    return 0;
  });
  return sorted;
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('coins.csv')
    .then(resp => resp.text())
    .then(text => {
      const { data } = parseCSV(text);
      globalData = data;
      populateFilters(globalData);
      let filters = { country: 'All', year: 'All', metal: 'All' };
      let sortOrder = 'none';

      function update() {
        let filteredSorted = globalData;
        if(sortOrder !== 'none'){
          filteredSorted = sortData(filteredSorted, sortOrder);
        }
        renderTable(filteredSorted, filters);
      }

      update();

      document.getElementById('country-filter').addEventListener('change', e => {
        filters.country = e.target.value;
        update();
      });
      document.getElementById('year-filter').addEventListener('change', e => {
        filters.year = e.target.value;
        update();
      });
      document.getElementById('metal-filter').addEventListener('change', e => {
        filters.metal = e.target.value;
        update();
      });
      document.getElementById('price-sort').addEventListener('change', e => {
        sortOrder = e.target.value;
        update();
      });
    })
    .catch(err => {
      console.error("Error loading CSV:", err);
      alert("Error loading coins.csv. Please ensure it is in the correct folder and correctly formatted.");
    });
});
