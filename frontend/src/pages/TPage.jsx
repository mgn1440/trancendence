import { useEffect, useState, useRef } from "@/lib/dom";
import { axiosUserMe } from "@/api/axios.custom";
import { isEmpty } from "@/lib/libft";

const TestPage = () => {
  const [getRef, setRef] = useRef(0);
  const [testState, setTestState] = useState(0);

  return (
    <div>
      <button
        onclick={() => {
          setRef(getRef() + 1);
          if (getRef() % 3 === 0) {
            setTestState(testState + 1);
          }
        }}
      >
        Click!
      </button>
      <h3>state: {testState}</h3>
      <h3>ref: {getRef()}</h3>
    </div>
  );
};

// const Loader = () => {
// const TestPage = () => {
//   useEffect(() => {
//     const modalElement = document.getElementById("exampleModal");
//     const handleModalHidden = () => {
//       console.log("modal hidden");
//     };

//     modalElement.addEventListener("hidden.bs.modal", handleModalHidden);

//     return () => {
//       modalElement.removeEventListener("hidden.bs.modal", handleModalHidden);
//     };
//   }, []);
//   const handleLoaderOpen = () => {
//     const loader = new bootstrap.Modal(document.getElementById("exampleModal"));
//     loader.show();
//   };
//   return (
//     <div>
//       <button
//         type="button"
//         class="btn btn-primary"
//         // data-bs-toggle="modal"
//         // data-bs-target="#exampleModal"
//         onclick={handleLoaderOpen}
//       >
//         Launch demo modal
//       </button>

//       <div
//         class="modal fade"
//         id="exampleModal"
//         tabindex="-1"
//         aria-labelledby="exampleModalLabel"
//         aria-hidden="true"
//       >
//         <div class="modal-dialog">
//           <div class="modal-content">
//             <div class="loader">
//               <span></span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const TestPage = () => {
//   const [myProfile, setMyProfile] = useState({});
//   const [roomList, setRoomList] = useState([]);
//   const [lobbySocket, setLobbySocket] = useRef({});
//   useEffect(() => {
//     const fetchProfile = async () => {
//       const userMe = await axiosUserMe();
//       setMyProfile(userMe.data);
//     };
//     fetchProfile();
//   }, []);

//   useEffect(() => {
//     const socketAsync = async () => {
//       const socket = new WebSocket("ws://" + "localhost:8000" + "/ws/lobby/");

//       socket.onopen = (e) => {};

//       socket.onmessage = (e) => {
//         const data = JSON.parse(e.data);

//         console.log(data); // debug
//         if (data.type === "room_list") {
//           setRoomList(data.rooms);
//         } else if (data.type === "join_approved") {
//           window.location.href = `/lobby/${data.host}`;
//         } else if (data.type === "join_denied") {
//           alert(data.message);
//         } else if (data.type === "password_required") {
//           let enterModal = new bootstrap.Modal(
//             document.getElementById("PswdRoomModal")
//           );
//           enterModal.show();
//         } else if (data.type === "matchmaking_waiting") {
//           console.log("matchmaking_waiting"); //debug
//         } else if (data.type === "goto_matchmaking_game") {
//           gotoPage(`/game/${data.host}`);
//         }
//       };

//       while (socket.readyState !== WebSocket.OPEN) {
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }
//       setLobbySocket(socket);
//     };
//     socketAsync();
//   }, []);
//   return <div>{isEmpty(myProfile) ? null : <Loader />}</div>;
// };

export default TestPage;
