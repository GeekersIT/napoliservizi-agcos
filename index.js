import KcAdminClient from '@keycloak/keycloak-admin-client';

import config from './config.js';
import database from './database.js';

import express from 'express';
// const express = require("express");
const app = express();
const port = 3000;

// import { SimpleDateFormat } from '@riversun/simple-date-format';
// const SimpleDateFormat = require("@riversun/simple-date-format");
// const sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

import { gql } from 'graphql-request';
// const { gql } = require("graphql-request");

const kcAdminClient = new KcAdminClient.default({
  baseUrl: config.keycloak.url,
  realmName: config.keycloak.realm,
});

// const config = require("./config");
// const database = require("./database");

import bodyParser from 'body-parser';
// var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/_health', (req, res) => {
  res.send({'status': 'ok'}); // Simple health endpoint so kubernetes/other know that service is up and running
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
