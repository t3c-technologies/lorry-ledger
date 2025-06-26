// src/pages/trucks.js
import { useState, useEffect, useMemo } from "react";
import { Filter, FilterX, X, Calendar, ChevronDown } from "lucide-react";
import axios from "axios";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "@/components/Notification";

import FilePreview from "@/components/FilePreview";

import { api } from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/endpoints";

const ITEMS_PER_PAGE = 1;

export default function Trucks() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilters, setDriverFilters] = useState([]);
  const [columnFilteredDrivers, setColumnFilteredDrivers] = useState([]);
  const [sortedAndFilteredDrivers, setSortedAndFilteredDrivers] = useState([]);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [isEditTruckModalOpen, setIsEditTruckModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  const [IsViewTruckModalOpen, setIsViewTruckModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    expenseType: "",
    amountPaid: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "Cash",
    currentKmReading: "",
    fuelQuantity: "",
    notes: "",
  });

  const [showEditTransactionModal, setShowEditTransactionModal] =
    useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [showDeleteTransactionModal, setShowDeleteTransactionModal] =
    useState(false);
  const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false);

  const handleRowClick = (driver) => {
    setCurrentDriver(driver);
    setIsViewTruckModalOpen(true);
    setIsEditMode(false);
  };

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const [showTruckTypeFilterDropdown, setShowTruckTypeFilterDropdown] =
    useState(false);

  const [showTruckStatusFilterDropdown, setShowTruckStatusFilterDropdown] =
    useState(false);

  const [
    showTruckOwnershipFilterDropdown,
    setShowTruckOwnershipFilterDropdown,
  ] = useState(false);

  const [newDriver, setNewDriver] = useState({
    truckNo: "",
    truckType: "",
    ownership: "",
    truckStatus: "available",
  });

  const resetNewDriverForm = () => {
    setNewDriver({
      truckNo: "",
      truckType: "",
      ownership: "",
      truckStatus: "available",
    });
  };
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [showSidebar, setShowSidebar] = useState(false);
  const [billingType, setBillingType] = useState("Fixed");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  //EMIS
  // State variables to add to your component
  const [showEMISidebar, setShowEMISidebar] = useState(false);
  const [showAddEMIPopup, setShowAddEMIPopup] = useState(false);
  const [showAddPastPaymentPopup, setShowAddPastPaymentPopup] = useState(false);
  const [showMarkPaidPopup, setShowMarkPaidPopup] = useState(false);
  const [emis, setEmis] = useState([]);
  const [selectedEMI, setSelectedEMI] = useState(null);
  const [emiFormData, setEmiFormData] = useState({
    financeCompany: "",
    monthlyEMI: "",
    dueOn: "1",
    reminderDay: "2nd",
    reminderFrequency: "every month",
  });
  const [pastPaymentData, setPastPaymentData] = useState({
    dueOn: "",
    amountPaid: "",
    paymentDate: "",
  });
  const [markPaidData, setMarkPaidData] = useState({
    amountPaid: "",
    paymentDate: "",
  });

  const [showEditPaymentPopup, setShowEditPaymentPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentEMI, setSelectedPaymentEMI] = useState(null);
  const [editPaymentData, setEditPaymentData] = useState({
    dueDate: "",
    amountPaid: "",
    paymentDate: "",
  });

  const [showEMIMenuPopup, setShowEMIMenuPopup] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditEMIPopup, setShowEditEMIPopup] = useState(false);
  const [showDeleteEMIConfirm, setShowDeleteEMIConfirm] = useState(false);
  const [showMarkEMICompletedPopup, setShowMarkEMICompletedPopup] =
    useState(false);
  const [editEMIData, setEditEMIData] = useState({
    financeCompany: "",
    monthlyEMI: "",
    dueOn: "",
    reminderDay: "",
    reminderFrequency: "",
  });

  //Documents
  const [showDocumentsSidebar, setShowDocumentsSidebar] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
  const [showDocumentOptionsModal, setShowDocumentOptionsModal] =
    useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [showExpenseFields, setShowExpenseFields] = useState(false);
  const [documents, setDocuments] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentFormData, setDocumentFormData] = useState({
    expiryDate: "",
    reminderDays: "15",
    policyNo: "",
    uploadedFile: null,
    expenseAmount: "",
    expenseDate: "",
  });

  const documentTypes = [
    { key: "insurance", name: "Insurance" },
    { key: "rcPermit", name: "RC Permit" },
    { key: "registration", name: "Registration Certificate" },
    { key: "nationalPermit", name: "National Permit" },
    { key: "roadTax", name: "Road Tax" },
    { key: "fitness", name: "Fitness Certificate" },
    { key: "driverLicense", name: "Driver's License" },
    { key: "pollution", name: "Pollution Certificate" },
    { key: "other", name: "Other Document" },
  ];

  // Functions to handle EMI menu popup
  const openEMIMenuPopup = (e, emi) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right - 150, // Adjust to position menu properly
      y: rect.bottom + 5,
    });

    setSelectedEMI(emi);
    setShowEMIMenuPopup(true);
  };

  const closeEMIMenuPopup = () => {
    setShowEMIMenuPopup(false);
    setSelectedEMI(null);
  };

  // Functions to handle Edit EMI popup
  const openEditEMIPopup = () => {
    if (selectedEMI) {
      setEditEMIData({
        financeCompany: selectedEMI.financeCompany || "",
        monthlyEMI: selectedEMI.monthlyEMI?.toString() || "",
        dueOn: selectedEMI.dueOn || "",
        reminderDay: selectedEMI.reminderDay || "2nd",
        reminderFrequency: selectedEMI.reminderFrequency || "monthly",
      });
      setShowEditEMIPopup(true);
      setShowEMIMenuPopup(false);
    }
  };

  const closeEditEMIPopup = () => {
    setShowEditEMIPopup(false);
    setEditEMIData({
      financeCompany: "",
      monthlyEMI: "",
      dueOn: "",
      reminderDay: "",
      reminderFrequency: "",
    });
  };

  // Functions to handle Delete EMI confirmation
  const openDeleteEMIConfirm = () => {
    setShowDeleteEMIConfirm(true);
    setShowEMIMenuPopup(false);
  };

  const closeDeleteEMIConfirm = () => {
    setShowDeleteEMIConfirm(false);
  };

  // Functions to handle Mark EMI Completed
  const openMarkEMICompletedPopup = () => {
    setShowMarkEMICompletedPopup(true);
    closeEMIMenuPopup();
  };

  const closeMarkEMICompletedPopup = () => {
    setShowMarkEMICompletedPopup(false);
  };

  // Close menu when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (showEMIMenuPopup) {
  //       closeEMIMenuPopup();
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [showEMIMenuPopup]);

  // Update the three-dot button in the EMI sidebar (replace the existing button)
  const ThreeDotMenuButton = ({ emi }) => (
    <button
      onClick={(e) => openEMIMenuPopup(e, emi)}
      className="text-gray-400 hover:text-gray-600 relative"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>
  );

  const isDocumentExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0; // Within 30 days
  };

  // Computed values for document warnings
  const documentsNeedingAttention = Object.keys(documents).filter((key) => {
    const doc = documents[key];
    return doc && isDocumentExpiringSoon(doc.expiryDate);
  });

  // Helper functions

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Main handler functions
  const openDocumentsSidebar = () => {
    setDocuments(selectedDriver.documents);
    console.log(selectedDriver);
    setShowDocumentsSidebar(true);
  };

  const closeDocumentsSidebar = () => {
    setShowDocumentsSidebar(false);
  };

  const openAddDocumentModal = (docType) => {
    setSelectedDocumentType(docType);
    setShowAddDocumentModal(true);
    setShowExpenseFields(false);
    // Reset form data
    setDocumentFormData({
      expiryDate: "",
      reminderDays: "15",
      policyNo: "",
      uploadedFile: null,
      expenseAmount: "",
      expenseDate: new Date().toISOString().split("T")[0], // Today's date
    });
  };

  const closeAddDocumentModal = () => {
    setShowAddDocumentModal(false);
    setSelectedDocumentType(null);
    setShowExpenseFields(false);
    setDocumentFormData({
      expiryDate: "",
      reminderDays: "15",
      policyNo: "",
      uploadedFile: null,
      expenseAmount: "",
      expenseDate: "",
    });
    console.log(documents);
  };
  const closeEditDocumentModal = () => {
    setShowEditDocumentModal(false);
    setSelectedDocumentType(null);
    setShowExpenseFields(false);
    setDocumentFormData({
      expiryDate: "",
      reminderDays: "15",
      policyNo: "",
      uploadedFile: null,
      expenseAmount: "",
      expenseDate: "",
    });
  };

  const openAddOtherDocumentModal = () => {
    const otherDocType = documentTypes.find((type) => type.key === "other");
    openAddDocumentModal(otherDocType);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFormData({
        ...documentFormData,
        uploadedFile: file,
      });
    }
  };

  // Your existing handleAddDocument function - slight modification needed
  const handleAddDocument = async () => {
    if (!selectedDocumentType) return;

    try {
      // Convert file to base64 if it's a File object
      const processFile = async (file) => {
        if (file instanceof File) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result.split(",")[1];
              resolve({
                data: base64,
                name: file.name,
                type: file.type,
                size: file.size,
              });
            };
            reader.readAsDataURL(file);
          });
        }
        return file;
      };

      // Process uploaded file - this is crucial
      const processedFile = documentFormData.uploadedFile
        ? await processFile(documentFormData.uploadedFile)
        : null;

      const newDocument = {
        id: Date.now(),
        type: selectedDocumentType.key,
        name: selectedDocumentType.name,
        expiryDate: documentFormData.expiryDate,
        reminderDays: parseInt(documentFormData.reminderDays),
        expenseAmount: parseInt(documentFormData.expenseAmount) || "",
        expenseDate: documentFormData.expenseDate || "",
        policyNo: documentFormData.policyNo,
        truckNo: selectedDriver.truckNo,
        createdAt: new Date().toISOString(),
        // Only include uploadedFile if there's a new file
        ...(processedFile && { uploadedFile: processedFile }),
      };

      // Update local state
      const updatedDocuments = {
        ...documents,
        [selectedDocumentType.key]: newDocument,
      };
      setDocuments(updatedDocuments);

      // Send to backend
      const response = await api.put(
        API_ENDPOINTS.trucks.update(selectedDriver.id),
        {
          ...selectedDriver,
          documents: updatedDocuments,
        }
      );

      if (response) {
        console.log("Document saved successfully");
        // Update local state with the response data to get the filePath
        if (response.data && response.data.documents) {
          setDocuments(response.data.documents);
        }
      }

      closeAddDocumentModal();
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  // Function to download a document
  const handleDownloadDocument = async () => {
    try {
      // Get the truck ID - you might need to adjust this based on your data structure
      const truckId = selectedDriver?.id;

      if (!truckId || !selectedDocumentType) {
        console.error("Missing truck ID or document type");
        // You can show a toast/alert here
        return;
      }
      console.log(documents);

      // Call the download API
      const url = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${url}/trucks/${truckId}/documents/${selectedDocumentType.key}/download/`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        // Get the filename from the response headers or use a default
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `${selectedDocumentType.name}_document`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Close the modal after successful download
        closeDocumentOptionsModal();

        // Optional: Show success message
        // toast.success('Document downloaded successfully!');
      } else {
        const errorData = await response.json();
        console.error("Download failed:", errorData);
        // toast.error('Failed to download document');
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      // toast.error('Error downloading document');
    }
  };

  // Function to get document info
  const getDocumentInfo = async (truckId, documentType) => {
    try {
      const response = await fetch(
        `/api/trucks/${truckId}/documents/${documentType}/`,
        {
          method: "GET",
          headers: {
            // Add your auth headers here
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.data; // Returns document info with downloadUrl
      }
    } catch (error) {
      console.error("Error getting document info:", error);
    }
    return null;
  };

  const handleEditDocumentSubmit = () => {
    if (!selectedDocumentType) return;

    // Convert file to base64 if it's a File object
    const processFile = async (file) => {
      if (file instanceof File) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(",")[1]; // Remove data:type;base64, prefix
            resolve({
              data: base64,
              name: file.name,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      }
      return file;
    };

    const saveDocument = async () => {
      // Process uploaded file
      const processedFile = documentFormData.uploadedFile
        ? await processFile(documentFormData.uploadedFile)
        : null;

      // Create new document object
      const newDocument = {
        id: Date.now(),
        type: selectedDocumentType.key,
        name: selectedDocumentType.name,
        expiryDate: documentFormData.expiryDate,
        reminderDays: parseInt(documentFormData.reminderDays),
        expenseAmount: parseInt(documentFormData.expenseAmount) || "",
        expenseDate: documentFormData.expenseDate || "",
        policyNo: documentFormData.policyNo,
        uploadedFile: processedFile, // This will be processed by backend
        createdAt: new Date().toISOString(),
        truckNo: selectedDriver.truckNo,
      };

      // Save document - update the documents object
      const updatedDocuments = {
        ...documents,
        [selectedDocumentType.key]: newDocument,
      };

      setDocuments(updatedDocuments);

      // Send to backend - you'll need to implement this API call
      // This should be a PUT/PATCH request to update the truck with new documents
      try {
        // Prepare the data to send - merge existing driver data with updated documents
        const updatedDriverData = {
          ...selectedDriver, // or currentDriver, depending on your variable name
          documents: updatedDocuments,
        };

        // Use your existing API method
        const response = await api.put(
          API_ENDPOINTS.trucks.update(selectedDriver.id), // or currentDriver.id
          updatedDriverData
        );

        if (response) {
          // Success - document saved to database
          console.log("Document saved successfully");
          // Optional: Show success message
          // toast.success('Document saved successfully!');
        }
        await fetchDrivers();
        await getSortedAndFilteredDrivers();
      } catch (error) {
        console.error("Error saving document:", error);
        // Optional: Show error message
        // toast.error('Failed to save document');
      }

      closeEditDocumentModal();
    };

    saveDocument();
  };

  const openDocumentOptionsModal = (docType, document) => {
    setSelectedDocumentType(docType);
    setSelectedDocument(document);
    setShowDocumentOptionsModal(true);
  };

  const closeDocumentOptionsModal = () => {
    setShowDocumentOptionsModal(false);
    setSelectedDocumentType(null);
    setSelectedDocument(null);
  };

  const handleEditDocument = () => {
    // Populate form with existing document data
    if (selectedDocument) {
      const uploadedFile = {
        name: selectedDocument.filePath.split("/").pop(),
      };
      setDocumentFormData({
        expiryDate: selectedDocument.expiryDate || "",
        reminderDays: selectedDocument.reminderDays?.toString() || "15",
        policyNo: selectedDocument.policyNo || "",
        uploadedFile: uploadedFile || null,
        expenseAmount: selectedDocument.expenseAmount || "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
    }
    if (selectedDocument.expenseAmount !== "") {
      setShowExpenseFields(true);
    }

    setShowDocumentOptionsModal(false);
    setShowEditDocumentModal(true);
  };

  const handleShareDocument = () => {
    if (selectedDocument && selectedDocument.uploadedFile) {
      // Implement sharing logic - could be:
      // 1. Generate a shareable link
      // 2. Open native share dialog
      // 3. Copy to clipboard

      if (navigator.share) {
        navigator
          .share({
            title: `${selectedDocument.name} - ${selectedDriver.truckNo}`,
            text: `Document: ${selectedDocument.name} for truck ${selectedDriver.truckNo}`,
            files: [selectedDocument.uploadedFile],
          })
          .catch(console.error);
      } else {
        // Fallback: Copy document info to clipboard
        const documentInfo = `${selectedDocument.name} - ${
          selectedDriver.truckNo
        }
Expiry Date: ${selectedDocument.expiryDate || "Not set"}
Policy No: ${selectedDocument.policyNo || "Not provided"}`;

        navigator.clipboard.writeText(documentInfo).then(() => {
          alert("Document information copied to clipboard!");
        });
      }
    }

    closeDocumentOptionsModal();
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocumentType || !selectedDocument) {
      closeDocumentOptionsModal();
      return;
    }

    const documentName = selectedDocumentType.name || selectedDocumentType;
    const documentKey = selectedDocumentType.key || selectedDocumentType;

    if (window.confirm(`Are you sure you want to delete ${documentName}?`)) {
      try {
        // Store original document for potential rollback
        const originalDocument = selectedDocument;

        // Update local state optimistically
        const updatedDocuments = { ...documents };
        delete updatedDocuments[documentKey];
        setDocuments(updatedDocuments);
        console.log(updatedDocuments);

        const updatedDriverData = {
          ...selectedDriver,
          documents: updatedDocuments,
        };

        console.log(updatedDriverData);

        // Send update to backend
        const response = await api.put(
          API_ENDPOINTS.trucks.update(selectedDriver.id), // or currentDriver.id
          updatedDriverData
        );

        if (response) {
          console.log("Document deleted successfully");
          // toast.success(`${documentName} deleted successfully!`);
        }

        fetchDrivers();
        getSortedAndFilteredDrivers();
      } catch (error) {
        console.error("Error deleting document:", error);

        // Rollback on error
        // setDocuments((prev) => ({
        //   ...prev,
        //   [documentKey]: originalDocument,
        // }));

        // toast.error('Failed to delete document. Please try again.');
      }
    }

    closeDocumentOptionsModal();
  };

  const openEMISidebar = () => {
    setShowEMISidebar(true);
    setEmis(selectedDriver.emi);
    setShowTransactionsModal(false);
  };
  const closeEMISidebar = () => setShowEMISidebar(false);
  const openAddEMIPopup = () => setShowAddEMIPopup(true);
  const closeAddEMIPopup = () => {
    setShowAddEMIPopup(false);
    setEmiFormData({
      financeCompany: "",
      monthlyEMI: "",
      dueOn: "1",
      reminderDay: "2nd",
      reminderFrequency: "every month",
    });
  };
  const openAddPastPaymentPopup = () => setShowAddPastPaymentPopup(true);
  const closeAddPastPaymentPopup = () => {
    setShowAddPastPaymentPopup(false);
    setPastPaymentData({
      dueOn: "",
      amountPaid: "",
      paymentDate: "",
    });
  };
  const openMarkPaidPopup = (emi) => {
    setSelectedEMI(emi);
    setMarkPaidData({
      amountPaid: emi.monthlyEMI,
      paymentDate: new Date().toISOString().split("T")[0],
    });
    setShowMarkPaidPopup(true);
  };
  const closeMarkPaidPopup = () => {
    setShowMarkPaidPopup(false);
    setSelectedEMI(null);
    setMarkPaidData({
      amountPaid: "",
      paymentDate: "",
    });
  };

  // Helper functions for edit/delete operations
  const openEditPaymentPopup = (emi, payment) => {
    setSelectedPaymentEMI(emi);
    setSelectedPayment(payment);
    setEditPaymentData({
      dueDate: payment.dueDate || "",
      amountPaid: payment.amount.toString(),
      paymentDate: payment.paymentDate || "",
    });
    setShowEditPaymentPopup(true);
  };

  const closeEditPaymentPopup = () => {
    setShowEditPaymentPopup(false);
    setSelectedPayment(null);
    setSelectedPaymentEMI(null);
    setEditPaymentData({
      dueDate: "",
      amountPaid: "",
      paymentDate: "",
    });
  };

  const openDeleteConfirmPopup = (emi, payment) => {
    setSelectedPaymentEMI(emi);
    setSelectedPayment(payment);
    setShowDeleteConfirmPopup(true);
  };

  const closeDeleteConfirmPopup = () => {
    setShowDeleteConfirmPopup(false);
    setSelectedPayment(null);
    setSelectedPaymentEMI(null);
  };

  const updateTruckEMI = async (truckId, emiData) => {
    try {
      const response = await api.put(API_ENDPOINTS.trucks.update(truckId), {
        ...selectedDriver,
        emi: emiData,
      });
    } catch (error) {
      console.error("Error updating EMI:", error);
      throw error;
    }
  };

  // Handle edit payment submission
  const handleEditPayment = async () => {
    if (selectedPaymentEMI && selectedPayment && selectedDriver.id) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedPaymentEMI.id) {
          const updatedPastPayments = emi.pastPayments.map((payment) => {
            if (payment.id === selectedPayment.id) {
              return {
                ...payment,
                dueDate: editPaymentData.dueDate,
                amount: parseFloat(editPaymentData.amountPaid),
                paymentDate: editPaymentData.paymentDate,
              };
            }
            return payment;
          });
          return {
            ...emi,
            pastPayments: updatedPastPayments,
          };
        }
        return emi;
      });

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeEditPaymentPopup();
      } catch (error) {
        console.error("Failed to update payment:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    if (selectedPaymentEMI && selectedPayment && selectedDriver.id) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedPaymentEMI.id) {
          const updatedPastPayments = emi.pastPayments.filter(
            (payment) => payment.id !== selectedPayment.id
          );
          return {
            ...emi,
            pastPayments: updatedPastPayments,
          };
        }
        return emi;
      });

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeDeleteConfirmPopup();
      } catch (error) {
        console.error("Failed to delete payment:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  // Handle delete EMI
  const handleDeleteEMI = async () => {
    if (selectedEMI && selectedDriver.id) {
      const updatedEmis = emis.filter((emi) => emi.id !== selectedEMI.id);

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeDeleteEMIConfirm();
      } catch (error) {
        console.error("Failed to delete EMI:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  // Handle edit EMI
  const handleEditEMI = async () => {
    const getNextDueDate = (dueDay) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-based (0 = January, 11 = December)

      // Calculate next month and year
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;

      // Handle year rollover when current month is December
      if (nextMonth > 11) {
        nextMonth = 0; // January
        nextYear += 1;
      }

      // Create the next due date
      const nextDueDate = new Date(nextYear, nextMonth, parseInt(dueDay));

      // Format as YYYY-MM-DD
      return nextDueDate.toISOString().split("T")[0];
    };
    if (selectedEMI && selectedDriver.id) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedEMI.id) {
          return {
            ...emi,
            financeCompany: editEMIData.financeCompany,
            monthlyEMI: parseFloat(editEMIData.monthlyEMI),
            dueOn: editEMIData.dueOn,
            reminderDay: editEMIData.reminderDay,
            reminderFrequency: editEMIData.reminderFrequency,
            upcomingPayments: [
              {
                id: Date.now() + 1,
                amount: parseFloat(editEMIData.monthlyEMI),
                dueDate: getNextDueDate(editEMIData.dueOn),
                status: "due",
              },
            ],
          };
        }
        return emi;
      });

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeEditEMIPopup();
      } catch (error) {
        console.error("Failed to edit EMI:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  // Handle mark EMI as completed
  const handleMarkEMICompleted = async () => {
    if (selectedEMI && selectedDriver.id) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedEMI.id) {
          return {
            ...emi,
            status: "completed",
            completedDate: new Date().toISOString().split("T")[0],
          };
        }
        return emi;
      });

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeMarkEMICompletedPopup();
      } catch (error) {
        console.error("Failed to mark EMI as completed:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  // Form submission handlers
  const handleAddEMI = async () => {
    if (!selectedDriver.id) return;

    // Calculate next month's due date
    const getNextDueDate = (dueDay) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth(); // 0-based (0 = January, 11 = December)

      // Calculate next month and year
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;

      // Handle year rollover when current month is December
      if (nextMonth > 11) {
        nextMonth = 0; // January
        nextYear += 1;
      }

      // Create the next due date
      const nextDueDate = new Date(nextYear, nextMonth, parseInt(dueDay));

      // Format as YYYY-MM-DD
      return nextDueDate.toISOString().split("T")[0];
    };

    const newEMI = {
      id: Date.now(),
      financeCompany: emiFormData.financeCompany,
      monthlyEMI: parseFloat(emiFormData.monthlyEMI),
      dueOn: emiFormData.dueOn,
      reminderDay: emiFormData.reminderDay,
      reminderFrequency: emiFormData.reminderFrequency,
      status: "active",
      pastPayments: [],
      upcomingPayments: [
        {
          id: Date.now() + 1,
          amount: parseFloat(emiFormData.monthlyEMI),
          dueDate: getNextDueDate(emiFormData.dueOn),
          status: "due",
        },
      ],
    };

    const updatedEmis = [...emis, newEMI];

    try {
      await updateTruckEMI(selectedDriver.id, updatedEmis);
      setEmis(updatedEmis);
      closeAddEMIPopup();
    } catch (error) {
      console.error("Failed to add EMI:", error);
      // Handle error - show toast/alert to user
    }
  };

  const handleAddPastPayment = async () => {
    if (selectedEMI && selectedDriver.id) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedEMI.id) {
          return {
            ...emi,
            pastPayments: [
              ...emi.pastPayments,
              {
                id: Date.now(),
                amount: parseFloat(pastPaymentData.amountPaid),
                dueDate: pastPaymentData.dueOn,
                paymentDate: pastPaymentData.paymentDate,
              },
            ],
          };
        }
        return emi;
      });

      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeAddPastPaymentPopup();
      } catch (error) {
        console.error("Failed to add past payment:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  const handleMarkPaid = async () => {
    if (selectedEMI) {
      const updatedEmis = emis.map((emi) => {
        if (emi.id === selectedEMI.id) {
          const updatedUpcomingPayments = emi.upcomingPayments.map(
            (payment) => {
              if (payment.status === "due") {
                return {
                  ...payment,
                  status: "paid",
                  paymentDate: markPaidData.paymentDate,
                };
              }
              return payment;
            }
          );

          return {
            ...emi,
            upcomingPayments: updatedUpcomingPayments,
            pastPayments: [
              ...emi.pastPayments,
              {
                id: Date.now(),
                amount: parseFloat(markPaidData.amountPaid),
                dueDate: selectedEMI.upcomingPayments.find(
                  (p) => p.status === "due"
                )?.dueDate,
                paymentDate: markPaidData.paymentDate,
              },
            ],
          };
        }
        return emi;
      });
      setEmis(updatedEmis);
      try {
        await updateTruckEMI(selectedDriver.id, updatedEmis);
        setEmis(updatedEmis);
        closeMarkPaidPopup();
      } catch (error) {
        console.error("Failed to mark payment as paid:", error);
        // Handle error - show toast/alert to user
      }
    }
  };

  const EMIMenuPopup = () => {
    if (!showEMIMenuPopup) return null;

    return (
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px]"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
      >
        <button
          onClick={openEditEMIPopup}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </button>

        <button
          onClick={openMarkEMICompletedPopup}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          EMI Completed
        </button>

        <button
          onClick={openDeleteEMIConfirm}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Delete EMI
        </button>
      </div>
    );
  };

  const EditEMIPopup = () => {
    if (!showEditEMIPopup) return null;

    return (
      <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit EMI</h3>
            <button
              onClick={closeEditEMIPopup}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Finance Company
              </label>
              <input
                type="text"
                value={editEMIData.financeCompany}
                onChange={(e) =>
                  setEditEMIData({
                    ...editEMIData,
                    financeCompany: e.target.value,
                  })
                }
                placeholder="Preetam"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Monthly EMI
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={editEMIData.monthlyEMI}
                  onChange={(e) =>
                    setEditEMIData({
                      ...editEMIData,
                      monthlyEMI: e.target.value,
                    })
                  }
                  placeholder="1,000"
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-gray-500">₹</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Due on</label>
              <select
                value={editEMIData.dueOn}
                onChange={(e) =>
                  setEditEMIData({
                    ...editEMIData,
                    dueOn: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                    {i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">Remind me on</span>
                <select
                  value={editEMIData.reminderDay}
                  onChange={(e) =>
                    setEditEMIData({
                      ...editEMIData,
                      reminderDay: e.target.value,
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="1st">1st</option>
                </select>
                <span className="text-sm text-gray-700">every month</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={closeEditEMIPopup}
              className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEditEMI}
              className="flex-1 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete EMI Confirmation Popup
  const DeleteEMIConfirmPopup = () => {
    if (!showDeleteEMIConfirm) return null;

    return (
      <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete EMI
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this EMI? This action cannot be
                undone.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{selectedEMI}</p>
                <p className="text-sm text-gray-600">
                  ₹ {selectedEMI?.monthlyEMI?.toLocaleString()}/month
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeDeleteEMIConfirm}
              className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteEMI}
              className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete EMI
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mark EMI Completed Confirmation Popup
  const MarkEMICompletedPopup = () => {
    if (!showMarkEMICompletedPopup) return null;

    return (
      <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Mark EMI as Completed
              </h3>
              <p className="text-sm text-gray-600">
                This will mark the EMI as fully paid and completed.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedEMI?.financeCompany}
                </p>
                <p className="text-sm text-gray-600">
                  ₹ {selectedEMI?.monthlyEMI?.toLocaleString()}/month
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={closeMarkEMICompletedPopup}
              className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkEMICompleted}
              className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Mark Completed
            </button>
          </div>
        </div>
      </div>
    );
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    if (type == "fuel") {
      newTransaction.expenseType = "Fuel Expense";
    }
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTransaction({
      expenseType: "",
      amountPaid: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      currentKmReading: "",
      fuelQuantity: "",
      dieselPumpName: "",
      notes: "",
    });
    setModalType(null);
    setPaymentMode("Cash");
  };

  const closeModal = () => {
    setShowModal(false);
    setNewTransaction({
      expenseType: "",
      amountPaid: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      currentKmReading: "",
      fuelQuantity: "",
      dieselPumpName: "",
      notes: "",
    });
    setModalType(null);
    setPaymentMode("Cash");
    console.log(newTransaction);
  };
  const extractNextPage = (fullUrl) => {
    if (!fullUrl) return null; // Handle undefined or null cases

    try {
      // Parse the URL to get its components
      const url = new URL(fullUrl);

      // Extract path and query parameters
      let pathWithQuery = url.pathname + url.search;

      // Remove leading slash if present
      if (pathWithQuery.startsWith("/")) {
        pathWithQuery = pathWithQuery.substring(1);
      }

      // Check if the path contains "api/" and remove it to avoid duplication
      const apiPattern = /^api\//i;
      if (apiPattern.test(pathWithQuery)) {
        pathWithQuery = pathWithQuery.replace(apiPattern, "");
      }

      return pathWithQuery;
    } catch (error) {
      // If URL parsing fails (e.g., if it's not a valid URL), return the original
      console.warn("Invalid URL format:", error.message);
      return fullUrl;
    }
  };
  const [errors, setErrors] = useState({
    truckNo: "",
  });

  const fetchDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.trucks.list, {
        page: currentPage,
        search: searchTerm,
        page_size: recordsPerPage, // Use dynamic value instead of ITEMS_PER_PAGE
      });
      setDrivers(response.data);
      setTotalPages(response.total_pages);
      setPrevPage(extractNextPage(response.previous));
      setNextPage(extractNextPage(response.next));
      console.log(response.total_pages);
    } catch (error) {
      notifyError("Error fetching drivers");
    }
  };
  const openTripSidebar = () => {
    setShowSidebar(true);
  };

  const closeTripSidebar = () => {
    setShowSidebar(false);
  };
  const billingOptions = [
    "Fixed",
    "Per Tonne",
    "Per Kg",
    "Per Km",
    "Per Trip",
    "Per Day",
    "Per Hour",
    "Per Litre",
    "Per Bag",
  ];

  const expenseTypeOptionsMaintenance = [
    "Showroom Service",
    "Regular Service",
    "Minor Repair",
    "Gear Maintenance",
    "Brake Oil Change",
    "Grease Oil Change",
    "Engine Oil Change",
    "Spare Parts Purhcase",
    "Air Filter Change",
    "Tyre Purchase",
    "Tyre Retread",
    "Tyre Puncture",
    "Roof Top Repair",
  ];
  const expenseTypeOptionsDriver = [
    "Driver Batta",
    "Driver Payment",
    "Loading Charges",
    "Unloading Charges",
    "Detention Charges",
    "Union Charges",
    "Toll Expense",
    "Police Expense",
    "RTO Expense",
    "Brokerage Expense",
    "Other Expense",
  ];
  const paymentOptions = ["Cash", "Credit", "Paid by Driver", "Online"];

  const toggleTruckTypeFilterDropdown = () => {
    setShowTruckTypeFilterDropdown(!showTruckTypeFilterDropdown);
  };

  const toggleTruckOwnershipFilterDropdown = () => {
    setShowTruckOwnershipFilterDropdown(!showTruckOwnershipFilterDropdown);
  };

  const toggleTruckStatusFilterDropdown = () => {
    setShowTruckStatusFilterDropdown(!showTruckStatusFilterDropdown);
  };

  const fetchTransactions = async (driver) => {
    try {
      console.log(driver);

      const response = await api.get(API_ENDPOINTS.trucks.expenses(driver.id), {
        page: currentPage,
        page_size: recordsPerPage, // Use dynamic value instead of ITEMS_PER_PAGE
      });
      setTransactions(response.data);
      console.log(transactions);
    } catch (error) {
      console.log(error);
      notifyError("Error fetching Transactions");
    }
  };

  const getSortedAndFilteredDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.trucks.list, {
        page: currentPage,
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setSortedAndFilteredDrivers(response.data);
      }
      setColumnFilteredDrivers(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        console.log("Transaction modal states changed:", {
          showAddTransactionModal,
          showEditTransactionModal,
          showTransactionsModal,
        });

        if (showAddTransactionModal) {
          setShowAddTransactionModal(false);
          setNewTransaction({
            expenseType: "",
            amountPaid: "",
            expenseDate: new Date().toISOString().split("T")[0],
            paymentMode: "Cash",
            currentKmReading: "",
            fuelQuantity: "",
            notes: "",
          });
          return; // Exit the function to prevent other modals from closing
        }

        // If edit transaction modal is open from transaction sidebar
        if (showEditTransactionModal) {
          setShowEditTransactionModal(false);
          setEditingTransaction(null);
          return; // Exit the function to prevent other modals from closing
        }

        // Close all modals
        setIsAddTruckModalOpen(false);
        setIsEditTruckModalOpen(false);
        setIsViewTruckModalOpen(false);
        setIsDeleteConfirmOpen(false);
        setShowTransactionsModal(false);
        setShowTruckTypeFilterDropdown(false);
        setShowTruckOwnershipFilterDropdown(false);
        setShowTruckStatusFilterDropdown(false);
        // Reset states if needed
        setNewDriver({
          truckNo: "",
          truckType: "",
          ownership: "",
          truckStatus: "available",
        });
        setCurrentDriver(null);
        setIsEditMode(false);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [
    showAddTransactionModal,
    showEditTransactionModal,
    showTransactionsModal,
    setShowAddTransactionModal,
    setShowEditTransactionModal,
    setNewTransaction,
    setIsAddTruckModalOpen,
    setIsEditTruckModalOpen,
    setIsViewTruckModalOpen,
    setIsDeleteConfirmOpen,
    setShowTruckTypeFilterDropdown,
    setShowTruckStatusFilterDropdown,
    setShowTruckOwnershipFilterDropdown,
    setNewDriver,
    setCurrentDriver,
    setIsEditMode,
  ]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Sort function for table columns
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = (data) => {
    return data;
  };

  useEffect(() => {
    getSortedAndFilteredDrivers();
  }, [recordsPerPage]);
  useEffect(() => {
    getSortedAndFilteredDrivers();
  }, [sortConfig]);
  useEffect(() => {
    getSortedAndFilteredDrivers();
  }, [searchTerm]);
  useEffect(() => {
    getSortedAndFilteredDrivers();
  }, [driverFilters]); // ✅ API call will trigger when driverFilters changes

  const handleFilterChange = (event, filterType) => {
    const value = event.target.value; // Get the value from the checkbox
    const isChecked = event.target.checked;

    setDriverFilters((prevFilters) => {
      if (isChecked) {
        // ✅ Add new filter
        return [...prevFilters, { [filterType]: value }];
      } else {
        // ✅ Remove filter
        return prevFilters.filter((filter) => filter[filterType] !== value);
      }
    });
  };

  // Filter drivers based on search term
  const filteredDrivers = columnFilteredDrivers.filter(
    (truck) =>
      truck.truckNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.truckType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFilteredData = (data) => {
    if (driverFilters.length === 0) {
      return data;
    }
    const newData = data.filter((driver) =>
      driverFilters.some((contact) => {
        console.log(driver.name);

        // Check name match if the contact object has a name property
        if (contact.name) {
          return driver.name.toLowerCase() === contact.name.toLowerCase();
        }

        // Check phone number match if the contact object has a phone property
        if (contact.status) {
          return driver.status === contact.status;
        }

        // Return false if the contact object doesn't have name or phone
        return false;
      })
    );
    console.log(newData);
    console.log(driverFilters);

    return newData;
  };

  // Get sorted and filtered drivers
  const outDrivers = getSortedData(filteredDrivers);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = outDrivers;

  // Change page
  const paginate = async (page) => {
    const pageUrl = `${API_ENDPOINTS.trucks.list}?page=${page}&page_size=${recordsPerPage}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setSortedAndFilteredDrivers(response.data);
      }
      setColumnFilteredDrivers(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage(page);
      console.log(currentPage);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  // Previous page
  const prevPageClick = async () => {
    try {
      const response = await api.get(prevPage, {
        page: currentPage - 1,
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setSortedAndFilteredDrivers(response.data);
      }
      setColumnFilteredDrivers(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage((prev) => prev - 1);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    console.log("Updated nextPage:", nextPage);
  }, [nextPage]);
  // Next page
  const nextPageClick = async () => {
    console.log(currentPage);

    try {
      const response = await api.get(nextPage, {
        search: searchTerm,
        page: currentPage + 1,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setSortedAndFilteredDrivers(response.data);
      }
      setColumnFilteredDrivers(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
    console.log(nextPage);
  };

  // Handle driver search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Open "Add Driver" modal
  const handleAddTruckClick = () => {
    setIsAddTruckModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClick = (truck) => {
    setCurrentDriver(truck);
    setNewDriver({
      truckNo: truck.truckNo,
      truckType: truck.truckType,
      ownership: truck.ownership,
      truckStatus: truck.truckStatus,
    });
    setIsEditTruckModalOpen(true);
  };

  const handleTransactionClick = (driver) => {
    setSelectedDriver(driver);
    console.log(selectedDriver);
    setShowTransactionsModal(true);
    fetchTransactions(driver);
  };

  // Function to close the modal
  const closeTransactionModal = () => {
    setShowTransactionsModal(false);
    setCurrentDriver(null);
  };

  // Function to open add transaction modal
  const openAddTransactionModal = () => {
    setShowAddTransactionModal(true);
  };

  // Function to close add transaction modal
  const closeAddTransactionModal = () => {
    setShowAddTransactionModal(false);
  };

  // Function to handle input change in add transaction form

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => {
      const updatedTransaction = { ...prev, [name]: value };
      return updatedTransaction;
    });
  };
  // Function to add a new transaction
  const handleAddExpense = async (e) => {
    e.preventDefault();

    const expense = {
      truckId: selectedDriver.id,
      expenseType: newTransaction.expenseType,
      amountPaid: parseFloat(newTransaction.amountPaid),
      fuelQuantity: newTransaction.fuelQuantity,
      expenseDate: newTransaction.expenseDate,
      notes: newTransaction.notes,
      paymentMode: newTransaction.paymentMode,
      currentKmReading: newTransaction.currentKmReading,
    };
    console.log(expense);

    try {
      await api.post(
        API_ENDPOINTS.trucks.expensesCreate(selectedDriver.id),
        expense,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      console.log(selectedDriver);
      setNewTransaction({
        expenseType: "",
        amountPaid: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMode: "Cash",
        currentKmReading: "",
        fuelQuantity: "",
        notes: "",
      });
      notifySuccess("Expense added successfully");
      fetchTransactions(selectedDriver);
      closeModal();
      closeAddTransactionModal();
    } catch (error) {
      notifyError("Error adding driver");
    }
  };
  const openEditTransactionModal = (transaction) => {
    setEditingTransaction({
      ...transaction,
      amountPaid: transaction.amountPaid.toString(),
    });
    if (transaction.expenseType == "Fuel Expense") {
      setModalType("fuel");
    } else if (
      expenseTypeOptionsMaintenance.includes(transaction.expenseType)
    ) {
      setModalType("maintenance");
    } else {
      setModalType("driver");
    }
    setShowEditModal(true);
  };

  // Function to close edit transaction modal
  const closeEditTransactionModal = () => {
    setShowEditTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditingTransaction({
      ...editingTransaction,
      [name]: value,
    });
  };
  const handleDeleteExpenseClick = (expense) => {
    console.log(selectedDriver);
    console.log("Hi");
    console.log(currentDriver);

    setShowDeleteExpenseModal(true);
    setCurrentTransaction(expense);
  };

  const handleDeleteExpense = async (e) => {
    e.preventDefault();
    try {
      await api.delete(
        API_ENDPOINTS.trucks.expensesDelete(currentTransaction.id)
      );
      notifyInfo("Expense deleted successfully");
      fetchTransactions(selectedDriver);
      setShowDeleteExpenseModal(false);
      setCurrentTransaction(null);
    } catch {
      notifyError("Error deleting expense");
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        API_ENDPOINTS.trucks.expensesUpdate(editingTransaction.id),
        editingTransaction,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      console.log(editingTransaction);

      fetchTransactions(selectedDriver);
      notifySuccess("Expense edited successfully");
      closeEditModal();
      closeAddTransactionModal();
    } catch (error) {
      notifyError("Error updating expense");
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        API_ENDPOINTS.drivers.transactionsUpdate(editingTransaction.id),
        editingTransaction,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      fetchTransactions(selectedDriver);
      notifySuccess("Transaction edited successfully");
    } catch (error) {
      notifyError("Error adding driver");
    }
    closeEditTransactionModal();
  };
  // Function to edit a transaction

  // Function to delete a transaction
  const handleDeleteTransactionClick = (transaction) => {
    setShowDeleteTransactionModal(true);
    setCurrentTransaction(transaction);
  };

  const handleDeleteTransactionModal = async () => {
    try {
      await api.delete(
        API_ENDPOINTS.drivers.transactionsDelete(currentTransaction.id)
      );
      notifyInfo("Trnsaction deleted successfully");
      fetchTransactions(selectedDriver);
      setShowDeleteTransactionModal(false);
      setCurrentTransaction(null);
    } catch {
      notifyError("Error deleting transaction");
    }
  };
  // Open delete confirmation
  const handleDeleteClick = (driver) => {
    setCurrentDriver(driver);
    setIsDeleteConfirmOpen(true);
  };

  const validateTruckForm = () => {
    let valid = true;
    let newErrors = {
      truckNo: "",
      truckType: "",
      ownership: "",
      truckStatus: "",
    };

    // Validate truck number
    if (!newDriver.truckNo) {
      newErrors.truckNo = "Truck Number is required.";
      valid = false;
    } else if (newDriver.truckNo.length !== 10) {
      newErrors.truckNo = "Truck No must be exactly 10 digits.";
      valid = false;
    }

    // Validate truck type
    if (!newDriver.truckType) {
      newErrors.truckType = "Please select a Truck Type.";
      valid = false;
    }

    // Validate ownership
    if (!newDriver.ownership) {
      newErrors.ownership = "Please select an Ownership type.";
      valid = false;
    }

    // Validate truck status
    if (!newDriver.truckStatus) {
      newErrors.truckStatus = "Please select a Status.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAddTruckFormSubmit = (e) => {
    e.preventDefault(); // Prevent form submission if invalid
    if (validateTruckForm()) {
      handleAddTruck(e); // Call parent submit function if valid
    }
  };
  // Handle input changes for driver form
  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
    console.log(newDriver);
  };

  const totalAmount = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amountPaid);
      return total - amount;
    }, 0);
  });

  // Handle add driver form submission
  const handleAddTruck = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("truckNo", newDriver.truckNo);
    formData.append("truckType", newDriver.truckType);
    formData.append("ownership", newDriver.ownership);
    formData.append("truckStatus", newDriver.truckStatus); // Add more fields if needed

    try {
      await api.post(API_ENDPOINTS.trucks.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set header
        },
      });
      notifySuccess("Truck added successfully");
      fetchDrivers();
      getSortedAndFilteredDrivers();
      setIsAddTruckModalOpen(false);
      resetNewDriverForm();
    } catch (error) {
      notifyError("Error adding driver");
    }
  };

  // Handle edit driver form submission
  // Handle edit driver form submission - works for both regular edit and view-edit modes
  const handleEditTruck = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (!currentDriver) return;

    try {
      await api.put(API_ENDPOINTS.trucks.update(currentDriver.id), newDriver);
      notifyInfo("Truck updated successfully");
      await fetchDrivers();
      await getSortedAndFilteredDrivers();

      if (fromViewModal) {
        // If coming from view modal, just exit edit mode
        setIsEditMode(false);
      } else {
        // If coming from regular edit modal, close it
        setIsEditTruckModalOpen(false);
        setCurrentDriver(null);
        setNewDriver({
          truckNo: "",
          truckType: "",
          ownership: "",
          truckStatus: "available",
        });
      }
    } catch (error) {
      console.error("Error updating driver:", error);
      notifyError("Error updating driver");
    }
  };
  const handleEditTruckFormSubmit = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (validateTruckForm()) {
      handleEditTruck(e, fromViewModal); // Call parent submit function if valid
    }
  };

  const toggleEditMode = () => {
    console.log("Hiii");

    if (isEditMode) {
      // If in edit mode, call the shared edit handler with fromViewModal=true
      handleEditTruckFormSubmit(null, true);
      console.log(newDriver);
    } else {
      // If in view mode, close the view modal and open the edit modal instead
      setIsViewTruckModalOpen(false); // Close view modal
      // Open edit modal with current driver data
      setNewDriver({
        truckNo: currentDriver.truckNo,
        truckType: currentDriver.truckType,
        ownership: currentDriver.ownership,
        truckStatus: currentDriver.truckStatus,
      });

      console.log(newDriver);

      // Open the regular edit modal
      setIsEditTruckModalOpen(true);
    }
  };

  // Handle delete driver
  const handleDeleteTruck = async () => {
    if (!currentDriver) return;
    try {
      await api.delete(API_ENDPOINTS.trucks.delete(currentDriver.id));
      notifyInfo("Driver deleted successfully");
      fetchDrivers();
      getSortedAndFilteredDrivers();
      setIsDeleteConfirmOpen(false);
      setCurrentDriver(null);
    } catch {
      notifyError("Error updating driver");
    }
  };

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  // Get sort direction icon
  const getSortDirectionIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortConfig.direction === "ascending" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Trucks</h1>
          <button
            onClick={handleAddTruckClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add Truck
          </button>
        </div>

        <div className="bg-white rounded-md shadow-md p-6">
          {/* Search Input */}
          <div className="mb-6 flex flex-wrap justify-end items-center">
            <div className="flex items-center relative w-full md:w-80 mx-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search Trucks"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
              />
              {driverFilters.length > 0 && (
                <button
                  onClick={() => setDriverFilters([])}
                  className="flex items-center justify-center whitespace-nowrap px-4 py-2 mx-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-md transition-colors duration-200 text-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mt-4 md:mt-0 flex items-center">
              <label className="mr-2 text-sm text-gray-600">
                Records per page:
              </label>
              <select
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                className="border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          {/* Drivers Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("truckNo")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Truck Number
                      </span>
                      {getSortDirectionIcon("truckNo")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer flex">
                    <div
                      className="flex items-center space-x-1"
                      onClick={() => requestSort("truckType")}
                    >
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Truck Type
                      </span>
                      {getSortDirectionIcon("truckType")}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleTruckTypeFilterDropdown}
                        className="px-3 py-2 hover:bg-gray-100 focus:outline-none"
                      >
                        {driverFilters.some(
                          (filter) =>
                            filter.truckType && filter.truckType.trim() !== ""
                        ) ? (
                          <FilterX size={20} className="text-blue-500" />
                        ) : (
                          <Filter size={20} className="text-gray-500" />
                        )}
                      </button>
                      {showTruckTypeFilterDropdown && (
                        <div className="fixed mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          <div className="p-3">
                            <div className="flex justify-between">
                              <h4 className="block mb-2 font-medium text-gray-700">
                                Search In
                              </h4>
                              <button
                                onClick={toggleTruckTypeFilterDropdown}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                            {(driverFilters.some(
                              (filter) => !("truckType" in filter)
                            )
                              ? [
                                  ...new Set(
                                    columnFilteredDrivers.map(
                                      (e) => e.truckType
                                    )
                                  ),
                                ]
                              : [...new Set(drivers.map((e) => e.truckType))]
                            ).map((truckType) => (
                              <label
                                key={truckType}
                                className="flex items-center space-x-2 py-1 mb-2 font-medium text-gray-700"
                              >
                                <input
                                  key={truckType}
                                  type="checkbox"
                                  checked={driverFilters.some(
                                    (filter) => filter.truckType === truckType
                                  )}
                                  onChange={(event) =>
                                    handleFilterChange(event, "truckType")
                                  }
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                  value={truckType}
                                />
                                <span className="text-sm capitalize">
                                  {truckType}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer">
                    <div className="flex">
                      <div
                        className="flex items-center space-x-1"
                        onClick={() => requestSort("ownership")}
                      >
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Ownership
                        </span>
                        {getSortDirectionIcon("ownership")}
                      </div>
                      <div className="relative">
                        <button
                          onClick={toggleTruckOwnershipFilterDropdown}
                          className="px-3 py-2 hover:bg-gray-100 focus:outline-none"
                        >
                          {driverFilters.some(
                            (filter) =>
                              filter.ownership && filter.ownership.trim() !== ""
                          ) ? (
                            <FilterX size={20} className="text-blue-500" />
                          ) : (
                            <Filter size={20} className="text-gray-500" />
                          )}
                        </button>
                        {showTruckOwnershipFilterDropdown && (
                          <div className="fixed mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                            <div className="p-3">
                              <div className="flex justify-between">
                                <h4 className="block mb-2 font-medium text-gray-700">
                                  Search In
                                </h4>
                                <button
                                  onClick={toggleTruckOwnershipFilterDropdown}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {(driverFilters.some(
                                (filter) => !("ownership" in filter)
                              )
                                ? [
                                    ...new Set(
                                      columnFilteredDrivers.map(
                                        (e) => e.ownership
                                      )
                                    ),
                                  ]
                                : [...new Set(drivers.map((e) => e.ownership))]
                              ).map((ownership) => (
                                <label
                                  key={ownership}
                                  className="flex items-center space-x-2 py-1 mb-2 font-medium text-gray-700"
                                >
                                  <input
                                    key={ownership}
                                    type="checkbox"
                                    checked={driverFilters.some(
                                      (filter) => filter.ownership === ownership
                                    )}
                                    onChange={(event) =>
                                      handleFilterChange(event, "ownership")
                                    }
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                    value={ownership}
                                  />
                                  <span className="text-sm capitalize">
                                    {ownership}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer flex">
                    <div
                      className="flex items-center space-x-1"
                      onClick={() => requestSort("status")}
                    >
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </span>
                      {getSortDirectionIcon("status")}
                    </div>
                    <div className="relative">
                      <button
                        onClick={toggleTruckStatusFilterDropdown}
                        className="px-3 py-2 hover:bg-gray-100 focus:outline-none"
                      >
                        {driverFilters.some(
                          (filter) =>
                            filter.truckStatus &&
                            filter.truckStatus.trim() !== ""
                        ) ? (
                          <FilterX size={20} className="text-blue-500" />
                        ) : (
                          <Filter size={20} className="text-gray-500" />
                        )}
                      </button>
                      {showTruckStatusFilterDropdown && (
                        <div className="fixed mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                          <div className="p-3">
                            <div className="flex justify-between">
                              <h4 className="block mb-2 font-medium text-gray-700">
                                Search In
                              </h4>
                              <button
                                onClick={toggleTruckStatusFilterDropdown}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                            {(driverFilters.some(
                              (filter) => !("truckStatus" in filter)
                            )
                              ? [
                                  ...new Set(
                                    columnFilteredDrivers.map(
                                      (e) => e.truckStatus
                                    )
                                  ),
                                ]
                              : [...new Set(drivers.map((e) => e.truckStatus))]
                            ).map((truckStatus) => (
                              <label
                                key={truckStatus}
                                className="flex items-center space-x-2 py-1 mb-2 font-medium text-gray-700"
                              >
                                <input
                                  key={truckStatus}
                                  type="checkbox"
                                  checked={driverFilters.some(
                                    (filter) =>
                                      filter.truckStatus === truckStatus
                                  )}
                                  onChange={(event) =>
                                    handleFilterChange(event, "truckStatus")
                                  }
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                  value={truckStatus}
                                />
                                <span className="text-sm capitalize">
                                  {truckStatus}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((truck) => (
                  <tr
                    key={truck.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(truck)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-gray-900">
                        {truck.truckNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {truck.truckType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {truck.ownership}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`h-3 w-3 rounded-full mr-2 ${
                            truck.truckStatus_display === "Available"
                              ? "bg-accent"
                              : truck.truckStatus_display === "On Trip"
                              ? "bg-primary"
                              : "bg-danger"
                          }`}
                        ></span>
                        <span className="text-base font-medium text-gray-900">
                          {truck.truckStatus_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRowClick(truck);
                          }}
                          className="text-primary hover:text-blue-700 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="bi bi-eye h-5 w-5"
                            fill="currentColor"
                            stroke="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleEditClick(truck);
                          }}
                          className="text-primary hover:text-blue-700 transition-colors"
                          title="Edit Driver"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteClick(truck);
                          }}
                          className="text-danger hover:text-red-600 transition-colors"
                          title="Delete Driver"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty state */}
            {sortedAndFilteredDrivers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-700 text-base">
                  No trucks found. Try a different search term or add a new
                  truck.
                </p>
              </div>
            )}
          </div>
          {showTransactionsModal && (
            <div className="fixed inset-y-0 right-0 z-30 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Transactions for {selectedDriver.truckNo} -{" "}
                  {selectedDriver.truckType}
                </h2>
                <button
                  onClick={closeTransactionModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Summary Section */}
              <div className="bg-gray-100 p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-600 mr-2">
                    Total Amount:
                  </span>
                  <span
                    className={`text-lg font-bold flex ${
                      totalAmount >= 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                      <path d="M7 9l11 0" />
                    </svg>
                    {Math.abs(totalAmount).toFixed(2)}
                  </span>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    totalAmount >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {totalAmount >= 0 ? "Net Credit" : "Net Debit"}
                </span>
                <div>
                  <button
                    onClick={openAddTransactionModal}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Expense
                  </button>
                  <button
                    onClick={openEMISidebar}
                    className="ml-2 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    📊 EMI Book
                  </button>
                  <button
                    onClick={openDocumentsSidebar}
                    className="ml-2 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    📄 Documents
                  </button>
                  {/* <button
                    onClick={openTripSidebar}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Trip
                  </button> */}
                </div>
              </div>

              <div className="flex-grow overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DATE
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REASON
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EXPENSES
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        REVENUE
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-gray-50"
                        onClick={() => openEditTransactionModal(transaction)}
                      >
                        <td className="px-4 py-3 text-black">
                          {transaction.expenseDate}
                        </td>
                        <td className="px-4 py-3 text-black">
                          {transaction.expenseType}
                        </td>
                        <td className="px-4 py-3 text-black flex">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                            <path d="M7 9l11 0" />
                          </svg>
                          <span
                            className="inline-block px-2 py-1 rounded-full font-medium
                                bg-red-100 text-red-800"
                          >
                            {transaction.amountPaid}
                          </span>
                        </td>
                        <td className="px-4 py-3">Null</td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              openEditTransactionModal(transaction)
                            }
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExpenseClick(transaction);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          No expenses found for this truck.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {showAddTransactionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Expenses
                  </h2>
                  <button
                    onClick={closeAddTransactionModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 flex justify-center space-x-8">
                  <div
                    onClick={() => openModal("fuel")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="text-blue-600 mb-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12H3V8z" />
                        <path d="M11 14h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3v6z" />
                        <path d="M13 5v3" />
                        <path d="M8 5v3" />
                      </svg>
                    </div>
                    <div className="text-center text-black">
                      <div className="font-medium">Fuel</div>
                      <div>Expense</div>
                    </div>
                  </div>

                  <div
                    onClick={() => openModal("maintenance")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="text-blue-600 mb-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    </div>
                    <div className="text-center text-black">
                      <div className="font-medium">Maintenance</div>
                      <div>Expense</div>
                    </div>
                  </div>

                  <div
                    onClick={() => openModal("driver")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="text-blue-600 mb-2">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                      </svg>
                    </div>
                    <div className="text-center text-black">
                      <div className="font-medium ">Driver/Other</div>
                      <div>Expense</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showModal && modalType === "fuel" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Fuel Expense
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-black hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Amount*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        placeholder="Enter Amount"
                        value={newTransaction.amountPaid}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="flex mb-4 gap-4">
                    <div className="flex-1">
                      <label className="block text-black mb-1">
                        Fuel Quantity
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fuelQuantity"
                          placeholder="Fuel Quantity"
                          value={newTransaction.fuelQuantity}
                          onChange={handleInputChange}
                          className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                        />
                        <span className="absolute right-3 top-2.5 text-black">
                          L
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-black">Optional</div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-black mb-1">
                        Rate per litre
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="ratePerLitre"
                          placeholder="Rate per litre"
                          value={
                            newTransaction.fuelQuantity > 0
                              ? newTransaction.amountPaid /
                                newTransaction.fuelQuantity
                              : ""
                          }
                          readOnly
                          className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                        />
                        <span className="absolute right-3 top-2.5 text-black">
                          ₹
                        </span>
                      </div>
                      <div className="text-black text-sm mt-1">Optional</div>
                    </div>
                  </div>

                  {/* <div className="mb-4 flex items-center">
                    <span className="mr-2 text-black">
                      I have filled full tank
                    </span>
                    <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                    </div>
                  </div> */}

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Current KM Reading
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="currentKmReading"
                        value={newTransaction.currentKmReading}
                        onChange={handleInputChange}
                        placeholder="Current KM Reading"
                        className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        KMs
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={newTransaction.expenseDate}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  {/* <div className="mb-4">
                    <button className="bg-blue-100 text-blue-500 p-2 rounded-md">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  </div> */}

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            newTransaction.paymentMode = option;
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleAddExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* General Expense Modal */}
          {showModal && modalType === "maintenance" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Expense / Purchase
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Type*
                    </label>
                    <select
                      name="expenseType"
                      value={newTransaction.expenseType}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Expense Type</option>
                      {expenseTypeOptionsMaintenance.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Amount Paid*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        value={newTransaction.amountPaid}
                        onChange={handleInputChange}
                        placeholder="Amount Paid"
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={newTransaction.expenseDate}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            newTransaction.paymentMode = option;
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Current KM Reading
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="currentKmReading"
                        onChange={handleInputChange}
                        placeholder="Current KM Reading"
                        className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        KMs
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleAddExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Driver/Other Expense Modal */}
          {showModal && modalType === "driver" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Driver / Other Expense
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Type*
                    </label>
                    <select
                      name="expenseType"
                      value={newTransaction.expenseType}
                      onChange={handleInputChange}
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Expense Type</option>
                      {expenseTypeOptionsDriver.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Amount Paid*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        value={newTransaction.amountPaid}
                        onChange={handleInputChange}
                        placeholder="Amount Paid"
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={newTransaction.expenseDate}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            newTransaction.paymentMode = option;
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">Notes</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-black">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="21" y1="6" x2="3" y2="6" />
                          <line x1="21" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="18" x2="3" y2="18" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes"
                        value={newTransaction.notes}
                        onChange={handleInputChange}
                        className="w-full border rounded-md p-2 pl-10 text-black"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleAddExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEditModal && modalType === "fuel" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Fuel Expense
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="text-black hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Amount*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        placeholder="Enter Amount"
                        value={editingTransaction.amountPaid}
                        onChange={handleEditInputChange}
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="flex mb-4 gap-4">
                    <div className="flex-1">
                      <label className="block text-black mb-1">
                        Fuel Quantity
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fuelQuantity"
                          placeholder="Fuel Quantity"
                          value={editingTransaction.fuelQuantity}
                          onChange={handleEditInputChange}
                          className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                        />
                        <span className="absolute right-3 top-2.5 text-black">
                          L
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-black">Optional</div>
                    </div>

                    <div className="flex-1">
                      <label className="block text-black mb-1">
                        Rate per litre
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="ratePerLitre"
                          placeholder="Rate per litre"
                          value={
                            editingTransaction.fuelQuantity > 0
                              ? editingTransaction.amountPaid /
                                editingTransaction.fuelQuantity
                              : ""
                          }
                          readOnly
                          className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                        />
                        <span className="absolute right-3 top-2.5 text-black">
                          ₹
                        </span>
                      </div>
                      <div className="text-black text-sm mt-1">Optional</div>
                    </div>
                  </div>

                  {/* <div className="mb-4 flex items-center">
                    <span className="mr-2 text-black">
                      I have filled full tank
                    </span>
                    <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
                    </div>
                  </div> */}

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Current KM Reading
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="currentKmReading"
                        value={editingTransaction.currentKmReading}
                        onChange={handleEditInputChange}
                        placeholder="Current KM Reading"
                        className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        KMs
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={editingTransaction.expenseDate}
                        onChange={handleEditInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  {/* <div className="mb-4">
                    <button className="bg-blue-100 text-blue-500 p-2 rounded-md">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  </div> */}

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            editingTransaction.paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            setEditingTransaction({
                              ...editingTransaction,
                              paymentMode: option,
                            });
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeEditModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleEditExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* General Expense Modal */}
          {showEditModal && modalType === "maintenance" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Expense / Purchase
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Type*
                    </label>
                    <select
                      name="expenseType"
                      value={editingTransaction.expenseType}
                      onChange={handleEditInputChange}
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Expense Type</option>
                      {expenseTypeOptionsMaintenance.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Amount Paid*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        value={editingTransaction.amountPaid}
                        onChange={handleEditInputChange}
                        placeholder="Amount Paid"
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={editingTransaction.expenseDate}
                        onChange={handleEditInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            editingTransaction.paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            setEditingTransaction({
                              ...editingTransaction,
                              paymentMode: option,
                            });
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Current KM Reading
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="currentKmReading"
                        value={editingTransaction.currentKmReading}
                        onChange={handleEditInputChange}
                        placeholder="Current KM Reading"
                        className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        KMs
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeEditModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleEditExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Driver/Other Expense Modal */}
          {showEditModal && modalType === "driver" && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-medium text-black">
                    Add Driver / Other Expense
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Type*
                    </label>
                    <select
                      name="expenseType"
                      value={editingTransaction.expenseType}
                      onChange={handleEditInputChange}
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Expense Type</option>
                      {expenseTypeOptionsDriver.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Amount Paid*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amountPaid"
                        value={editingTransaction.amountPaid}
                        onChange={handleEditInputChange}
                        placeholder="Amount Paid"
                        className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                      />
                      <span className="absolute right-3 top-2.5 text-black">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={editingTransaction.expenseDate}
                        onChange={handleEditInputChange}
                        className="w-full border rounded-md p-2 text-black"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Payment Mode*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {paymentOptions.map((option) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-md text-sm ${
                            editingTransaction.paymentMode === option
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          name="paymentMode"
                          onClick={() => {
                            setEditingTransaction({
                              ...editingTransaction,
                              paymentMode: option,
                            });
                            setPaymentMode(option);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black mb-1">Notes</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-black">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="21" y1="6" x2="3" y2="6" />
                          <line x1="21" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="18" x2="3" y2="18" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="notes"
                        placeholder="Notes"
                        value={editingTransaction.notes}
                        onChange={handleEditInputChange}
                        className="w-full border rounded-md p-2 pl-10 text-black"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">Add Trip</label>
                    <select
                      name="addTrip"
                      className="w-full border rounded-md p-2 text-black"
                    >
                      <option value="">Select Trip</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end p-4 border-t">
                  <button
                    onClick={closeEditModal}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button
                    className="bg-gray-300 text-black px-4 py-2 rounded-md"
                    onClick={handleEditExpense}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showSidebar && (
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40">
              <div className="absolute right-0 top-0 bottom-0 bg-white w-full max-w-lg shadow-lg z-60 flex flex-col">
                {/* Header - Fixed */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-semibold text-black">Add Trip</h2>
                  <button
                    onClick={closeTripSidebar}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Trip Details Section */}
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold mb-4 text-black">
                      Trip Details
                    </h3>

                    <div className="mb-4">
                      <label className="block text-black mb-1">
                        Select Party *
                      </label>
                      <div className="relative">
                        <select className="w-full border rounded-md p-2 appearance-none bg-white text-black">
                          <option>Arjun Reddy</option>
                        </select>
                        <ChevronDown
                          size={20}
                          className="absolute right-3 top-2.5 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-black mb-1">
                          Truck Registration No.*
                        </label>
                        <div className="relative">
                          <select className="w-full border rounded-md p-2 appearance-none bg-white text-black">
                            <option>TN22CR3044</option>
                          </select>
                          <ChevronDown
                            size={20}
                            className="absolute right-3 top-2.5 text-black pointer-events-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-black mb-1">
                          Driver Name*
                        </label>
                        <div className="relative">
                          <select className="w-full border rounded-md p-2 appearance-none bg-white text-black">
                            <option>Preetam</option>
                          </select>
                          <ChevronDown
                            size={20}
                            className="absolute right-3 top-2.5 text-black pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Route Section */}
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold mb-4 text-black">
                      Route
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-black mb-1">Origin*</label>
                        <div className="relative">
                          <select className="w-full border rounded-md p-2 appearance-none bg-white text-black">
                            <option>Bangalore</option>
                          </select>
                          <ChevronDown
                            size={20}
                            className="absolute right-3 top-2.5 text-black pointer-events-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-black mb-1">
                          Destination*
                        </label>
                        <div className="relative">
                          <select className="w-full border rounded-md p-2 appearance-none bg-white text-black">
                            <option>Eg: Delhi</option>
                          </select>
                          <ChevronDown
                            size={20}
                            className="absolute right-3 top-2.5 text-black pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing Information Section */}
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold mb-4 text-black">
                      Billing Information
                    </h3>

                    <div className="mb-4">
                      <label className="block text-black mb-1">
                        Party Billing Type *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {billingOptions.map((option) => (
                          <button
                            key={option}
                            className={`px-4 py-2 rounded-md text-sm ${
                              billingType === option
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                            onClick={() => setBillingType(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-black mb-1">
                        Party Freight Amount*
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-2.5 text-black">
                          ₹
                        </div>
                        <input
                          type="text"
                          placeholder="Eg: 45,000"
                          className="w-full border rounded-md p-2 pl-7 text-black"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-black mb-1">
                          Start Date*
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border rounded-md p-2 pr-10 text-black"
                          />
                          <Calendar
                            size={20}
                            className="absolute right-3 top-2.5 text-black"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-black mb-1">
                          Start Kms Reading
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Start readings"
                            className="w-full border rounded-md p-2 pr-12 text-black"
                          />
                          <span className="absolute right-3 top-2.5 text-black">
                            KMs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <button
                        onClick={() => setShowMoreDetails((prev) => !prev)}
                        className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md"
                      >
                        Add More Details
                      </button>
                    </div>

                    {showMoreDetails && (
                      <div className="border-t pt-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-black mb-1">
                              Additional Field 1
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-md p-2 text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-black mb-1">
                              Additional Field 2
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-md p-2 text-black"
                            />
                          </div>
                        </div>
                        {/* Adding more fields to demonstrate scrolling */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-black mb-1">
                              Notes
                            </label>
                            <textarea
                              className="w-full border rounded-md p-2 text-black"
                              rows={3}
                            ></textarea>
                          </div>
                          <div>
                            <label className="block text-black mb-1">
                              Reference Number
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-md p-2 text-black"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-black mb-1">
                              Expected End Date
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full border rounded-md p-2 pr-10 text-black"
                              />
                              <Calendar
                                size={20}
                                className="absolute right-3 top-2.5 text-black"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-black mb-1">
                              Contact Person
                            </label>
                            <input
                              type="text"
                              className="w-full border rounded-md p-2 text-black"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Adding extra padding at the bottom to ensure content doesn't get hidden behind the footer */}
                  <div className="pb-16"></div>
                </div>

                {/* Footer - Fixed */}
                <div className="border-t bg-white p-4 flex justify-end mt-auto">
                  <button
                    onClick={closeTripSidebar}
                    className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md mr-2"
                  >
                    Close
                  </button>
                  <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
                    Save Trip
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Edit Transaction Modal */}
          {showEditTransactionModal && editingTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[1100] flex justify-center items-center">
              <div className="bg-white rounded-lg w-[400px] p-5 relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-5 pb-2.5 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Edit Transaction
                  </h3>
                  <button
                    onClick={closeEditTransactionModal}
                    className="text-2xl text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    ×
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateTransaction}>
                  {/* Amount Input */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={editingTransaction.amount}
                      onChange={handleEditInputChange}
                      placeholder="Enter amount"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  {/* Type Select */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      name="amountType"
                      value={editingTransaction.amountType}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                    </select>
                  </div>

                  {/* Reason Input */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Reason
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={editingTransaction.reason}
                      onChange={handleEditInputChange}
                      placeholder="Enter reason"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  {/* Date Input */}
                  <div className="mb-4">
                    <label className="block mb-2 font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={editingTransaction.date}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2.5 mt-5">
                    <button
                      type="button"
                      onClick={closeEditTransactionModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#243b6c] text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Update Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {showEMISidebar && (
            <div className=" text-black fixed inset-y-0 right-0 z-40 w-[90%] max-w-[600px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  EMI Book - {selectedDriver.truckNo} •{" "}
                  {selectedDriver.truckType}
                </h2>
                <button
                  onClick={closeEMISidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-grow overflow-auto p-6">
                {emis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Add your EMI to get monthly reminders
                    </h3>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={closeEMISidebar}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={openAddEMIPopup}
                        className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700 flex items-center gap-2"
                      >
                        <span>+</span> Add EMI
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {emis.map((emi) => (
                      <div
                        key={emi.id}
                        className="bg-white border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {emi.financeCompany}
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹ {emi.monthlyEMI.toLocaleString()}
                            </p>
                          </div>
                          <ThreeDotMenuButton emi={emi} />
                        </div>

                        {/* Current EMI Status */}
                        {emi.upcomingPayments.some(
                          (p) => p.status === "due"
                        ) && (
                          <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-red-600 rounded">
                                  DUE
                                </span>
                                <span className="ml-2 text-sm text-gray-600">
                                  on{" "}
                                  {new Date(
                                    emi.upcomingPayments.find(
                                      (p) => p.status === "due"
                                    ).dueDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {emi.upcomingPayments.some(
                          (p) => p.status === "paid"
                        ) && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-green-600 rounded">
                                  PAID
                                </span>
                                <span className="ml-2 text-sm text-gray-600">
                                  on on{" "}
                                  {new Date(
                                    emi.upcomingPayments.find(
                                      (p) => p.status === "paid"
                                    ).paymentDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Upcoming Section */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                            UPCOMING
                          </h4>
                          {emi.upcomingPayments
                            .filter((p) => p.status === "due")
                            .map((payment) => (
                              <div
                                key={payment.id}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <div>
                                  <p className="font-semibold">
                                    ₹ {payment.amount.toLocaleString()}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-red-600 rounded">
                                      DUE
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      on{" "}
                                      {new Date(
                                        emi.upcomingPayments.find(
                                          (p) => p.status === "due"
                                        ).dueDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => openMarkPaidPopup(emi)}
                                  className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50"
                                >
                                  ✓ Mark Paid
                                </button>
                              </div>
                            ))}
                        </div>

                        {/* Past Payments Section */}
                        {emi.pastPayments.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                              PAST PAYMENTS
                            </h4>
                            <div className="space-y-2">
                              {emi.pastPayments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="flex justify-between items-center p-2 border-b border-gray-100 hover:bg-gray-50 rounded"
                                >
                                  <div>
                                    <p className="font-medium">
                                      Due on{" "}
                                      {new Date(
                                        payment.dueDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Paid on{" "}
                                      {new Date(
                                        payment.paymentDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">
                                      ₹ {payment.amount.toLocaleString()}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditPaymentPopup(emi, payment);
                                      }}
                                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                      title="Edit Payment"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteConfirmPopup(emi, payment);
                                      }}
                                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                      title="Delete Payment"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={closeEMISidebar}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEMI(emis[0]); // Set first EMI as selected for past payment
                          openAddPastPaymentPopup();
                        }}
                        className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 flex items-center gap-2"
                      >
                        <span>+</span> Add Past Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {showAddEMIPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add EMI
                  </h3>
                  <button
                    onClick={closeAddEMIPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Finance Company
                    </label>
                    <input
                      type="text"
                      value={emiFormData.financeCompany}
                      onChange={(e) =>
                        setEmiFormData({
                          ...emiFormData,
                          financeCompany: e.target.value,
                        })
                      }
                      placeholder="Preetam"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Monthly EMI
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={emiFormData.monthlyEMI}
                        onChange={(e) =>
                          setEmiFormData({
                            ...emiFormData,
                            monthlyEMI: e.target.value,
                          })
                        }
                        placeholder="1,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Due on
                    </label>
                    <select
                      value={emiFormData.dueOn}
                      onChange={(e) =>
                        setEmiFormData({
                          ...emiFormData,
                          dueOn: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                          {i === 0
                            ? "st"
                            : i === 1
                            ? "nd"
                            : i === 2
                            ? "rd"
                            : "th"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Remind me on
                      </span>
                      <select
                        value={emiFormData.reminderDay}
                        onChange={(e) =>
                          setEmiFormData({
                            ...emiFormData,
                            reminderDay: e.target.value,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="1st">1st</option>
                      </select>
                      <span className="text-sm text-gray-700">every month</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeAddEMIPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddEMI}
                    className="flex-1 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showAddPastPaymentPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Past Payment
                  </h3>
                  <button
                    onClick={closeAddPastPaymentPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Due on
                    </label>
                    <input
                      type="date"
                      value={pastPaymentData.dueOn}
                      onChange={(e) =>
                        setPastPaymentData({
                          ...pastPaymentData,
                          dueOn: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Amount Paid
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pastPaymentData.amountPaid}
                        onChange={(e) =>
                          setPastPaymentData({
                            ...pastPaymentData,
                            amountPaid: e.target.value,
                          })
                        }
                        placeholder="1,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={pastPaymentData.paymentDate}
                      onChange={(e) =>
                        setPastPaymentData({
                          ...pastPaymentData,
                          paymentDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* <svg
                        className="absolute right-3 top-2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg> */}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeAddPastPaymentPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddPastPayment}
                    className="flex-1 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showMarkPaidPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    EMI 03 Jul 2025
                  </h3>
                  <button
                    onClick={closeMarkPaidPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Amount Paid
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={markPaidData.amountPaid}
                        onChange={(e) =>
                          setMarkPaidData({
                            ...markPaidData,
                            amountPaid: e.target.value,
                          })
                        }
                        placeholder="1,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Payment Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={markPaidData.paymentDate}
                        onChange={(e) =>
                          setMarkPaidData({
                            ...markPaidData,
                            paymentDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg
                        className="absolute right-3 top-2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeMarkPaidPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleMarkPaid}
                    className="flex-1 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEditPaymentPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Payment
                  </h3>
                  <button
                    onClick={closeEditPaymentPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editPaymentData.dueDate}
                      onChange={(e) =>
                        setEditPaymentData({
                          ...editPaymentData,
                          dueDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Amount Paid
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editPaymentData.amountPaid}
                        onChange={(e) =>
                          setEditPaymentData({
                            ...editPaymentData,
                            amountPaid: e.target.value,
                          })
                        }
                        placeholder="1,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Payment Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editPaymentData.paymentDate}
                        onChange={(e) =>
                          setEditPaymentData({
                            ...editPaymentData,
                            paymentDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <svg
                        className="absolute right-3 top-2 w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeEditPaymentPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPayment}
                    className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDeleteConfirmPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Payment
                  </h3>
                  <button
                    onClick={closeDeleteConfirmPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 text-center mb-2">
                    Are you sure you want to delete this payment?
                  </h4>
                  <p className="text-sm text-gray-500 text-center">
                    This action cannot be undone. The payment record will be
                    permanently removed.
                  </p>

                  {selectedPayment && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-medium">
                          ₹ {selectedPayment.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">
                          Payment Date:
                        </span>
                        <span className="font-medium">
                          {selectedPayment.paymentDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteConfirmPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePayment}
                    className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEMIMenuPopup && (
            <div
              className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px]"
              style={{
                left: `${menuPosition.x}px`,
                top: `${menuPosition.y}px`,
              }}
            >
              <button
                onClick={openEditEMIPopup}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>

              <button
                onClick={openMarkEMICompletedPopup}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                EMI Completed
              </button>

              <button
                onClick={openDeleteEMIConfirm}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete EMI
              </button>
            </div>
          )}

          {showEditEMIPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit EMI
                  </h3>
                  <button
                    onClick={closeEditEMIPopup}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Finance Company
                    </label>
                    <input
                      type="text"
                      value={editEMIData.financeCompany}
                      onChange={(e) =>
                        setEditEMIData({
                          ...editEMIData,
                          financeCompany: e.target.value,
                        })
                      }
                      placeholder="Preetam"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Monthly EMI
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editEMIData.monthlyEMI}
                        onChange={(e) =>
                          setEditEMIData({
                            ...editEMIData,
                            monthlyEMI: e.target.value,
                          })
                        }
                        placeholder="1,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Due on
                    </label>
                    <select
                      value={editEMIData.dueOn}
                      onChange={(e) =>
                        setEditEMIData({
                          ...editEMIData,
                          dueOn: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                          {i === 0
                            ? "st"
                            : i === 1
                            ? "nd"
                            : i === 2
                            ? "rd"
                            : "th"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Remind me on
                      </span>
                      <select
                        value={editEMIData.reminderDay}
                        onChange={(e) =>
                          setEditEMIData({
                            ...editEMIData,
                            reminderDay: e.target.value,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="2nd">2nd</option>
                        <option value="3rd">3rd</option>
                        <option value="1st">1st</option>
                      </select>
                      <span className="text-sm text-gray-700">every month</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeEditEMIPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditEMI}
                    className="flex-1 px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteEMIConfirm && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete EMI
                    </h3>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete this EMI? This action
                      cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedEMI?.financeCompany}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹ {selectedEMI?.monthlyEMI}/month
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeDeleteEMIConfirm}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEMI}
                    className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete EMI
                  </button>
                </div>
              </div>
            </div>
          )}

          {showMarkEMICompletedPopup && (
            <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mark EMI as Completed
                    </h3>
                    <p className="text-sm text-gray-600">
                      This will mark the EMI as fully paid and completed.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedEMI?.financeCompany}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹ {selectedEMI?.monthlyEMI?.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeMarkEMICompletedPopup}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkEMICompleted}
                    className="flex-1 px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Documents SideBar */}
          {/* Documents Sidebar */}
          {showDocumentsSidebar && (
            <div className="text-black fixed inset-y-0 right-0 z-40 w-[90%] max-w-[600px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Document Book {selectedDriver.truckNo} •{" "}
                  {selectedDriver.truckType}
                </h2>
                <button
                  onClick={closeDocumentsSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Document warning */}
              {documentsNeedingAttention.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 m-4">
                  <div className="flex items-center">
                    <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2">
                      {documentsNeedingAttention.length}
                    </div>
                    <span className="text-red-700 text-sm">
                      {documentsNeedingAttention.length} Document
                      {documentsNeedingAttention.length > 1 ? "s" : ""} need
                      {documentsNeedingAttention.length === 1 ? "s" : ""}{" "}
                      attention
                    </span>
                  </div>
                </div>
              )}

              <div className="flex-grow overflow-auto p-4">
                {documentTypes.map((docType) => {
                  const document = documents[docType.key];
                  const isExpiringSoon =
                    document && isDocumentExpiringSoon(document.expiryDate);

                  return (
                    <div
                      key={docType.key}
                      className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue-600"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10,9 9,9 8,9" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {docType.name}
                            </h3>
                            {document ? (
                              <div>
                                {isExpiringSoon && (
                                  <span className="text-xs text-orange-600 font-medium">
                                    Expiring in{" "}
                                    {getDaysUntilExpiry(document.expiryDate)}{" "}
                                    days
                                  </span>
                                )}
                                {document.expiryDate && !isExpiringSoon && (
                                  <span className="text-xs text-gray-500">
                                    Expires: {document.expiryDate}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => openAddDocumentModal(docType)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Add Expiry
                              </button>
                            )}
                          </div>
                        </div>

                        {document && (
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                openDocumentOptionsModal(docType, document)
                              }
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t p-4">
                <div className="flex justify-between">
                  <button
                    onClick={closeDocumentsSidebar}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={openAddOtherDocumentModal}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Other Document
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Document Modal */}
          {showAddDocumentModal && (
            <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add {selectedDocumentType?.name}
                  </h3>
                  <button
                    onClick={closeAddDocumentModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Truck Info</p>
                    <p className="font-medium text-gray-900">
                      {selectedDriver.truckNo} • {selectedDriver.truckType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={documentFormData.expiryDate}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Remind me
                      </span>
                      <select
                        value={documentFormData.reminderDays}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            reminderDays: e.target.value,
                          })
                        }
                        className="ml-2 p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                      </select>
                      <span className="text-sm text-gray-700 ml-2">
                        before expiry
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy No
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Policy No"
                      value={documentFormData.policyNo}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          policyNo: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                      className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      Upload File
                    </button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="*/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {documentFormData.uploadedFile && (
                      <p className="text-xs text-green-600 mt-1">
                        File uploaded: {documentFormData.uploadedFile.name}
                      </p>
                    )}
                  </div>

                  {showExpenseFields && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expense Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Expense Amount"
                            value={documentFormData.expenseAmount}
                            onChange={(e) =>
                              setDocumentFormData({
                                ...documentFormData,
                                expenseAmount: e.target.value,
                              })
                            }
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Optional</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expense Date
                        </label>
                        <input
                          type="date"
                          value={documentFormData.expenseDate}
                          onChange={(e) =>
                            setDocumentFormData({
                              ...documentFormData,
                              expenseDate: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {!showExpenseFields && (
                    <button
                      onClick={() => setShowExpenseFields(true)}
                      className="w-full px-4 py-2 text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Add {selectedDocumentType?.name} Expense
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeAddDocumentModal}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddDocument}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {showEditDocumentModal && (
            <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit {selectedDocumentType?.name}
                  </h3>
                  <button
                    onClick={closeEditDocumentModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Truck Info</p>
                    <p className="font-medium text-gray-900">
                      {selectedDriver.truckNo} • {selectedDriver.truckType}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={documentFormData.expiryDate}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  <div>
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Remind me
                      </span>
                      <select
                        value={documentFormData.reminderDays}
                        onChange={(e) =>
                          setDocumentFormData({
                            ...documentFormData,
                            reminderDays: e.target.value,
                          })
                        }
                        className="ml-2 p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                      </select>
                      <span className="text-sm text-gray-700 ml-2">
                        before expiry
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy No
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Policy No"
                      value={documentFormData.policyNo}
                      onChange={(e) =>
                        setDocumentFormData({
                          ...documentFormData,
                          policyNo: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional</p>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        document.getElementById("file-upload").click()
                      }
                      className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      Upload File
                    </button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="*/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {documentFormData.uploadedFile && (
                      <p className="text-xs text-green-600 mt-1">
                        File uploaded: {documentFormData.uploadedFile.name}
                      </p>
                    )}
                  </div>

                  {showExpenseFields && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expense Amount
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Expense Amount"
                            value={documentFormData.expenseAmount}
                            onChange={(e) =>
                              setDocumentFormData({
                                ...documentFormData,
                                expenseAmount: e.target.value,
                              })
                            }
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Optional</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expense Date
                        </label>
                        <input
                          type="date"
                          value={documentFormData.expenseDate}
                          onChange={(e) =>
                            setDocumentFormData({
                              ...documentFormData,
                              expenseDate: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {!showExpenseFields && (
                    <button
                      onClick={() => setShowExpenseFields(true)}
                      className="w-full px-4 py-2 text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      Add {selectedDocumentType?.name} Expense
                    </button>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeEditDocumentModal}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEditDocumentSubmit}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Document Options Modal */}
          {showDocumentOptionsModal && (
            <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-xs mx-4">
                <div className="space-y-2">
                  <button
                    onClick={handleEditDocument}
                    className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Document
                  </button>

                  <button
                    onClick={handleDownloadDocument}
                    className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Document
                  </button>

                  <button
                    onClick={handleShareDocument}
                    className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </button>

                  <button
                    onClick={handleDeleteDocument}
                    className="w-full flex items-center px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-3"
                    >
                      <polyline points="3,6 5,6 21,6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={closeDocumentOptionsModal}
                    className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Pagination */}
          {outDrivers.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, outDrivers.length)} of{" "}
                {outDrivers.length} entries
              </div>

              <nav className="flex items-center">
                <button
                  onClick={prevPageClick}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md mx-1 ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const showEllipsisBefore =
                      index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter =
                      index < array.length - 1 && array[index + 1] !== page + 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <span className="px-3 py-1 text-gray-500">...</span>
                        )}

                        <button
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>

                        {showEllipsisAfter && (
                          <span className="px-3 py-1 text-gray-500">...</span>
                        )}
                      </div>
                    );
                  })}

                <button
                  onClick={nextPageClick}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md mx-1 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Add Truck Modal */}
      {isAddTruckModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Truck
              </h2>
              <button
                onClick={() => {
                  resetNewDriverForm();
                  setErrors({
                    truckNo: "",
                    truckType: "",
                    ownership: "",
                    truckStatus: "",
                  });
                  setIsAddTruckModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTruckFormSubmit}>
              <div className="gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      name="truckNo"
                      value={newDriver.truckNo}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckNo ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.truckNo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.truckNo}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Truck Type
                    </label>
                    <select
                      name="truckType"
                      value={newDriver.truckType}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckType ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="">Select Truck Type</option>
                      <option value="Mini Truck / LCV">Mini Truck / LCV</option>
                      <option value="Open Body Truck">Open Body Truck</option>
                      <option value="Closed Container">Closed Container</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Tipper">Tipper</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.truckType && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.truckType}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ownership
                    </label>
                    <select
                      name="ownership"
                      value={newDriver.ownership}
                      onChange={handleDriverChange}
                      className={`${
                        errors.ownership ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="">Select Ownership</option>
                      <option value="Market Truck">Market Truck</option>
                      <option value="My Truck">My Truck</option>
                    </select>
                    {errors.ownership && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.ownership}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="truckStatus"
                      value={newDriver.truckStatus}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckStatus
                          ? "border-red-500"
                          : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="">Select Status</option>
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="off_duty">Off Duty</option>
                    </select>
                    {errors.truckStatus && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.truckStatus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right column */}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    resetNewDriverForm();
                    setErrors({
                      truckNo: "",
                      truckType: "",
                      ownership: "",
                      truckStatus: "",
                    });
                    setIsAddTruckModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {isEditTruckModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Truck
              </h2>
              <button
                onClick={() => {
                  resetNewDriverForm();
                  setErrors({
                    truckNo: "",
                    truckType: "",
                    ownership: "",
                    truckStatus: "",
                  });
                  setIsEditTruckModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditTruckFormSubmit}>
              <div className="gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      name="truckNo"
                      value={newDriver.truckNo}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckNo ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.truckNo && (
                      <p className="text-red-500 text-xs absolute mt-1">
                        {errors.truckNo}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Truck Type
                    </label>
                    <select
                      name="truckType"
                      value={newDriver.truckType}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckType ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="Mini Truck / LCV">Mini Truck / LCV</option>
                      <option value="Open Body Truck">Open Body Truck</option>
                      <option value="Closed Container">Closed Container</option>
                      <option value="Trailer">Trailer</option>
                      <option value="Tanker">Tanker</option>
                      <option value="Tipper">Tipper</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.truckType && (
                      <p className="text-red-500 text-xs absolute mt-1">
                        {errors.truckType}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ownership
                    </label>
                    <select
                      name="ownership"
                      value={newDriver.ownership}
                      onChange={handleDriverChange}
                      className={`${
                        errors.ownership ? "border-red-500" : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="Market Truck">Market Truck</option>
                      <option value="My Truck">My Truck</option>
                    </select>
                    {errors.ownership && (
                      <p className="text-red-500 text-xs absolute mt-1">
                        {errors.ownership}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="truckStatus"
                      value={newDriver.truckStatus}
                      onChange={handleDriverChange}
                      className={`${
                        errors.truckStatus
                          ? "border-red-500"
                          : "border-gray-300"
                      } w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="off_duty">Off Duty</option>
                    </select>
                    {errors.truckStatus && (
                      <p className="text-red-500 text-xs absolute mt-1">
                        {errors.truckStatus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right column */}
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    resetNewDriverForm();
                    setErrors({
                      truckNo: "",
                      truckType: "",
                      ownership: "",
                      truckStatus: "",
                    });
                    setIsEditTruckModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Driver Modal */}
      {IsViewTruckModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Truck" : "Truck Details"}
              </h2>
              <button
                onClick={() => setIsViewTruckModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {!isEditMode ? (
              /* View Mode */
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Left column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Truck No
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.truckNo}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Truck Type
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.truckType}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Ownership
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.ownership}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Status
                    </h3>
                    <div className="flex items-center">
                      <span
                        className={`h-3 w-3 rounded-full mr-2 ${
                          currentDriver?.truckStatus === "available"
                            ? "bg-accent"
                            : currentDriver?.truckStatus === "on_trip"
                            ? "bg-primary"
                            : "bg-danger"
                        }`}
                      ></span>
                      <span className="text-base font-medium text-gray-900">
                        {currentDriver?.truckStatus_display}
                      </span>
                    </div>
                  </div>
                </div>
                {/* <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.license_number}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Expiry Date
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.license_expiry_date &&
                        new Date(
                          currentDriver.license_expiry_date
                        ).toLocaleDateString()}
                    </p>
                  </div>
                  {/* <div>
                    <h3 className="text-sm font-medium text-gray-500">Photo</h3>
                    <FilePreview
                      fileUrl={currentDriver?.photo}
                      fileName={`${currentDriver?.name || "Driver"}'s Photo`}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Documents
                    </h3>
                    <FilePreview
                      fileUrl={currentDriver?.documents}
                      fileName={`${
                        currentDriver?.name || "Driver"
                      }'s Documents`}
                      className="mt-1"
                    />
                  </div>
                </div> */}
              </div>
            ) : (
              /* Edit Mode - Form Fields */
              <form onSubmit={handleEditDriver}>
                {/* Edit form content (unchanged) */}
                {/* ... */}
              </form>
            )}

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                onClick={() => setIsViewTruckModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              {!isEditMode ? (
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEditTruckFormSubmit}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete truck{" "}
                <span className="font-semibold">{currentDriver?.truckNo}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTruck}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setShowDeleteExpenseModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete Expense for{" "}
                <span className="font-semibold">{selectedDriver?.truckNo}</span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteExpenseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setShowDeleteTransactionModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete Transaction{" "}
                <span className="font-semibold">{currentDriver?.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteTransactionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTransactionModal}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
