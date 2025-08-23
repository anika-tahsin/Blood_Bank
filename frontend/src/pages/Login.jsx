import { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      login(res.data);
      setMsg("Login successful!");
    } catch (err) {
      setMsg(err.response.data.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm">
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
