const express = require('express')
const app = express()
const port = 3000
const cors = require('cors');

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded());

require('dotenv').config({path: '.env'})

const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env['API_TOKEN'] }).base(process.env['AIRTABLE_APP']);
const table = base(process.env['AIRTABLE_NAME']);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/airtable/:userCode', (req, res) => {

  const getRecords = async () => {
    try {
      const records = await table.select({ filterByFormula: `{User_Code} = "${req.params.userCode}"`, }).firstPage();
      let rec = records[0];
      // console.log(rec["fields"]);
      // console.log(rec["id"]);
      res.send({"records": rec["fields"], "Id": rec["id"]});
    } catch (error) {
      console.log("error", error);
      res.send(error);
    }
  };

  getRecords();
  // this.axios
  //   .get(`https://api.airtable.com/v0/${airTableApp}/${airTableName}`, {
  //     headers: { Authorization: "Bearer " + apiToken },
  //   })
  //   .then((response) => {
  //     console.log("succece!!!");

  //   })
  //   .catch((error) => {
  //     console.log("error!!!");
  //   });

  // res.status(200).json({ message: 'OK' });
});

app.get('/updateAT/:id', (req, res) => {
  let data = JSON.parse(req.query.data);
  // console.log(data['fields']);
  // console.log(req.params.id);

  const minifyRecord = (record) => {
    return {
        id: record.id,
        fields: record.fields,
    }
  }

  const updateRecord = async (id, fields) => {
    try {
      const updateRecord = await table.update(id, fields);
      console.log(minifyRecord(updateRecord));
      res.send({ message: "OK" });
    } catch (error) {
      res.send(error);
    }
  }

  updateRecord(req.params.id, data['fields']);

});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})