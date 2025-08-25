import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VerifyRedirect() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/verify/${uid}/${token}/`);
        if (res.ok) {
          navigate("/verify-success");
        } else {
          navigate("/verify-error");
        }
      } catch (err) {
        navigate("/verify-error");
      }
    };
    verifyEmail();
  }, [uid, token, navigate]);

  return <p className="text-center mt-10">Verifying your email...</p>;
}
