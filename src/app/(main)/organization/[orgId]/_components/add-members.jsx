"use client";

import { useState } from "react";
import { inviteUser } from "@/actions/organizations";
import toast from "react-hot-toast";

export default function AddMembers({ setAddMembersOpen }) {
  const [emails, setEmails] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index) => {
    const updatedEmails = emails.filter((_, i) => i !== index);
    setEmails(updatedEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmails = emails.map(email => email.trim()).filter(email => email);

    if (trimmedEmails.length === 0) {
      setMessage("Please enter at least one email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await inviteUser(trimmedEmails);
      if (!result) {
        setMessage("An error occurred while inviting members.");
        return;
      } else {
        toast.success("Members invited successfully");
        setAddMembersOpen(false);
      }
    } catch (error) {
      // console.error("Error inviting members:", error);
      setMessage("An error occurred while inviting members.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="bg-black rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
          onClick={() => setAddMembersOpen(false)}
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-4">Invite Members</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder={`Enter email #${index + 1}`}
                className="flex-1 p-2 border rounded"
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  className="text-red-500 text-lg px-2"
                  title="Remove email"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addEmailField}
            className="px-4 py-2 bg-black text-white border border-gray-200 rounded"
          >
            + Add another email
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Invites"}
          </button>

          {message && (
            <p className="text-center text-sm text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
