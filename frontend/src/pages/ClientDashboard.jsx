import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);

  const [contracts, setContracts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newContract, setNewContract] = useState({
    providerId: "",
    title: "",
    amount: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cRes, vRes] = await Promise.all([
        API.get("/contracts/client"),
        API.get("/vendors"),
      ]);

      setContracts(cRes.data);
      setVendors(vRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        provider_id: newContract.providerId,
        title: newContract.title,
        amount: Number(newContract.amount),
      };

      const { data } = await API.post("/contracts", payload);
      setContracts([data, ...contracts]);
      setShowModal(false);

      setNewContract({ providerId: "", title: "", amount: "" });
    } catch {
      alert("Error creating contract");
    }
  };

  const handleFund = async (c) => {
    alert("Escrow funded (dummy)");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-500">Welcome {user?.name}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          + New Contract
        </button>
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : contracts.length === 0 ? (
        <p>No contracts yet</p>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl shadow flex justify-between"
            >
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-gray-500">₹{c.amount}</p>
              </div>

              <button
                onClick={() => handleFund(c)}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Fund
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <form
            onSubmit={handleCreate}
            className="bg-white p-6 rounded-xl w-[400px]"
          >
            <h2 className="text-xl font-bold mb-4">Create Contract</h2>

            <select
              required
              className="w-full p-3 border mb-3"
              value={newContract.providerId}
              onChange={(e) =>
                setNewContract({
                  ...newContract,
                  providerId: e.target.value,
                })
              }
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.company_name}
                </option>
              ))}
            </select>

            <input
              required
              placeholder="Title"
              className="w-full p-3 border mb-3"
              value={newContract.title}
              onChange={(e) =>
                setNewContract({ ...newContract, title: e.target.value })
              }
            />

            <input
              required
              type="number"
              placeholder="Amount"
              className="w-full p-3 border mb-3"
              value={newContract.amount}
              onChange={(e) =>
                setNewContract({ ...newContract, amount: e.target.value })
              }
            />

            <button className="w-full bg-blue-600 text-white py-2 rounded">
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;