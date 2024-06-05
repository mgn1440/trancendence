import instance from "@/api/axios.instance";

const apiURL = "/api";

/* Auth API */
const axiosAuthURL = `${apiURL}/auth`;
const axiosUserURL = `${apiURL}/user`;

const axiosVerifyOTPURL = `${axiosAuthURL}/otp`;

const axiosUserMeURL = `${axiosUserURL}/me`;

export const axiosVerfiyOTP = async (otp) => {
  try {
    const response = await instance.post(axiosVerifyOTPURL, { otp });
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

export const axiosUserOther = async (username) => {
  try {
    const apiURL = axiosUserURL + "/" + username;
    const response = await instance.get(apiURL);
    return response;
  } catch (error) {
    return error;
  }
}