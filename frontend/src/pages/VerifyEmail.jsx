import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(location.state?.message || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const user = await verifyEmail(email, code);
      const dest =
        user.role === "farmer" ? "/farmer" : user.role === "admin" ? "/admin" : user.role === "agent" ? "/agent" : "/";
      navigate(dest);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const res = await resendVerification(email);
      setInfo(res.message || "A new code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📧</div>
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter the 6-digit code we sent to your email address to activate your account.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-8 space-y-4">
        {error && <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</p>}
        {info && <p className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg">{info}</p>}

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Verification Code</label>
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-brand-500 text-white py-2.5 rounded-full font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <div className="text-center text-sm text-gray-500">
          Didn't get a code?{" "}
          <button type="button" onClick={handleResend} disabled={resending} className="text-brand-600 font-medium disabled:opacity-50">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <p className="text-sm text-center text-gray-600">
          <Link to="/login" className="text-brand-600 font-medium">Back to login</Link>
        </p>
      </form>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
        <p>
          <strong>Testing locally without email set up?</strong> Check your backend terminal — the
          verification code is printed there if SMTP hasn't been configured yet.
        </p>
      </div>
    </div>
  );
}
