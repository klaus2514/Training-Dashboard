import { useParams } from "react-router-dom";

const VideoPage = () => {
  const { id } = useParams(); // Get video ID from URL

  return (
    <div>
      <h2>Video Page</h2>
      <p>Displaying video with ID: {id}</p>
      <video src="http://localhost:5000/uploads/sample-video.mp4" controls width="600" />
    </div>
  );
};

export default VideoPage;
