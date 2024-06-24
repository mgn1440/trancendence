import NotFoundPage from "../not-found";
import MainPage from "../pages/Main";
import LobbyPage from "../pages/Lobby";
import RoomPage from "../pages/GameRoom";
import GamePage from "../pages/Game";
import TwoFactorAuthPage from "../pages/TwoFactorAuth";
import ProfilePage from "../pages/Profile";
import ProfileConfigPage from "../pages/ProfileConfig";
import TournamentPage from "../pages/Tournament";
import CustomTournamentPage from "../pages/CustomTournament";
import CustomGamePage from "../pages/CustomGamePage";
import LocalGamePage from "../pages/LocalGamePage";
import TestPage from "@/pages/TPage";

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
            children: [
              {
                path: "config",
                element: ProfileConfigPage,
              },
            ],
          },
          {
            path: ":id",
            element: ProfilePage,
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
      {
        path: "tournament",
        children: [
          {
            path: ":id",
            element: TournamentPage,
          },
        ],
      },
      {
        path: "custom",
        children: [
          {
            path: ":id",
            element: CustomGamePage,
          },
        ],
      },
      {
        path: "customTournament",
        children: [
          {
            path: ":id",
            element: CustomTournamentPage,
          },
        ],
      },
      {
        path: "local",
        children: [
          {
            path: ":id",
            element: LocalGamePage,
          },
        ],
      },
    ],
  },
];
