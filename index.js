// Import stylesheets
import './style.css';

// declate Jquery variable
import jQuery from 'jquery';
var $ = jQuery;

var listOfEvents = ``;
var listOfEventsArr = [];
var listOfEventsArrCopy = [];
var groupArrays = [];

var selectedCheckboxes = [];
//Jquery ready function
jQuery(function ($) {
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

  //Change icon of Filter button based on checkboxes selected
  applyStylingBasedOnCheckboxesSelected();

  // Get the modal
  var modalFilter = document.getElementById('modalFilter');
  var modalDetails = document.getElementById('modalDetails');

  // When the user clicks the button, open the modal
  $('#filter-button').click(function () {
    $('#modalFilter').fadeIn(150).show();
  });

  // When the user clicks on <span> (x), close the modal
  $('.close').click(function () {
    $('#modalFilter').fadeOut(150).hide();
    $('#modalDetails').fadeOut(150).hide();
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modalFilter || event.target == modalDetails) {
      $('#modalFilter').fadeOut(150).hide();
      $('#modalDetails').fadeOut(150).hide();
    }
  };
}); //end of jQuery(document).ready

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

  var calendarKey = 'ks8ftmzv9zw938fxfk';

  const noOfDaysFromTomorrow = 0;
  const currentDate = new Date();
  const startDateParam = formatDate(currentDate);
  const endDateParam = formatDate(
    currentDate.setDate(currentDate.getDate() + noOfDaysFromTomorrow)
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

          response['events'].map((item, index) => {
            ////////////////Create Zoom button link////////////////
            var htmlNotes = parser.parseFromString(item.notes, 'text/html');
            var modalContent = '';

            if (htmlNotes) {
              modalContent =
                htmlNotes.getElementsByTagName('body')[0].innerHTML;
            }

            var zoomButtonLink = '';
            var youtubeButtonLink = '';
            if (item.custom) {
              if (item.custom.zoom_link) {
                zoomButtonLink = item.custom.zoom_link;
              }
              if (item.custom.youtube_link) {
                youtubeButtonLink = item.custom.youtube_link;
              }
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

            let calenderColor = '#2951B9';
            let calenderLabel = 'English Meditations';

            const validCalenersArr = [
              9551817, 9613432, 7897161, 9533536, 11986948,
            ];

            switch (item.subcalendar_id) {
              case 9551817:
                calenderColor = '#2951B9';
                calenderLabel = 'English Meditations';
                break;

              case 9613432:
                calenderColor = '#B20D47';
                calenderLabel = 'Hindi Meditations';
                break;

              case 7897161:
                calenderColor = '#CA7609';
                calenderLabel = 'Sannyasi-led Events';
                break;

              case 9533536:
                calenderColor = '#176413';
                calenderLabel = 'Indian Language Meditations';
                break;

              case 11986948:
                calenderColor = '#B84E9D';
                calenderLabel = 'Study Groups in English & Indian Languages';
                break;

              default:
                break;
            }

            //To check if selectedCheckboxes does not have subcalendar_id to avoid duplicates
            if (!selectedCheckboxes.includes(item.subcalendar_id)) {
              //To check if subcalendar_id matches with Valid Calender configured
              if (validCalenersArr.includes(item.subcalendar_id)) {
                selectedCheckboxes.push(item.subcalendar_id);
              }
            }

            //To check if subcalendar_id matches with Valid Calender configured then push in listOfEventsArr
            if (validCalenersArr.includes(item.subcalendar_id)) {
              listOfEventsArr.push({
                id: index,
                title: item.title,
                rawStartTime: item.start_dt,
                subcalendar_id: item.subcalendar_id,
                startTimeStr: startTimeStr,
                endTimeStr: endTimeStr,
                calenderLabel: calenderLabel,
                calenderColor: calenderColor,
                zoomButtonLink: zoomButtonLink,
                youtubeButtonLink: youtubeButtonLink,
                isCurrentTimeBetween: isCurrentTimeBetween,
                modalContent: modalContent,
              });
            }
          }); //end of response['events'].map((item)

          //Create clone of ListOfEvents for filtering
          listOfEventsArrCopy = Object.assign([], listOfEventsArr);

          listOfEvents += getCuratedListOfEvents();
        } //end of if (response['events'].length !== 0)
        else {
          listOfEvents = hideCalenderFiltersAndGetErrorHTML();
        }
      } //end of if if (response && response['events'])
      else {
        listOfEvents = hideCalenderFiltersAndGetErrorHTML();
      }

      // Write Javascript code!
      const appDiv = document.getElementById('mainContent');
      appDiv.innerHTML = listOfEvents;

      // Create filter list on the fly
      const ulcheckboxList = document.getElementById('ulcheckboxList');
      ulcheckboxList.innerHTML = getFilters();

      console.warn(`On ready: selectedCheckboxes`);
      console.log(selectedCheckboxes.join(','));

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

          // When the user clicks the button, open the modal
          assignClickForModal();
        });
      }
      //Assign click event for Checkboxes

      // When the user clicks the button, open the modal
      assignClickForModal();

      // Create filter list on the fly for Modal popup
      const ulcheckboxListModal = document.getElementById(
        'ulcheckboxListModal'
      );
      ulcheckboxListModal.innerHTML = getFilters('modal');

      //Assign click event for Checkboxes in Modal popup
      const modalCheckboxes = $('.modalcheckbox');
      for (let checkbox of modalCheckboxes) {
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

          // When the user clicks the button, open the modal
          assignClickForModal();
        });
      }
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

