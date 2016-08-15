var endPoint = window.location.origin + '/';

var project = window.location.hash.replace(/^#/,'')
var id = ''
var timestamp = ''
var audio = {}

const csmRegister = function(pf) {
  id = 'VPython' + btoa(random()).substring(1, 10);
  if (pf.is_sim == undefined){
    pf.is_sim = false;
  }
  if (pf.d_name == undefined){
    pf.d_name = pf.dm_name + (floor(Math.random() * 20)).toString();
  }
  $.ajax({
    url: endPoint + id,
    type: 'POST',
    data: JSON.stringify({profile: pf}),
    //dataType: 'json',
    contentType: 'application/json',
    success: function(){
      document.title = pf.d_name;
    },
    error: function(a,b,c){
      alert('register fail');
    }
  });
};


const csmPull = function(df, handler) {
  var value = null;
  var preHandler = function(data){
    if(data.samples.length > 0 && data.samples[0][0] != timestamp){
      timestamp = data.samples[0][0];
      if(data.samples[0][1].length == 1){
        value = data.samples[0][1][0];
      }
      else{
        value = data.samples[0][1];
      }
      console.log(value)
    }
    handler(value);
  }
  $.ajax({
    url: endPoint + id + '/' + df,
    type: 'GET',
    error: function(a, b, c) {handler(value);}
  })
  .done(preHandler);
};

const csmPush = function(df, rawData) {
  jsonData = {'data': rawData};
  $.ajax({
    url: endPoint + id + '/' + df,
    type: 'PUT',
    data: JSON.stringify(jsonData),
    dataType: 'json',
    contentType: 'application/json'
  })
};

const csmDelete = function() {
  $.ajax({
    url: endPoint + id,
    type: 'DELETE'
  })
};

const preloadAudio = function(filename) {
  if (audio[filename] == undefined) {
    audio[filename] = new Audio('/webda/vpython/audio/' + filename);
  }
};

const playAudio = function(filename) {
  preloadAudio(filename);
  if (audio[filename] != undefined) {
    audio[filename].play();
  }
};

const execute = function (code) {
  const options = {
    lang: 'vpython',
    version: 2.1
  };

  const js_code = glowscript_compile(code, options);
  const program = eval(js_code);

  //console.log(js_code);
  program(function(err){
    console.log(err)
  });
};

const fetch_code = function(url){
  fetch(url)
    .then(function(res){
      return res.text();
    })
    .then(execute);
};

window.__context = {
  glowscript_container: $('#glowscript'),
};

//Auto delete
window.onunload = csmDelete;
window.onbeforeunload = csmDelete;
window.onclose = csmDelete;
window.onpagehide = csmDelete;
//first fetch
fetch_code('/webda/vpython/py/'+ project + '.py');

//hashchange handler
$(window).on('hashchange', function() {

  //delete
  csmDelete();

  //clear content and refetch
  $('#glowscript').html('');
  project = window.location.hash.replace(/^#/,'');
  fetch_code('/webda/vpython/py/'+ project + '.py');
});
