// Import stylesheets
import './style.css';

// Creates a CORS request in a cross-browser manner
function createCORSRequest(method, url) {
  var apiKey =
    'd835b37beb748a92356e6eab167768baa4ef5832f6fd98c4d1f0b82583648cdb';
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari/IE10+.
    xhr.open(method, url, true);
    xhr.setRequestHeader('Teamup-Token', apiKey);
  } else if (typeof XDomainRequest != 'undefined') {
    // XDomainRequest for IE8/IE9.
    xhr = new XDomainRequest();
    // XDomainRequest does not support querying HTTPS from HTTP pages
    if (window.location.protocol === 'http:') {
      url = url.replace('https://', 'http://');
    }
    if (-1 === ['GET', 'POST'].indexOf(method)) {
      alert('XDomainRequest only supports GET and POST methods');
      return;
    }
    if (-1 === url.indexOf('?')) {
      url += '?_teamup_token=' + apiKey;
    } else {
      url += '&_teamup_token=' + apiKey;
    }
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// Sends the actual CORS request.
function makeCorsRequest(url, successCallback, errorCallback) {
  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function (xhr) {
    if (xhr.target.status < 400) {
      if (successCallback) successCallback(xhr.target);
    } else if (errorCallback) {
      errorCallback(xhr.target);
    }
  };
  xhr.onerror = function (xhr) {
    if (errorCallback) {
      errorCallback(xhr.target);
    }
  };

  xhr.send();
}

// function getMyCalenderEvents() {
console.warn('getMyCalenderEvents');
// Send a GET request for all events in a date range

var calendarKey = 'ks91nc4hq4vimq69g2';
var url = `https://api.teamup.com/${calendarKey}/events`;

makeCorsRequest(
  url,
  function (xhr) {
    var response = JSON.parse(xhr.responseText);
    console.warn('Total no. of Events');

    var listOfEvents = ``;

    if (response && response['events']) {
      if (response['events'].length !== 0) {
        console.log(response['events'].length);

        listOfEvents = '<ul>';
        let parser = new DOMParser();

        response['events'].map((item) => {
          ////////////////Create Zoom button link////////////////
          var htmlDoc = parser.parseFromString(item.notes, 'text/html');
          var zoomButtonLink = '';

          if (htmlDoc && htmlDoc.getElementsByTagName('p')) {
            zoomButtonLink = htmlDoc.getElementsByTagName('p')[0].innerHTML;

            // console.warn('zoomButtonLink');
            // console.log(zoomButtonLink);
          }
          ////////////////Create Zoom button link////////////////

          const currentDateValue = '2023-09-23T07:00:00+05:30';
          const currentDateStr = new Date(currentDateValue).toLocaleString(
            'en-US',
            {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }
          );

          const currentTime =
            new Date(currentDateValue).getHours() * 60 +
            new Date(currentDateValue).getMinutes();
          // console.warn('currentTime');
          console.log(currentTime);

          const startTimeStr = new Date(item.start_dt).toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          const startTime =
            new Date(item.start_dt).getHours() * 60 +
            new Date(item.start_dt).getMinutes();
          // console.warn('startTime');
          // console.log(startTime);

          const endTimeStr = new Date(item.end_dt).toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          const endTime =
            new Date(item.end_dt).getHours() * 60 +
            new Date(item.end_dt).getMinutes();
          // console.warn('endTime');
          // console.log(endTime);

          //To compare if current Time falls between the event Start and End time and highlight event accordingly
          const isCurrentTimeBetween =
            startTime <= currentTime && currentTime <= endTime;
          console.warn('isCurrentTimeBetween');
          console.log(isCurrentTimeBetween);

          if (isCurrentTimeBetween) {
            listOfEvents += `<li> <span style="background-color:#c5e1a5">${startTimeStr} - ${endTimeStr} | ${item.title}</span> | ${zoomButtonLink}</li>`;
          } else {
            listOfEvents += `<li>${startTimeStr} - ${endTimeStr} | ${item.title} | ${zoomButtonLink}</li>`;
          }
        }); //end of response['events'].map((item)

        listOfEvents += '</ul>';
      } //end of if (response['events'].length !== 0)
    } //end of if if (response && response['events'])

    // Write Javascript code!
    const appDiv = document.getElementById('app');
    appDiv.innerHTML = listOfEvents;
  },
  function (xhr) {
    var data = JSON.parse(xhr.responseText);
    console.error(
      'Request failed with code ' + xhr.status + ': ' + JSON.stringify(data)
    );
  }
);
// }
