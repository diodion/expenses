const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  parcela INTEGER NOT NULL,
  total_parcelas INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data DATE NOT NULL
);
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ Table ready"))
  .catch((err) => console.error("❌ Error creating table:", err));

app.post("/expenses", async (req, res) => {
  const { nome, valor, parcela, totalParcelas, categoria, tipo, data } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO expenses (nome, valor, parcela, total_parcelas, categoria, tipo, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, valor, parcela, totalParcelas, categoria, tipo, data]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Falha para inserir gasto:", err);
    res.status(500).json({ error: "Falha para inserir gasto" });
  }
});

app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY data DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Erro para pegar gastos" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Rodando em http://localhost:${port}`);
});
