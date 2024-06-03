import NotFoundPage from "../not-found";
import MainPage from "../pages/Main";
import LobbyPage from "../pages/Lobby";
import RoomPage from "../pages/GameRoom";
import GamePage from "../pages/Game";
import TwoFactorAuthPage from "../pages/TwoFactorAuth";
import ProfilePage from "../pages/Profile";
import ProfileConfigPage from "../pages/ProfileConfig";


export const routes = [
  {
    path: "/",
    element: MainPage,
    errorElement: NotFoundPage,
    children: [
      {
        path: "2fa",
        element: TwoFactorAuthPage,
        children: [],
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
        path: "profile",
        children: [
          {
            path: "me",
            element: ProfilePage,
          },
          {
            path: ":id",
            element: ProfilePage,
            children: [
              {
                path: "config",
                element: ProfileConfigPage,
              },
            ],
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
      // {
      //   path: "test",
      //   element: TestPage,
      // },
    ],
  },
];
