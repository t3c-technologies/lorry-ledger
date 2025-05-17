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
  });

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

    if (!/^\d{10}$/.test(newDriver.phone_number)) {
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

                    {/* Right column */}
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
