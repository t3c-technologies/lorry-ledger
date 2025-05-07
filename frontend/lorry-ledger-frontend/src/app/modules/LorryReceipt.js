import { useState, useEffect, useMemo, useRef } from "react";
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

export default function LorryReceipt() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilters, setDriverFilters] = useState([]);
  const [columnFilteredDrivers, setColumnFilteredDrivers] = useState([]);
  const [isAddLRModalOpen, setIsAddLRModalOpen] = useState(false);
  const [isEditLRModalOpen, setIsEditLRModalOpen] = useState(false);
  const [isViewLRModalOpen, setIsViewLRModalOpen] = useState(false);
  const [currentFormSection, setCurrentFormSection] = useState(0);
  const [consigners, setConsigners] = useState([]);
  const [consignees, setConsignees] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedConsigner, setSelectedConsigner] = useState("");
  const [selectedConsignee, setSelectedConsignee] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("");
  const [currentLR, setCurrentLR] = useState("");
  const [showAddConsignerPopup, setShowAddConsignerPopup] = useState(false);
  const [showAddConsigneePopup, setShowAddConsigneePopup] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [LRList, setLRList] = useState([]);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  const [IsViewSupplierModalOpen, setIsViewSupplierModalOpen] = useState(false);
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

  const handleRowClick = (LR) => {
    setCurrentLR(LR);
    setFormData({
      trip_id: LR.trip.id,
      lrDate: LR.lrDate,
      lrNumber: LR.lrNumber,
      materialCategory: LR.materialCategory,
      numberOfPackages: LR.numberOfPackages,
      unit: LR.unit,
      weight: LR.weight,
      freightPaidBy: LR.freightPaidBy,
      gstPercentage: LR.gstPercentage,
      consignee_id: LR.consignee.id,
      consigner_id: LR.consigner.id,
    });
    getConsigners();
    getConsignees();
    getTrips();
    setSelectedConsignee(LR.consignee.id);
    setSelectedConsigner(LR.consigner.id);
    setSelectedTrip(LR.trip.id);
    console.log(formData);
    console.log(currentLR);
    setCurrentFormSection(0);
    setIsViewLRModalOpen(true);
  };

  const handleViewToEdit = () => {
    setIsViewLRModalOpen(false);
    setIsEditLRModalOpen(true);
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

  const [showDriverNameFilterDropdown, setShowDriverNameFilterDropdown] =
    useState(false);

  const [showDriverStatusFilterDropdown, setShowDriverStatusFilterDropdown] =
    useState(false);

  const [newDriver, setNewDriver] = useState({
    supplierName: "",
    mobileNumber: "",
  });

  const resetNewDriverForm = () => {
    setNewDriver({
      supplierName: "",
      mobileNumber: "",
    });
  };
  const SelectWithSearch = ({
    name,
    value,
    onChange,
    options,
    className,
    required,
    placeholder = "Select an option",
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Handle selection of an option
    const handleSelect = (option) => {
      onChange({ target: { name, value: option } });
      setIsOpen(false);
      setSearchTerm("");
    };

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown trigger */}
        <div
          className={className}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{value || placeholder}</span>
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search box */}
            <div className="sticky top-0 p-2 bg-white border-b border-gray-200">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options */}
            <div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-black ${
                      value === option ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500">No results found</div>
              )}
            </div>
          </div>
        )}

        {/* Hidden select for form validation */}
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="sr-only"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  // Form data state
  const [formData, setFormData] = useState({
    lrDate: new Date().toISOString().split("T")[0],
    lrNumber: "LRN-",
    consigner_id: "",
    consignee_id: "",
    materialCategory: "",
    weight: "",
    unit: "Tonnes",
    numberOfPackages: "",
    freightPaidBy: "Consigner",
    gstPercentage: "",
  });

  const resetAddLR = () => {
    setFormData({
      lrDate: new Date().toISOString().split("T")[0],
      lrNumber: "LRN-",
      consigner_id: "",
      consignee_id: "",
      materialCategory: "",
      weight: "",
      unit: "Tonnes",
      numberOfPackages: "",
      freightPaidBy: "Consigner",
      gstPercentage: "",
    });
  };

  // New consigner form state
  const [newConsigner, setNewConsigner] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const resetConsigner = () => {
    setNewConsigner({
      gstNumber: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      state: "Maharashtra",
      pincode: "",
      mobileNumber: "",
    });
  };
  const [newConsignee, setNewConsignee] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const resetConsignee = () => {
    setNewConsignee({
      gstNumber: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      state: "Maharashtra",
      pincode: "",
      mobileNumber: "",
    });
  };

  const handleInputConsignerChange = (e) => {
    const { name, value } = e.target;
    setNewConsigner((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputConsigneeChange = (e) => {
    const { name, value } = e.target;
    setNewConsignee((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddConsigner = async () => {
    // Validate form
    if (!newConsigner.name || !newConsigner.gstNumber) {
      alert("Please fill in required fields");
      return;
    }
    try {
      const response = await api.post(
        API_ENDPOINTS.consigners.create,
        newConsigner,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setSelectedConsigner(response.data.id);
      getConsigners();
    } catch (error) {
      notifyError("Error creating consigner");
    }
    setShowAddConsignerPopup(false);

    // Reset form
    setNewConsigner({
      gstNumber: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      state: "Maharashtra",
      pincode: "",
      mobileNumber: "",
    });
  };

  const handleAddConsignee = async () => {
    // Validate form
    if (!newConsignee.name || !newConsignee.gstNumber) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const response = await api.post(
        API_ENDPOINTS.consignees.create,
        newConsignee,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setSelectedConsignee(response.data.id);
      getConsignees();
    } catch (error) {
      notifyError("Error creating consignee");
    }
    setShowAddConsigneePopup(false);

    // Reset form
    setNewConsignee({
      gstNumber: "",
      name: "",
      addressLine1: "",
      addressLine2: "",
      state: "Maharashtra",
      pincode: "",
      mobileNumber: "",
    });
  };

  const extractNextPage = (fullUrl) => {
    if (!fullUrl) return null; // Handle undefined or null cases

    const baseUrl = "http://localhost:8000/api/";
    const index = fullUrl.indexOf(baseUrl);

    if (index !== -1) {
      return fullUrl.slice(index + baseUrl.length); // Extract everything after base URL
    }

    return fullUrl; // Return original if base URL is missing
  };
  const [errors, setErrors] = useState({
    truckNo: "",
  });

  useEffect(() => {
    getLR();
  }, [recordsPerPage]);
  useEffect(() => {
    getLR();
  }, [sortConfig]);
  useEffect(() => {
    getLR();
  }, [searchTerm]);
  useEffect(() => {
    getLR();
  }, [driverFilters]);

  const getLR = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LR.listAll, {
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      setLRList(response.data);
      setTotalPages(response.total_pages);
      setPrevPage(extractNextPage(response.previous));
      setNextPage(extractNextPage(response.next));
    } catch (error) {
      console.log(error);

      //notifyError("Error fetching LRs");
    }
  };

  // Previous page
  const prevPageClick = async () => {
    try {
      const response = await api.get(prevPage);
      setLRList(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage((prev) => prev - 1);
    } catch (error) {
      console.log(error);
    }
  };
  // Next page
  const nextPageClick = async () => {
    console.log(currentPage);

    try {
      const response = await api.get(nextPage);
      setLRList(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
    console.log(nextPage);
    console.log(currentPage);
  };

  const fetchDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.suppliers.list, {
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
      notifyError("Error fetching parties");
    }
  };

  const getSortedAndFilteredDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.suppliers.list, {
        page: currentPage,
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setSortedAndFilteredDrivers(response.data);
      }
      setPrevPage(extractNextPage(response.previous));
      setNextPage(extractNextPage(response.next));
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
        setIsAddLRModalOpen(false);
        setIsEditLRModalOpen(false);
        setIsViewSupplierModalOpen(false);
        setIsDeleteConfirmOpen(false);
        setShowTransactionsModal(false);
        setShowDriverNameFilterDropdown(false);
        setShowDriverStatusFilterDropdown(false);
        // Reset states if needed
        setNewDriver({ name: "", phone_number: "", status: "available" });
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
    setIsAddLRModalOpen,
    setIsEditLRModalOpen,
    setIsViewSupplierModalOpen,
    setIsDeleteConfirmOpen,
    setShowDriverNameFilterDropdown,
    setShowDriverStatusFilterDropdown,
    setNewDriver,
    setCurrentDriver,
    setIsEditMode,
  ]);

  useEffect(() => {
    getLR();
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

  // Filter drivers based on search term
  const filteredDrivers = columnFilteredDrivers.filter(
    (supplier) =>
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.mobileNumber?.includes(searchTerm.toLowerCase())
  );

  // Get sorted and filtered drivers
  const outDrivers = getSortedData(filteredDrivers);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = outDrivers;

  // Change page
  const paginate = async (page) => {
    const pageUrl = `${API_ENDPOINTS.suppliers.list}?page=${page}&page_size=${recordsPerPage}`;
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
  useEffect(() => {
    console.log("Updated nextPage:", nextPage);
  }, [nextPage]);
  // Next page

  // Handle driver search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Open "Edit Driver" modal
  const handleEditClick = (LR) => {
    setCurrentLR(LR);
    setFormData({
      trip_id: LR.trip.id,
      lrDate: LR.lrDate,
      lrNumber: LR.lrNumber,
      materialCategory: LR.materialCategory,
      numberOfPackages: LR.numberOfPackages,
      unit: LR.unit,
      weight: LR.weight,
      freightPaidBy: LR.freightPaidBy,
      gstPercentage: LR.gstPercentage,
      consignee_id: LR.consignee.id,
      consigner_id: LR.consigner.id,
    });
    setSelectedConsignee(LR.consignee.id);
    setSelectedConsigner(LR.consigner.id);
    setSelectedTrip(LR.trip.id);
    console.log(formData);
    console.log(currentLR);
    getConsigners();
    getConsignees();
    getTrips();
    setCurrentFormSection(0);
    setIsEditLRModalOpen(true);
  };

  // Function to handle input change in add transaction form

  const handleInputChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };
  // Function to add a new transaction

  // Function to close edit transaction modal

  // Open delete confirmation
  const handleDeleteClick = (LR) => {
    setCurrentLR(LR);
    setIsDeleteConfirmOpen(true);
  };

  const validateTruckForm = () => {
    let valid = true;
    let newErrors = { truckNo: "" };

    setErrors(newErrors);
    return valid;
  };

  const getTrips = async () => {
    try {
      console.log("Hi");

      const response = await api.get(API_ENDPOINTS.trips.list);
      setTrips(response.data);
    } catch (error) {
      notifyError("Error fetching trips");
    }
  };

  const handleSubmitLR = () => {
    formData.consignee_id = selectedConsignee;
    formData.consigner_id = selectedConsigner;
    formData.trip_id = selectedTrip;
    console.log(formData);
    submitLR();
  };

  const handleUpdateLR = () => {
    formData.consignee_id = selectedConsignee;
    formData.consigner_id = selectedConsigner;
    formData.trip_id = selectedTrip;
    console.log(formData);
    updateLR();
  };

  const submitLR = async () => {
    try {
      const response = await api.post(API_ENDPOINTS.LR.create, formData, {
        headers: {
          "Content-Type": "application/json", // Explicitly set header
        },
      });
      setIsAddLRModalOpen(false);
      resetAddLR();
      setSelectedConsigner("");
      setSelectedConsignee("");
      getLR();
      notifySuccess("LR Created Successfully");
    } catch (error) {
      notifyError("Error creating LR");
    }
    // Reset form
    // console.log(formData);
  };

  const updateLR = async () => {
    try {
      const response = await api.put(
        API_ENDPOINTS.LR.update(currentLR.id),
        formData,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setIsEditLRModalOpen(false);
      resetAddLR();
      setSelectedConsigner("");
      setSelectedConsignee("");
      setSelectedTrip("");
      notifySuccess("LR Updated Successfully");
      getLR();
    } catch (error) {
      notifyError("Error updating LR");
    }
  };

  const handleDeleteLR = async () => {
    try {
      await api.delete(API_ENDPOINTS.LR.delete(currentLR.id));
      notifyInfo("LR deleted successfully");
      getLR();
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getConsigners = async () => {
    try {
      console.log("Hi");

      const response = await api.get(API_ENDPOINTS.consigners.list);
      setConsigners(response.data);
    } catch (error) {
      notifyError("Error fetching consigners");
    }
  };
  const getConsignees = async () => {
    try {
      console.log("Hi");

      const response = await api.get(API_ENDPOINTS.consignees.list);
      setConsignees(response.data);
    } catch (error) {
      notifyError("Error fetching consignees");
    }
  };

  const handleAddLRClick = () => {
    getTrips();
    getConsigners();
    getConsignees();
    setIsAddLRModalOpen(true);
    setCurrentFormSection(0); // Reset to first section when opening
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

  const handleNextSection = () => {
    if (currentFormSection < formSections.length - 1) {
      setCurrentFormSection(currentFormSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentFormSection > 0) {
      setCurrentFormSection(currentFormSection - 1);
    }
  };

  const formSections = [
    "Trip Details",
    "Consigner",
    "Consignee",
    "Load Details",
  ];

  // Form section components
  const renderTripDetailsSection = () => (
    <div className="space-y-4 text-black">
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Trip</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedTrip}
          onChange={(e) => setSelectedTrip(e.target.value)}
        >
          <option value="">-- Select a trip --</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              Party Name: {trip.party.partyName}, {trip.origin} &rarr;
              {trip.destination}
            </option>
          ))}
        </select>
      </div>
      {selectedTrip && trips.find((trip) => trip.id == selectedTrip) && (
        <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">
                {trips.find((trip) => trip.id == selectedTrip).origin}
              </div>
              <div className="text-sm text-gray-500">21 Apr 2025</div>
            </div>
            <ChevronDown
              size={20}
              className="text-gray-400 transform rotate -rotate-90"
            />
            <div>
              <div className="font-bold">
                {trips.find((trip) => trip.id == selectedTrip).destination}
              </div>
              <div className="text-sm text-gray-500">-</div>
            </div>
          </div>

          <div className="grid grid-cols-2 mt-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Party Name</div>
              <div>
                {trips.find((trip) => trip.id == selectedTrip).party?.partyName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Billing Type</div>
              <div>
                {trips.find((trip) => trip.id == selectedTrip).partyBillingType}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Freight Amount</div>
              <div>
                ₹{" "}
                {
                  trips.find((trip) => trip.id == selectedTrip)
                    .partyFreightAmount
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Party Balance</div>
              <div>
                ₹{" "}
                {
                  trips.find((trip) => trip.id == selectedTrip).party
                    ?.openingBalance
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">{trip.origin}</div>
            <div className="text-sm text-gray-500">21 Apr 2025</div>
          </div>
          <ChevronDown
            size={20}
            className="text-gray-400 transform rotate -rotate-90"
          />
          <div>
            <div className="font-bold">{trip.destination}</div>
            <div className="text-sm text-gray-500">-</div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Party Name</div>
            <div>{trip.party.partyName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Billing Type</div>
            <div>{trip.partyBillingType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Freight Amount</div>
            <div>₹ {trip.partyFreightAmount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Party Balance</div>
            <div>₹ {trip.party.openingBalance}</div>
          </div>
        </div>
      </div> */}
      <div>
        <label className="block text-sm text-black font-medium mb-1">
          LR Date*
        </label>
        <div className="relative">
          <input
            type="date"
            value={formData.lrDate}
            onChange={(e) => handleInputChange("lrDate", e.target.value)}
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-black font-medium mb-1">
          LR Number*
        </label>
        <input
          type="text"
          value={formData.lrNumber}
          onChange={(e) => handleInputChange("lrNumber", e.target.value)}
          className="w-full border border-gray-300 text-black rounded px-3 py-2"
        />
      </div>
    </div>
  );

  const renderConsignerSection = () => (
    <div className="text-black">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Consigner Details</h2>
          <button
            onClick={() => setShowAddConsignerPopup(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="mr-1">+</span>
            Add New Consigner
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Consigner</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedConsigner}
            onChange={(e) => setSelectedConsigner(e.target.value)}
          >
            <option value="">-- Select a consigner --</option>
            {consigners.map((consigner) => (
              <option key={consigner.id} value={consigner.id}>
                {consigner.name} (GST: {consigner.gstNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedConsigner && selectedConsigner !== "0" && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Selected Consigner Details</h3>
            {console.log(selectedConsigner)}
            {consigners.find((c) => c.id == selectedConsigner) && (
              <div>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {consigners.find((c) => c.id == selectedConsigner).name}
                </p>
                <p>
                  <span className="font-medium">GST:</span>{" "}
                  {consigners.find((c) => c.id == selectedConsigner).gstNumber}
                </p>
                {consigners.find((c) => c.id == selectedConsigner)
                  .addressLine1 && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {
                      consigners.find((c) => c.id == selectedConsigner)
                        .addressLine1
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddConsignerPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Consigner</h2>
              <button
                onClick={() => {
                  resetConsigner();
                  setShowAddConsignerPopup(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={newConsigner.gstNumber}
                  onChange={handleInputConsignerChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Consigner Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={newConsigner.name}
                  onChange={handleInputConsignerChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={newConsigner.addressLine1}
                  onChange={handleInputConsignerChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={newConsigner.addressLine2}
                  onChange={handleInputConsignerChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">State</label>
                  <select
                    name="state"
                    value={newConsigner.state}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={newConsigner.pincode}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={newConsigner.mobileNumber}
                  onChange={handleInputConsignerChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    resetConsigner();
                    setShowAddConsignerPopup(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddConsigner}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Save Consigner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderConsigneeSection = () => (
    <div className="text-black">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Consignee Details</h2>
          <button
            onClick={() => setShowAddConsigneePopup(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="mr-1">+</span>
            Add New Consignee
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Select Consignee</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedConsignee}
            onChange={(e) => setSelectedConsignee(e.target.value)}
          >
            <option value="">-- Select a consignee --</option>
            {consignees.map((consignee) => (
              <option key={consignee.id} value={consignee.id}>
                {consignee.name} (GST: {consignee.gstNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedConsignee && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Selected Consignee Details</h3>
            {consignees.find((c) => c.id == selectedConsignee) && (
              <div>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {consignees.find((c) => c.id == selectedConsignee).name}
                </p>
                <p>
                  <span className="font-medium">GST:</span>{" "}
                  {consignees.find((c) => c.id == selectedConsignee).gstNumber}
                </p>
                {consignees.find((c) => c.id == selectedConsignee)
                  .addressLine1 && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {
                      consignees.find((c) => c.id == selectedConsignee)
                        .addressLine1
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddConsigneePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Consignee</h2>
              <button
                onClick={() => {
                  resetConsignee();
                  setShowAddConsigneePopup(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={newConsignee.gstNumber}
                  onChange={handleInputConsigneeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Consigner Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={newConsignee.name}
                  onChange={handleInputConsigneeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={newConsignee.addressLine1}
                  onChange={handleInputConsigneeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={newConsignee.addressLine2}
                  onChange={handleInputConsigneeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">State</label>
                  <select
                    name="state"
                    value={newConsignee.state}
                    onChange={handleInputConsigneeChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={newConsignee.pincode}
                    onChange={handleInputConsigneeChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Mobile Number</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={newConsignee.mobileNumber}
                  onChange={handleInputConsigneeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    resetConsignee();
                    setShowAddConsigneePopup(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddConsignee}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Save Consignee
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLoadDetailsSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          Material Category*
        </label>
        <div className="relative">
          <select
            value={formData.materialCategory}
            onChange={(e) =>
              handleInputChange("materialCategory", e.target.value)
            }
            className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
          >
            <option value="">Eg: Steel</option>
            <option value="Steel">Steel</option>
            <option value="Wood">Wood</option>
            <option value="Plastic">Plastic</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-3 text-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Weight
          </label>
          <input
            type="text"
            placeholder="Eg: 5"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Unit
          </label>
          <div className="relative">
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange("unit", e.target.value)}
              className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
            >
              <option value="Tonnes">Tonnes</option>
              <option value="Kg">Kg</option>
              <option value="Quintal">Quintal</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 text-black"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          No. of Bags / Box / Shipments
        </label>
        <input
          type="text"
          placeholder="Eg: 5"
          value={formData.numberOfPackages}
          onChange={(e) =>
            handleInputChange("numberOfPackages", e.target.value)
          }
          className="w-full border border-gray-300 text-black rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          FREIGHT PAID BY
        </label>
        <div className="flex space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Consigner"
              checked={formData.freightPaidBy === "Consigner"}
              onChange={(e) =>
                handleInputChange("freightPaidBy", e.target.value)
              }
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Consigner</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Consignee"
              checked={formData.freightPaidBy === "Consignee"}
              onChange={(e) =>
                handleInputChange("freightPaidBy", e.target.value)
              }
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Consignee</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Agent"
              checked={formData.freightPaidBy === "Agent"}
              onChange={(e) =>
                handleInputChange("freightPaidBy", e.target.value)
              }
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Agent</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          GST Percentage
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Eg: 5"
            value={formData.gstPercentage}
            onChange={(e) => handleInputChange("gstPercentage", e.target.value)}
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
          <span className="absolute right-3 top-2.5 text-black">%</span>
        </div>
      </div>
    </div>
  );

  const renderFormSection = () => {
    switch (currentFormSection) {
      case 0:
        return renderTripDetailsSection();
      case 1:
        return renderConsignerSection();
      case 2:
        return renderConsigneeSection();
      case 3:
        return renderLoadDetailsSection();
      default:
        return renderTripDetailsSection();
    }
  };

  // Form section components
  const renderTripDetailsSectionView = () => (
    <div className="space-y-4">
      {/* <div className="mb-4">
        <label className="block mb-2 font-medium">Select Trip</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedTrip}
          onChange={(e) => setSelectedTrip(e.target.value)}
        >
          <option value="">-- Select a trip --</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              Party Name: {trip.party.partyName}, {trip.origin} &rarr;
              {trip.destination}
            </option>
          ))}
        </select>
      </div> */}
      {selectedTrip && trips.find((trip) => trip.id == selectedTrip) && (
        <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">
                {trips.find((trip) => trip.id == selectedTrip).origin}
              </div>
              <div className="text-sm text-gray-500">21 Apr 2025</div>
            </div>
            <ChevronDown
              size={20}
              className="text-gray-400 transform rotate -rotate-90"
            />
            <div>
              <div className="font-bold">
                {trips.find((trip) => trip.id == selectedTrip).destination}
              </div>
              <div className="text-sm text-gray-500">-</div>
            </div>
          </div>

          <div className="grid grid-cols-2 mt-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Party Name</div>
              <div>
                {trips.find((trip) => trip.id == selectedTrip).party?.partyName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Billing Type</div>
              <div>
                {trips.find((trip) => trip.id == selectedTrip).partyBillingType}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Freight Amount</div>
              <div>
                ₹{" "}
                {
                  trips.find((trip) => trip.id == selectedTrip)
                    .partyFreightAmount
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Party Balance</div>
              <div>
                ₹{" "}
                {
                  trips.find((trip) => trip.id == selectedTrip).party
                    ?.openingBalance
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold">{trip.origin}</div>
            <div className="text-sm text-gray-500">21 Apr 2025</div>
          </div>
          <ChevronDown
            size={20}
            className="text-gray-400 transform rotate -rotate-90"
          />
          <div>
            <div className="font-bold">{trip.destination}</div>
            <div className="text-sm text-gray-500">-</div>
          </div>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-4">
          <div>
            <div className="text-sm text-gray-500">Party Name</div>
            <div>{trip.party.partyName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Billing Type</div>
            <div>{trip.partyBillingType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Freight Amount</div>
            <div>₹ {trip.partyFreightAmount}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Party Balance</div>
            <div>₹ {trip.party.openingBalance}</div>
          </div>
        </div>
      </div> */}

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          LR Date*
        </label>
        <div className="relative">
          <span className="text-black">{formData.lrDate}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          LR Number*
        </label>
        <span className="text-black">{formData.lrNumber}</span>
      </div>
    </div>
  );

  const renderConsignerSectionView = () => (
    <div className="text-black">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Consigner Details</h2>
          {/* <button
                onClick={() => setShowAddConsignerPopup(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                <span className="mr-1">+</span>
                Add New Consigner
              </button> */}
        </div>

        {/* <div className="mb-4">
              <label className="block mb-2 font-medium">Select Consigner</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedConsigner}
                onChange={(e) => setSelectedConsigner(e.target.value)}
              >
                <option value="">-- Select a consigner --</option>
                {consigners.map((consigner) => (
                  <option key={consigner.id} value={consigner.id}>
                    {consigner.name} (GST: {consigner.gstNumber})
                  </option>
                ))}
              </select>
            </div> */}

        {selectedConsigner && selectedConsigner !== "0" && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Selected Consigner Details</h3>
            {console.log(selectedConsigner)}
            {consigners.find((c) => c.id == selectedConsigner) && (
              <div>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {consigners.find((c) => c.id == selectedConsigner).name}
                </p>
                <p>
                  <span className="font-medium">GST:</span>{" "}
                  {consigners.find((c) => c.id == selectedConsigner).gstNumber}
                </p>
                {consigners.find((c) => c.id == selectedConsigner)
                  .addressLine1 && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {
                      consigners.find((c) => c.id == selectedConsigner)
                        .addressLine1
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderConsigneeSectionView = () => (
    <div className="text-black">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Consignee Details</h2>
          {/* <button
                onClick={() => setShowAddConsigneePopup(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                <span className="mr-1">+</span>
                Add New Consignee
              </button> */}
        </div>

        {/* <div className="mb-4">
              <label className="block mb-2 font-medium">Select Consignee</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedConsignee}
                onChange={(e) => setSelectedConsignee(e.target.value)}
              >
                <option value="">-- Select a consignee --</option>
                {consignees.map((consignee) => (
                  <option key={consignee.id} value={consignee.id}>
                    {consignee.name} (GST: {consignee.gstNumber})
                  </option>
                ))}
              </select>
            </div> */}

        {selectedConsignee && (
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-bold mb-2">Selected Consignee Details</h3>
            {consignees.find((c) => c.id == selectedConsignee) && (
              <div>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {consignees.find((c) => c.id == selectedConsignee).name}
                </p>
                <p>
                  <span className="font-medium">GST:</span>{" "}
                  {consignees.find((c) => c.id == selectedConsignee).gstNumber}
                </p>
                {consignees.find((c) => c.id == selectedConsignee)
                  .addressLine1 && (
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {
                      consignees.find((c) => c.id == selectedConsignee)
                        .addressLine1
                    }
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderLoadDetailsSectionView = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          Material Category*
        </label>
        <div className="relative">
          <span className="text-black">{formData.materialCategory}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Weight
          </label>
          <span className="text-black">{formData.weight}</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Unit
          </label>
          <div className="relative">
            <span className="text-black">{formData.unit}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          No. of Bags / Box / Shipments
        </label>
        <span className="text-black">{formData.numberOfPackages}</span>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          FREIGHT PAID BY
        </label>
        <div className="flex space-x-4 mt-1">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Consigner"
              disabled
              checked={formData.freightPaidBy === "Consigner"}
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Consigner</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Consignee"
              disabled
              checked={formData.freightPaidBy === "Consignee"}
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Consignee</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="freight"
              value="Agent"
              disabled
              checked={formData.freightPaidBy === "Agent"}
              className="text-blue-600"
            />
            <span className="ml-2 text-black">Agent</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          GST Percentage
        </label>
        <div className="relative">
          <span className="text-black">% {formData.gstPercentage}</span>
        </div>
      </div>
    </div>
  );

  const renderFormSectionView = () => {
    switch (currentFormSection) {
      case 0:
        return renderTripDetailsSectionView();
      case 1:
        return renderConsignerSectionView();
      case 2:
        return renderConsigneeSectionView();
      case 3:
        return renderLoadDetailsSectionView();
      default:
        return renderTripDetailsSectionView();
    }
  };

  const ProgressIndicator = () => (
    <div className="flex justify-between items-center px-6 py-3 border-b text-black">
      {formSections.map((section, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="flex items-center">
            {index > 0 && (
              <div
                className={`h-1 w-16 ${
                  index <= currentFormSection ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentFormSection
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {index + 1}
            </div>
            {index < formSections.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  index < currentFormSection ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
          <span className="text-xs mt-2">{section}</span>
        </div>
      ))}
    </div>
  );

  const AddLRFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New LR</h2>
          <button
            onClick={() => {
              resetAddLR();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setSelectedTrip("");
              setIsAddLRModalOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Form Content */}
        <div className="p-6">{renderFormSection()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSection}
            className={`px-4 py-2 rounded-md border ${
              currentFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentFormSection === 0}
          >
            Previous
          </button>

          {currentFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSection}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleSubmitLR();
                console.log("Form submitted:", formData);
                //resetAddLR();
                //setIsAddLRModalOpen(false);
              }}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const EditLRFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit LR</h2>
          <button
            onClick={() => {
              resetAddLR();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setSelectedTrip("");
              setIsEditLRModalOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Form Content */}
        <div className="p-6">{renderFormSection()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSection}
            className={`px-4 py-2 rounded-md border ${
              currentFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentFormSection === 0}
          >
            Previous
          </button>

          {currentFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSection}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleUpdateLR();
                console.log("Form submitted:", formData);
                //resetAddLR();
                //setIsAddLRModalOpen(false);
              }}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ViewLRFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">LR Details</h2>
          <button
            onClick={() => {
              resetAddLR();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setSelectedTrip("");
              setIsViewLRModalOpen(false);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Form Content */}
        <div className="p-6">{renderFormSectionView()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSection}
            className={`px-4 py-2 rounded-md border ${
              currentFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentFormSection === 0}
          >
            Previous
          </button>

          {currentFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSection}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleViewToEdit();
                //resetAddLR();
                //setIsAddLRModalOpen(false);
              }}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Lorry Receipts
          </h1>
          <button
            onClick={handleAddLRClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add LR
          </button>
        </div>

        <div className="bg-white rounded-md p-6">
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
                placeholder="Search LRs"
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
                    onClick={() => requestSort("lrNumber")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        LR Number
                      </span>
                      {getSortDirectionIcon("lrNumber")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("lrDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        LR Date
                      </span>
                      {getSortDirectionIcon("lrDate")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("consigner.name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Consigner Name
                      </span>
                      {getSortDirectionIcon("consigner.name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("consignee.name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Consignee Name
                      </span>
                      {getSortDirectionIcon("consignee.name")}
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
                {LRList.map((LR) => (
                  <tr
                    key={LR.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-gray-900">
                        {LR.lrNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {LR.lrDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {LR.consigner.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {LR.consignee.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(LR);
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
                            e.stopPropagation();
                            handleEditClick(LR);
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
                            e.stopPropagation();
                            handleDeleteClick(LR);
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
            {LRList.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-700 text-base">
                  No LRs found. Try a different search term or add a new LR.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {LRList.length > 0 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstRecord + 1} to{" "}
                {Math.min(indexOfLastRecord, LRList.length)} of {LRList.length}{" "}
                entries
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

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => {
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
                Are you sure you want to delete LR{" "}
                <span className="font-semibold">{currentLR?.lrNumber}</span>?
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
                onClick={handleDeleteLR}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddLRModalOpen && AddLRFormModal()}
      {isEditLRModalOpen && EditLRFormModal()}
      {isViewLRModalOpen && ViewLRFormModal()}
    </div>
  );
}
