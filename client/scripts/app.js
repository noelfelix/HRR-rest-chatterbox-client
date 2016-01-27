var app = {
  //set server;
  username: window.location.search.split('=')[window.location.search.split('=').length - 1],
  room: "your mom's room",
  friendlist: {},
  messageList: [],
  roomlist: {},
  server: "https://api.parse.com/1/classes/chatterbox",
  init: function(){
    app.fetch();
  },
  send: function(message){
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent. Data: ', data);
      }
    })
  },
  fetch: function(){
    $.ajax({
      type: 'GET',
      url: app.server,
      contentType: 'application/json',
      data: {"order": "-createdAt"},
      //get data object from each message
      success: function(data){
        app.clearMessages();
        data = data.results;
        for(var i=0; i<data.length; i++){
          app.messageList.push(data[i]);
          app.addMessage(data[i]);
        }
        //for rooms drop down
        $(".rooms select").children().remove();
        for(var x=0; x<data.length; x++){
          app.roomlist[data[x].roomname] = 1;
        }
        dropDown(app.roomlist, "rooms");
      },
    })
  },
  clearMessages: function(){
    $("#chats").children().remove();
  },
  addMessage: function(message){
    var user = message.username;
    if(message.text){
      message = JSON.stringify(message.text);
    }else if(message.message){
      message = JSON.stringify(message.message);
    }else{
      return 
    }
      var display = $('<div class="message"></div>')
      display.append('<b class="username">' + user + '</b>');
      display.append(':  ')
      if(app.friendlist.hasOwnProperty(user)){
        $('<b>').appendTo(display).append(document.createTextNode(message));
      }else{
        display.append(document.createTextNode(message));
      }
      display.append('<br>')
      $('#chats').append(display);
  },
  addRoom: function(roomName){
    var room = '<option>' + roomName + '</option>';
    $('.rooms select').append(room);
  },
  addFriend: function(friend){
    if(app.friendlist[friend]===undefined){
      app.friendlist[friend] = friend;
      var friendlist = '<option value="friend">' + friend + '</option>';
      $(".friends select").append(friendlist);
    }
  },
  handleSubmit: function(){
    var message = {};
    message["username"] = app.username || 'anonymous';
    message["roomname"] = app.room;
    message["message"] = $('#newMessage').val();
    app.send(message);
    $('#newMessage').val('');
  }
};

//drop down 
function dropDown(collection, id){
    for(var key in collection){
      var room = '<option class="rooms" value="key">' + key + '</option>';
      $("." + id + " select").append(room);
    }
}

function filter(category, key){
  app.clearMessages();
  var collection = app.messageList;
  for(var i = 0; i < app.messageList.length; i++){
    if(app.messageList[i][category] === key){
      app.addMessage(app.messageList[i]);
    }
  }
}

$('#send .submit').submit(function(event){
  event.preventDefault();
  app.handleSubmit();
})

$('#clear').on('click', function(){
  app.clearMessages();
})

$('#load').on('click', function(){
  app.fetch();
})

$('#addroom').on('click', function(){
  var newroom = prompt("Please enter new room name.");
  if(!app.roomlist.hasOwnProperty(newroom)){
    app.addRoom(newroom);
    app.room = newroom;
    app.roomlist[newroom] = 1;
  }
})

$('body').on('click', '.username', function(){
  app.addFriend($(this).text());
})

$('.rooms select').change(function(){
  app.roomname = this.options[this.selectedIndex].text;
  filter("roomname", app.roomname);
})

$('.friends select').change(function(){
  filter("username", this.options[this.selectedIndex].text);
})

app.init(); 

