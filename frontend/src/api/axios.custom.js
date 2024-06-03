import instance from "@/api/axios.instance";

const apiURL = "/api";

/* Auth API */
const axiosAuthURL = `${apiURL}/auth`;

const axiosVerifyOTPURL = `${axiosAuthURL}/otp`;
export const axiosVerfiyOTP = async (otp) => {
  try {
    const response = await instance.post(axiosVerifyOTPURL, { otp });
    return response;
  } catch (error) {
    return error;
  }
};
