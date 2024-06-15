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
    console.log(error);
    return error;
  }
};

export const axiosGameRecords = async ({ username, isSingle }) => {
  try {
    console.log(username);
    if (isSingle === "SINGLE") {
      const response = await instance.get(
        `${axiosUserURL}/${username}/record/single`
      );
      console.log(response);
      return response;
    } else if (isSingle === "MULTI") {
      const response = await instance.get(
        `${axiosUserURL}/${username}/record/multi`
      );
      console.log(response);
      return response;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const axiosUserFollow = async (user_name) => {
  try {
    const apiURL = axiosUserFollowURL + "/";
    const response = await instance.post(apiURL, { "following_username" : user_name });
    return response;
  } catch (error) {
    return error;
  }
}

export const axiosUserUnfollow = async (user_name) => {
  try {
    const apiURL = axiosUserFollowURL + "/" + user_name;
    const response = await instance.delete(apiURL);
    return response;
  } catch (error) {
    return error;
  }
}

export const axiosUserList = async () => {
  try {
    const response = await instance.get(axiosUserFollowURL);
    return response;
  } catch (error) {
    return error;
  }
}
