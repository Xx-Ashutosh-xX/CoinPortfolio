function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim().length);
  // Find the header row (should contain "COUNTRY / PERIOD")
  let headerIdx = 0;
  for(let i=0; i<lines.length; ++i) {
    if (lines[i].includes('COUNTRY / PERIOD')) {
      headerIdx = i;
      break;
    }
  }
  const headers = lines[headerIdx].split(',').map(h => h.trim());
  const data = lines.slice(headerIdx+1)
    .map(line => line.split(','))
    .filter(row => row.length === headers.length && row[3] && row[4]); // remove incomplete
  return {headers, data};
}

function unique(arr) {
  return [...new Set(arr)];
}

function getCountry(row) {
  return row[3].trim();
}
function getYear(row) {
  return row[4].trim();
}
function getValue(row) {
  return row[5].trim();
}
function getDescription(row) {
  return row[6].trim();
}
function getMetal(row) {
  return row[7].trim();
}
function getEstValue(row) {
  return row[8].trim() + " " + (row[9]||"").trim();
}

function renderTable(rows, filter) {
  const table = document.getElementById('coins-table').getElementsByTagName('tbody')[0];
  table.innerHTML = '';
  rows.forEach(row => {
    if (filter !== "All" && getCountry(row) !== filter) return;
    const tr = document.createElement('tr');
    [getCountry(row),getYear(row),getValue(row),getDescription(row),getMetal(row),getEstValue(row)]
    .forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function populateFilter(rows) {
  const select = document.getElementById('country-filter');
  const countries = rows.map(getCountry).filter(Boolean);
  unique(countries).sort().forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    select.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  fetch('coins.csv')
    .then(resp => resp.text())
    .then(text => {
      const {data} = parseCSV(text);
      populateFilter(data);
      renderTable(data, 'All');
      document.getElementById('country-filter').addEventListener('change', function() {
        renderTable(data, this.value);
      });
    });
});
