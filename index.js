// Import stylesheets
import './style.css';
// Import stylesheets
import './style.css';

import jQuery from 'jquery';

var listOfEvents = ``;
var listOfEventsArr = [];
var listOfEventsArrCopy = [];
var groupArrays = [];

var selectedCheckboxes = [];

jQuery(document).ready(function ($) {
  //Assign click event for Checkboxes
  const checkboxes = $('.checkbox');
  for (let checkbox of checkboxes) {
    $(checkbox).click(function ($event) {
      var currentValue = +$event.target.value;
      var isChecked = $event.target.checked;

      if (isChecked) {
        selectedCheckboxes.push(currentValue);
      } else {
        var index = selectedCheckboxes.indexOf(currentValue);
        selectedCheckboxes.splice(index, 1);
      }
      console.warn(`Click: selectedCheckboxes`);
      console.log(selectedCheckboxes.join(','));

      var filteredHTML = getCuratedListOfEvents(true);

      const appDiv = $('#mainContent');
      if (appDiv.length !== 0) {
        appDiv[0].innerHTML = filteredHTML;
      }
    });
  }

  //Assign click event for Filter button
  var container = $('#filterContent');

  $('#filter-button').click(function ($event) {
    $event.stopPropagation();

    if (container.length !== 0) {
      if ($('#filterContent').hasClass('filters--active')) {
        $('#filterContent').removeClass('filters--active');
      } else {
        $('#filterContent').addClass('filters--active');
      }
    }
  });

  container.onclick = function (e) {
    e.stopPropagation();
  };

  if (selectedCheckboxes.length != 0) {
    $('#filterContent').addClass('filters--active');
    $('#filter-button').addClass('button--highlight');
  } else {
    $('#filter-button').removeClass('button--highlight');
  }
});
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

// self executing function here
(function () {
  // your page initialization code here
  // the DOM will be available here
  console.warn('On DOM ready');

  // function getMyCalenderEvents() {
  console.warn('getMyCalenderEvents');
  // Send a GET request for all events in a date range

  var calendarKey = 'ks91nc4hq4vimq69g2';

  const currentDate = new Date();
  const startDateParam = formatDate(currentDate);
  const endDateParam = formatDate(
    currentDate.setDate(currentDate.getDate() + 1)
  );

  //Passing Date range for events
  const url = `https://api.teamup.com/${calendarKey}/events?startDate=${startDateParam}&endDate=${endDateParam}`;

  //Only Todays events
  // const url = `https://api.teamup.com/${calendarKey}/events`;

  showLoader();

  makeCorsRequest(
    url,
    function (xhr) {
      hideLoader();
      var response = JSON.parse(xhr.responseText);
      console.warn('Total no. of Events');
      console.log(response);

      if (response && response['events']) {
        if (response['events'].length !== 0) {
          console.log(response['events'].length);

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

            // const currentDateValue = '2023-09-23T07:00:00+05:30';
            const currentDateStr = new Date().toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            });

            const currentTime =
              new Date().getHours() * 60 + new Date().getMinutes();
            // console.warn('currentTime');
            // console.log(currentTime);

            const startTimeStr = new Date(item.start_dt).toLocaleString(
              'en-US',
              {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              }
            );
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

            //To compare if current Time falls between the event Start and End time and Date is also same then highlight event accordingly
            const isCurrentTimeBetween =
              startTime <= currentTime &&
              currentTime <= endTime &&
              new Date(item.start_dt).getDate() == new Date().getDate();
            // console.warn('isCurrentTimeBetween');
            // console.log(isCurrentTimeBetween);

            const hasEndTimeOfEventAfterCurrentTime =
              currentTime > endTime &&
              new Date(item.start_dt).getDate() == new Date().getDate();

            // console.warn('hasEndTimeOfEventAfterCurrentTime');
            // console.log(hasEndTimeOfEventAfterCurrentTime);

            if (hasEndTimeOfEventAfterCurrentTime) return;

            let calenderColor = '#283842';

            switch (item.subcalendar_id) {
              case 12582899:
                calenderColor = '#2951B9';
                break;
              case 12582900:
                calenderColor = '#B20D47';
                break;
              case 12582894:
                calenderColor = '#CA7609';
                break;

              default:
                break;
            }

            if (!selectedCheckboxes.includes(item.subcalendar_id)) {
              selectedCheckboxes.push(item.subcalendar_id);
            }

            listOfEventsArr.push({
              title: item.title,
              rawStartTime: item.start_dt,
              subcalendar_id: item.subcalendar_id,
              startTimeStr: startTimeStr,
              endTimeStr: endTimeStr,
              calenderColor: calenderColor,
              zoomButtonLink: zoomButtonLink,
              isCurrentTimeBetween: isCurrentTimeBetween,
            });
          }); //end of response['events'].map((item)

          //Create clone of ListOfEvents for filtering
          listOfEventsArrCopy = Object.assign([], listOfEventsArr);

          listOfEvents += getCuratedListOfEvents();
        } //end of if (response['events'].length !== 0)
      } //end of if if (response && response['events'])

      // Write Javascript code!
      const appDiv = document.getElementById('mainContent');
      appDiv.innerHTML = listOfEvents;

      console.warn(`On ready: selectedCheckboxes`);
      console.log(selectedCheckboxes.join(','));
    },
    function (xhr) {
      hideLoader();
      var data = JSON.parse(xhr.responseText);
      console.error(
        'Request failed with code ' + xhr.status + ': ' + JSON.stringify(data)
      );
    }
  );
})(); //end of DOM ready

