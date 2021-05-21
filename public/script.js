const myName = prompt("Please Enter Your Name");

// show loading state
const loading = document.createElement("div");
const spin = document.createElement("div");
loading.setAttribute("class", "d-flex loading");
spin.classList.add("loading_spinner");

loading.appendChild(spin);
document.body.appendChild(loading);

const socket = io("/");
const peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com',
    secure: true
});

const peers = {};
const videoGrid = document.getElementById("video-grid");
const videoText = document.createElement("div");
const videoItem = document.createElement("div");
videoItem.classList.add("video__item");
videoText.classList.add("video__name");
videoItem.append(videoText);

const video = document.createElement("video");
video.muted = true;

const mediaConfig = {
  video: true,
  audio: true,
};

peer.on("open", (id) => {
  if (loading) loading.remove();

  socket.emit("join-room", ROOM_ID, { id, name: myName });

  navigator.mediaDevices
  .getUserMedia(mediaConfig)
    .then((stream) => {
      addClickListeners(stream);

      addVideoStream(video, stream, id, myName);

      peer.on("call", (call) => {
        call.answer(stream);

        const video = document.createElement("video");
        call.on("stream", (userStream) => {
          const userId = call.peer;
          const userName = call.metadata.name;

          log(`User connected - ID: ${userId}, Name: ${userName}`);
          addVideoStream(video, userStream, userId, userName);
        });
      });

      socket.on("user-connected", ({ id, name }) => {
        log(`User connected - ID: ${id}, Name: ${name}`);
        connectToNewUser({ id, name }, stream);
      });
    })
    // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('')
      }
    });
    socket.on("createMessage", message => {
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom()
    })
});

socket.on("user-disconnected", ({ id, name }) => {
  log(`User disconnected - ID: ${id}, Name: ${name}`);

  const video = document.getElementById(id);
  if (video) {
    video.parentElement.remove();
  }

  if (peers[id]) peers[id].close();
});

function connectToNewUser({ id, name }, stream) {
  const call = peer.call(id, stream, { metadata: { name: myName } });

  const video = document.createElement("video");
  call.on("stream", (userStream) => {
    addVideoStream(video, userStream, id, name);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[id] = call;
}

function addVideoStream(video, stream, id, name) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  const clonedItem = videoItem.cloneNode(true);
  clonedItem.children[0].innerHTML = name;
  clonedItem.append(video);

  videoGrid.append(clonedItem);

  // weird error cleanup
  const nodes = document.querySelectorAll(".video__item") || [];
  nodes.forEach((node) => {
    if (node.children && node.children.length < 2) {
      node.remove();
    }
  });
}

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

function addClickListeners(stream) {
  const pause = document.getElementById("pause-video");
  const mute = document.getElementById("mute-video");
  pause.addEventListener("click", () => {
    stream.getTracks().forEach((t) => {
      if (t.kind === "video") {
        t.enabled = !t.enabled;
        pause.innerHTML = t.enabled ? `<i class="fas fa-video"></i><span>Stop Video</span>` : `<i class="stop fas fa-video-slash"></i><span>Start Video</span>`;
      }
    });
  });
  mute.addEventListener("click", () => {
    stream.getTracks().forEach((t) => {
      if (t.kind === "audio") {
        t.enabled = !t.enabled;
        mute.innerHTML = t.enabled ? `<i class="fas fa-microphone"></i><span>Mute</span>` : `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`;
      }
    });
  });
}

const shareScreen = async () => {

    const socket = io('/')
    const videoGrid = document.getElementById('video-grid');
    const videoText = document.createElement("div");
    const videoItem = document.createElement("div");
    videoItem.classList.add("video__item");
    videoText.classList.add("video__name");
    videoItem.append(videoText);
    const peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com',
    secure: true
    })
  const myVideo2 = document.createElement('video')
  myVideo2.muted = true;
  const peers = {}

  peer.on("open", (id) => {
    if (loading) loading.remove();
    socket.emit("join-room", ROOM_ID, { id, name: myName });

  navigator.mediaDevices.getDisplayMedia({
    video: true
  }).then(stream => {
    myVideoStream = stream;
      addVideoStream(myVideo2, stream, id, myName);
      peer.on("call", (call) => {
        call.answer(stream);

        const video2 = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          const userId = call.peer;
          const userName = call.metadata.name;

          log(`User connected - ID: ${userId}, Name: ${userName}`);
          addVideoStream(video2, userVideoStream, userId, userName);
        });
      });

    socket.on("user-connected", ({ id, name }) => {
      log(`User connected - ID: ${id}, Name: ${name}`);
      connectToNewUser({ id, name }, stream);
    });

  })
});

  socket.on("user-disconnected", ({ id, name }) => {
    log(`User disconnected - ID: ${id}, Name: ${name}`);

    const video = document.getElementById(id);
    if (video) {
      video.parentElement.remove();
    }

    if (peers[id]) peers[id].close();
  });

  function connectToNewUser(id, stream) {
    const call = peer.call(id, stream, { metadata: { name: myName } });

    const video2 = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userStream, id, name);
    });
    call.on("close", () => {
      video.remove();
    });

    peers[id] = call;

  }

  function addVideoStream(video2, stream) {
    video2.srcObject = stream;
    video2.addEventListener("loadedmetadata", () => {
      video2.play();
    });

    const clonedItem2 = videoItem.cloneNode(true);
    clonedItem2.children[0].innerHTML = name;
    clonedItem2.append(video2);

    videoGrid.append(clonedItem2);
videoGrid.append(video2);
    // weird error cleanup
    const nodes = document.querySelectorAll(".video__item") || [];
    nodes.forEach((node) => {
      if (node.children && node.children.length < 2) {
        node.remove();
      }
    });
  }

};



function log(text) {
  console.info(text);
}
