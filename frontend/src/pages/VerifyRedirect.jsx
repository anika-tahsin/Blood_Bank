import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
import axios from "axios";

export default function VerifyRedirect() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // const res = await fetch(`https://blood-bank-backend-upcq.onrender.com/api/accounts/verify-email/${uid}/${token}/`);
        const res = await axios.get(`https://blood-bank-backend-upcq.onrender.com/api/accounts/verify-email/${uid}/${token}/`);

        if (res.status === 200 && res.data?.success) {
          navigate("/verify-success");
        } else {
          console.error("Verification failed:", res.data);
          navigate("/verify-error");
        }
      } catch (err) {
        console.error("Verification error:", err.response?.data || err.message);
        navigate("/verify-error");
      }
    };
        // Check if response is actually JSON
    //     const contentType = res.headers.get('content-type');
        
    //     if (contentType && contentType.includes('application/json')) {
    //       const data = await res.json();
          
    //       if (res.ok && data.success) {
    //         navigate("/verify-success");
    //       } else {
    //         console.error("Verification failed:", data);
    //         navigate("/verify-error");
    //       }
    //     } else {
    //       // Response is not JSON (likely HTML error page)
    //       const textResponse = await res.text();
    //       console.error("Non-JSON response:", textResponse);
          
    //       if (res.ok) {
    //         // Sometimes Django returns HTML success page
    //         navigate("/verify-success");
    //       } else {
    //         navigate("/verify-error");
    //       }
    //     }
    //   } catch (err) {
    //     console.error("Verification error:", err);
    //     navigate("/verify-error");
    //   }
    // };
    
    if (uid && token) {
      verifyEmail();
    } else {
      console.error("Missing uid or token");
      navigate("/verify-error");
    }
  }, [uid, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-900 via-pink-800 to-black">
      <div className="text-center">
        {/* Animated Spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-300 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-white text-lg font-medium mb-2">Verifying your email...</p>
        <p className="text-white/70 text-sm">Please wait while we confirm your account</p>
        
        {/* Animated Dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}