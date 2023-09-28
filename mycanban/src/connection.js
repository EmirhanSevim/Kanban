const express = require('express');
const { Client } = require('pg');

const app = express();

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'deneme',
  password: '123',
  port: 5432, // PostgreSQL varsayılan portu
});

client
  .connect()
  .then(() => console.log('PostgreSQL Veritabanına Bağlandı'))
  .catch((err) => console.error('PostgreSQL Bağlantı Hatası:', err));
