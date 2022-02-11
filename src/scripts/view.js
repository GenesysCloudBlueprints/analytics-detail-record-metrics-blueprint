const view = {

  displayUserData(name) {
    document.getElementById('userName').innerHTML = name;
  },

  viewDate(formattedFrom, formattedTo) {
    document.getElementById('date').innerHTML = "Data from " + formattedFrom + " to " + formattedTo;
  },

  displayNumberofCalls(totalHits) {
    document.getElementById('numberofCalls').innerHTML = totalHits;
  },

  displayNumberofChat(totalHits) {
    document.getElementById('chatInteractionsNumber').innerHTML = totalHits;
  },

  displayNumberofAbandoned(totalHits) {
    document.getElementById('numberofAbandonedCalls').innerHTML = totalHits;
  },

  displayNumberofAnswered(totalHits) {
    document.getElementById('numberofAnsweredCalls').innerHTML = totalHits;
  },

  displayNumberofVoiceOutbound(totalHits) {
    document.getElementById('numberofOutbound').innerHTML = totalHits;
  },

  displayNumberofVoiceInbound(totalHits) {
    document.getElementById('numberofInbound').innerHTML = totalHits;
  },

  displayNumberofUsers(data) {
    let agents = document.getElementById('agentsList');

    for (const results of data.results) {
      let newOption = document.createElement('option');
      let optionText = document.createTextNode(results.name);
      newOption.appendChild(optionText);
      newOption.setAttribute('value', results.id);
      agents.appendChild(newOption);
    }
  },


  populateUsertable(results) {
    let agents = document.getElementById('userTable');
    let row = document.createElement("tr");

    for (const [key] of Object.entries(results)) {

      let cell;
      let text = "";
      let cellText = "";

      if (key != "organizationPresenceId") {

        if (key == "startTime") {
          text = results.startTime;
          text = text.replace("T", " ");
          text = text.replace("Z", "");
          text = text.slice(0, 19);
        }

        if (key == "endTime") {
          text = results.endTime;
          text = text.replace("T", " ");
          text = text.replace("Z", "");
          text = text.slice(0, 19);
        }

        if (key == "systemPresence") {
          text = results.systemPresence;
        }
        cell = document.createElement("td");
        cellText = document.createTextNode(text);
        cell.appendChild(cellText);
        row.appendChild(cell)
        agents.appendChild(row);
      }
    }
  }

}

export default view