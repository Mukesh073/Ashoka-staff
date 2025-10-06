
import React, { useState, useEffect } from "react";
import "./StaffCheckinSystem.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/guests";



const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [staffName, setStaffName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (staffName.trim()) {
      onAddStaff({ name: staffName });
      setStaffName(""); 
      onClose(); 
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Staff</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="staffName">Staff Name</label>
            <input
              type="text"
              id="staffName"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Enter staff name"
              required
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-confirm">
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



//================================================
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


//================================================


const StaffCheckinSystem = () => {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [confirmationModalState, setConfirmationModalState] = useState({
    isOpen: false,
    action: null,
    staff: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all guests on mount
  useEffect(() => {
    fetchStaffList();
    // eslint-disable-next-line
  }, []);

  // Search guests by name
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStaff(staffList);
    } else {
      searchGuests(searchTerm);
    }
    // eslint-disable-next-line
  }, [searchTerm, staffList]);

  const fetchStaffList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch staff list");
      const data = await res.json();
      setStaffList(data);
      setFilteredStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchGuests = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/search?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Failed to search guests");
      const data = await res.json();
      setFilteredStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (newStaff) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStaff.name }),
      });
      if (!res.ok) throw new Error("Failed to add staff");
      await fetchStaffList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReCheckIn = async (staffId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${staffId}/checkin`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to check in staff");
      await fetchStaffList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (staffId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${staffId}/checkout`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to check out staff");
      await fetchStaffList();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmationModal = (action, staff) => {
    setConfirmationModalState({ isOpen: true, action, staff });
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationModalState({ isOpen: false, action: null, staff: null });
  };

  const handleConfirmAction = async () => {
    const { action, staff } = confirmationModalState;
    if (action === 'checkout') {
      await handleCheckout(staff.id);
    } else if (action === 'checkin') {
      await handleReCheckIn(staff.id);
    }
    handleCloseConfirmationModal();
  };

  const getModalContent = () => {
    if (!confirmationModalState.staff) return {};
    const { action, staff } = confirmationModalState;
    if (action === 'checkout') {
      return { title: 'Confirm Checkout', message: `Are you sure you want to check out ${staff.name}?`, confirmText: 'Confirm Checkout' };
    }
    if (action === 'checkin') {
      return { title: 'Confirm Check-In', message: `Are you sure you want to check in ${staff.name} again?`, confirmText: 'Confirm Check-In' };
    }
    return {};
  };

  return (
    <div className="main-container">
      <div className="search-and-add-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by staff name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="add-staff-button" onClick={() => setAddModalOpen(true)}>
          New Check-In
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>S.NO</th>
              <th>STAFF NAME</th>
              <th>CHECK-IN TIME</th>
              <th>CHECK-OUT TIME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff, index) => (
                <tr key={staff.id}>
                  <td>{index + 1}</td>
                  <td>{staff.name}</td>
                  <td>{staff.checkinTime}</td>
                  <td>{staff.checkoutTime ? staff.checkoutTime : '---'}</td>
                  <td>
                    <div className="action-buttons-wrapper">
                      {staff.checkoutTime ? (
                        <button className="action-button checkin" onClick={() => handleOpenConfirmationModal('checkin', staff)}>
                          Check-In
                        </button>
                      ) : (
                        <button className="action-button checkout" onClick={() => handleOpenConfirmationModal('checkout', staff)}>
                          Check-Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  No staff checked in yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddStaff={handleAddStaff}
      />

      <ConfirmationModal
        isOpen={confirmationModalState.isOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleConfirmAction}
        {...getModalContent()}
      />
    </div>
  );
};

export default StaffCheckinSystem;

