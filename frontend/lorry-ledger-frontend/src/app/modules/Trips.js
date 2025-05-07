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

export default function Trips({ onSelectTrip }) {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [driverFilters, setDriverFilters] = useState([]);
  const [columnFilteredDrivers, setColumnFilteredDrivers] = useState([]);
  const [sortedAndFilteredDrivers, setSortedAndFilteredDrivers] = useState([]);
  const [isAddTripModalOpen, setisAddTripModalOpen] = useState(false);
  const [isEditTripModalOpen, setisEditTripModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  //Routes
  const [tripType, setTripType] = useState("Single Route");
  const [routes, setRoutes] = useState([{ consigner: "", consignee: "" }]);
  const [showAddConsignerPopup, setShowAddConsignerPopup] = useState(false);
  const [showAddConsigneePopup, setShowAddConsigneePopup] = useState(false);
  const [consignerOptions, setConsignerOptions] = useState([
    "Mumbai",
    "Bangalore",
  ]);
  const [consigneeOptions, setConsigneeOptions] = useState([
    "Chennai",
    "Delhi",
  ]);
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

  const [consignersList, setConsignersList] = useState([]);
  const [consigneesList, setConsigneesList] = useState([]);

  const [calculationFields, setCalculationFields] = useState({
    rate: "",
    units: "",
  });
  const [isViewTripModalOpen, setisViewTripModalOpen] = useState(false);
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
    setisViewTripModalOpen(true);
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

  const [paymentMode, setPaymentMode] = useState("Fixed");
  const [partyList, setPartyList] = useState([]);
  const [truckList, setTruckList] = useState([]);
  const [driverList, setDriverList] = useState([]);

  const [showDriverNameFilterDropdown, setShowDriverNameFilterDropdown] =
    useState(false);

  const [showDriverStatusFilterDropdown, setShowDriverStatusFilterDropdown] =
    useState(false);

  const [newDriver, setNewDriver] = useState({
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

  const resetNewDriverForm = () => {
    setNewDriver({
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

  const fetchDrivers = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.trips.list, {
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
      const response = await api.get(API_ENDPOINTS.trips.list, {
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
      getParties();
      getTrucks();
      getDrivers();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        setPaymentMode("Fixed");

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
        setisAddTripModalOpen(false);
        setisEditTripModalOpen(false);
        setisViewTripModalOpen(false);
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
    setisAddTripModalOpen,
    setisEditTripModalOpen,
    setisViewTripModalOpen,
    setIsDeleteConfirmOpen,
    setShowDriverNameFilterDropdown,
    setShowDriverStatusFilterDropdown,
    setNewDriver,
    setCurrentDriver,
    setIsEditMode,
  ]);

  useEffect(() => {
    fetchDrivers();
    getConsigners();
    getConsignees();
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
    (trip) =>
      trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
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
    const pageUrl = `${API_ENDPOINTS.trips.list}?page=${page}&page_size=${recordsPerPage}`;
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
  const handleAddTripClick = () => {
    resetNewDriverForm();
    setisAddTripModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClick = (trip) => {
    setCurrentDriver(trip);
    setPaymentMode(trip.partyBillingType);
    setNewDriver({
      origin: trip.origin,
      destination: trip.destination,
      partyBillingType: trip.partyBillingType,
      partyFreightAmount: trip.partyFreightAmount,
      tripStatus: trip.tripStatus,
      startDate: trip.startDate,
      startKmsReading: trip.startKmsReading,
      party_id: trip.party.id,
      truck_id: trip.truck.id,
      driver_id: trip.driver_id,
    });
    console.log(trip);

    setisEditTripModalOpen(true);
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
  const handleDriverInputChange = (e) => {
    const { name, value } = e.target;

    // Allow only numeric input and restrict the length
    if (name === "aadhar_number" && /^\d{0,12}$/.test(value)) {
      setErrors((prev) => ({ ...prev, aadhar: "" }));
      handleDriverChange(e);
    }

    if (name === "phone_number" && /^\d{0,10}$/.test(value)) {
      setErrors((prev) => ({ ...prev, phone: "" }));
      handleDriverChange(e);
    }
  };

  const validateTruckForm = () => {
    let valid = true;
    let newErrors = { truckNo: "" };

    setErrors(newErrors);
    return valid;
  };

  const handleAddTripFormSubmit = (e) => {
    e.preventDefault(); // Prevent form submission if invalid

    if (validateTruckForm()) {
      handleAddTrip(e); // Call parent submit function if valid
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
  const handleAddTrip = async (e) => {
    e.preventDefault();

    //console.log(routes);
    //console.log(newDriver);
    //console.log(calculationFields);

    // Convert routes array to JSON string
    const routesJSON = JSON.stringify(routes);

    console.log(routesJSON);

    const formData = new FormData();
    formData.append("origin", newDriver.origin);
    formData.append("destination", newDriver.destination);
    formData.append("tripType", tripType);
    formData.append("partyBillingType", newDriver.partyBillingType);
    formData.append("ratePerUnit", calculationFields.rate);
    formData.append("noOfUnits", calculationFields.units);
    formData.append("partyFreightAmount", newDriver.partyFreightAmount);
    formData.append("tripStatus", newDriver.tripStatus);
    formData.append("startDate", newDriver.startDate);
    formData.append("startKmsReading", newDriver.startKmsReading);
    formData.append("party_id", newDriver.party_id);
    formData.append("truck_id", newDriver.truck_id); // Add more fields if needed
    formData.append("driver_id", newDriver.driver_id);
    formData.append("routes", routesJSON);

    try {
      await api.post(API_ENDPOINTS.trips.create, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set header
        },
      });
      notifySuccess("Trip added successfully");
      fetchDrivers();
      getSortedAndFilteredDrivers();
      setisAddTripModalOpen(false);
      resetNewDriverForm();
      setRoutes([{ consigner: "", consignee: "" }]);
      setTripType("Single Route");
      setCalculationFields({
        rate: "",
        units: "",
      });
    } catch (error) {
      notifyError("Error adding trip");
    }
  };

  // Handle edit driver form submission
  // Handle edit driver form submission - works for both regular edit and view-edit modes
  const handleEditTrip = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (!currentDriver) return;

    try {
      await api.put(API_ENDPOINTS.trips.update(currentDriver.id), newDriver);
      notifyInfo("Trip updated successfully");
      await fetchDrivers();
      await getSortedAndFilteredDrivers();

      if (fromViewModal) {
        // If coming from view modal, just exit edit mode
        setIsEditMode(false);
      } else {
        // If coming from regular edit modal, close it
        setisEditTripModalOpen(false);
        setCurrentDriver(null);
        resetNewDriverForm();
      }
      resetNewDriverForm();
      setShowTransactionsModal(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };
  const handleEditTripFormSubmit = async (e, fromViewModal = false) => {
    if (e) e.preventDefault();
    if (validateTruckForm()) {
      handleEditTrip(e, fromViewModal); // Call parent submit function if valid
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If in edit mode, call the shared edit handler with fromViewModal=true
      handleEditTripFormSubmit(null, true);
    } else {
      // If in view mode, close the view modal and open the edit modal instead
      setisViewTripModalOpen(false); // Close view modal

      // Open edit modal with current driver data
      setNewDriver({
        origin: currentDriver.origin,
        destination: currentDriver.destination,
        partyBillingType: currentDriver.partyBillingType,
        partyFreightAmount: currentDriver.partyFreightAmount,
        tripStatus: currentDriver.tripStatus,
        startDate: currentDriver.startDate,
        startKmsReading: currentDriver.startKmsReading,
        party_id: currentDriver.party.id,
        truck_id: currentDriver.truck.id,
        driver_id: currentDriver.driver_id,
      });

      // Open the regular edit modal
      setisEditTripModalOpen(true);
    }
  };

  // Handle delete driver
  const handleDeleteSupplier = async () => {
    if (!currentDriver) return;
    try {
      await api.delete(API_ENDPOINTS.trips.delete(currentDriver.id));
      notifyInfo("Trip deleted successfully");
      fetchDrivers();
      getSortedAndFilteredDrivers();
      setIsDeleteConfirmOpen(false);
      setCurrentDriver(null);
    } catch {
      notifyError("Error updating Trip");
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
          <h1 className="text-2xl font-semibold text-gray-800">Trips</h1>
          <button
            onClick={handleAddTripClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add Trips
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
                placeholder="Search Trips"
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
                    onClick={() => requestSort("startDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Start Date
                      </span>
                      {getSortDirectionIcon("startDate")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("LRCount")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        LR Count
                      </span>
                      {getSortDirectionIcon("LRCount")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("party.partyName")}
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
                    onClick={() => requestSort("truck.truckNo")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Truck No
                      </span>
                      {getSortDirectionIcon("truckNo")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("origin")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Route
                      </span>
                      {getSortDirectionIcon("origin")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("tripStatus")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Trip Status
                      </span>
                      {getSortDirectionIcon("tripStatus")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("party.openingBalance")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Party Balance
                      </span>
                      {getSortDirectionIcon("openingBalance")}
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
                {currentRecords.map((trip) => (
                  <tr
                    key={trip.id}
                    onClick={() => onSelectTrip(trip)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base font-medium text-gray-900">
                        {trip.startDate}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.LRCount}{" "}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.party.partyName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.truck.truckNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.origin}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.tripStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {trip.party.openingBalance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleRowClick(trip);
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
                            handleEditClick(trip);
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
                            handleDeleteClick(trip);
                          }}
                          className="text-danger hover:text-red-600 transition-colors"
                          title="Delete Trip"
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
                  No trips found. Try a different search term or add a new trip.
                </p>
              </div>
            )}
          </div>

          {showTransactionsModal && (
            <div className="fixed inset-y-0 right-0 z-30 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
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

              {/* Summary Section */}
              <div className="bg-gray-100 p-4 flex justify-end items-center">
                {/* <div>
                  <span className="text-sm text-gray-600 mr-2">
                    Total Party Balance:
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
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                      <path d="M7 9l11 0" />
                    </svg>
                    {Math.abs(totalAmount).toFixed(2)}
                  </span>
                </div> */}
                {/* <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    totalAmount >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {totalAmount >= 0 ? "Net Credit" : "Net Debit"}
                </span> */}
                <div>
                  <button
                    onClick={openAddTransactionModal}
                    className="px-4 py-2 mx-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Payment
                  </button>
                  <button
                    onClick={openAddTransactionModal}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Trip
                  </button>
                  {/* <button
                    onClick={openTripSidebar}
                    className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
                  >
                    + Add Trip
                  </button> */}
                </div>
              </div>
              <div className="flex-grow overflow-auto px-10 pt-2">
                <form onSubmit={handleEditTripFormSubmit}>
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

                    {/* Right column */}
                  </div>

                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        resetNewDriverForm();
                        setisEditTripModalOpen(false);
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
      {isAddTripModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <form onSubmit={handleAddTripFormSubmit}>
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Add Trip</h2>
                <button
                  onClick={() => {
                    setisAddTripModalOpen(false);
                    setPaymentMode("Fixed");
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
                            value={newDriver.origin}
                            onChange={handleDriverChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          >
                            <option value={null}>Select Origin...</option>
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="destination"
                            value={newDriver.destination}
                            onChange={handleDriverChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          >
                            <option value={null}>Select Destination...</option>
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
                              setRoutes([{ consigner: "", consignee: "" }]);
                              setTripType(e.target.value);
                            }}
                            className="text-blue-600"
                          />
                          <span className="ml-2 text-black">Single Route</span>
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
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Party <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="party_id"
                          value={newDriver.party_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Party...</option>
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
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Truck Registration No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="truck_id"
                          value={newDriver.truck_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Truck...</option>
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
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="driver_id"
                          value={newDriver.driver_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Driver...</option>
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
                              { consigner: "", consignee: "" },
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Consigner <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex">
                            <select
                              value={routes[0].consigner}
                              onChange={(e) => {
                                const updatedRoutes = [...routes];
                                updatedRoutes[0].consigner = e.target.value;
                                setRoutes(updatedRoutes);
                              }}
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                            >
                              <option value="">-- Select a consigner --</option>
                              {consignersList.map((consigner) => (
                                <option key={consigner.id} value={consigner.id}>
                                  {consigner.name} (GST: {consigner.gstNumber})
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Consignee <span className="text-red-500">*</span>
                          </label>
                          <div className="relative flex">
                            <select
                              value={routes[0].consignee}
                              onChange={(e) => {
                                const updatedRoutes = [...routes];
                                updatedRoutes[0].consignee = e.target.value;
                                setRoutes(updatedRoutes);
                              }}
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                            >
                              <option value="">-- Select a consignee --</option>
                              {consigneesList.map((consignee) => (
                                <option key={consignee.id} value={consignee.id}>
                                  {consignee.name} (GST: {consignee.gstNumber})
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
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {routes.map((route, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 border border-gray-200 rounded-md p-3 relative"
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
                                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
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
                                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
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
                            </div>

                            {routes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedRoutes = [...routes];
                                  updatedRoutes.splice(index, 1);
                                  setRoutes(updatedRoutes);
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
                              newDriver.partyBillingType = option;
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
                              onChange={(e) => {
                                const rate = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setCalculationFields({
                                  ...calculationFields,
                                  rate,
                                });
                                // Calculate and update party freight amount
                                const total = rate * calculationFields.units;
                                newDriver.partyFreightAmount = total
                                  ? total.toString()
                                  : "";
                                setNewDriver({ ...newDriver });
                              }}
                              className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
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
                            onChange={(e) => {
                              const units = e.target.value.replace(
                                /[^0-9.]/g,
                                ""
                              );
                              setCalculationFields({
                                ...calculationFields,
                                units,
                              });
                              // Calculate and update party freight amount
                              const total = calculationFields.rate * units;
                              newDriver.partyFreightAmount = total
                                ? total.toString()
                                : "";
                              setNewDriver({ ...newDriver });
                            }}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
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
                          value={newDriver.partyFreightAmount}
                          onChange={handleDriverChange}
                          type="text"
                          className={`pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black ${
                            paymentMode !== "Fixed" ? "bg-gray-50" : ""
                          }`}
                          placeholder="Eg: 45,000"
                          readOnly={paymentMode !== "Fixed"}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            value={newDriver.startDate}
                            onChange={handleDriverChange}
                            type="date"
                            name="startDate"
                            className="w-full border rounded-md p-2 text-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Kms Reading
                        </label>
                        <input
                          name="startKmsReading"
                          value={newDriver.startKmsReading}
                          onChange={handleDriverChange}
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          placeholder="Start readings"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-4 gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setisAddTripModalOpen(false);
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

      {/* Edit Driver Modal */}
      {isEditTripModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <form onSubmit={handleEditTripFormSubmit}>
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Add Trip</h2>
                <button
                  onClick={() => {
                    setisEditTripModalOpen(false);
                    setPaymentMode("Fixed");
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
              <div className="p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                <div className="p-2">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Trip Details
                    </h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Party <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="party_id"
                          value={newDriver.party_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Party...</option>
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
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Truck Registration No.{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="truck_id"
                          value={newDriver.truck_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Truck...</option>
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
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driver Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="driver_id"
                          value={newDriver.driver_id}
                          onChange={handleDriverChange}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                        >
                          <option value={null}>Select a Driver...</option>
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
                    </div>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Route
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Origin <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="origin"
                            value={newDriver.origin}
                            onChange={handleDriverChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          >
                            <option value={null}>Select Origin...</option>
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
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="destination"
                            value={newDriver.destination}
                            onChange={handleDriverChange}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          >
                            <option value={null}>Select Destination...</option>
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
                      </div>
                    </div>
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
                              newDriver.partyBillingType = option;
                              setPaymentMode(option);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

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
                          value={newDriver.partyFreightAmount}
                          onChange={handleDriverChange}
                          type="text"
                          className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          placeholder="Eg: 45,000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            value={newDriver.startDate}
                            onChange={handleDriverChange}
                            type="date"
                            name="startDate"
                            className="w-full border rounded-md p-2 text-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Kms Reading
                        </label>
                        <input
                          name="startKmsReading"
                          value={newDriver.startKmsReading}
                          onChange={handleDriverChange}
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                          placeholder="Start readings"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-4 gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setisEditTripModalOpen(false);
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

      {/* View Driver Modal */}
      {isViewTripModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? "Edit Supplier" : "Supplier Details"}
              </h2>
              <button
                onClick={() => setisViewTripModalOpen(false)}
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
                      {currentDriver?.party.partyName}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Truck No
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.truck.truckNo}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Route</h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.origin}
                      {" - "}
                      {currentDriver?.destination}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Party Billing Type
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.partyBillingType}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Party Freight Amount
                    </h3>
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {currentDriver?.partyFreightAmount}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Start Date
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.startDate}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Start Kms Reading
                    </h3>
                    <p className="text-base font-medium text-gray-900">
                      {currentDriver?.startKmsReading}
                    </p>
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
                onClick={() => {
                  setisViewTripModalOpen(false);
                  setCurrentDriver(null);
                }}
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
                  onClick={handleEditTripFormSubmit}
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
                Are you sure you want to delete trip for{" "}
                <span className="font-semibold">
                  {currentDriver?.party.partyName}
                  {" - "}
                  {currentDriver?.truck.truckNo}
                  {" from "}
                  {currentDriver?.origin}
                  {" to "}
                  {currentDriver?.destination}
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
                onClick={handleDeleteSupplier}
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
