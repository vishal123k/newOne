import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    gstin: "",
    competencies: "",
    service_rate: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        API.get("/profiles"),
        API.get("/contracts/vendor"),
      ]);

      setProfile(pRes.data);
      setContracts(cRes.data);

      setForm({
        company_name: pRes.data?.company_name || "",
        gstin: pRes.data?.gstin || "",
        competencies: pRes.data?.competencies || "",
        service_rate: pRes.data?.service_rate || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      await API.post("/profiles", {
        ...form,
        service_rate: Number(form.service_rate),
      });

      alert("Saved!");
      setEdit(false);
      fetchData();
    } catch {
      alert("Error");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/contracts/${id}/status`, { status });
      fetchData();
    } catch {
      alert("Error updating");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-gray-500">{profile?.company_name}</p>
        </div>

        <button
          onClick={() => setEdit(!edit)}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          {edit ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* PROFILE FORM */}
      {edit && (
        <form onSubmit={saveProfile} className="bg-white p-6 rounded-xl mb-6 shadow space-y-3">

          <input
            required
            placeholder="Company"
            className="w-full p-3 border"
            value={form.company_name}
            onChange={(e) =>
              setForm({ ...form, company_name: e.target.value })
            }
          />

          <input
            placeholder="GST"
            className="w-full p-3 border"
            value={form.gstin}
            onChange={(e) =>
              setForm({ ...form, gstin: e.target.value })
            }
          />

          <input
            placeholder="Skills"
            className="w-full p-3 border"
            value={form.competencies}
            onChange={(e) =>
              setForm({ ...form, competencies: e.target.value })
            }
          />

          <input
            required
            type="number"
            placeholder="Rate"
            className="w-full p-3 border"
            value={form.service_rate}
            onChange={(e) =>
              setForm({ ...form, service_rate: e.target.value })
            }
          />

          <button className="bg-black text-white px-5 py-2 rounded">
            Save
          </button>
        </form>
      )}

      {/* CONTRACTS */}
      {contracts.length === 0 ? (
        <p>No contracts</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl shadow flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p>₹{c.amount}</p>
              </div>

              <div className="flex gap-2">
                {c.status === "funded" && (
                  <button
                    onClick={() => updateStatus(c.id, "in_progress")}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Start
                  </button>
                )}

                {c.status === "in_progress" && (
                  <button
                    onClick={() => updateStatus(c.id, "completed")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;