import KcAdminClient from '@keycloak/keycloak-admin-client';

import config from './config.js';
import database from './database.js';
import mysql from 'mysql';

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

app.get('/update', (req, res) => {
  var con = mysql.createConnection({
    host: config.agcos.host,
    port: config.agcos.port,
    database: config.agcos.database,
    user: config.agcos.user,
    password: config.agcos.password
  });
  con.connect(function(err) {
    if (err) return  console.log(err);
    console.log("Connected!");
    con.query('SELECT * FROM view_agcos', async (err, result) => {
      if (err) return  console.log(err);
      console.log("Result: " + JSON.stringify(result[0]));

      const elenco = result.map(element => {
        var data_sinistro = null;
        if(element.data_sinistro != null){
          data_sinistro = new Date(element.data_sinistro);
          if(element.ora_sinistro!=null){
            data_sinistro.setHours(element.ora_sinistro.split(':')[0]);
            data_sinistro.setMinutes(element.ora_sinistro.split(':')[1]);
          }else{
            data_sinistro.setHours(0);
            data_sinistro.setMinutes(0);
          }
        }
        return {
          civico: element.civico+"",
          indicazione_approssimativa: element.indicazione_approssimativa+"",
          latitudine: element.latitudine,
          longitudine: element.longitudine,
          data_sinistro: data_sinistro,
          esito_sentenza: element.esito+"",
          costi_sostenuti: element.costo+"",
          esiste_risarcimento: element.esiste_risarcimento == 1 ? true : false,
          esiste_citazione: element.esiste_citazione == 1 ? true : false,
          esiste_sentenza: element.esiste_sentenza == 1 ? true : false,
          codice_strada: element.codice_strada+"",
          elemento: element.elemento+"",
          causa: element.causa+"",
          scarsa_illuminazione_pubblica: element.flag_scarsa_ill_pubb == 1 ? true : false,
          scarsa_illuminazione_naturale: element.flag_scarsa_ill_nat == 1 ? true : false,
          presenza_foglie: element.flag_presenza_foglie == 1 ? true : false,
          presenza_acqua: element.flag_presenza_acqua == 1 ? true : false,
          altro: element.altro+"",
          danno_persone: element.flag_danno_persone == 1 ? true : false,
          danno_cose: element.flag_danno_cose == 1 ? true : false,
        }
      });

      const del = gql`
      mutation MyMutation {
        delete_agcos_agcos(where: {}) {
          affected_rows
        }
      }
      `;
      await database.queryFetch(del);


      const mutation = gql`
      mutation AgcosUpdate($objects: [agcos_agcos_insert_input!] = {}) {
        insert_agcos_agcos(objects: $objects) {
          affected_rows
        }
      }
      `;
      await database.queryFetch(mutation, {
        objects: elenco
      });

      const update = gql`
      mutation MyMutation {
        update_agcos_import_by_pk(pk_columns: {id: 1}, _set: {id: 1}) {
          id
        }
      }
      `;
      await database.queryFetch(update);

      res.send({'status': 'ok'});
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
