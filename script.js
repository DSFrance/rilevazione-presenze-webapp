
let presenze = JSON.parse(localStorage.getItem("presenze")) || {};
let dipendenti = JSON.parse(localStorage.getItem("dipendenti")) || ["Mario Rossi"];

function aggiornaSelect() {
  const select = document.getElementById("employeeSelect");
  select.innerHTML = "";
  dipendenti.forEach(nome => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = nome;
    select.appendChild(opt);
  });
}
aggiornaSelect();

function addEmployee() {
  const nome = prompt("Nome dipendente:");
  if (nome) {
    dipendenti.push(nome);
    localStorage.setItem("dipendenti", JSON.stringify(dipendenti));
    aggiornaSelect();
  }
}

function salva() {
  const nome = document.getElementById("employeeSelect").value;
  const data = document.getElementById("dateInput").value;
  if (!data) return alert("Inserisci una data");
  const row = {
    entrata: document.getElementById("entrata").value,
    inizioPausa: document.getElementById("inizioPausa").value,
    finePausa: document.getElementById("finePausa").value,
    uscita: document.getElementById("uscita").value,
    note: document.getElementById("note").value,
  };
  const ore = calcolaOre(row);
  row.oreLavorate = ore;

  if (!presenze[nome]) presenze[nome] = {};
  presenze[nome][data] = row;
  localStorage.setItem("presenze", JSON.stringify(presenze));
  mostraPresenze(nome);
}

function mostraPresenze(nome) {
  const table = document.getElementById("presenzeTable");
  const dati = presenze[nome] || {};
  table.innerHTML = "<tr><th>Data</th><th>Entrata</th><th>Inizio Pausa</th><th>Fine Pausa</th><th>Uscita</th><th>Ore</th><th>Note</th></tr>";
  Object.keys(dati).sort().forEach(data => {
    const r = dati[data];
    table.innerHTML += `<tr><td>${data}</td><td>${r.entrata}</td><td>${r.inizioPausa}</td><td>${r.finePausa}</td><td>${r.uscita}</td><td>${r.oreLavorate}</td><td>${r.note}</td></tr>`;
  });
}
document.getElementById("employeeSelect").addEventListener("change", e => mostraPresenze(e.target.value));
mostraPresenze(document.getElementById("employeeSelect").value);

function esporta() {
  const wb = XLSX.utils.book_new();
  dipendenti.forEach(nome => {
    const dati = presenze[nome] || {};
    const rows = [["Data", "Entrata", "Inizio Pausa", "Fine Pausa", "Uscita", "Ore Lavorate", "Note"]];
    Object.keys(dati).sort().forEach(data => {
      const r = dati[data];
      rows.push([data, r.entrata, r.inizioPausa, r.finePausa, r.uscita, r.oreLavorate, r.note]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, nome.substring(0, 31));
  });
  XLSX.writeFile(wb, "PresenzeDipendenti.xlsx");
}

function calcolaOre(r) {
  const toMin = t => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const entrata = toMin(r.entrata);
  const uscita = toMin(r.uscita);
  const pausa = toMin(r.finePausa) - toMin(r.inizioPausa);
  const tot = uscita - entrata - (pausa > 0 ? pausa : 0);
  return tot > 0 ? (tot / 60).toFixed(2) : "0";
}
