// src/pages/trucks.js
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

export default function Parties() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilters, setDriverFilters] = useState([]);
  const [columnFilteredDrivers, setColumnFilteredDrivers] = useState([]);
  const [sortedAndFilteredDrivers, setSortedAndFilteredDrivers] = useState([]);
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [isEditPartyModalOpen, setIsEditPartyModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  const [IsViewPartyModalOpen, setIsViewPartyModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [activeTab, setActiveTab] = useState("party-details");

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

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentDetails, setPaymentDetails] = useState({
    paymentAmount: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().split("T")[0], // Helper function to format date as YYYY-MM-DD
    notes: "",
    receivedByDriver: false,
  });

  //Trips
  const [tripType, setTripType] = useState("Single Route");
  const [routes, setRoutes] = useState([
    {
      consigner: "",
      consignee: "",
      units: "",
      lrNumber: "",
      invoiceNumber: "",
    },
  ]);
  const [validationErrors, setValidationErrors] = useState({});
  const [paymentMode, setPaymentMode] = useState("Fixed");
  const [partyList, setPartyList] = useState([]);
  const [truckList, setTruckList] = useState([]);
  const [driverList, setDriverList] = useState([]);
  const [consignersList, setConsignersList] = useState([]);
  const [consigneesList, setConsigneesList] = useState([]);
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
  const [newConsignee, setNewConsignee] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const [showAddConsignerPopup, setShowAddConsignerPopup] = useState(false);
  const [showAddConsigneePopup, setShowAddConsigneePopup] = useState(false);

  const [calculationFields, setCalculationFields] = useState({
    rate: "",
    units: "",
  });
  const [isAddTripModalOpen, setisAddTripModalOpen] = useState(false);

  const handleRowClick = (driver) => {
    setCurrentDriver(driver);
    setIsViewPartyModalOpen(true);
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

  const [showDriverNameFilterDropdown, setShowDriverNameFilterDropdown] =
    useState(false);

  const [showDriverStatusFilterDropdown, setShowDriverStatusFilterDropdown] =
    useState(false);

  const [newDriver, setNewDriver] = useState({
    partyName: "",
    openingBalance: "",
    openingBalanceDate: new Date().toISOString().split("T")[0],
    mobileNumber: "",
    gstNumber: "",
    pan: "",
    companyName: "",
    address: "",
    state: "",
    pincode: "",
  });

  const [newTrip, setNewTrip] = useState({
    origin: "",
    destination: "",
    partyBillingType: "Fixed",
    partyFreightAmount: "",
    tripStatus: "Started",
    startDate: new Date().toISOString().split("T")[0],
    startKmsReading: "",
    party_id: "",
    truck_id: "",
    driver_id: "",
  });

  const resetNewTripForm = () => {
    setNewTrip({
      origin: "",
      destination: "",
      partyBillingType: "Fixed",
      partyFreightAmount: "",
      tripStatus: "Started",
      startDate: new Date().toISOString().split("T")[0],
      startKmsReading: "",
      party_id: "",
      truck_id: "",
      driver_id: "",
    });
  };

  const partyBillingOptions = [
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

  const resetNewDriverForm = () => {
    setNewDriver({
      partyName: "",
      openingBalance: "",
      openingBalanceDate: new Date().toISOString().split("T")[0],
      mobileNumber: "",
      gstNumber: "",
      pan: "",
      companyName: "",
      address: "",
      state: "",
      pincode: "",
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

  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    resetPaymentForm();
  };

  // Form handlers
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const resetPaymentForm = () => {
    setPaymentDetails({
      paymentAmount: "",
      paymentMethod: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
      receivedByDriver: false,
    });
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
    partyName: "",
    openingBalance: "",
    openingBalanceDate: "",
    mobileNumber: "",
  });

  const fetchDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.parties.list, {
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
  const openTripSidebar = () => {
    setShowSidebar(true);
  };

  const closeTripSidebar = () => {
    setShowSidebar(false);
  };

  const statesList = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Orissa",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
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

  const toggleDriverNameFilterDropdown = () => {
    setShowDriverNameFilterDropdown(!showDriverNameFilterDropdown);
  };

  const toggleDriverStatusFilterDropdown = () => {
    setShowDriverStatusFilterDropdown(!showDriverStatusFilterDropdown);
  };

  const getParties = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.parties.list);
      setPartyList(response.data);
    } catch (error) {
      notifyError("Error fetching parties");
    }
  };

  const getTrucks = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.trucks.list);
      setTruckList(response.data);
    } catch (error) {
      notifyError("Error fetching trucks");
    }
  };

  const getDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.drivers.list);
      setDriverList(response.data);
    } catch (error) {
      notifyError("Error fetching drivers");
    }
  };

  const getConsigners = async () => {
    try {
      console.log("Hi");

      const response = await api.get(API_ENDPOINTS.consigners.list);
      setConsignersList(response.data);
    } catch (error) {
      notifyError("Error fetching consigners");
    }
  };
  const getConsignees = async () => {
    try {
      console.log("Hi");

      const response = await api.get(API_ENDPOINTS.consignees.list);
      setConsigneesList(response.data);
    } catch (error) {
      notifyError("Error fetching consignees");
    }
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

  const handleInputConsignerChange = (e) => {
    const { name, value } = e.target;
    setNewConsigner((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputConsigneeChange = (e) => {
    const { name, value } = e.target;
    setNewConsignee((prev) => ({ ...prev, [name]: value }));
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
      const response = await api.get(API_ENDPOINTS.parties.list, {
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
        setIsAddPartyModalOpen(false);
        setIsEditPartyModalOpen(false);
        setIsViewPartyModalOpen(false);
        setIsDeleteConfirmOpen(false);
        setShowTransactionsModal(false);
        setShowDriverNameFilterDropdown(false);
        setShowDriverStatusFilterDropdown(false);
        // Reset states if needed
        resetNewDriverForm();
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
    setIsAddPartyModalOpen,
    setIsEditPartyModalOpen,
    setIsViewPartyModalOpen,
    setIsDeleteConfirmOpen,
    setShowDriverNameFilterDropdown,
    setShowDriverStatusFilterDropdown,
    setNewDriver,
    setCurrentDriver,
    setIsEditMode,
  ]);

  useEffect(() => {
    fetchDrivers();
    getParties();
    getTrucks();
    getDrivers();
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
    (party) =>
      party.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.openingBalance.includes(searchTerm.toLowerCase())
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
    const pageUrl = `${API_ENDPOINTS.parties.list}?page=${page}&page_size=${recordsPerPage}`;
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
  const handleAddPartyClick = () => {
    resetNewDriverForm();
    setIsAddPartyModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClick = (party) => {
    setCurrentDriver(party);
    setNewDriver({
      partyName: party.partyName,
      openingBalance: party.openingBalance,
      openingBalanceDate: party.openingBalanceDate,
      mobileNumber: party.mobileNumber,
    });
    setIsEditPartyModalOpen(true);
  };

  const handleTransactionClick = (party) => {
    setCurrentDriver(party);
    setNewDriver({
      partyName: party.partyName,
      openingBalance: party.openingBalance,
      openingBalanceDate: party.openingBalanceDate,
      mobileNumber: party.mobileNumber,
      gstNumber: party.gstNumber,
      pan: party.pan,
      companyName: party.companyName,
      address: party.address,
      state: party.state,
      pincode: party.pincode,
    });
    setSelectedDriver(party);
    console.log(selectedDriver);
    setShowTransactionsModal(true);
    //fetchTransactions(party);
  };

  // Function to close the modal
  const closeTransactionModal = () => {
    setShowTransactionsModal(false);
    setCurrentDriver(null);
  };

  // Function to open add transaction modal
  const openAddTransactionModal = () => {
    setShowPaymentModal(true);
  };

  const addTripModalToggle = () => {
    setisAddTripModalOpen(true);
    setNewTrip((prev) => ({ ...prev, party_id: currentDriver.id }));
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

  const validatePartyForm = () => {
    let valid = true;
    let newErrors = {
      partyName: "",
      openingBalance: "",
      openingBalanceDate: "",
      mobileNumber: "",
    };

    // Check if party name is empty
    if (!newDriver.partyName.trim()) {
      newErrors.partyName = "Party name is required";
      valid = false;
    }

    // Check if opening balance is empty
    if (!newDriver.openingBalance.trim()) {
      newErrors.openingBalance = "Opening balance is required";
      valid = false;
    }

    // Check if opening balance date is empty
    if (!newDriver.openingBalanceDate) {
      newErrors.openingBalanceDate = "Date is required";
      valid = false;
    }

    // Check if mobile number is empty
    if (!newDriver.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
      valid = false;
    }

    if (!/^\d{10}$/.test(newDriver.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number should be exactly 10 digits";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  const handleAddPartyFormSubmit = (e) => {
    e.preventDefault(); // Prevent form submission if invalid
    if (validatePartyForm()) {
      handleAddParty(e); // Call parent submit function if valid
    }
  };
  // Handle input changes for driver form
  const handleDriverChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
    console.log(newDriver);
  };

  // Handle input changes for driver form
  const handleTripChange = (e) => {
    const { name, value } = e.target;
    setNewTrip((prev) => ({ ...prev, [name]: value }));
    console.log(newTrip);
  };

  const handleFieldChange = (field, value) => {
    if (validationErrors["noOfUnits"]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors["noOfUnits"];
        console.log(newErrors);
        return newErrors;
      });
    }
    console.log(routes);

    // Keep your existing numeric value handling
    const numericValue = value.replace(/[^0-9.]/g, "");

    let rate = field === "rate" ? numericValue : calculationFields.rate;
    let units = field === "units" ? numericValue : calculationFields.units;
    let freight =
      field === "freight" ? numericValue : newDriver.partyFreightAmount;

    let newRate = rate;
    let newUnits = units;
    let newFreight = freight;

    // Compute the missing field - keep your existing calculation logic
    if (rate && units && field !== "freight") {
      newFreight = (parseFloat(rate) * parseFloat(units)).toFixed(2);
    }
    // } else if (freight && rate && field !== "units") {
    //   newUnits = (parseFloat(freight) / parseFloat(rate)).toFixed(2);
    // }
    else if (freight && units && field !== "rate") {
      newRate = (parseFloat(freight) / parseFloat(units)).toFixed(2);
    }

    // Update calculation fields
    setCalculationFields({
      rate: newRate || "",
      units: units || "",
    });

    // Update driver information
    setNewDriver({
      ...newDriver,
      partyFreightAmount: newFreight || "",
    });

    // Run validation after field change if we're changing units
    // This provides immediate feedback when changing the units field
    if (field === "units" && paymentMode !== "Fixed") {
      // Calculate total units from all routes
      const totalRouteUnits = routes.reduce((sum, route) => {
        const routeUnits = parseFloat(route.units) || 0;
        return sum + routeUnits;
      }, 0);

      // Check if total route units exceeds noOfUnits
      if (totalRouteUnits > parseFloat(numericValue)) {
        setValidationErrors((prev) => ({
          ...prev,
          noOfUnits: `Total route units (${totalRouteUnits}) exceed allocated units (${numericValue})`,
        }));
      }
    }

    console.log(newDriver);
    console.log(calculationFields);
  };
  const handleRouteUnitChange = (index, value) => {
    // Force numeric value
    console.log("Hiiiii");

    const numericValue = value.replace(/[^0-9.]/g, "");

    // Update routes
    const updatedRoutes = [...routes];
    updatedRoutes[index].units = numericValue;
    setRoutes(updatedRoutes);

    // Check validation if we have a noOfUnits set
    if (paymentMode !== "Fixed" && calculationFields.units) {
      // Calculate total units from all routes
      const totalRouteUnits = updatedRoutes.reduce((sum, route) => {
        const routeUnits = parseFloat(route.units) || 0;
        return sum + routeUnits;
      }, 0);

      const noOfUnits = parseFloat(calculationFields.units) || 0;

      // Check if total route units exceeds noOfUnits
      if (totalRouteUnits > noOfUnits) {
        setValidationErrors((prev) => ({
          ...prev,
          noOfUnits: `Total route units (${totalRouteUnits}) exceed allocated units (${noOfUnits})`,
        }));
      } else {
        // Clear error if it's fixed
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.noOfUnits;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate general route fields
    if (!newDriver.origin) {
      errors.origin = "Origin is required";
    }

    if (!newDriver.destination) {
      errors.destination = "Destination is required";
    }

    // Validate trip details
    if (!tripType) {
      errors.tripType = "Trip type is required";
    }

    if (!newDriver.party_id) {
      errors.party_id = "Party is required";
    }

    if (!newDriver.truck_id) {
      errors.truck_id = "Truck is required";
    }

    if (!newDriver.driver_id) {
      errors.driver_id = "Driver is required";
    }

    // Validate routes
    routes.forEach((route, index) => {
      if (!route.consigner) {
        errors[`route_${index}_consigner`] = "Consigner is required";
      }

      if (!route.consignee) {
        errors[`route_${index}_consignee`] = "Consignee is required";
      }

      if (!route.units) {
        errors[`route_${index}_units`] = "Units are required";
      }
    });

    // Validate billing information
    if (paymentMode !== "Fixed") {
      if (!calculationFields.rate) {
        errors.rate = "Rate is required";
      }

      if (!calculationFields.units) {
        errors.units = "Number of units is required";
      }

      // Only validate total units if all routes have units specified
      const allRoutesHaveUnits = routes.every((route) => !!route.units);

      if (allRoutesHaveUnits && calculationFields.units) {
        // Calculate total units from all routes
        const totalRouteUnits = routes.reduce((sum, route) => {
          const units = parseFloat(route.units) || 0;
          return sum + units;
        }, 0);

        const noOfUnits = parseFloat(calculationFields.units) || 0;

        // Check if total route units exceeds noOfUnits
        if (totalRouteUnits > noOfUnits) {
          errors.noOfUnits = `Total route units (${totalRouteUnits}) exceed allocated units (${noOfUnits})`;
        }
      }
    }

    if (!newDriver.partyFreightAmount) {
      errors.partyFreightAmount = "Party freight amount is required";
    }

    if (!newDriver.startDate) {
      errors.startDate = "Start date is required";
    }

    // Validate start KMS reading if truck is owned
    const selectedTruck = truckList.find(
      (truck) => truck.id == newDriver.truck_id
    );
    if (
      selectedTruck &&
      selectedTruck.ownership === "My Truck" &&
      !newDriver.startKmsReading
    ) {
      errors.startKmsReading = "Start KMs reading is required for owned trucks";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Returns true if no errors
  };
  const handleAddTrip = async (e) => {
    //console.log(routes);
    console.log(newDriver);
    //console.log(calculationFields);

    // Convert routes array to JSON string
    const routesJSON = JSON.stringify(routes);

    console.log(routesJSON);

    // const formData = new FormData();
    // formData.append("origin", newTrip.origin);
    // formData.append("destination", newTrip.destination);
    // formData.append("tripType", tripType);
    // formData.append("partyBillingType", newTrip.partyBillingType);
    // formData.append("ratePerUnit", calculationFields.rate);
    // formData.append("noOfUnits", calculationFields.units);
    // formData.append("partyFreightAmount", newTrip.partyFreightAmount);
    // formData.append("tripStatus", newTrip.tripStatus);
    // formData.append("startDate", newTrip.startDate);
    // formData.append("startKmsReading", newTrip.startKmsReading);
    // formData.append("party_id", newTrip.party_id);
    // formData.append("truck_id", newTrip.truck_id); // Add more fields if needed
    // formData.append("driver_id", newTrip.driver_id);
    // formData.append("routes", routesJSON);

    // try {
    //   await api.post(API_ENDPOINTS.trips.create, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data", // Explicitly set header
    //     },
    //   });
    //   notifySuccess("Trip added successfully");
    //   setisAddTripModalOpen(false);
    //   resetNewTripForm();
    //   setRoutes([
    //     {
    //       consigner: "",
    //       consignee: "",
    //       units: "",
    //       lrNumber: "",
    //       invoiceNumber: "",
    //     },
    //   ]);
    //   setTripType("Single Route");
    //   setCalculationFields({
    //     rate: "",
    //     units: "",
    //   });
    //   setValidationErrors({});
    // } catch (error) {
    //   notifyError("Error adding trip");
    // }
  };

  const handleAddTripFormSubmit = (e) => {
    e.preventDefault(); // Prevent form submission if invalid

    if (validateForm()) {
      handleAddTrip(e); // Call parent submit function if valid
    }
  };

  const totalAmount = useMemo(() => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amountPaid);
      return total - amount;
    }, 0);
  });

  // Handle add driver form submission
  const handleAddParty = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("partyName", newDriver.partyName);
    formData.append("openingBalance", newDriver.openingBalance);
    formData.append("openingBalanceDate", newDriver.openingBalanceDate);
    formData.append("mobileNumber", newDriver.mobileNumber); // Add more fields if needed

    try {
      await api.post(API_ENDPOINTS.parties.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set header
        },
      });
      notifySuccess("Party added successfully");
      fetchDrivers();
      getParties();
      getSortedAndFilteredDrivers();
      setIsAddPartyModalOpen(false);
      resetNewDriverForm();
    } catch (error) {
      notifyError("Error adding party");
    }
  };

  // Handle edit driver form submission
  // Handle edit driver form submission - works for both regular edit and view-edit modes
  const handleEditParty = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (!currentDriver) return;

    try {
      await api.put(API_ENDPOINTS.parties.update(currentDriver.id), newDriver);
      notifyInfo("Party updated successfully");
      await fetchDrivers();
      await getParties();
      await getSortedAndFilteredDrivers();

      if (fromViewModal) {
        // If coming from view modal, just exit edit mode
        setIsEditMode(false);
      } else {
        // If coming from regular edit modal, close it
        setIsEditPartyModalOpen(false);
        setCurrentDriver(null);
        setNewDriver({
          truckNo: "",
          truckType: "",
          ownership: "",
          truckStatus: "available",
        });
      }
      resetNewDriverForm();
      setShowTransactionsModal(false);
    } catch (error) {
      console.error("Error updating driver:", error);
      notifyError("Error updating driver");
    }
  };
  const handleEditPartyFormSubmit = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (validatePartyForm()) {
      handleEditParty(e, fromViewModal); // Call parent submit function if valid
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If in edit mode, call the shared edit handler with fromViewModal=true
      handleEditPartyFormSubmit(null, true);
    } else {
      // If in view mode, close the view modal and open the edit modal instead
      setIsViewPartyModalOpen(false); // Close view modal

      // Open edit modal with current driver data
      setNewDriver({
        partyName: currentDriver.partyName,
        openingBalance: currentDriver.openingBalance,
        openingBalanceDate: currentDriver.openingBalanceDate,
        mobileNumber: currentDriver.mobileNumber,
      });

      // Open the regular edit modal
      setIsEditPartyModalOpen(true);
    }
  };

  // Handle delete driver
  const handleDeleteParty = async () => {
    if (!currentDriver) return;
    try {
      await api.delete(API_ENDPOINTS.parties.delete(currentDriver.id));
      notifyInfo("Party deleted successfully");
      fetchDrivers();
      getParties();
      getSortedAndFilteredDrivers();
      setIsDeleteConfirmOpen(false);
      setCurrentDriver(null);
    } catch {
      notifyError("Error updating party");
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
          <h1 className="text-2xl font-semibold text-gray-800">Parties</h1>
          <button
            onClick={handleAddPartyClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add Party
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
                placeholder="Search Parties"
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
                    onClick={() => requestSort("partyName")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Party Name
                      </span>
                      {getSortDirectionIcon("partyName")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("openingBalance")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Opening Balance
                      </span>
                      {getSortDirectionIcon("openingBalance")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("openingBalanceDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Opening Balance Date
                      </span>
                      {getSortDirectionIcon("openingBalanceDate")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("mobileNumber")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Mobile Number
                      </span>
                      {getSortDirectionIcon("mobileNumber")}
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
                {currentRecords.map((party) => (
                  <tr
                    key={party.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(party)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-gray-900">
                        {party.partyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {party.openingBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {party.openingBalanceDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {party.mobileNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRowClick(party);
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
                            handleEditClick(party);
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
                            handleDeleteClick(party);
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
                  No parties found. Try a different search term or add a new
                  party.
                </p>
              </div>
            )}
          </div>

          {showPaymentModal && (
            <div className="text-black fixed inset-y-0 right-0 z-50 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Party Payment
                </h2>
                <button
                  onClick={closePaymentModal}
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

              <div className="flex-grow overflow-auto px-6 pt-4">
                {/* Party Details Section */}
                <div className="bg-gray-100 rounded-md p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">Party Name</span>
                      <h3 className="font-medium">PK</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">
                        Total Balance
                      </span>
                      <h3 className="font-medium">
                        ₹ {currentDriver.openingBalance}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="paymentAmount"
                        placeholder="Enter Amount"
                        value={paymentDetails.paymentAmount}
                        onChange={handlePaymentChange}
                        className="w-full p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <span className="absolute right-3 top-2 text-gray-500">
                        ₹
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <div className="relative">
                      <select
                        name="paymentMethod"
                        value={paymentDetails.paymentMethod}
                        onChange={handlePaymentChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Check">Check</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="paymentDate"
                        value={paymentDetails.paymentDate}
                        onChange={handlePaymentChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Enter Notes"
                      value={paymentDetails.notes}
                      onChange={handlePaymentChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-3">
                        Received By Driver
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="receivedByDriver"
                          checked={paymentDetails.receivedByDriver}
                          onChange={handleToggleChange}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Buttons */}
              <div className="border-t p-4 flex justify-between">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors">
                  Choose Opening Balance/Trips
                </button>
              </div>
            </div>
          )}

          {showAddConsignerPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Consigner</h2>
                  <button
                    onClick={() => setShowAddConsignerPopup(false)}
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
                    <label className="block mb-1 font-medium">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={newConsigner.addressLine1}
                      onChange={handleInputConsignerChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Address Line 2
                    </label>
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
                    <label className="block mb-1 font-medium">
                      Mobile Number
                    </label>
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
                      onClick={() => setShowAddConsignerPopup(false)}
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
          {showAddConsigneePopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add New Consignee</h2>
                  <button
                    onClick={() => setShowAddConsigneePopup(false)}
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
                    <label className="block mb-1 font-medium">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={newConsignee.addressLine1}
                      onChange={handleInputConsigneeChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">
                      Address Line 2
                    </label>
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
                    <label className="block mb-1 font-medium">
                      Mobile Number
                    </label>
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
                      onClick={() => setShowAddConsigneePopup(false)}
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

          {isAddTripModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                <form onSubmit={handleAddTripFormSubmit}>
                  <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                      Add Trip
                    </h2>
                    <button
                      onClick={() => {
                        setisAddTripModalOpen(false);
                        setRoutes([
                          {
                            consigner: "",
                            consignee: "",
                            units: "",
                            lrNumber: "",
                            invoiceNumber: "",
                          },
                        ]);
                        setCalculationFields({
                          rate: "",
                          units: "",
                        });
                        setPaymentMode("Fixed");
                        setValidationErrors({});
                      }}
                      className="text-gray-400 hover:text-gray-500"
                      type="button"
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
                  <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="p-2">
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                          General Route
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Origin <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                name="origin"
                                value={newTrip.origin}
                                onChange={handleTripChange}
                                className={`appearance-none block w-full px-3 py-2 border ${
                                  validationErrors.origin
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                              >
                                <option value="">Select Origin...</option>
                                <option value={"Mumbai"}>Mumbai</option>
                                <option value={"Bangalore"}>Bangalore</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg
                                  className="h-4 w-4"
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
                              </div>
                            </div>
                            {validationErrors.origin && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.origin}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Destination{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                name="destination"
                                value={newTrip.destination}
                                onChange={handleTripChange}
                                className={`appearance-none block w-full px-3 py-2 border ${
                                  validationErrors.destination
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                              >
                                <option value="">Select Destination...</option>
                                <option value={"Chennai"}>Chennai</option>
                                <option value={"Delhi"}>Delhi</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg
                                  className="h-4 w-4"
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
                              </div>
                            </div>
                            {validationErrors.destination && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.destination}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                          Trip Details
                        </h3>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trip Type <span className="text-red-500">*</span>
                          </label>
                          <div className="flex space-x-4 mt-1">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="tripType"
                                value="Single Route"
                                checked={tripType === "Single Route"}
                                onChange={(e) => {
                                  setRoutes([
                                    {
                                      consigner: "",
                                      consignee: "",
                                      units: "",
                                      lrNumber: "",
                                      invoiceNumber: "",
                                    },
                                  ]);
                                  setTripType(e.target.value);
                                }}
                                className="text-blue-600"
                              />
                              <span className="ml-2 text-black">
                                Single Route
                              </span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="tripType"
                                value="Multiple Routes"
                                checked={tripType === "Multiple Routes"}
                                onChange={(e) => setTripType(e.target.value)}
                                className="text-blue-600"
                              />
                              <span className="ml-2 text-black">
                                Multiple Routes
                              </span>
                            </label>
                          </div>
                          {validationErrors.tripType && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.tripType}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Party <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="party_id"
                              value={newTrip.party_id}
                              onChange={handleTripChange}
                              className={`appearance-none block w-full px-3 py-2 border ${
                                validationErrors.party_id
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                            >
                              <option value="">Select a Party...</option>
                              {partyList.map((party) => (
                                <option key={party.id} value={party.id}>
                                  {party.partyName}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
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
                            </div>
                          </div>
                          {validationErrors.party_id && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.party_id}
                            </p>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Truck Registration No.{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="truck_id"
                              value={newTrip.truck_id}
                              onChange={handleTripChange}
                              className={`appearance-none block w-full px-3 py-2 border ${
                                validationErrors.truck_id
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                            >
                              <option value="">Select a Truck...</option>
                              {truckList.map((truck) => (
                                <option key={truck.id} value={truck.id}>
                                  {truck.truckNo}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
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
                            </div>
                          </div>
                          {validationErrors.truck_id && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.truck_id}
                            </p>
                          )}
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Driver Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="driver_id"
                              value={newTrip.driver_id}
                              onChange={handleTripChange}
                              className={`appearance-none block w-full px-3 py-2 border ${
                                validationErrors.driver_id
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                            >
                              <option value="">Select a Driver...</option>
                              {driverList.map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg
                                className="h-4 w-4"
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
                            </div>
                          </div>
                          {validationErrors.driver_id && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.driver_id}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-5">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-700">
                            {tripType === "Single Route" ? "Route" : "Routes"}
                          </h3>

                          {tripType === "Multiple Routes" && (
                            <button
                              type="button"
                              onClick={() =>
                                setRoutes([
                                  ...routes,
                                  {
                                    consigner: "",
                                    consignee: "",
                                    units: "",
                                    lrNumber: "",
                                    invoiceNumber: "",
                                  },
                                ])
                              }
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Add Route
                            </button>
                          )}
                        </div>

                        {tripType === "Single Route" ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Consigner{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative flex">
                                <select
                                  value={routes[0].consigner}
                                  onChange={(e) => {
                                    const updatedRoutes = [...routes];
                                    updatedRoutes[0].consigner = e.target.value;
                                    setRoutes(updatedRoutes);
                                  }}
                                  className={`appearance-none block w-full px-3 py-2 border ${
                                    validationErrors[`route_0_consigner`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                >
                                  <option value="">
                                    -- Select a consigner --
                                  </option>
                                  {consignersList.map((consigner) => (
                                    <option
                                      key={consigner.id}
                                      value={consigner.id}
                                    >
                                      {consigner.name} (GST:{" "}
                                      {consigner.gstNumber})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowAddConsignerPopup(true)}
                                  className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                                <div className="pointer-events-none absolute inset-y-0 right-10 flex items-center px-2 text-gray-700">
                                  <svg
                                    className="h-4 w-4"
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
                                </div>
                              </div>
                              {validationErrors[`route_0_consigner`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors[`route_0_consigner`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Consignee{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative flex">
                                <select
                                  value={routes[0].consignee}
                                  onChange={(e) => {
                                    const updatedRoutes = [...routes];
                                    updatedRoutes[0].consignee = e.target.value;
                                    setRoutes(updatedRoutes);
                                  }}
                                  className={`appearance-none block w-full px-3 py-2 border ${
                                    validationErrors[`route_0_consignee`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                >
                                  <option value="">
                                    -- Select a consignee --
                                  </option>
                                  {consigneesList.map((consignee) => (
                                    <option
                                      key={consignee.id}
                                      value={consignee.id}
                                    >
                                      {consignee.name} (GST:{" "}
                                      {consignee.gstNumber})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowAddConsigneePopup(true)}
                                  className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                                <div className="pointer-events-none absolute inset-y-0 right-10 flex items-center px-2 text-gray-700">
                                  <svg
                                    className="h-4 w-4"
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
                                </div>
                              </div>
                              {validationErrors[`route_0_consignee`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors[`route_0_consignee`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Units <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={routes[0].units || ""}
                                onChange={(e) =>
                                  handleRouteUnitChange(0, e.target.value)
                                }
                                placeholder="Enter number of units"
                                className={`appearance-none block w-full px-3 py-2 border ${
                                  validationErrors[`route_0_units`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                              />
                              {validationErrors[`route_0_units`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors[`route_0_units`]}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {routes.map((route, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 border border-gray-200 rounded-md p-3 relative"
                              >
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Consigner{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative flex">
                                    <select
                                      value={route.consigner}
                                      onChange={(e) => {
                                        const updatedRoutes = [...routes];
                                        updatedRoutes[index].consigner =
                                          e.target.value;
                                        setRoutes(updatedRoutes);
                                      }}
                                      className={`appearance-none block w-full px-3 py-2 border ${
                                        validationErrors[
                                          `route_${index}_consigner`
                                        ]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                    >
                                      <option value="">
                                        -- Select a consigner --
                                      </option>
                                      {consignersList.map((consigner) => (
                                        <option
                                          key={consigner.id}
                                          value={consigner.id}
                                        >
                                          {consigner.name} (GST:{" "}
                                          {consigner.gstNumber})
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowAddConsignerPopup(true)
                                      }
                                      className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                    <div className="pointer-events-none absolute inset-y-0 right-10 flex items-center px-2 text-gray-700">
                                      <svg
                                        className="h-4 w-4"
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
                                    </div>
                                  </div>
                                  {validationErrors[
                                    `route_${index}_consigner`
                                  ] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {
                                        validationErrors[
                                          `route_${index}_consigner`
                                        ]
                                      }
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Consignee{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <div className="relative flex">
                                    <select
                                      value={route.consignee}
                                      onChange={(e) => {
                                        const updatedRoutes = [...routes];
                                        updatedRoutes[index].consignee =
                                          e.target.value;
                                        setRoutes(updatedRoutes);
                                      }}
                                      className={`appearance-none block w-full px-3 py-2 border ${
                                        validationErrors[
                                          `route_${index}_consignee`
                                        ]
                                          ? "border-red-500"
                                          : "border-gray-300"
                                      } rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                    >
                                      <option value="">
                                        -- Select a consignee --
                                      </option>
                                      {consigneesList.map((consignee) => (
                                        <option
                                          key={consignee.id}
                                          value={consignee.id}
                                        >
                                          {consignee.name} (GST:{" "}
                                          {consignee.gstNumber})
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setShowAddConsigneePopup(true)
                                      }
                                      className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                    <div className="pointer-events-none absolute inset-y-0 right-10 flex items-center px-2 text-gray-700">
                                      <svg
                                        className="h-4 w-4"
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
                                    </div>
                                  </div>
                                  {validationErrors[
                                    `route_${index}_consignee`
                                  ] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {
                                        validationErrors[
                                          `route_${index}_consignee`
                                        ]
                                      }
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Units{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={route.units || ""}
                                    onChange={(e) =>
                                      handleRouteUnitChange(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter number of units"
                                    className={`appearance-none block w-full px-3 py-2 border ${
                                      validationErrors[`route_${index}_units`]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                  />
                                  {validationErrors[`route_${index}_units`] && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {
                                        validationErrors[
                                          `route_${index}_consignee`
                                        ]
                                      }
                                    </p>
                                  )}
                                </div>

                                {routes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedRoutes = [...routes];
                                      updatedRoutes.splice(index, 1);
                                      setRoutes(updatedRoutes);
                                      if (
                                        paymentMode !== "Fixed" &&
                                        calculationFields.units
                                      ) {
                                        // Calculate total units from all routes
                                        const totalRouteUnits =
                                          updatedRoutes.reduce((sum, route) => {
                                            const routeUnits =
                                              parseFloat(route.units) || 0;
                                            return sum + routeUnits;
                                          }, 0);

                                        const noOfUnits =
                                          parseFloat(calculationFields.units) ||
                                          0;

                                        // Check if total route units exceeds noOfUnits
                                        if (totalRouteUnits > noOfUnits) {
                                          setValidationErrors((prev) => ({
                                            ...prev,
                                            noOfUnits: `Total route units (${totalRouteUnits}) exceed allocated units (${noOfUnits})`,
                                          }));
                                        } else {
                                          // Clear error if it's fixed
                                          setValidationErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.noOfUnits;
                                            return newErrors;
                                          });
                                        }
                                      }
                                    }}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
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
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mb-5">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">
                          Billing Information
                        </h3>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Party Billing Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {partyBillingOptions.map((option) => (
                              <button
                                type="button"
                                key={option}
                                className={`px-4 py-2 rounded-md text-sm ${
                                  paymentMode === option
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                                name="partyBillingType"
                                onClick={() => {
                                  newTrip.partyBillingType = option;
                                  setPaymentMode(option);
                                  // Reset calculation fields when billing type changes
                                  if (option !== "Fixed") {
                                    setCalculationFields({
                                      rate: "",
                                      units: "",
                                    });
                                  }
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>

                        {paymentMode !== "Fixed" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rate per{" "}
                                {paymentMode === "Per Hour"
                                  ? "Hour"
                                  : paymentMode === "Per Tonne"
                                  ? "Tonne"
                                  : paymentMode === "Per Km"
                                  ? "KM"
                                  : paymentMode === "Per Kg"
                                  ? "KG"
                                  : paymentMode === "Per Trip"
                                  ? "Trip"
                                  : paymentMode === "Per Day"
                                  ? "Day"
                                  : paymentMode === "Per Litre"
                                  ? "Litre"
                                  : paymentMode === "Per Bag"
                                  ? "Bag"
                                  : "Unit"}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-black">₹</span>
                                </div>
                                <input
                                  type="text"
                                  value={calculationFields.rate}
                                  onChange={(e) =>
                                    handleFieldChange("rate", e.target.value)
                                  }
                                  className={`pl-7 block w-full px-3 py-2 border ${
                                    validationErrors.rate
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                  placeholder={`Rate per ${
                                    paymentMode === "Per Hour"
                                      ? "hour"
                                      : paymentMode === "Per Tonne"
                                      ? "tonnes"
                                      : paymentMode === "Per Km"
                                      ? "km"
                                      : paymentMode === "Per Kg"
                                      ? "kg"
                                      : paymentMode === "Per Trip"
                                      ? "trip"
                                      : paymentMode === "Per Day"
                                      ? "day"
                                      : paymentMode === "Per Litre"
                                      ? "litre"
                                      : paymentMode === "Per Bag"
                                      ? "bag"
                                      : "unit"
                                  }`}
                                />
                              </div>
                              {validationErrors.rate && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors.rate}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of{" "}
                                {paymentMode === "Per Hour"
                                  ? "Hours"
                                  : paymentMode === "Per Tonne"
                                  ? "Tonnes"
                                  : paymentMode === "Per Km"
                                  ? "KMs"
                                  : paymentMode === "Per Kg"
                                  ? "KGs"
                                  : paymentMode === "Per Trip"
                                  ? "Trips"
                                  : paymentMode === "Per Day"
                                  ? "Days"
                                  : paymentMode === "Per Litre"
                                  ? "Litres"
                                  : paymentMode === "Per Bag"
                                  ? "Bags"
                                  : "Units"}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={calculationFields.units}
                                onChange={(e) =>
                                  handleFieldChange("units", e.target.value)
                                }
                                className={`block w-full px-3 py-2 border ${
                                  validationErrors.units ||
                                  validationErrors.noOfUnits
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                                placeholder={`Number of ${
                                  paymentMode === "Per Hour"
                                    ? "hours"
                                    : paymentMode === "Per Ton"
                                    ? "tons"
                                    : paymentMode === "Per Kilometer"
                                    ? "kilometers"
                                    : "units"
                                }`}
                              />
                              {validationErrors.units && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors.units}
                                </p>
                              )}
                              {validationErrors.noOfUnits && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors.noOfUnits}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Party Freight Amount{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-black">₹</span>
                            </div>
                            <input
                              name="partyFreightAmount"
                              value={newTrip.partyFreightAmount}
                              onChange={(e) => {
                                handleFieldChange("freight", e.target.value);
                                handleTripChange(e);
                              }}
                              type="text"
                              className={`pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                                validationErrors.partyFreightAmount
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Eg: 45,000"
                              readOnly={paymentMode === "Fixed"}
                            />
                          </div>
                          {validationErrors.partyFreightAmount && (
                            <p className="text-red-500 text-sm mt-1">
                              {validationErrors.partyFreightAmount}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                value={newTrip.startDate}
                                onChange={handleTripChange}
                                type="date"
                                name="startDate"
                                className={`${
                                  validationErrors.startDate
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } w-full border rounded-md p-2 text-black`}
                              />
                            </div>
                            {validationErrors.startDate && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.startDate}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Kms Reading{" "}
                              {truckList.find(
                                (truck) => truck.id == newTrip.truck_id
                              )?.ownership == "My Truck" && (
                                <span className="text-red-500">*</span>
                              )}
                            </label>
                            <input
                              name="startKmsReading"
                              value={newTrip.startKmsReading}
                              onChange={handleTripChange}
                              type="text"
                              className={`${
                                validationErrors.startKmsReading
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black`}
                              placeholder="Start readings"
                            />
                            {validationErrors.startKmsReading && (
                              <p className="text-red-500 text-sm mt-1">
                                {validationErrors.startKmsReading}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end p-4 gap-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setisAddTripModalOpen(false);
                        setRoutes([
                          {
                            consigner: "",
                            consignee: "",
                            units: "",
                            lrNumber: "",
                            invoiceNumber: "",
                          },
                        ]);
                        setCalculationFields({
                          rate: "",
                          units: "",
                        });
                        setPaymentMode("Fixed");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showTransactionsModal && (
            <div className="fixed inset-y-0 right-0 z-20 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add More Info for {selectedDriver.partyName}
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

              {/* Tabs Navigation */}
              <div className="border-b border-gray-200">
                <div className="flex justify-between items-center px-6">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("trips")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "trips"
                          ? "border-[#243b6c] text-[#243b6c]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Trips
                    </button>
                    <button
                      onClick={() => setActiveTab("passbook")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "passbook"
                          ? "border-[#243b6c] text-[#243b6c]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Passbook
                    </button>
                    <button
                      onClick={() => setActiveTab("monthly-balances")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "monthly-balances"
                          ? "border-[#243b6c] text-[#243b6c]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Monthly Balances
                    </button>
                    <button
                      onClick={() => setActiveTab("party-details")}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === "party-details"
                          ? "border-[#243b6c] text-[#243b6c]"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Party Details
                    </button>
                  </nav>

                  <div className="flex space-x-2">
                    <button
                      onClick={openAddTransactionModal}
                      className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                    >
                      + Add Payment
                    </button>
                    <button
                      onClick={addTripModalToggle}
                      className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                    >
                      + Add Trip
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-grow overflow-auto">
                {/* Trips Tab */}
                {activeTab === "trips" && (
                  <div className="p-6">
                    <div className="text-center animate-[fadeIn_0.3s_ease-in-out_forwards]">
                      {/* <div className="text-gray-400 mb-4">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Trips
                      </h3>
                      <p className="text-gray-500">
                        Trip information will be displayed here.
                      </p> */}
                      <div className="flex-grow overflow-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Truck No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Route
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Party Balance
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                              <tr
                                key={transaction.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-black flex">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                                    <path d="M7 9l11 0" />
                                  </svg>
                                  {transaction.amount}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full font-medium ${
                                      transaction.amountType === "Credit"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {transaction.amountType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.reason}
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.date}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                                    ✏️
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
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
                                  No trips found for this party.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passbook Tab */}
                {activeTab === "passbook" && (
                  <div className="p-6">
                    <div className="text-center animate-[fadeIn_0.3s_ease-in-out_forwards]">
                      {/* <div className="text-gray-400 mb-4">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Passbook
                      </h3> */}
                      <div className="flex-grow overflow-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trip Details
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                              <tr
                                key={transaction.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-black flex">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                                    <path d="M7 9l11 0" />
                                  </svg>
                                  {transaction.amount}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full font-medium ${
                                      transaction.amountType === "Credit"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {transaction.amountType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.reason}
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.date}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                                    ✏️
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
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
                                  No transactions found for this driver.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly Balances Tab */}
                {activeTab === "monthly-balances" && (
                  <div className="p-6">
                    <div className="text-center py-12 animate-[fadeIn_0.3s_ease-in-out_forwards]">
                      {/* <div className="text-gray-400 mb-4">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Monthly Balances
                      </h3>
                      <p className="text-gray-500">
                        Monthly balance summary will be displayed here.
                      </p> */}
                      <div className="flex-grow overflow-auto">
                        <table className="w-full">
                          <thead className="bg-gray-100 border-b sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Month
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trip Started
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trip Settled
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Balance
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Collection(%)
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                              <tr
                                key={transaction.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-black flex">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                                    <path d="M7 9l11 0" />
                                  </svg>
                                  {transaction.amount}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-block px-2 py-1 rounded-full font-medium ${
                                      transaction.amountType === "Credit"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {transaction.amountType}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.reason}
                                </td>
                                <td className="px-4 py-3 text-black">
                                  {transaction.date}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                                    ✏️
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
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
                                  No monthly balances found for this parties.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Party Details Tab */}
                {activeTab === "party-details" && (
                  <div className="animate-[fadeIn_0.3s_ease-in-out_forwards]">
                    {/* Summary Section */}

                    <div className="px-10 pt-2 pb-6">
                      <form onSubmit={handleEditPartyFormSubmit}>
                        <div className="gap-x-6 gap-y-4">
                          {/* Left column */}
                          <div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                GST Number
                              </label>
                              <input
                                type="text"
                                name="gstNumber"
                                value={newDriver.gstNumber}
                                onChange={handleDriverChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                              />
                            </div>

                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                PAN
                              </label>
                              <input
                                type="text"
                                name="pan"
                                value={newDriver.pan}
                                onChange={handleDriverChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-black mb-1">
                                Company Name
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  name="companyName"
                                  value={newDriver.companyName}
                                  onChange={handleDriverChange}
                                  className="w-full border rounded-md p-2 text-black"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                              </label>
                              <input
                                type="text"
                                name="address"
                                value={newDriver.address}
                                onChange={handleDriverChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                              </label>
                              <SelectWithSearch
                                name="state"
                                value={newDriver.state}
                                onChange={handleDriverChange}
                                options={statesList}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                                placeholder="Select a state"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pincode
                              </label>
                              <input
                                type="text"
                                name="pincode"
                                value={newDriver.pincode}
                                onChange={handleDriverChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                          <button
                            type="button"
                            onClick={() => {
                              resetNewDriverForm();
                              setIsEditPartyModalOpen(false);
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
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Party
              </h2>
              <button
                onClick={() => {
                  setErrors({
                    partyName: "",
                    openingBalance: "",
                    openingBalanceDate: "",
                    mobileNumber: "",
                  });
                  resetNewDriverForm();
                  setIsAddPartyModalOpen(false);
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
            <form onSubmit={handleAddPartyFormSubmit}>
              <div className="gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Name*
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={newDriver.partyName}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.partyName ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.partyName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.partyName}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Balance*
                    </label>
                    <input
                      type="text"
                      name="openingBalance"
                      value={newDriver.openingBalance}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.openingBalance
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.openingBalance && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.openingBalance}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="openingBalanceDate"
                        value={newDriver.openingBalanceDate}
                        onChange={handleDriverChange}
                        className={`w-full border ${
                          errors.openingBalanceDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-2 text-black`}
                      />
                      {errors.openingBalanceDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.openingBalanceDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number*
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={newDriver.mobileNumber}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.mobileNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.mobileNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.mobileNumber}
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
                    setErrors({
                      partyName: "",
                      openingBalance: "",
                      openingBalanceDate: "",
                      mobileNumber: "",
                    });
                    resetNewDriverForm();
                    setIsAddPartyModalOpen(false);
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
      {isEditPartyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Party
              </h2>
              <button
                onClick={() => {
                  setErrors({
                    partyName: "",
                    openingBalance: "",
                    openingBalanceDate: "",
                    mobileNumber: "",
                  });
                  resetNewDriverForm();
                  setIsEditPartyModalOpen(false);
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
            <form onSubmit={handleEditPartyFormSubmit}>
              <div className="gap-x-6 gap-y-4">
                {/* Left column */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Party Name*
                    </label>
                    <input
                      type="text"
                      name="partyName"
                      value={newDriver.partyName}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.partyName ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.partyName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.partyName}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Balance*
                    </label>
                    <input
                      type="text"
                      name="openingBalance"
                      value={newDriver.openingBalance}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.openingBalance
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.openingBalance && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.openingBalance}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-black mb-1">
                      Expense Date*
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="openingBalanceDate"
                        value={newDriver.openingBalanceDate}
                        onChange={handleDriverChange}
                        className={`w-full border ${
                          errors.openingBalanceDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md p-2 text-black`}
                      />
                      {errors.openingBalanceDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.openingBalanceDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number*
                    </label>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={newDriver.mobileNumber}
                      onChange={handleDriverChange}
                      className={`w-full p-2 border ${
                        errors.mobileNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black`}
                    />
                    {errors.mobileNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.mobileNumber}
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
                    setErrors({
                      partyName: "",
                      openingBalance: "",
                      openingBalanceDate: "",
                      mobileNumber: "",
                    });
                    resetNewDriverForm();
                    setIsEditPartyModalOpen(false);
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
      {IsViewPartyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Party" : "Party Details"}
              </h2>
              <button
                onClick={() => setIsViewPartyModalOpen(false)}
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
                      Party Name
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.partyName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Opening Balance
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.openingBalance}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Opening Balance Date
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentDriver?.openingBalanceDate}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Mobile Number
                    </h3>
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {currentDriver.mobileNumber}
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
                onClick={() => setIsViewPartyModalOpen(false)}
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
                  onClick={handleEditPartyFormSubmit}
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
                Are you sure you want to delete party{" "}
                <span className="font-semibold">
                  {currentDriver?.partyName}
                </span>
                ? This action cannot be undone.
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
                onClick={handleDeleteParty}
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
