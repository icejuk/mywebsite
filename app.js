const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const port = process.env.PORT || 3000;

// Import the appropriate class
const { WebhookClient } = require('dialogflow-fulfillment');

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({
    success: true,
  });
});

app.post('/webhook', (req, res) => {
  try {
    console.log('POST: /');
    //   console.log('Body: ', req.body);

    //Create an instance
    const agent = new WebhookClient({
      request: req,
      response: res,
    });

    //Test get value of WebhookClient
    console.log('agentVersion: ' + agent.agentVersion);
    console.log('intent: ' + agent.intent);
    console.log('locale: ' + agent.locale);
    console.log('query: ', agent.query);
    console.log('session: ', agent.session);

    //Function Location
    function location(agent) {
      agent.add('Welcome to Thailand.');
    }

    function welcome(agent) {
      console.log('welcome');
      agent.add(`ดีจ้าแม่!`);
    }

    function fallback(agent) {
      console.log('fallback');
      agent.add(`ไม่เข้าใจจ้าแม่ พิมพ์ใหม่อีกครั้ง...`);
    }

    function calBMI(agent) {
      let result = '99 สาธุ!';
      try {
        console.log('calBMI');
        // console.log(1, req.body);
        const weight = req.body.queryResult.parameters.weight;
        const height = req.body.queryResult.parameters.height / 100;
        if (weight && height) {
          const bmi = (weight / (height * height)).toFixed(2);
          result = `BMI ของคุณคือ ${bmi}`;
        }
        agent.add(result);
      } catch (error) {
        agent.add(result);
      }
    }

    function lotto(agent) {
      let result = 'โดนหวยแดกแน่!';
      try {
        console.log('calBMI');
        const number = req.body.queryResult.parameters.number;
        if (number > 6) {
          result = `ใส่เกิน 6 ตัวทำไมง่าาา`;
        } else if (number < 2) {
          result = `เลขท้าย ${number} ไม่มีอยู่จริงจ้า โถ่ว`;
        } else {
          const limit = Math.pow(10, number);
          const ran = Math.floor(Math.random() * limit);
          result = `เลขที่ออกคือ ${ran.toString().padStart(number, '0')} จัดไปจุกๆ`;
        }
        agent.add(result);
      } catch (error) {
        console.log(error);
        agent.add(result);
      }
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);

    intentMap.set('BMI - custom - yes', calBMI);
    intentMap.set('lotto - custom', lotto);

    agent.handleRequest(intentMap);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