//To format for group
function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// To display loader animation
function showLoader() {
  var divLoader = document.getElementById('divLoader');

  if (divLoader) divLoader.style.display = 'block';
}

// To hide loader animation
function hideLoader() {
  if (divLoader) divLoader.style.display = 'none';
}

// To get curated List of Events based on filters checkboxes applied
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

    //Sort the array by Date
    listOfEventsArr = listOfEventsArr.sort(function (a, b) {
      return new Date(a.rawStartTime) - new Date(b.rawStartTime);
    });

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
      const calenderStyle = `style="color:${item.calenderColor}"`;

      const liveIndicatorBlock = `<span class="live-indicator-block">
    <span class="live-indicator">
    <span class="indicator online"></span>
    <span style="padding: 2px;
       vertical-align: top;">Live</span>
    </span>
    </span>`;

      let buttonLinks = '';
      const zoomButtonLinkHTML = item.zoomButtonLink
        ? `<a href=${item.zoomButtonLink} target="_blank" rel="nofollow" class="joinButtonLink">
        <span>
        <i aria-hidden="true" class="fas fa-video joinButtonIcon" style="color: #fff;"></i> </span>
        <span style="color: #fff;">Join via Zoom</span>
        </a>`
        : '';

      if (zoomButtonLinkHTML) {
        buttonLinks = zoomButtonLinkHTML;
      }
      const youtubeButtonLinkHTML = item.youtubeButtonLink
        ? `<a href=${item.youtubeButtonLink} target="_blank" rel="nofollow" class="joinButtonLink">
        <span>
        <i aria-hidden="true" class="fab fa-youtube joinButtonIcon" style="color: #fff;"></i> </span>
        <span style="color: #fff;">Join via YouTube</span>
        </a>`
        : '';

      if (youtubeButtonLinkHTML) {
        buttonLinks += `&ensp;&ensp;` + youtubeButtonLinkHTML;
      }

      if (item.isCurrentTimeBetween) {
        strHTML += `<li> 
         <p ${calenderStyle}> ${liveIndicatorBlock} ${item.calenderLabel}</p>
         <p id="${item.id}" class="title">${item.title}</p>
         <p class="joinButtonPara"><span class="spanStyle spanjoinTime">${item.startTimeStr} - ${item.endTimeStr}</span> &ensp; <span class="spanStyle spanjoinButton"> ${buttonLinks} </span></p></li>`;
      } else {
        strHTML += `<li>
         <p ${calenderStyle}>${item.calenderLabel}</p>
         <p id="${item.id}" class="title">${item.title}</p>
         <p class="joinButtonPara"><span class="spanStyle spanjoinTime">${item.startTimeStr} - ${item.endTimeStr}</span> &ensp; <span class="spanStyle spanjoinButton"> ${buttonLinks} </span></p></li>`;
      }
    });
  });

  strHTML += '</ul>';

  var button = document.getElementById('filter-button');

  //Change icon of Filter button based on checkboxes selected
  applyStylingBasedOnCheckboxesSelected();

  return strHTML;
}

