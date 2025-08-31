import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyRedirect() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/verify-email/${uid}/${token}/`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          navigate("/verify-success");
        } else {
          navigate("/verify-error");
        }
      } catch (err) {
        console.error("Verification error:", err);
        navigate("/verify-error");
      }
    };
    verifyEmail();
  }, [uid, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-900 via-pink-800 to-black">
      <p className="text-white text-lg">Verifying your email...</p>
    </div>
  );
}