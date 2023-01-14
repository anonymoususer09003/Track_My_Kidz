const subscription = stompClient.subscribe('/post', function (message) {
    displayIncomingMessage( message.body);
  });


  import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

...

  let timeout = 5000;
  let timeoutCounter = 0;
  const maxTimeoutCounter = 10;

  const connect = () => {

    const ws = new SockJS("http://localhost:8080/socket");
    this.stompClient = Stomp.over(ws);

    let that = this;

    that.stompClient.connect({}, function(frame) {

      that.stompClient.subscribe("/queue/update", (message) => {
        const data = JSON.parse(message.body);
        // Some code here
      });

    }, (error) => {
      timeoutCounter++;

      if (timeoutCounter < maxTimeoutCounter) {
        setTimeout(connect, timeoutCounter * timeout);
      }}
    }