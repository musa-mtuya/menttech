'use strict';

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  app = express().use(bodyParser.json()),
  PORT = 80;// creates express http server

// Sets server port and logs message on success
app.listen(PORT, () => console.log('webhook is listening on port '+ PORT));


// Question Index
let questionIndex;
var questionResponses = [];
var questions = [
  "Hello, firstly I would like you to know that all your provided answers are highly confidential unless I need to connect you with a mental health specialist. Can I proceed?",
  "What is your Age?",
  "Are you a male or a female?",
  "What is your marital status? ",
  "Where do you live?",
  "You have not been able to stop or control worrying in the past weeks?",
  "You have been restless that it’s always hard for you to sit still?",
  "You often feel afraid that something awful might happen?",
  "You have trouble concentrating on things such as reading the newspapers or watching television?",
  "You have been having trouble falling or staying asleep, or sleeping too much? ",
  "You have been feeling down, sad or hopeless?",
  "You have been having little or no interest or in doing day to day activities? "
]


app.get('/', (req,res) => {
  res.send('Hello Menttech Ai!')
});


// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        
        handlePostback(sender_psid, webhook_event.postback);
      }
      
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "menttechai";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;
  
  // Checks if the message contains text
  if (received_message.text) {   
     
    // Create the payload for a basic text message, which
    // will be added to the body of our request to the Send API
    saveQuestionResponse(questionIndex,received_message.text);
    let nextquesstion = questionIndex + 1;

    if(nextquesstion >= questions.length) {
      response = {
        "text": JSON.stringify(questionResponses)
      }
    }else {
      response = {
        "text": questions[nextquesstion]
      }
    }
    
  } else if (received_message.attachments) {
    nextquesstion = nextquesstion - 1;
    response = {
      "text": questions[nextquesstion]
    }
    // Get the URL of the message attachment
    //let attachment_url = received_message.attachments[0].payload.url;
    // response = {
    //   "attachment": {
    //     "type": "template",
    //     "payload": {
    //       "template_type": "generic",
    //       "elements": [{
    //         "title": "Is this the right picture?",
    //         "subtitle": "Tap a button to answer.",
    //         "image_url": attachment_url,
    //         "buttons": [
    //           {
    //             "type": "postback",
    //             "title": "Yes!",
    //             "payload": "yes",
    //           },
    //           {
    //             "type": "postback",
    //             "title": "No!",
    //             "payload": "no",
    //           }
    //         ],
    //       }]
    //     }
    //   }
    // }
  } 
  
  // Send the response message
  callSendAPI(sender_psid, response);    
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok')
   let response;
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  // if (payload === 'yes') {
  //   response = { "text": "Thanks!" }
  // } else if (payload === 'no') {
  //   response = { "text": "Oops, try sending another image." }
  // }

  if(payload == 'get_started'){
    response = {
      "text": questions[0]
    }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}




function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }




  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": 'EAAKUimKicTsBAGVMDS2ZC5ZACWzEYEdc8ZCPZAShHJAlZCXQD6hA84SeX1doxNAHPrlMQYZBSog8wOaCtMum03BaH9KtYJTVgfAjF5koq3gXDsaaYwJCerdEef68ZCEuG9ZClIWqmBpYG6tt2s0JMAuuDEkoJny6eGZBTuTIbM8CGXW9E2DAwY4IB' },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}





// function sendQuestion(index) {
// let response;
//   response = {
//     "attachment": {
//       "type": "template",
//       "payload": {
//         "template_type": "generic",
//         "elements": [{
          
//           // "buttons": [
//           //   {
//           //     "type": "postback",
//           //     "title": "Yes!",
//           //     "payload": "yes",
//           //   },
//           //   {
//           //     "type": "postback",
//           //     "title": "No!",
//           //     "payload": "no",
//           //   }
//           // ],
//         }]
//       }
//     }
//   }
// }



function saveQuestionResponse(questionIndex,response) {
  questionResponses.push({
    "question": questions[questionIndex],
    "response": response
  });
}