// To get curated List of Events based on filters checkboxes applied
function getFilters(className = '') {
  let strHTML = '<ul class="checkboxList">';

  selectedCheckboxes.forEach((selectedCheckbox, index) => {
    let checkboxColor = '#2951B9';
    let checkboxLabel = 'English Meditations';

    switch (selectedCheckbox) {
      case 9551817:
        checkboxColor = '#2951B9';
        checkboxLabel = 'English Meditations';
        break;

      case 9613432:
        checkboxColor = '#B20D47';
        checkboxLabel = 'Hindi Meditations';
        break;

      case 7897161:
        checkboxColor = '#CA7609';
        checkboxLabel = 'Sannyasi-led Events';
        break;

      case 9533536:
        checkboxColor = '#176413';
        checkboxLabel = 'Indian Language Meditations';
        break;

      case 11986948:
        checkboxColor = '#B84E9D';
        checkboxLabel = 'Study Groups in English & Indian Languages';
        break;

      default:
        break;
    }

    strHTML += `<li>
          <input
            type="checkbox"
            class="${className}checkbox"
            id="${className}cb${index}"
            value="${selectedCheckbox}"
            checked="true"
          /><label class="${className}chkLabel"  for="${className}cb${index}"
          style="color: ${checkboxColor}" >${checkboxLabel}</label
          >
        </li>`;
  });

  strHTML += '</ul>';
  return strHTML;
}

function assignClickForModal() {
  $('p.title').click(function ($event) {
    const id = $event.target.id;
    const foundEvent = listOfEventsArr.find((x) => x.id == id);

    if (foundEvent) {
      foundEvent.modalContent;
      const modalContentDetails = document.getElementById(
        'modalContentDetails'
      );

      modalContentDetails.innerHTML = '';

      const paraCalenderLabel = document.createElement('p');
      paraCalenderLabel.style.color = foundEvent.calenderColor;
      paraCalenderLabel.textContent = foundEvent.calenderLabel;
      paraCalenderLabel.classList.add('modal-calenderLabel');

      modalContentDetails.append(paraCalenderLabel);
      modalContentDetails.innerHTML += foundEvent.modalContent;

      // $('.modal-header-details').css(
      //   'background-color',
      //   foundEvent.calenderColor
      // );

      $('#modalDetails').fadeIn(150).show();
    }
  });
}

function applyStylingBasedOnCheckboxesSelected() {
  if (selectedCheckboxes.length != 0) {
    $('.filterButtonIcon').removeClass('iconOutline');
    $('#filter-button').attr('data-count', selectedCheckboxes.length);
  } else {
    $('.filterButtonIcon').addClass('iconOutline');
    $('#filter-button').attr('data-count', selectedCheckboxes.length);
  }
}

function hideCalenderFiltersAndGetErrorHTML() {
  $('.left').hide();
  $('.right-btn').hide();

  const strHTML = `<h4 style="
  color: grey !important;
  text-align: center !important;
"><i class="fa fa-solid fa-exclamation"></i> Sorry, No events found.</h4>`;
  return strHTML;
}
