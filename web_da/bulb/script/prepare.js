bulbBackground = ".bulb-top, .bulb-middle-1, .bulb-middle-2, .bulb-middle-3, .bulb-bottom, .night"

var da = {
'daKey': 'defema',
'serverUrl': 'http://openmtc.darkgerm.com:9999/',
//'serverUrl': 'http://127.0.0.1:9999/',
'profile': {
  'd_name': 'myBulb',
  'dm_name': 'Bulb',
  'u_name': 'yb',
  'is_sim': false,
  'df_list': ['Luminance']
  }
};

var current_luminance = 0;

function makepush (serverUrl, daKey)
{
  return function (feature, data, done) {
    var command  = serverUrl + 'push/' + daKey + '/' + feature + '?data=' + JSON.stringify(data);
    return function () {
      $.ajax ({
        'method': 'GET',
        'url':    command,
      }).done(done);
    }
  };
}

function makepull (serverUrl, daKey)
{
  return function (feature, done) {
    var command  = serverUrl + 'pull/' + daKey + '/' + feature;
    return function () {
      $.ajax ({
        'method': 'GET',
        'url':    command,
      }).done(done);
    }
  };
}

function deleteDA ()
{
  $.ajax({
    'method': 'GET',
    'url':    da.serverUrl + 'delete/' + da.daKey,
    'async': false,
  }).done(function(msg){alert(msg);});
}

function hexc(colorval) {
  var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
      parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
  color = '#' + parts.join('');
  return color;
}

function decreaseLuminance () {
   var DECAY_INDEX = 4;
   current_luminance -= DECAY_INDEX;
   if (current_luminance <= 0) {
     current_luminance = 0;
   }
   var luminanceStr = (15 - current_luminance).toString(16);
   $(bulbBackground).css({'background': '#ffff' + luminanceStr + luminanceStr});
}
