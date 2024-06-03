document.addEventListener("DOMContentLoaded", function() {
    const friendListElement = document.getElementById("friend-list");
    const socket = new WebSocket("ws://your-websocket-url");

    // 친구 목록 가져오기
    fetch("http://localhost:8000/api/user/friend")
        .then(response => response.json())
        .then(friends => {
            friends.forEach(friend_list => {
                const friendItem = document.createElement("li");
                friendItem.className = "friend-item";
                friendItem.innerHTML = `<span class="status-dot"></span>${friend_list.nickname}`;
                friendListElement.appendChild(friendItem);
            });
        })
        .catch(error => console.error("Error fetching friends:", error));

    // 웹소켓 연결 및 메시지 처리
    socket.addEventListener("message", function(event) {
        const data = JSON.parse(event.data);
        if (data.type === "status") {
            const onlineFriends = data.online;
            const offlineFriends = data.offline;

            document.querySelectorAll(".friend-item").forEach(item => {
                const nickname = item.textContent;
                const statusDot = item.querySelector(".status-dot");

                if (onlineFriends.includes(nickname)) {
                    statusDot.style.backgroundColor = "green";
                } else if (offlineFriends.includes(nickname)) {
                    statusDot.style.backgroundColor = "red";
                }
            });
        }
    });

    // 웹소켓 연결 오류 처리
    socket.addEventListener("error", function(error) {
        console.error("WebSocket Error:", error);
    });

    // 웹소켓 연결 닫힘 처리
    socket.addEventListener("close", function() {
        console.log("WebSocket connection closed");
    });
});