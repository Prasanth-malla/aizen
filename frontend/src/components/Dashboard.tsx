import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token being sent:', token); // Add this for debugging
        const res = await axios.get('http://localhost:5000/images', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setImages(res.data);
      } catch (err) {
        console.error('Error fetching images:', err.response ? err.response.data : err.message);
      }
    };
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const res = await axios.get('http://localhost:5000/images', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setImages(res.data);
    } catch (err) {
      console.error('Error uploading image:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ padding: '5px 10px', margin: '10px 0' }}>
        Upload Image
      </button>
      <h3>Your Images</h3>
      <ul>
        {images.map((img) => (
          <li key={img.id}>
            <img
              src={`http://localhost:5000/images/${img.filename}`}
              alt={img.filename}
              style={{ width: '200px', margin: '10px 0' }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;