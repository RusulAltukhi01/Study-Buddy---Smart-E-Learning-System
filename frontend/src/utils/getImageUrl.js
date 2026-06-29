const BASE_URL = "http://localhost:5000";

export function getImageUrl(picturePath) {
  if (!picturePath || picturePath === "") return null;

  let imagePath = picturePath;
  if (!imagePath.startsWith("/")) imagePath = "/" + imagePath;


  return `${BASE_URL}${imagePath}`;
}