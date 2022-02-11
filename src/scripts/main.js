import configuration from './config.js';
import view from './view.js';

const platformClient = require('platformClient');
const client = platformClient.ApiClient.instance;

// API Instances
let analyticsApi = new platformClient.AnalyticsApi();
let usersApi = new platformClient.UsersApi();
let interval;


// Event Handler
document.getElementById("agentsList").addEventListener("change", function () {
  let table = document.getElementById("userTable");
  table.innerHTML = "";
  let selectedUserId = agentsList.options[agentsList.selectedIndex].value;
  generateUserData(selectedUserId);
}, false)

// Initial Setup
client.setEnvironment(configuration.genesysCloud.region);
document.addEventListener('DOMContentLoaded', function () {
  client.loginImplicitGrant(configuration.clientID, configuration.redirectUri)
    .then(() => {
      getDate();
      formatDate();
      getCurrentUserData();
      getChatInteractions();
      getNumberofCalls();
      abandonedCalls();
      getNumberofAnsweredCall();
      getNumberofVoiceOutbound();
      getNumberofVoiceInbound();
      populateUsers();
     

    })
    .catch((err) => console.error(err));
}, false);

function getCurrentUserData() {

  let opts = {};

  
  usersApi.getUsersMe(opts)
    .then((data) => {
      let name = data.name;
      view.displayUserData(name)
    })
}

function formatDate() {

  let formattedDate = interval;
  formattedDate = formattedDate.replace("T", " ");
  formattedDate = formattedDate.replace("Z", "");
  formattedDate = formattedDate.replace("/", " to ");
  let formattedFrom = formattedDate.slice(0,10);
  let formattedTo = formattedDate.slice(26,37);
  view.viewDate(formattedFrom,formattedTo)
  

}

// Change the date to the user's desired date.
function getDate() {

  interval = "2021-03-31T16:00:00.000Z/2021-04-29T16:00:00.000Z"

}

function getNumberofCalls() {

  let body = {
    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: 25,
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "voice"
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofCalls(data.totalHits)
    
    })
}

function getChatInteractions() {

  let body = {

    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: "100",
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "chat"
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofChat(data.totalHits) 

    })
}

function abandonedCalls() {

  let body = {

    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: 25,
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "voice"
      }]
    }],
    conversationFilters: [{
      type: "or",
      predicates: [{
        type: "metric",
        metric: "tAbandon",
        range: {
          gte: 1
        }
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofAbandoned(data.totalHits) 
    })
}

function getNumberofAnsweredCall() {
  let body = {
    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: 25,
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "voice"
      }]
    }],
    conversationFilters: [{
      type: "and",
      predicates: [{
        type: "metric",
        metric: "tAnswered",
        range: {
          gte: 1
        }
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofAnswered(data.totalHits) 
    })
}


function getNumberofVoiceOutbound() {
  let body = {
    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: "100",
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "direction",
        operator: "matches",
        value: "outbound"
      }, {
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "voice"
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofVoiceOutbound(data.totalHits);
   
    })
}


function getNumberofVoiceInbound() {
  let body = {
    interval: interval,
    order: "asc",
    orderBy: "conversationStart",
    paging: {
      pageSize: "100",
      pageNumber: 1
    },
    segmentFilters: [{
      type: "and",
      predicates: [{
        type: "dimension",
        dimension: "direction",
        operator: "matches",
        value: "inbound"
      }, {
        type: "dimension",
        dimension: "mediaType",
        operator: "matches",
        value: "voice"
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsConversationsDetailsQuery(body)
    .then((data) => {
      view.displayNumberofVoiceInbound(data.totalHits);
      
    })
}

function populateUsers() {

 
  let body = {
    "sortOrder": "ASC",
    "pageSize": 100
  }; // Object | Search request options

  usersApi.postUsersSearch(body)
    .then((data) => {
      view.displayNumberofUsers(data);

    })
}

function generateUserData(selectedUserId) {

  let body = {
    interval: interval,
    order: "asc",
    paging: {
      pageSize: 25,
      pageNumber: 1
    },
    userFilters: [{
      type: "or",
      predicates: [{
        type: "dimension",
        dimension: "userId",
        operator: "matches",
        value: selectedUserId
      }]
    }]
  }; // Object | query

  analyticsApi.postAnalyticsUsersDetailsQuery(body)
    .then((data) => {
      for (const results of data.userDetails[0].primaryPresence) {
        view.populateUsertable(results)
      }

    })
}
