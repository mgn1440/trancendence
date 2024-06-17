import { axiosUserProfile } from "@/api/axios.custom";
import { useEffect } from "@/lib/dom";

const TestPage = () => {
  useEffect(() => {
    const fetchUserProfile = async (username) => {
      const profileImg = await axiosUserProfile(username);
      console.log(profileImg);
    };

    fetchUserProfile("hyungjuk");
  }, []);
  return <div>TestPage</div>;
};

export default TestPage;
