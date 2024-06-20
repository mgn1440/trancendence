import { axiosUserProfile } from "@/api/axios.custom";
import { useEffect } from "@/lib/dom";

const dataURItoBlob = (dataURI) => {
  const binary = atob(dataURI.split(",")[1]);
  const array = [];

  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
};

const cropImage = async (img, width, height) => {
  const cropSize = width > height ? height : width;

  const canvas = document.querySelector(".canvas");
  canvas.width = cropSize;
  canvas.height = cropSize;
  console.log(canvas.width, canvas.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, cropSize, cropSize, 0, 0, cropSize, cropSize);

  let file = dataURItoBlob(
    await new Promise((resolve) => {
      resolve(canvas.toDataURL("image/jpeg"));
    })
  );

  const baseSize = 512000;
  const compSize = 25600;

  if (file.size >= baseSize) {
    const ratio = Math.ceil(Math.sqrt(file.size / compSize, 2));
    canvas.width /= ratio;
    canvas.height /= ratio;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      0,
      0,
      cropSize,
      cropSize,
      0,
      0,
      canvas.width,
      canvas.height
    );

    file = dataURItoBlob(
      await new Promise((resolve) => {
        resolve(canvas.toDataURL("image/jpeg"));
      })
    );
  }

  console.log(file);
  const url = URL.createObjectURL(file);
  console.log(url);

  return url;
};

const TestPage = () => {
  useEffect(() => {
    const fetchUserProfile = async (username) => {
      const profileImg = await axiosUserProfile(username);
      console.log(profileImg);
    };

    fetchUserProfile("hyungjuk");
  }, []);

  useEffect(() => {
    const realUpload = document.querySelector(".real-upload");
    realUpload.addEventListener("change", (e) => {
      const file = e.currentTarget.files[0];

      if (!file) {
        return;
      }
      if (!file.type.match("image/*")) {
        alert("Only Image file can be uploaded.");
        return;
      }
      const img = document.createElement("img");
      const cropImg = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const { width, height } = img;
        cropImg.src = await cropImage(img, width, height);
        const frame = document.querySelector(".frame");
        frame.appendChild(cropImg);
      };
      // console.log(typeof file, file);
    });
  }, []);

  const uploadHandler = () => {
    const realUpload = document.querySelector(".real-upload");
    realUpload.click();
  };
  return (
    <div>
      <input
        type="file"
        class="real-upload"
        accept="image/*"
        required
        style="display: none"
      />
      <button class="config-btn bg-red" onclick={uploadHandler}>
        Upload
      </button>
      <div class="frame"></div>
      <canvas class="canvas"></canvas>
    </div>
  );
};

export default TestPage;
