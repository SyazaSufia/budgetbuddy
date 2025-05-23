import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./AdsPage.module.css";
import AdvertisementForm from "./AdsForm";
import AdvertisementTable from "./AdsTable";
import { DeleteModal } from "./DeleteModal";
import { adminAdvertisementAPI } from "../../services/AdminApi";

const AdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50
  });

  // Fetch advertisements on component mount
  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminAdvertisementAPI.getAllAdvertisements(page, 50);
      
      setAdvertisements(response.data || []);
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
        limit: response.pagination?.limit || 50
      });
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      toast.error(error.message || "Failed to load advertisements");
      setAdvertisements([]);
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
      await adminAdvertisementAPI.deleteAdvertisement(selectedAdId);
      
      // Remove the deleted ad from state
      setAdvertisements(advertisements.filter(ad => ad.adID !== selectedAdId));
      toast.success("Advertisement deleted successfully");
      
      // Refresh the list to get updated pagination
      fetchAdvertisements(pagination.currentPage);
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
    
    try {
      if (isEditing) {
        await adminAdvertisementAPI.updateAdvertisement(currentAd.adID, formData);
        toast.success("Advertisement updated successfully");
      } else {
        await adminAdvertisementAPI.createAdvertisement(formData);
        toast.success("Advertisement created successfully");
      }
      
      // Refresh the advertisements list
      fetchAdvertisements(pagination.currentPage);
      
      // Close form
      setShowForm(false);
    } catch (error) {
      console.error("Error saving advertisement:", error);
      toast.error(error.message || "Failed to save advertisement");
    }
  };

  const handleToggleStatus = async (adId) => {
    try {
      await adminAdvertisementAPI.toggleAdvertisementStatus(adId);
      
      // Update the advertisement in the state
      setAdvertisements(prev => 
        prev.map(ad => 
          ad.adID === adId 
            ? { ...ad, isActive: !ad.isActive }
            : ad
        )
      );
      
      toast.success("Advertisement status updated successfully");
    } catch (error) {
      console.error("Error toggling advertisement status:", error);
      toast.error(error.message || "Failed to update advertisement status");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAdvertisements(newPage);
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
        <div className={styles.headerActions}>
          {!showForm && (
            <button 
              className={styles.addButton}
              onClick={handleAddNewClick}
            >
              + Add New Advertisement
            </button>
          )}
          {!showForm && advertisements.length > 0 && (
            <div className={styles.statsContainer}>
              <span className={styles.totalCount}>
                Total: {pagination.total} advertisements
              </span>
            </div>
          )}
        </div>
      </div>
      
      {showForm ? (
        <AdvertisementForm 
          advertisement={currentAd}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <AdvertisementTable 
            advertisements={advertisements}
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
            onToggleStatus={handleToggleStatus}
            loading={loading}
          />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              
              <span className={styles.paginationInfo}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button 
                className={styles.paginationButton}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
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