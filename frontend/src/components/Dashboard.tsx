import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadTrigger, setUploadTrigger] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [userEmail, setUserEmail] = useState(''); // State for user email
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
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

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserEmail(res.data.email);
    } catch (err) {
      console.error('Error fetching user:', err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchUser(); // Fetch user email on mount
  }, [uploadTrigger]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
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
      setUploadTrigger((prev) => prev + 1);
      setPreview(null);
      setFile(null);
    } catch (err) {
      console.error('Error uploading image:', err.response ? err.response.data : err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    setIsDeleting(imageId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/delete/${imageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Error deleting image:', err.response ? err.response.data : err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard</h2>
      {userEmail && <p>Welcome, {userEmail}!</p>}
      <button onClick={handleLogout} style={{ padding: '5px 10px', margin: '10px 0', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px' }}>
        Logout
      </button>
      <div>
        <input type="file" onChange={handleFileChange} />
        {preview && (
          <div style={{ margin: '10px 0' }}>
            <h4>Preview:</h4>
            <img src={preview} alt="Preview" style={{ width: '200px' }} />
          </div>
        )}
        <button onClick={handleUpload} style={{ padding: '5px 10px', margin: '10px 0' }} disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      <h3>Your Images</h3>
      <ul>
        {images.map((img) => (
          <li key={img.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <img
              src={`http://localhost:5000/images/${img.filename}`}
              alt={img.filename}
              style={{ width: '200px', marginRight: '10px' }}
            />
            <button
              onClick={() => handleDelete(img.id)}
              style={{ padding: '5px 10px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px' }}
              disabled={isDeleting === img.id}
            >
              {isDeleting === img.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;