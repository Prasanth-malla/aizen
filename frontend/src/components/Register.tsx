import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    console.log('Attempting to register with:', { email, password });
    try {
      const response = await axios.post('http://localhost:5000/register', { email, password });
      console.log('Registration successful:', response.data);
      navigate('/');
    } catch (err) {
      console.error('Registration failed with error:', err.response ? err.response.data : err.message);
      alert('Registration failed: ' + (err.response ? err.response.data.msg : err.message));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Register</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ margin: '10px 0', padding: '5px' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ margin: '10px 0', padding: '5px' }}
      />
      <button onClick={handleRegister} style={{ padding: '5px 10px' }}>Register</button>
      <p><a href="/">Login</a></p>
    </div>
  );
};

export default Register;