function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function showLoader() {
  var divLoader = document.getElementById('divLoader');

  if (divLoader) divLoader.style.display = 'block';
}
function hideLoader() {
  if (divLoader) divLoader.style.display = 'none';
}

function getCuratedListOfEvents(isFilter = false) {
  let strHTML = '<ul>';

  if (isFilter) {
    let filteredlistOfEventsArr = [];
    listOfEventsArr = listOfEventsArrCopy;

    selectedCheckboxes.forEach((selectedCheckbox) => {
      if (filteredlistOfEventsArr.length === 0) {
        filteredlistOfEventsArr = listOfEventsArr.filter((item) => {
          return item.subcalendar_id == selectedCheckbox;
        });
      } else {
        filteredlistOfEventsArr = filteredlistOfEventsArr.concat(
          listOfEventsArr.filter((item) => {
            return item.subcalendar_id == selectedCheckbox;
          })
        );
      }
    });

    listOfEventsArr = filteredlistOfEventsArr;

    console.warn(`listOfEventsArr`);
    console.log(listOfEventsArr);
  }

  // this gives an object with dates as keys
  const groups = listOfEventsArr.reduce((groups, game) => {
    const rawStartDate = new Date(game.rawStartTime);
    const date =
      rawStartDate.getDate() +
      ' ' +
      rawStartDate.toLocaleString('default', { month: 'short' }) +
      ' ' +
      rawStartDate.getFullYear();

    if (!groups[date]) {
      groups[date] = [];
      groups[date]['startDate'] = new Date(rawStartDate).getDate();
    }
    groups[date].push(game);
    return groups;
  }, {});

  // Edit: to add it in the array format instead
  groupArrays = Object.keys(groups).map((date) => {
    return {
      date,
      startDate: groups[date]['startDate'],
      events: groups[date],
    };
  });

  console.warn('groupArrays');
  console.log(groupArrays);

  groupArrays.forEach((group, index) => {
    strHTML += `${
      group.startDate === new Date().getDate()
        ? `<h4><i>Today</i> — ${group.date}</h4>`
        : `<h4> ${group.date}</h4>`
    }`;

    group.events.forEach((item) => {
      const liStyle = `style="color:${item.calenderColor}"`;

      const liveIndicatorBlock = `<span class="live-indicator-block">
    <span class="live-indicator">
    <span class="indicator online"></span>
    <span style="padding: 2px;
       vertical-align: top;">Live</span>
    </span>
    </span>`;
      if (item.isCurrentTimeBetween) {
        strHTML += `<li ${liStyle}> ${liveIndicatorBlock} <span class="spanStyle">${item.startTimeStr} - ${item.endTimeStr}</span> &emsp; ${item.title} <span class="spanStyle"> &ensp;|&ensp; ${item.zoomButtonLink}</span></li>`;
      } else {
        strHTML += `<li ${liStyle}><span class="spanStyle">${item.startTimeStr} - ${item.endTimeStr}</span> &emsp; ${item.title} <span class="spanStyle"> &ensp;|&ensp; ${item.zoomButtonLink}</span></li>`;
      }
    });
  });

  strHTML += '</ul>';

  var button = document.getElementById('filter-button');

  if (selectedCheckboxes.length != 0) {
    button.classList.add('button--highlight');
  } else {
    button.classList.remove('button--highlight');
  }

  return strHTML;
}
