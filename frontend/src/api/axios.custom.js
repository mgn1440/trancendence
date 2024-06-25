import instance from "@/api/axios.instance";

const apiURL = "/api";

/* Auth API */
const axiosAuthURL = `${apiURL}/auth`;
const axiosUserURL = `${apiURL}/user`;

const axiosVerifyOTPURL = `${axiosAuthURL}/otp`;

const axiosUserMeURL = `${axiosUserURL}/me`;

const axiosUserFollowURL = `${axiosUserURL}/follow`;

export const axiosVerfiyOTP = async (otp) => {
  try {
    const response = await instance.post(axiosVerifyOTPURL + "/", { otp });
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserOther = async (username) => {
  try {
    const response = await instance.get(`${axiosUserURL}/${username}`);
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserMe = async () => {
  try {
    const response = await instance.get(axiosUserMeURL);
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserMeConfig = async (config2Change) => {
  try {
    const response = await instance.put(axiosUserMeURL + "/", config2Change);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosDeleteProfileImg = async () => {
  try {
    const response = await instance.delete(axiosUserMeURL);
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosUserDayStat = async ({ username }) => {
  try {
    const response = await instance.get(
      `${axiosUserURL}/${username}/user-day-stat`
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosUserRecentOpponent = async ({ username }) => {
  try {
    const response = await instance.get(
      `${axiosUserURL}/${username}/user-recent-opponent`
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosGameDetail = async ({ gameId }) => {
  try {
    const response = await instance.get(
      `${axiosUserURL}/game-detail/${gameId}`
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosGameRecords = async ({ username, isSingle }) => {
  try {
    if (isSingle === "SINGLE") {
      const response = await instance.get(
        `${axiosUserURL}/${username}/record/single`
      );
      return response;
    } else if (isSingle === "MULTI") {
      const response = await instance.get(
        `${axiosUserURL}/${username}/record/multi`
      );
      return response;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosAvgGameLine = async ({ username }) => {
  try {
    const response = await instance.get(
      `${axiosUserURL}/${username}/average-line`
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosUserFollow = async (user_name) => {
  try {
    const apiURL = axiosUserFollowURL + "/";
    const response = await instance.post(apiURL, {
      following_username: user_name,
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserUnfollow = async (user_name) => {
  try {
    const apiURL = axiosUserFollowURL + "/" + user_name;
    const response = await instance.delete(apiURL);
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserList = async () => {
  try {
    const response = await instance.get(axiosUserFollowURL);
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosUserProfile = async (user_name) => {
  try {
    const response = await instance.get(
      `${axiosUserURL}/${user_name}/profile-image`
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const axiosLogout = async () => {
  try {
    const response = await instance.get(`${axiosUserURL}/logout`);
    return response;
  } catch (error) {
    return error;
  }
};
