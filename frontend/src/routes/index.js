import NotFoundPage from "../not-found";
import MainPage from "../pages/Main";
import LobbyPage from "../pages/Lobby";
import RoomPage from "../pages/GameRoom";
import GamePage from "../pages/Game";
import TwoFactorAuthPage from "../pages/TwoFactorAuth";
// import TestPage from "../pages/Test";

export const routes = [
  {
    path: "/",
    element: MainPage,
    errorElement: NotFoundPage,
    children: [
      {
        path: "TwoFactorAuth",
        element: TwoFactorAuthPage,
        children: []
      },
      {
        path: "lobby",
        element: LobbyPage,
        children: [
          {
            path: ":id",
            element: RoomPage,
          },
        ],
      },
      {
        path: "game",
        children: [
          {
            path: ":id",
            element: GamePage,
          },
        ],
      },
      {
        path: "test",
        element: TestPage,
      },
    ],
  },
];
