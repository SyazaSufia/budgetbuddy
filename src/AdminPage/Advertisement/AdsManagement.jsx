import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./AdsPage.module.css";
import AdvertisementForm from "./AdsForm";
import AdvertisementTable from "./AdsTable";
import { DeleteModal } from "./DeleteModal";
import { getApiBaseUrl } from "../utils"; // Import from utils file

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState(null);

  // Get the API base URL from utility function
  const apiBaseUrl = getApiBaseUrl();

  // Fetch advertisements on component mount
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/advertisements`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch advertisements");
      }
      
      const data = await response.json();
      setAdvertisements(data.data || []);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewClick = () => {
    setCurrentAd(null);
    setShowForm(true);
    // Scroll to top when showing form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditAd = (ad) => {
    setCurrentAd(ad);
    setShowForm(true);
    // Scroll to top when showing form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAd = (adId) => {
    setSelectedAdId(adId);
    setIsModalOpen(true);
  };

  const confirmDeleteAd = async () => {
    if (!selectedAdId) return;
    
    try {
      const response = await fetch(`${apiBaseUrl}/admin/advertisements/${selectedAdId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete advertisement");
      }
      
      // Remove the deleted ad from state
      setAdvertisements(advertisements.filter(ad => ad.adID !== selectedAdId));
      toast.success("Advertisement deleted successfully");
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      toast.error(error.message || "Failed to delete advertisement");
    } finally {
      setIsModalOpen(false);
      setSelectedAdId(null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleFormSubmit = async (formData) => {
    const isEditing = !!currentAd;
    const url = isEditing 
      ? `${apiBaseUrl}/admin/advertisements/${currentAd.adID}`
      : `${apiBaseUrl}/admin/advertisements`;
    
    const method = isEditing ? "PUT" : "POST";
    
    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        body: formData, // FormData is sent directly for multipart/form-data
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save advertisement");
      }
      
      // Refresh the advertisements list
      fetchAdvertisements();
      
      // Show success message and close form
      toast.success(isEditing ? "Advertisement updated successfully" : "Advertisement created successfully");
      setShowForm(false);
    } catch (error) {
      console.error("Error saving advertisement:", error);
      toast.error(error.message || "Failed to save advertisement");
    }
  };

  return (
    <div className={styles.div16}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className={styles.headerContainer}>
        <h1 className={styles.heading}>Advertisement Management</h1>
        {!showForm && (
          <button 
            className={styles.addButton}
            onClick={handleAddNewClick}
          >
            + Add New Advertisement
          </button>
        )}
      </div>
      
      {showForm ? (
        <AdvertisementForm 
          advertisement={currentAd}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <AdvertisementTable 
          advertisements={advertisements}
          onEdit={handleEditAd}
          onDelete={handleDeleteAd}
          loading={loading}
        />
      )}
      
      {isModalOpen && (
        <DeleteModal 
          onCancel={() => setIsModalOpen(false)} 
          onConfirm={confirmDeleteAd} 
          itemName={advertisements.find(ad => ad.adID === selectedAdId)?.title || "this advertisement"}
        />
      )}
    </div>
  );
};

export default AdvertisementManagement;