import { useParams } from "react-router-dom";
import "../styles/VideoPage.css";

const VideoPage = () => {
  const { id } = useParams();

  return (
    <div className="video-page-container">
      <h2>Video Page</h2>
      <p>Displaying video with ID: {id}</p>
      <video src="http://localhost:5000/uploads/sample-video.mp4" controls width="600" />
    </div>
  );
};

export default VideoPage;