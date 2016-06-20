jQuery (document).ready (function () {
  var timeStamp;
  var timeStampOld;
  var fromBulb       = makepull (da.serverUrl, da.daKey);
  var getLuminance   = fromBulb ((da.profile.df_list)[0], adjustLight);
  var toBulb         = makepush (da.serverUrl, da.daKey);
  function setLuminance () {
    var luminance = [$(this).data('luminance')];
    var buttonColor = [$(this).data('buttonColor')];
    $(this).css ({"background": '#' + buttonColor});
    toBulb(da.profile.df_list[0], luminance, function(){})();
  }
  function adjustLight (msg) { 
    var new_luminance = msg['data'][0];
    var timeStamp = msg['timestamp'];
    if (timeStamp != timeStampOld) {
      timeStampOld = timeStamp;
      if (new_luminance == null) {
        current_luminance = 0;
        $(bulbBackground).css({'background': 'white'});
      } else {
        new_luminance = Math.floor(parseFloat(new_luminance[0]) * 4);
        console.log('Current luminance:', current_luminance);
        console.log('Input luminance:', new_luminance);
        current_luminance += new_luminance;
        console.log('New luminance:', current_luminance);
        if (current_luminance <= 0) {
            current_luminance = 0;
        } else if (current_luminance > 15) {
            current_luminance = 15;
        }

        var luminanceNext = (15 - current_luminance).toString(16);
        $(bulbBackground).css({'background': '#ffff' + luminanceNext + luminanceNext});
      }
    }
  };

  
    
  $.ajax({
     type: 'POST',
     url: da.serverUrl,
     dataType: 'json',  
     data: da.profile,
	 headers: {"Access-Control-Allow-Origin": "*"},
	 crossDomain: true,
//  'method': 'GET',
//    'url':    da.serverUrl + 'create/' + da.daKey + '?profile=' + JSON.stringify(da.profile),
  }).error(function (body) {console.log(body);});

  $('.adjust li').mouseover (setLuminance)
    .mouseleave (function () {
      $(this).css({'background-color': '#CCFFFF'});
    });

//  setInterval(getLuminance, 1000);
//  setInterval(decreaseLuminance, 1000);
  jQuery(window).bind('beforeunload',deleteDA);
});

