import {
  BadgeCheck,
  Camera,
  FileCheck2,
  FileText,
  Truck,
  User2,
  ChevronDown,
  View,
  X,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  notifyError,
  notifyInfo,
  notifySuccess,
} from "@/components/Notification";
import { api } from "../../utils/api";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function TripsDetail({ trip, onBack }) {
  const [isRouteListModalOpen, setIsRouteListModalOpen] = useState(false);
  const [isAddRouteModalOpen, setIsAddRouteModalOpen] = useState(false);
  const [isEditRouteModalOpen, setIsEditRouteModalOpen] = useState(false);
  const [isDeleteRouteConfirmOpen, setIsDeleteRouteConfirmOpen] =
    useState(false);
  const [isAddLRModalOpen, setIsAddLRModalOpen] = useState(false);
  const [isEditLRModalOpen, setIsEditLRModalOpen] = useState(false);
  const [isViewLRModalOpen, setIsViewLRModalOpen] = useState(false);
  const [isLRListModalOpen, setIsLRListModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [isEditInvoiceModalOpen, setIsEditInvoiceModalOpen] = useState(false);
  const [isViewInvoiceModalOpen, setIsViewInvoiceModalOpen] = useState(false);
  const [isInvoiceListModalOpen, setIsInvoiceListModalOpen] = useState(false);
  const [isDeleteInvoiceConfirmOpen, setIsDeleteInvoiceConfirmOpen] =
    useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [transactionsList, setTransactionsList] = useState([]);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    amountType: "Credit",
    reason: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showEditTransactionModal, setShowEditTransactionModal] =
    useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [showDeleteTransactionModal, setShowDeleteTransactionModal] =
    useState(false);

  //Expenses
  const [showExpensesModal, setShowExpensesModal] = useState(false);

  const [expensesList, setExpensesList] = useState([]);

  const [showAddExpensesModal, setShowAddExpensesModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    expenseType: "",
    amountPaid: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "Cash",
    currentKmReading: "",
    fuelQuantity: "",
    notes: "",
  });

  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentExpense, setCurrentExpense] = useState(null);

  const [showDeleteExpenseModal, setShowDeleteExpenseModal] = useState(false);

  const [tripExpensePaymentMode, setTripExpensePaymentMode] = useState("Cash");

  //Routes
  const [routesList, setRoutesList] = useState(trip.routes);
  const [tripExpensesList, setTripExpensesList] = useState(trip.expenses);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState(-1);
  const [isExpenseSidebarOpen, setIsExpenseSidebarOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    consigner: "",
    consignee: "",
    units: "",
    lrNumber: "",
    invoiceNumber: "",
  });
  const [routeIndex, setRouteIndex] = useState(-1);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [billingType, setBillingType] = useState("Fixed");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermInvoice, setSearchTermInvoice] = useState("");

  const [progressBarNumber, setProgressBarNumber] = useState(1);
  const [progressButtonText, setProgressButtonText] =
    useState("Mark as Completed");

  const [tripCompletePopup, setTripCompletePopup] = useState(false);
  const [showPODReceivedPopup, setShowPODReceivedPopup] = useState(false);
  const [showPODSubmittedPopup, setShowPODSubmittedPopup] = useState(false);
  const [showSettleBalancePopup, setShowSettleBalancePopup] = useState(false);
  const [settlementMode, setSettlementMode] = useState("Cash");

  const [updatedTrip, setUpdatedTrip] = useState(trip);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageInvoice, setCurrentPageInvoice] = useState(1);
  const [recordsPerPageLR, setRecordsPerPageLR] = useState(10);
  const [recordsPerPageInvoice, setRecordsPerPageInvoice] = useState(10);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [nextPageInvoice, setNextPageInvoice] = useState(null);
  const [prevPageInvoice, setPrevPageInvoice] = useState(null);
  const [LRFilters, setLRFilters] = useState([]);
  const [invoiceFilters, setInvoiceFilters] = useState([]);
  const [currentLRFormSection, setCurrentLRFormSection] = useState(0);
  const [currentInvoiceFormSection, setCurrentInvoiceFormSection] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPagesInvoice, setTotalPagesInvoice] = useState(0);

  const [showAddConsignerPopup, setShowAddConsignerPopup] = useState(false);
  const [showAddConsigneePopup, setShowAddConsigneePopup] = useState(false);
  const [LRList, setLRList] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [consigners, setConsigners] = useState([]);
  const [consignees, setConsignees] = useState([]);
  const [selectedConsigner, setSelectedConsigner] = useState("");
  const [selectedConsignee, setSelectedConsignee] = useState("");
  const [currentLR, setCurrentLR] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState("");
  const [nextLrNumber, setNextLrNumber] = useState("LRN-001");
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("1");

  const [advances, setAdvances] = useState(trip.advances);
  const [charges, setCharges] = useState(trip.charges);
  const [payments, setPayments] = useState(trip.payments);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditAdvanceModal, setShowEditAdvanceModal] = useState(false);
  const [showEditChargeModal, setShowEditChargeModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
  const [selectedType, setSelectedType] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    lrDate: new Date().toISOString().split("T")[0],
    lrNumber: "",
    consigner_id: "",
    consignee_id: "",
    materialCategory: "",
    weight: "",
    unit: "Tonnes",
    numberOfPackages: "",
    freightPaidBy: "Consigner",
    gstPercentage: "",
    trip_id: trip.id,
  });

  const [formDataInvoice, setFormDataInvoice] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    consigner_id: "",
    consignee_id: "",
    materialCategory: "",
    weight: "",
    unit: "Tonnes",
    numberOfPackages: "",
    freightPaidBy: "Consigner",
    gstPercentage: "",
    trip_id: trip.id,
  });

  const resetAddInvoice = () => {
    setFormData({
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      consigner_id: "",
      consignee_id: "",
      materialCategory: "",
      weight: "",
      unit: "Tonnes",
      numberOfPackages: "",
      freightPaidBy: "Consigner",
      gstPercentage: "",
      trip_id: trip.id,
    });
  };

  const [showTripExpenseModal, setShowTripExpenseModal] = useState(false);
  const [showEditTripExpenseModal, setShowEditTripExpenseModal] =
    useState(false);
  const [showDeleteTripExpenseModal, setShowDeleteTripExpenseModal] =
    useState(false);

  // State for expense form
  const [tripExpenseDetails, setTripExpenseDetails] = useState({
    expenseType: "",
    expenseAmount: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "Cash", // Default selected payment mode
    addToPartyBill: false,
    partyBillAmount: "",
    notes: "",
  });

  const resetAddLR = () => {
    setFormData({
      lrDate: new Date().toISOString().split("T")[0],
      lrNumber: "",
      consigner_id: "",
      consignee_id: "",
      materialCategory: "",
      weight: "",
      unit: "Tonnes",
      numberOfPackages: "",
      freightPaidBy: "Consigner",
      gstPercentage: "",
      trip_id: trip.id,
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
  const [newConsignee, setNewConsignee] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const [advanceForm, setAdvanceForm] = useState({
    amount: "",
    paymentMode: "Cash",
    date: new Date().toISOString().split("T")[0],
    receivedByDriver: false,
    notes: "",
  });

  const [chargeForm, setChargeForm] = useState({
    addToBill: true,
    chargeType: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMode: "Cash",
    date: new Date().toISOString().split("T")[0],
    receivedByDriver: false,
    notes: "",
  });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [progressSteps, SetProgressSteps] = useState([
    { label: "Started", date: formatDate(trip.startDate) },
    { label: "Completed", date: formatDate(trip.tripEndDate) },
    { label: "POD Received", date: formatDate(trip.PODReceivedDate) },
    { label: "POD Submitted", date: formatDate(trip.PODSubmittedDate) },
    { label: "Settled", date: formatDate(trip.settlementDate) },
  ]);

  const totalExpenses = useMemo(() => {
    return tripExpensesList.reduce(
      (sum, expense) => sum + parseFloat(expense.expenseAmount || 0),
      0
    );
  });
  const revenue = parseFloat(trip.partyFreightAmount || 0);
  const profit = useMemo(() => {
    return revenue - totalExpenses;
  });

  const indexOfLastRecord = currentPage * recordsPerPageLR;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPageLR;
  const indexOfLastRecordInvoice = currentPageInvoice * recordsPerPageInvoice;
  const indexOfFirstRecordInvoice =
    indexOfLastRecordInvoice - recordsPerPageInvoice;
  const currentRecords = [];

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
      setNewRoute((prev) => ({ ...prev, consigner: response.data.id }));
      console.log(newRoute);

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

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const requestSortInvoice = (key) => {
    let direction = "ascending";
    if (
      sortConfigInvoice.key === key &&
      sortConfigInvoice.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfigInvoice({ key, direction });
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
      setNewRoute((prev) => ({ ...prev, consignee: response.data.id }));
      getConsignees();
      console.log(newRoute);
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

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [sortConfigInvoice, setSortConfigInvoice] = useState({
    key: "name",
    direction: "ascending",
  });

  //Progress Bar
  useEffect(() => {
    // Determine progress based on trip data
    if (trip.settlementDate) {
      setProgressBarNumber(5);
    } else if (trip.PODSubmittedDate) {
      setProgressBarNumber(4);
    } else if (trip.PODReceivedDate) {
      setProgressBarNumber(3);
    } else if (trip.tripEndDate) {
      setProgressBarNumber(2);
    } else {
      setProgressBarNumber(1);
    }
  }, [trip]);

  useEffect(() => {
    // Set button text based on progress
    if (progressBarNumber === 1) {
      setProgressButtonText("Complete Trip");
    } else if (progressBarNumber === 2) {
      setProgressButtonText("Received POD");
    } else if (progressBarNumber === 3) {
      setProgressButtonText("Mark POD Submitted");
    } else if (progressBarNumber === 4) {
      setProgressButtonText("Settle Amount");
    } else {
      setProgressButtonText("Trip Fully Settled");
    }
  }, [progressBarNumber]);

  const handleProgressBarUpdate = () => {
    if (progressBarNumber == 1) {
      console.log("Hi");

      setTripCompletePopup(true);
    } else if (progressBarNumber == 2) {
      setShowPODReceivedPopup(true);
    } else if (progressBarNumber === 3) {
      setShowPODSubmittedPopup(true);
    } else if (progressBarNumber === 4) {
      setShowSettleBalancePopup(true);
    }
  };

  const handleProgressBarInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTrip((prev) => ({ ...prev, [name]: value }));
  };

  const submitTripEnd = async () => {
    if (progressBarNumber == 4) {
      updatedTrip.settlementPaymentMode = settlementMode;
    }
    console.log(updatedTrip);

    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), updatedTrip, {
        headers: {
          "Content-Type": "application/json", // Explicitly set header
        },
      });
      notifySuccess("Trip updated successfully");
      if (progressBarNumber == 1) {
        setTripCompletePopup(false);
      } else if (progressBarNumber == 2) {
        setShowPODReceivedPopup(false);
      } else if (progressBarNumber == 3) {
        setShowPODSubmittedPopup(false);
      } else if (progressBarNumber == 4) {
        setShowSettleBalancePopup(false);
        setSettlementMode("Cash");
      }
      setProgressBarNumber((prev) => prev + 1);
      SetProgressSteps([
        { label: "Started", date: formatDate(updatedTrip.startDate) },
        { label: "Completed", date: formatDate(updatedTrip.tripEndDate) },
        {
          label: "POD Received",
          date: formatDate(updatedTrip.PODReceivedDate),
        },
        {
          label: "POD Submitted",
          date: formatDate(updatedTrip.PODSubmittedDate),
        },
        { label: "Settled", date: formatDate(updatedTrip.settlementDate) },
      ]);
      console.log(progressBarNumber);
      console.log(progressSteps);
    } catch (error) {
      notifyError("Error updating trip");
    }
  };

  //Print LR
  // Add this function to handle the print button click
  const handlePrintClick = (lrId) => {
    // Open the PDF in a new window/tab
    const url = process.env.NEXT_PUBLIC_API_URL;
    window.open(`${url}/lr/pdf/${lrId}/`, "_blank");
  };

  const handlePrintClickInvoice = (invoiceId) => {
    // Open the PDF in a new window/tab
    const url = process.env.NEXT_PUBLIC_API_URL;
    window.open(`${url}/invoices/pdf/${invoiceId}/`, "_blank");
  };

  // Also add this function to your component
  const printLR = async (lrId) => {
    try {
      const token = localStorage.getItem("authToken"); // Retrieve the authentication token

      const response = await fetch(`/api/lr/pdf/${lrId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();

      // Create a link element and trigger a download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LR_${lrId}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error printing LR:", error);
      toast.error("Failed to print LR. Please try again.");
    }
  };

  //Transactions

  const totalTransactionAmount = useMemo(() => {
    return transactionsList.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount);
      return transaction.amountType === "Credit"
        ? total + amount
        : total - amount;
    }, 0);
  });

  const handleTransactionClick = () => {
    setShowTransactionsModal(true);
  };

  // Function to close the modal
  const closeTransactionModal = () => {
    setShowTransactionsModal(false);
  };

  // Function to open add transaction modal
  const openAddTransactionModal = () => {
    setShowAddTransactionModal(true);
  };

  // Function to close add transaction modal
  const closeAddTransactionModal = () => {
    setShowAddTransactionModal(false);
    setNewTransaction({
      amount: "",
      amountType: "Credit",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Function to handle input change in add transaction form

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => {
      const updatedTransaction = { ...prev, [name]: value };
      return updatedTransaction;
    });
    console.log(showAddTransactionModal);
  };
  // Function to add a new transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();

    const transaction = {
      driverId: trip.driver.id,
      amount: parseFloat(newTransaction.amount),
      reason: newTransaction.reason,
      amountType: newTransaction.amountType,
      date: newTransaction.date,
    };

    try {
      await api.post(
        API_ENDPOINTS.drivers.transactionsCreate(trip.driver.id),
        transaction,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      notifySuccess("Transaction added successfully");
      getTransactions();
      closeAddTransactionModal();
    } catch (error) {
      notifyError("Error adding transaction");
    }
  };
  const openEditTransactionModal = (transaction) => {
    setEditingTransaction({
      ...transaction,
      amount: transaction.amount.toString(),
    });
    setShowEditTransactionModal(true);
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
      getTransactions();
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
      getTransactions();
      setShowDeleteTransactionModal(false);
      setCurrentTransaction(null);
    } catch {
      notifyError("Error deleting transaction");
    }
  };

  //Expenses
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

  const handleExpenseClick = () => {
    setShowExpensesModal(true);
  };

  const handleTripExpenseClick = (expense, index) => {
    setSelectedExpense(expense);
    setSelectedExpenseIndex(index);
    setIsExpenseSidebarOpen(true);
  };

  const handleDeleteTripExpense = async () => {
    const updatedExpenses = [...tripExpensesList];
    updatedExpenses.splice(selectedExpenseIndex, 1);
    setTripExpensesList(updatedExpenses);
    console.log(updatedExpenses);
    const tripToUpdate = { ...updatedTrip, expenses: updatedExpenses };
    setUpdatedTrip((prev) => ({ ...prev, expenses: updatedExpenses }));
    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      resetTripExpenseForm();
      setShowDeleteTripExpenseModal(false);
      setIsExpenseSidebarOpen(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };

  const handleEditTripExpense = async () => {
    const updatedExpenses = [...tripExpensesList];
    updatedExpenses[selectedExpenseIndex].expenseType =
      tripExpenseDetails.expenseType;
    updatedExpenses[selectedExpenseIndex].expenseAmount =
      tripExpenseDetails.expenseAmount;
    updatedExpenses[selectedExpenseIndex].expenseDate =
      tripExpenseDetails.expenseDate;
    updatedExpenses[selectedExpenseIndex].paymentMode =
      tripExpenseDetails.paymentMode;
    updatedExpenses[selectedExpenseIndex].addToPartyBill =
      tripExpenseDetails.addToPartyBill;
    updatedExpenses[selectedExpenseIndex].partyBillAmount =
      tripExpenseDetails.partyBillAmount;
    updatedExpenses[selectedExpenseIndex].notes = tripExpenseDetails.notes;
    console.log(updatedExpenses);
    setTripExpensesList(updatedExpenses);
    const tripToUpdate = { ...updatedTrip, expenses: updatedExpenses };
    setUpdatedTrip((prev) => ({ ...prev, expenses: updatedExpenses }));
    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      resetTripExpenseForm();
      setShowEditTripExpenseModal(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };

  const totalExpenseAmount = useMemo(() => {
    return expensesList.reduce((total, expense) => {
      const amount = parseFloat(expense.amountPaid);
      return total - amount;
    }, 0);
  });

  // Function to close the modal
  const closeExpenseModalMain = () => {
    setShowTransactionsModal(false);
  };

  // Function to open add transaction modal
  const openAddExpenseModal = () => {
    setShowAddExpensesModal(true);
  };

  const openExpenseModal = (type) => {
    setModalType(type);
    setShowModal(true);
    if (type == "fuel") {
      newExpense.expenseType = "Fuel Expense";
    }
  };
  const closeEditExpenseModal = () => {
    setShowEditModal(false);
    setEditingExpense({
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

  const closeExpensesModal = () => {
    setShowExpensesModal(false);
  };

  const closeExpenseModal = () => {
    setShowModal(false);
    setNewExpense({
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
    console.log(newExpense);
  };

  const getExpenses = async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.trucks.expenses(trip.truck.id),
        {
          page: currentPage,
          page_size: recordsPerPageLR, // Use dynamic value instead of ITEMS_PER_PAGE
        }
      );
      setExpensesList(response.data);
    } catch (error) {
      console.log(error);
      notifyError("Error fetching Expense");
    }
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => {
      const updatedExpense = { ...prev, [name]: value };
      return updatedExpense;
    });
    console.log(showAddTransactionModal);
  };

  const handleEditExpenseInputChange = (e) => {
    const { name, value } = e.target;

    setEditingExpense({
      ...editingExpense,
      [name]: value,
    });
  };
  const closeAddExpenseModal = () => {
    setShowAddExpensesModal(false);
  };

  // Function to add a new transaction
  const handleAddExpense = async (e) => {
    e.preventDefault();

    const expense = {
      truckId: trip.truck.id,
      expenseType: newExpense.expenseType,
      amountPaid: parseFloat(newExpense.amountPaid),
      fuelQuantity: newExpense.fuelQuantity,
      expenseDate: newExpense.expenseDate,
      notes: newExpense.notes,
      paymentMode: newExpense.paymentMode,
      currentKmReading: newExpense.currentKmReading,
    };
    try {
      await api.post(
        API_ENDPOINTS.trucks.expensesCreate(trip.truck.id),
        expense,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setNewExpense({
        expenseType: "",
        amountPaid: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMode: "Cash",
        currentKmReading: "",
        fuelQuantity: "",
        notes: "",
      });
      notifySuccess("Expense added successfully");
      getExpenses();
      closeExpenseModal();
      closeAddExpenseModal();
    } catch (error) {
      notifyError("Error adding expense");
    }
  };
  const openEditExpenseModal = (expense) => {
    setEditingExpense({
      ...expense,
      amountPaid: expense.amountPaid.toString(),
    });
    if (expense.expenseType == "Fuel Expense") {
      setModalType("fuel");
    } else if (expenseTypeOptionsMaintenance.includes(expense.expenseType)) {
      setModalType("maintenance");
    } else {
      setModalType("driver");
    }
    setShowEditModal(true);
  };

  const handleDeleteExpenseClick = (expense) => {
    setShowDeleteExpenseModal(true);
    setCurrentExpense(expense);
  };

  const handleDeleteExpense = async (e) => {
    e.preventDefault();
    try {
      await api.delete(API_ENDPOINTS.trucks.expensesDelete(currentExpense.id));
      notifyInfo("Expense deleted successfully");
      getExpenses();
      setShowDeleteExpenseModal(false);
      setCurrentExpense(null);
    } catch {
      notifyError("Error deleting expense");
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        API_ENDPOINTS.trucks.expensesUpdate(editingExpense.id),
        editingExpense,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      console.log(editingExpense);

      getExpenses();
      notifySuccess("Expense edited successfully");
      closeEditExpenseModal();
      closeAddExpenseModal();
    } catch (error) {
      notifyError("Error updating expense");
    }
  };

  //Trip Expenses
  const handlePaymentModeSelect = (mode) => {
    setTripExpensePaymentMode(mode);
    setTripExpenseDetails((prev) => ({
      ...prev,
      paymentMode: mode,
    }));
  };
  // Open expense modal
  const openTripExpenseModal = () => {
    setShowTripExpenseModal(true);
  };
  const openEditTripExpenseModal = () => {
    setShowEditTripExpenseModal(true);
    setTripExpenseDetails({
      expenseType: selectedExpense.expenseType,
      expenseAmount: selectedExpense.expenseAmount,
      expenseDate: selectedExpense.expenseDate,
      paymentMode: selectedExpense.paymentMode, // Default selected payment mode
      addToPartyBill: selectedExpense.addToPartyBill,
      partyBillAmount: selectedExpense.partyBillAmount,
      notes: selectedExpense.notes,
    });
    console.log(selectedExpense);
  };
  const openDeleteTripExpenseModal = () => {
    setShowDeleteTripExpenseModal(true);
  };

  // Close expense modal
  const closeTripExpenseModal = () => {
    setShowTripExpenseModal(false);
    resetTripExpenseForm();
    setTripExpensePaymentMode("Cash");
  };

  const closeEditTripExpenseModal = () => {
    setShowEditTripExpenseModal(false);
    resetTripExpenseForm();
    setTripExpensePaymentMode("Cash");
  };

  // Handle input changes for form fields
  const handleTripExpenseChange = (e) => {
    const { name, value } = e.target;
    setTripExpenseDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox change for "Add To Party Bill"
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setTripExpenseDetails((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Handle payment mode selection
  const handleTripPaymentModeSelect = (mode) => {};

  // Handle form submission
  const handleTripExpenseSubmit = async (e) => {
    if (e) e.preventDefault();

    // Form validation
    if (
      !tripExpenseDetails.expenseType ||
      !tripExpenseDetails.expenseAmount ||
      !tripExpenseDetails.expenseDate
    ) {
      // Show validation error
      alert("Please fill all required fields");
      return;
    }

    // If addToPartyBill is checked, validate additional fields
    if (
      tripExpenseDetails.addToPartyBill &&
      !tripExpenseDetails.partyBillAmount
    ) {
      alert("Please select a trip and enter party bill amount");
      return;
    }

    // Submit expense data
    console.log("Expense details:", tripExpenseDetails);
    const updatedExpenses = [...tripExpensesList, tripExpenseDetails];
    setTripExpensesList(updatedExpenses);
    const tripToUpdate = { ...updatedTrip, expenses: updatedExpenses };
    setUpdatedTrip((prev) => ({ ...prev, expenses: updatedExpenses }));
    console.log(tripToUpdate);

    //console.log(updatedTrip);

    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      resetTripExpenseForm();
      closeTripExpenseModal();
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }

    // For demo purposes, just close the modal
  };

  // Reset form to initial state
  const resetTripExpenseForm = () => {
    setTripExpenseDetails({
      expenseType: "",
      expenseAmount: "",
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMode: "Cash",
      addToPartyBill: false,
      selectedTrip: "",
      partyBillAmount: "",
      notes: "",
    });
  };

  //Party Bill calculation
  const calculateBalance = () => {
    const totalAdvances = advances.reduce(
      (sum, advance) => sum + advance.amount,
      0
    );
    const totalCharges = charges.reduce(
      (sum, charge) =>
        charge.addToBill ? sum + charge.amount : sum - charge.amount,
      0
    );
    const totalPayments = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    return (
      trip.partyFreightAmount - totalAdvances + totalCharges - totalPayments
    );
  };

  const handleAddAdvance = async () => {
    try {
      if (advanceForm.amount) {
        const newAdvance = {
          date: advanceForm.date,
          receivedByDriver: advanceForm.receivedByDriver,
          paymentMode: advanceForm.paymentMode,
          amount: parseFloat(advanceForm.amount),
          notes: advanceForm.notes,
        };
        const updatedAdvances = [...advances, newAdvance];
        setAdvances(updatedAdvances);
        const tripToUpdate = { ...updatedTrip, advances: updatedAdvances };
        console.log(tripToUpdate);

        setUpdatedTrip((prev) => ({ ...prev, advances: updatedAdvances }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
        setAdvanceForm({
          amount: "",
          paymentMode: "Cash",
          date: new Date().toISOString().split("T")[0],
          receivedByDriver: false,
          notes: "",
        });
        setShowAdvanceModal(false);
      }
      console.log(advances);
    } catch (error) {
      notifyError("Error creating Advance");
    }
  };

  const handleEditAdvance = async () => {
    try {
      if (advanceForm.amount) {
        const updatedAdvances = [...advances];
        updatedAdvances[selectedItemIndex].date = advanceForm.date;
        updatedAdvances[selectedItemIndex].receivedByDriver =
          advanceForm.receivedByDriver;
        updatedAdvances[selectedItemIndex].paymentMode =
          advanceForm.paymentMode;
        updatedAdvances[selectedItemIndex].amount = parseFloat(
          advanceForm.amount
        );
        updatedAdvances[selectedItemIndex].notes = advanceForm.notes;
        setAdvances(updatedAdvances);
        const tripToUpdate = { ...updatedTrip, advances: updatedAdvances };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, advances: updatedAdvances }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
        setAdvanceForm({
          amount: "",
          paymentMode: "Cash",
          date: new Date().toISOString().split("T")[0],
          receivedByDriver: false,
          notes: "",
        });
        setShowEditAdvanceModal(false);
        setShowSidebar(false);
      }
      //console.log(advances);
    } catch (error) {
      notifyError("Error creating Advance");
    }
  };

  const handleAddCharge = async () => {
    try {
      if (chargeForm.chargeType && chargeForm.amount) {
        const newCharge = {
          date: chargeForm.date,
          chargeType: chargeForm.chargeType,
          addToBill: chargeForm.addToBill,
          amount: parseFloat(chargeForm.amount),
          notes: chargeForm.notes,
        };
        const updatedCharges = [...charges, newCharge];
        setCharges(updatedCharges);
        const tripToUpdate = { ...updatedTrip, charges: updatedCharges };
        console.log(tripToUpdate);

        setUpdatedTrip((prev) => ({ ...prev, charges: updatedCharges }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
        setChargeForm({
          addToBill: true,
          chargeType: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setShowChargeModal(false);
      }
      console.log(charges);
    } catch (error) {
      notifyError("Error creating Charge");
    }
  };

  const handleEditCharge = async () => {
    try {
      if (chargeForm.chargeType && chargeForm.amount) {
        const updatedCharges = [...charges];
        updatedCharges[selectedItemIndex].date = chargeForm.date;
        updatedCharges[selectedItemIndex].addToBill = chargeForm.addToBill;
        updatedCharges[selectedItemIndex].chargeType = chargeForm.chargeType;
        updatedCharges[selectedItemIndex].amount = parseFloat(
          chargeForm.amount
        );
        updatedCharges[selectedItemIndex].notes = chargeForm.notes;
        setCharges(updatedCharges);
        const tripToUpdate = { ...updatedTrip, charges: updatedCharges };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, charges: updatedCharges }));
        //await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        //notifyInfo("Trip updated successfully");
        setChargeForm({
          addToBill: true,
          chargeType: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setShowEditChargeModal(false);
        setShowSidebar(false);
      }
      //console.log(advances);
    } catch (error) {
      notifyError("Error creating Charge");
    }
  };

  const handleAddPayment = async () => {
    try {
      if (paymentForm.amount) {
        const newPayment = {
          date: paymentForm.date,
          paymentMode: paymentForm.paymentMode,
          amount: parseFloat(paymentForm.amount),
          receivedByDriver: paymentForm.receivedByDriver,
          notes: paymentForm.notes,
        };
        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);
        const tripToUpdate = { ...updatedTrip, payments: updatedPayments };
        console.log(tripToUpdate);

        setUpdatedTrip((prev) => ({ ...prev, payments: updatedPayments }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
        setPaymentForm({
          amount: "",
          paymentMode: "Cash",
          date: new Date().toISOString().split("T")[0],
          receivedByDriver: false,
          notes: "",
        });
        setShowPaymentModal(false);
      }
      console.log(payments);
    } catch (error) {
      notifyError("Error creating Payment");
    }
  };

  const handleEditPayment = async () => {
    try {
      if (paymentForm.amount) {
        const updatedPayments = [...payments];
        updatedPayments[selectedItemIndex].date = paymentForm.date;
        updatedPayments[selectedItemIndex].paymentMode =
          paymentForm.paymentMode;
        updatedPayments[selectedItemIndex].receivedByDriver =
          paymentForm.receivedByDriver;
        updatedPayments[selectedItemIndex].amount = parseFloat(
          paymentForm.amount
        );
        updatedPayments[selectedItemIndex].notes = paymentForm.notes;
        setPayments(updatedPayments);
        const tripToUpdate = { ...updatedTrip, payments: updatedPayments };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, payments: updatedPayments }));
        //await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        //notifyInfo("Trip updated successfully");
        setPaymentForm({
          amount: "",
          paymentMode: "Cash",
          date: new Date().toISOString().split("T")[0],
          receivedByDriver: false,
          notes: "",
        });
        setShowEditPaymentModal(false);
        setShowSidebar(false);
      }
      //console.log(advances);
    } catch (error) {
      notifyError("Error creating Charge");
    }
  };

  const handleItemClick = (item, type, index) => {
    setSelectedItem(item);
    setSelectedType(type);
    setSelectedItemIndex(index);
    setShowSidebar(true);
  };

  const handleEditBillClick = () => {
    if (selectedType === "advance") {
      setAdvanceForm({
        amount: selectedItem.amount,
        paymentMode: selectedItem.paymentMode,
        date: selectedItem.date,
        receivedByDriver: selectedItem.receivedByDriver,
        notes: selectedItem.notes,
      });
      setShowEditAdvanceModal(true);
    } else if (selectedType === "charge") {
      setChargeForm({
        addToBill: selectedItem.addToBill,
        chargeType: selectedItem.chargeType,
        amount: selectedItem.amount,
        date: selectedItem.date,
        notes: selectedItem.notes,
      });
      setShowEditChargeModal(true);
    } else if (selectedType === "payment") {
      setPaymentForm({
        amount: selectedItem.amount,
        paymentMode: selectedItem.paymentMode,
        date: selectedItem.date,
        receivedByDriver: selectedItem.receivedByDriver,
        notes: selectedItem.notes,
      });
      setShowEditPaymentModal(true);
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedType === "advance") {
        const updatedAdvances = advances.filter(
          (_, index) => index !== selectedItemIndex
        );
        setAdvances(updatedAdvances);
        const tripToUpdate = { ...updatedTrip, advances: updatedAdvances };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, advances: updatedAdvances }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
      } else if (selectedType === "charge") {
        const updatedCharges = charges.filter(
          (_, index) => index !== selectedItemIndex
        );
        setCharges(updatedCharges);
        const tripToUpdate = { ...updatedTrip, charges: updatedCharges };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, charges: updatedCharges }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
      } else if (selectedType === "payment") {
        const updatedPayments = payments.filter(
          (_, index) => index !== selectedItemIndex
        );
        setPayments(updatedPayments);
        const tripToUpdate = { ...updatedTrip, payments: updatedPayments };
        console.log(tripToUpdate);
        setUpdatedTrip((prev) => ({ ...prev, payments: updatedPayments }));
        await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
        notifyInfo("Trip updated successfully");
      }
      setShowSidebar(false);
    } catch (error) {
      notifyError("Error deleting component");
    }
  };

  const handleSearchInvoice = (e) => {
    setSearchTermInvoice(e.target.value);
    setCurrentPageInvoice(1); // Reset to first page when searching
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle records per page change
  const handleRecordsPerPageInvoiceChange = (e) => {
    setRecordsPerPageInvoice(Number(e.target.value));
    setCurrentPageInvoice(1); // Reset to first page when changing records per page
  };

  // Handle records per page change
  const handleRecordsPerPageLRChange = (e) => {
    setRecordsPerPageLR(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  const getTransactions = async () => {
    try {
      const response = await api.get(
        API_ENDPOINTS.drivers.transactions(trip.driver.id)
      );
      setTransactionsList(response.data);
    } catch (error) {
      console.log(error);
      notifyError("Error fetching Transactions");
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
  const handleAddInvoiceClick = (route) => {
    if (route.lrNumber != "") {
      const lr = LRList.find((lr) => lr.id == route.lrNumber);
      console.log(lr);
      setFormDataInvoice((prevFormData) => ({
        ...prevFormData,
        freightPaidBy: lr.freightPaidBy,
        materialCategory: lr.materialCategory,
        unit: lr.unit,
        weight: lr.weight,
        gstPercentage: lr.gstPercentage,
      }));
      setCurrentInvoiceFormSection(0);
    } else {
      setCurrentInvoiceFormSection(3);
    }
    setIsAddInvoiceModalOpen(true); // Reset to first section when opening
  };

  const handleAddLRClick = () => {
    setIsAddLRModalOpen(true);
    setCurrentLRFormSection(3); // Reset to first section when opening
  };

  const handleNextSection = () => {
    if (currentLRFormSection < formSections.length - 1) {
      setCurrentLRFormSection(currentLRFormSection + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentLRFormSection > 0) {
      setCurrentLRFormSection(currentLRFormSection - 1);
    }
  };

  const handleNextSectionInvoice = () => {
    if (currentInvoiceFormSection < formSections.length - 1) {
      setCurrentInvoiceFormSection(currentInvoiceFormSection + 1);
    }
  };

  const handlePrevSectionInvoice = () => {
    if (currentInvoiceFormSection > 0) {
      setCurrentInvoiceFormSection(currentInvoiceFormSection - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  const handleInputChangeInvoice = (field, value) => {
    setFormDataInvoice((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
  };

  useEffect(() => {
    getTransactions();
    getConsigners();
    getConsignees();
    getLR();
    getLRAll();
    getInvoices();
    getInvoicesAll();
  }, []);

  useEffect(() => {
    getInvoices();
  }, [recordsPerPageInvoice]);
  useEffect(() => {
    getInvoices();
  }, [sortConfigInvoice]);
  useEffect(() => {
    getInvoices();
  }, [searchTermInvoice]);
  useEffect(() => {
    getInvoices();
  }, [invoiceFilters]);

  useEffect(() => {
    getLR();
  }, [recordsPerPageLR]);
  useEffect(() => {
    getLR();
  }, [sortConfig]);
  useEffect(() => {
    getLR();
  }, [searchTerm]);
  useEffect(() => {
    getLR();
  }, [LRFilters]);

  const generateNextLrNumber = (lrs) => {
    if (!lrs || lrs.length === 0) {
      setNextLrNumber("LRN-001");
      return;
    }

    // Find the highest LR number
    let highestNumber = 0;

    lrs.forEach((lr) => {
      if (lr.lrNumber && lr.lrNumber.startsWith("LRN-")) {
        const numPart = lr.lrNumber.substring(4);
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > highestNumber) {
          highestNumber = num;
        }
      }
    });

    // Generate the next number with leading zeros
    const nextNumber = highestNumber + 1;
    setNextLrNumber(`LRN-${String(nextNumber).padStart(3, "0")}`);
  };

  const generateNextInvoiceNumber = (invoices) => {
    if (!invoices || invoices.length === 0) {
      setNextInvoiceNumber("1");
      return;
    }

    // Find the highest LR number
    let highestNumber = 0;

    invoices.forEach((invoice) => {
      if (invoice.invoiceNumber) {
        const numPart = invoice.invoiceNumber;
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > highestNumber) {
          highestNumber = num;
        }
      }
    });

    // Generate the next number with leading zeros
    const nextNumber = highestNumber + 1;
    setNextInvoiceNumber(nextNumber);
  };

  const getInvoices = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.invoices.list(trip.id), {
        search: searchTermInvoice,
        page_size: recordsPerPageInvoice,
        filters: JSON.stringify(invoiceFilters),
        sorting: JSON.stringify(sortConfigInvoice),
      });
      setInvoiceList(response.data);
      setTotalPagesInvoice(response.total_pages);
      setPrevPageInvoice(extractNextPage(response.previous));
      setNextPageInvoice(extractNextPage(response.next));
    } catch (error) {
      notifyError("Error fetching invoices");
    }
  };

  const getLR = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LR.list(trip.id), {
        search: searchTerm,
        page_size: recordsPerPageLR,
        filters: JSON.stringify(LRFilters),
        sorting: JSON.stringify(sortConfig),
      });
      setLRList(response.data);
      setTotalPages(response.total_pages);
      setPrevPage(extractNextPage(response.previous));
      setNextPage(extractNextPage(response.next));
    } catch (error) {
      notifyError("Error fetching LRs");
    }
  };

  const getLRAll = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LR.listAll, {
        search: searchTerm,
        page_size: recordsPerPageLR,
        filters: JSON.stringify(LRFilters),
        sorting: JSON.stringify(sortConfig),
      });
      generateNextLrNumber(response.data);
    } catch (error) {
      notifyError("Error fetching LRs ALl");
    }
  };

  const getInvoicesAll = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.invoices.listAll, {
        search: searchTermInvoice,
        page_size: recordsPerPageInvoice,
        filters: JSON.stringify(invoiceFilters),
        sorting: JSON.stringify(sortConfigInvoice),
      });
      generateNextInvoiceNumber(response.data);
    } catch (error) {
      notifyError("Error fetching all invoices");
    }
  };

  // Previous page
  const prevPageClickInvoice = async () => {
    try {
      const response = await api.get(prevPageInvoice);
      setInvoiceList(response.data);
      setNextPageInvoice(extractNextPage(response.next)); // Store next page URL
      setPrevPageInvoice(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesInvoice(response.total_pages);
      setCurrentPageInvoice((prev) => prev - 1);
    } catch (error) {
      console.log(error);
    }
  };
  // Next page
  const nextPageClickInvoice = async () => {
    try {
      const response = await api.get(nextPageInvoice);
      setInvoiceList(response.data);
      setNextPageInvoice(extractNextPage(response.next)); // Store next page URL
      setPrevPageInvoice(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesInvoice(response.total_pages);
      setCurrentPageInvoice((prev) => prev + 1);
    } catch (error) {
      console.log(error);
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

  const updateInvoice = async () => {
    try {
      const response = await api.put(
        API_ENDPOINTS.invoices.update(currentInvoice.id),
        formDataInvoice,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setIsEditInvoiceModalOpen(false);
      resetAddInvoice();
      setSelectedConsigner("");
      setSelectedConsignee("");
      notifySuccess("Invoice Updated Successfully");
      getInvoices();
    } catch (error) {
      notifyError("Error updating invoice");
    }
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
      notifySuccess("LR Updated Successfully");
      getLR();
    } catch (error) {
      notifyError("Error updating LR");
    }
  };

  const submitInvoice = async () => {
    try {
      const response = await api.post(
        API_ENDPOINTS.invoices.create,
        formDataInvoice,
        {
          headers: {
            "Content-Type": "application/json", // Explicitly set header
          },
        }
      );
      setIsAddInvoiceModalOpen(false);
      resetAddInvoice();
      setSelectedConsigner("");
      setSelectedConsignee("");
      getInvoices();
      getInvoicesAll();
      const updatedRoutes = [...routesList];
      updatedRoutes[routeIndex].invoiceNumber = response.data.id;
      setRoutesList(updatedRoutes);
      const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
      console.log(tripToUpdate);

      setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setRouteIndex(-1);
      notifySuccess("Invoice Created Successfully");
    } catch (error) {
      notifyError("Error creating Invoice");
    }
    // Reset form
    // console.log(formData);
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
      getLRAll();
      const updatedRoutes = [...routesList];
      updatedRoutes[routeIndex].lrNumber = response.data.id;
      console.log(updatedRoutes);
      setRoutesList(updatedRoutes);
      const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
      setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      console.log(tripToUpdate);
      console.log(response.data);

      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setRouteIndex(-1);
      notifySuccess("LR Created Successfully");
    } catch (error) {
      notifyError("Error creating LR");
    }
    // Reset form
    // console.log(formData);
  };
  const handleUpdateInvoice = () => {
    formDataInvoice.consignee_id = selectedConsignee;
    formDataInvoice.consigner_id = selectedConsigner;
    updateInvoice();
  };

  const handleUpdateLR = () => {
    formData.consignee_id = selectedConsignee;
    formData.consigner_id = selectedConsigner;
    console.log(formData);
    updateLR();
  };

  const handleSubmitInvoice = () => {
    formDataInvoice.consignee_id = selectedConsignee;
    formDataInvoice.consigner_id = selectedConsigner;
    //console.log(formDataInvoice);
    //submitLR();
    submitInvoice();
  };

  const handleSubmitLR = () => {
    formData.consignee_id = selectedConsignee;
    formData.consigner_id = selectedConsigner;
    console.log(formData);
    submitLR();
  };

  const handleRowClickInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setFormDataInvoice({
      trip_id: invoice.trip.id,
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      materialCategory: invoice.materialCategory,
      numberOfPackages: invoice.numberOfPackages,
      unit: invoice.unit,
      weight: invoice.weight,
      freightPaidBy: invoice.freightPaidBy,
      gstPercentage: invoice.gstPercentage,
      consignee_id: invoice.consignee.id,
      consigner_id: invoice.consigner.id,
    });
    getConsigners();
    getConsignees();
    setSelectedConsignee(invoice.consignee.id);
    setSelectedConsigner(invoice.consigner.id);
    setCurrentInvoiceFormSection(0);
    setIsViewInvoiceModalOpen(true);
  };

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
    setSelectedConsignee(LR.consignee.id);
    setSelectedConsigner(LR.consigner.id);
    console.log(formData);
    console.log(currentLR);
    setCurrentLRFormSection(0);
    setIsViewLRModalOpen(true);
  };

  const handleNewRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRoute((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRouteClick = () => {
    setIsAddRouteModalOpen(true);
  };

  const handleAddRoute = async () => {
    const updatedRoutes = [...routesList, newRoute];
    setRoutesList(updatedRoutes);
    const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
    setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
    console.log(updatedRoutes);

    //console.log(updatedTrip);

    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setIsAddRouteModalOpen(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };

  const handleEditRouteClick = (route, index) => {
    setNewRoute(route);
    setRouteIndex(index);
    setIsEditRouteModalOpen(true);
  };

  const handleEditRoute = async () => {
    const updatedRoutes = [...routesList];
    updatedRoutes[routeIndex].consigner = newRoute.consigner;
    updatedRoutes[routeIndex].consignee = newRoute.consignee;
    updatedRoutes[routeIndex].units = newRoute.units;
    console.log(updatedRoutes);
    setRoutesList(updatedRoutes);
    const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
    setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setRouteIndex(-1);
      setIsEditRouteModalOpen(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };

  const handleDeleteRouteClick = (route, index) => {
    setNewRoute(route);
    setRouteIndex(index);
    setIsDeleteRouteConfirmOpen(true);
  };

  const handleDeleteRoute = async () => {
    const updatedRoutes = [...routesList];
    updatedRoutes.splice(routeIndex, 1);
    setRoutesList(updatedRoutes);
    console.log(updatedRoutes);
    const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
    setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
    try {
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setRouteIndex(-1);
      setIsDeleteRouteConfirmOpen(false);
    } catch (error) {
      console.error("Error updating Trip:", error);
      notifyError("Error updating Trip");
    }
  };

  const handleEditClickInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setFormDataInvoice({
      trip_id: invoice.trip.id,
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      materialCategory: invoice.materialCategory,
      numberOfPackages: invoice.numberOfPackages,
      unit: invoice.unit,
      weight: invoice.weight,
      freightPaidBy: invoice.freightPaidBy,
      gstPercentage: invoice.gstPercentage,
      consignee_id: invoice.consignee.id,
      consigner_id: invoice.consigner.id,
    });
    setSelectedConsignee(invoice.consignee.id);
    setSelectedConsigner(invoice.consigner.id);
    getConsigners();
    getConsignees();
    setCurrentInvoiceFormSection(0);
    setIsEditInvoiceModalOpen(true);
  };

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
    console.log(formData);
    console.log(currentLR);
    getConsigners();
    getConsignees();
    setCurrentLRFormSection(0);
    setIsEditLRModalOpen(true);
  };

  const handleDeleteClickInvoice = (invoice) => {
    setCurrentInvoice(invoice);
    setIsDeleteInvoiceConfirmOpen(true);
  };

  const handleDeleteClick = (LR) => {
    setCurrentLR(LR);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteInvoice = async () => {
    try {
      const updatedRoutes = [...routesList];
      const curIndex = updatedRoutes.findIndex(
        (route) => route.invoiceNumber == currentInvoice.id
      );
      console.log(updatedRoutes);
      console.log(curIndex);

      updatedRoutes[curIndex].invoiceNumber = "";
      console.log(updatedRoutes);
      setRoutesList(updatedRoutes);
      const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
      setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
      await api.delete(API_ENDPOINTS.invoices.delete(currentInvoice.id));
      notifyInfo("LR deleted successfully");
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setIsDeleteInvoiceConfirmOpen(false);
      setRouteIndex(-1);
      getInvoices();
      console.log("HIiiii");
      getInvoicesAll();
      console.log(nextInvoiceNumber);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLR = async () => {
    const updatedRoutes = [...routesList];
    const curIndex = updatedRoutes.findIndex(
      (route) => route.lrNumber == currentLR.id
    );
    updatedRoutes[curIndex].lrNumber = "";
    console.log(updatedRoutes);
    setRoutesList(updatedRoutes);
    const tripToUpdate = { ...updatedTrip, routes: updatedRoutes };
    setUpdatedTrip((prev) => ({ ...prev, routes: updatedRoutes }));
    try {
      await api.delete(API_ENDPOINTS.LR.delete(currentLR.id));
      notifyInfo("LR deleted successfully");
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      setNewRoute({
        consigner: "",
        consignee: "",
        units: "",
        lrNumber: "",
        invoiceNumber: "",
      });
      setRouteIndex(-1);
      getLR();
      getLRAll();
      setIsDeleteConfirmOpen(false);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewToEditInvoice = () => {
    setIsViewInvoiceModalOpen(false);
    setIsEditInvoiceModalOpen(true);
  };

  const handleViewToEdit = () => {
    setIsViewLRModalOpen(false);
    setIsEditLRModalOpen(true);
  };

  const paginate = async (page) => {
    const pageUrl = `${API_ENDPOINTS.LR.list(
      trip.id
    )}?page=${page}&page_size=${recordsPerPageLR}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchTerm,
        page_size: recordsPerPageLR,
        filters: JSON.stringify(LRFilters),
        sorting: JSON.stringify(sortConfig),
      });
      setLRList(response.data);
      setNextPage(extractNextPage(response.next)); // Store next page URL
      setPrevPage(extractNextPage(response.previous)); // Store previous page URL
      setTotalPages(response.total_pages);
      setCurrentPage(page);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  const paginateInvoice = async (page) => {
    const pageUrl = `${API_ENDPOINTS.invoices.list(
      trip.id
    )}?page=${page}&page_size=${recordsPerPageInvoice}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchTermInvoice,
        page_size: recordsPerPageInvoice,
        filters: JSON.stringify(invoiceFilters),
        sorting: JSON.stringify(sortConfigInvoice),
      });
      setInvoiceList(response.data);
      setNextPageInvoice(extractNextPage(response.next)); // Store next page URL
      setPrevPageInvoice(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesInvoice(response.total_pages);
      setCurrentPageInvoice(page);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  const formSections = [
    "Trip Details",
    "Consigner",
    "Consignee",
    "Load Details",
  ];

  const viewRoutesToggle = () => {
    setIsRouteListModalOpen(true);
  };

  const AddInvoiceToggle = () => {
    setIsInvoiceListModalOpen(true);
    console.log(isInvoiceListModalOpen);
  };

  const AddLRToggle = () => {
    setIsLRListModalOpen(true);
  };

  const getSortDirectionIconInvoice = (columnName) => {
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

  // Form section components
  const renderTripDetailsSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
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
      </div>

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
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm text-black font-medium mb-1">
    //       GST Number
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consigner.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium text-black mb-1">
    //       Consigner Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Name"
    //       value={formData.consigner.name}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 1"
    //       value={formData.consigner.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 2"
    //       value={formData.consigner.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consigner.state}
    //           onChange={(e) =>
    //             handleInputChange("consigner", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consigner.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consigner", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consigner.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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
    </div>
  );

  const renderConsigneeSection = () => (
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm font-medium mb-1">GST Number</label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consignee.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Name"
    //       value={formData.consignee.name}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 1"
    //       value={formData.consignee.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 2"
    //       value={formData.consignee.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consignee.state}
    //           onChange={(e) =>
    //             handleInputChange("consignee", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consignee.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consignee", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consignee.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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
    switch (currentLRFormSection) {
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
      <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
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
      </div>

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
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm text-black font-medium mb-1">
    //       GST Number
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consigner.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium text-black mb-1">
    //       Consigner Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Name"
    //       value={formData.consigner.name}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 1"
    //       value={formData.consigner.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 2"
    //       value={formData.consigner.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consigner.state}
    //           onChange={(e) =>
    //             handleInputChange("consigner", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consigner.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consigner", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consigner.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm font-medium mb-1">GST Number</label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consignee.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Name"
    //       value={formData.consignee.name}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 1"
    //       value={formData.consignee.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 2"
    //       value={formData.consignee.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consignee.state}
    //           onChange={(e) =>
    //             handleInputChange("consignee", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consignee.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consignee", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consignee.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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
    switch (currentLRFormSection) {
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

  // Form section components
  const renderTripDetailsSectionInvoice = () => (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
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
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          Invoice Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={formDataInvoice.invoiceDate}
            onChange={(e) =>
              handleInputChangeInvoice("invoiceDate", e.target.value)
            }
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          Invoice Number
        </label>
        <input
          type="text"
          value={formDataInvoice.invoiceNumber}
          onChange={(e) =>
            handleInputChangeInvoice("invoiceNumber", e.target.value)
          }
          className="w-full border border-gray-300 text-black rounded px-3 py-2"
        />
      </div>
    </div>
  );

  const renderConsignerSectionInvoice = () => (
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
    </div>
  );

  const renderConsigneeSectionInvoice = () => (
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
    </div>
  );

  const renderLoadDetailsSectionInvoice = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          Material Category*
        </label>
        <div className="relative">
          <select
            value={formDataInvoice.materialCategory}
            onChange={(e) =>
              handleInputChangeInvoice("materialCategory", e.target.value)
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
            value={formDataInvoice.weight}
            onChange={(e) => handleInputChangeInvoice("weight", e.target.value)}
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Unit
          </label>
          <div className="relative">
            <select
              value={formDataInvoice.unit}
              onChange={(e) => handleInputChangeInvoice("unit", e.target.value)}
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
          value={formDataInvoice.numberOfPackages}
          onChange={(e) =>
            handleInputChangeInvoice("numberOfPackages", e.target.value)
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
              checked={formDataInvoice.freightPaidBy === "Consigner"}
              onChange={(e) =>
                handleInputChangeInvoice("freightPaidBy", e.target.value)
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
              checked={formDataInvoice.freightPaidBy === "Consignee"}
              onChange={(e) =>
                handleInputChangeInvoice("freightPaidBy", e.target.value)
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
              checked={formDataInvoice.freightPaidBy === "Agent"}
              onChange={(e) =>
                handleInputChangeInvoice("freightPaidBy", e.target.value)
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
            value={formDataInvoice.gstPercentage}
            onChange={(e) =>
              handleInputChangeInvoice("gstPercentage", e.target.value)
            }
            className="w-full border border-gray-300 text-black rounded px-3 py-2"
          />
          <span className="absolute right-3 top-2.5 text-black">%</span>
        </div>
      </div>
    </div>
  );

  const renderFormSectionInvoice = () => {
    switch (currentInvoiceFormSection) {
      case 0:
        return renderTripDetailsSectionInvoice();
      case 1:
        return renderConsignerSectionInvoice();
      case 2:
        return renderConsigneeSectionInvoice();
      case 3:
        return renderLoadDetailsSectionInvoice();
      default:
        return renderTripDetailsSectionInvoice();
    }
  };

  // Form section components
  const renderTripDetailsSectionViewInvoice = () => (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-md p-4 mb-4 text-black">
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
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          Invoice Date
        </label>
        <div className="relative">
          <span className="text-black">{formDataInvoice.invoiceDate}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          Invoice Number
        </label>
        <span className="text-black">{formDataInvoice.invoiceNumber}</span>
      </div>
    </div>
  );

  const renderConsignerSectionViewInvoice = () => (
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm text-black font-medium mb-1">
    //       GST Number
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consigner.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium text-black mb-1">
    //       Consigner Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Name"
    //       value={formData.consigner.name}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 1"
    //       value={formData.consigner.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consigner Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consigner Address Line 2"
    //       value={formData.consigner.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consigner.state}
    //           onChange={(e) =>
    //             handleInputChange("consigner", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consigner.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consigner", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consigner.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consigner", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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

  const renderConsigneeSectionViewInvoice = () => (
    // <div className="space-y-4 text-black">
    //   <div>
    //     <label className="block text-sm font-medium mb-1">GST Number</label>
    //     <input
    //       type="text"
    //       placeholder="GST Number"
    //       value={formData.consignee.gstNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "gstNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Name*
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Name"
    //       value={formData.consignee.name}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "name", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 1
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 1"
    //       value={formData.consignee.addressLine1}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine1", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">
    //       Consignee Address Line 2
    //     </label>
    //     <input
    //       type="text"
    //       placeholder="Consignee Address Line 2"
    //       value={formData.consignee.addressLine2}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "addressLine2", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>

    //   <div className="grid grid-cols-2 gap-4">
    //     <div>
    //       <label className="block text-sm font-medium mb-1">State</label>
    //       <div className="relative">
    //         <select
    //           value={formData.consignee.state}
    //           onChange={(e) =>
    //             handleInputChange("consignee", "state", e.target.value)
    //           }
    //           className="w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none"
    //         >
    //           <option value="">State</option>
    //           <option value="Maharashtra">Maharashtra</option>
    //           <option value="Delhi">Delhi</option>
    //           <option value="Karnataka">Karnataka</option>
    //         </select>
    //         <ChevronDown
    //           size={16}
    //           className="absolute right-3 top-3 text-black"
    //         />
    //       </div>
    //     </div>

    //     <div>
    //       <label className="block text-sm font-medium mb-1">Pincode</label>
    //       <input
    //         type="text"
    //         placeholder="Pincode"
    //         value={formData.consignee.pincode}
    //         onChange={(e) =>
    //           handleInputChange("consignee", "pincode", e.target.value)
    //         }
    //         className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //       />
    //     </div>
    //   </div>

    //   <div>
    //     <label className="block text-sm font-medium mb-1">Mobile Number</label>
    //     <input
    //       type="text"
    //       placeholder="+91 Mobile Number"
    //       value={formData.consignee.mobileNumber}
    //       onChange={(e) =>
    //         handleInputChange("consignee", "mobileNumber", e.target.value)
    //       }
    //       className="w-full border border-gray-300 text-black rounded px-3 py-2"
    //     />
    //   </div>
    // </div>
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

  const renderLoadDetailsSectionViewInvoice = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          Material Category*
        </label>
        <div className="relative">
          <span className="text-black">{formDataInvoice.materialCategory}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Weight
          </label>
          <span className="text-black">{formDataInvoice.weight}</span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Unit
          </label>
          <div className="relative">
            <span className="text-black">{formDataInvoice.unit}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          No. of Bags / Box / Shipments
        </label>
        <span className="text-black">{formDataInvoice.numberOfPackages}</span>
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
              checked={formDataInvoice.freightPaidBy === "Consigner"}
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
              checked={formDataInvoice.freightPaidBy === "Consignee"}
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
              checked={formDataInvoice.freightPaidBy === "Agent"}
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
          <span className="text-black">% {formDataInvoice.gstPercentage}</span>
        </div>
      </div>
    </div>
  );

  const renderFormSectionViewInvoice = () => {
    switch (currentInvoiceFormSection) {
      case 0:
        return renderTripDetailsSectionViewInvoice();
      case 1:
        return renderConsignerSectionViewInvoice();
      case 2:
        return renderConsigneeSectionViewInvoice();
      case 3:
        return renderLoadDetailsSectionViewInvoice();
      default:
        return renderTripDetailsSectionViewInvoice();
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
                  index <= currentLRFormSection ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentLRFormSection
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {index + 1}
            </div>
            {index < formSections.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  index < currentLRFormSection ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
          <span className="text-xs mt-2">{section}</span>
        </div>
      ))}
    </div>
  );

  const ProgressIndicatorInvoice = () => (
    <div className="flex justify-between items-center px-6 py-3 border-b text-black">
      {formSections.map((section, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="flex items-center">
            {index > 0 && (
              <div
                className={`h-1 w-16 ${
                  index <= currentInvoiceFormSection
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentInvoiceFormSection
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {index + 1}
            </div>
            {index < formSections.length - 1 && (
              <div
                className={`h-1 w-16 ${
                  index < currentInvoiceFormSection
                    ? "bg-blue-600"
                    : "bg-gray-300"
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
              setNewRoute({
                consigner: "",
                consignee: "",
                units: "",
                lrNumber: "",
                invoiceNumber: "",
              });
              setRouteIndex(-1);
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
              currentLRFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentLRFormSection === 0}
          >
            Previous
          </button>

          {currentLRFormSection < formSections.length - 1 ? (
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
              setNewRoute({
                consigner: "",
                consignee: "",
                units: "",
                lrNumber: "",
                invoiceNumber: "",
              });
              setRouteIndex(-1);
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
              currentLRFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentLRFormSection === 0}
          >
            Previous
          </button>

          {currentLRFormSection < formSections.length - 1 ? (
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
              currentLRFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentLRFormSection === 0}
          >
            Previous
          </button>

          {currentLRFormSection < formSections.length - 1 ? (
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

  const AddInvoiceFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Invoice
          </h2>
          <button
            onClick={() => {
              resetAddInvoice();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setNewRoute({
                consigner: "",
                consignee: "",
                units: "",
                lrNumber: "",
                invoiceNumber: "",
              });
              setRouteIndex(-1);
              setIsAddInvoiceModalOpen(false);
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
        <ProgressIndicatorInvoice />

        {/* Form Content */}
        <div className="p-6">{renderFormSectionInvoice()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSectionInvoice}
            className={`px-4 py-2 rounded-md border ${
              currentInvoiceFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentInvoiceFormSection === 0}
          >
            Previous
          </button>

          {currentInvoiceFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSectionInvoice}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleSubmitInvoice();
                console.log("Form submitted:", formDataInvoice);
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

  const EditInvoiceFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Invoice</h2>
          <button
            onClick={() => {
              resetAddInvoice();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setNewRoute({
                consigner: "",
                consignee: "",
                units: "",
                lrNumber: "",
                invoiceNumber: "",
              });
              setRouteIndex(-1);
              setIsEditInvoiceModalOpen(false);
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
        <ProgressIndicatorInvoice />

        {/* Form Content */}
        <div className="p-6">{renderFormSectionInvoice()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSectionInvoice}
            className={`px-4 py-2 rounded-md border ${
              currentInvoiceFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentInvoiceFormSection === 0}
          >
            Previous
          </button>

          {currentInvoiceFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSectionInvoice}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleUpdateInvoice();
                console.log("Form submitted:", formDataInvoice);
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

  const ViewInvoiceFormModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">LR Details</h2>
          <button
            onClick={() => {
              resetAddInvoice();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setIsViewInvoiceModalOpen(false);
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
        <ProgressIndicatorInvoice />

        {/* Form Content */}
        <div className="p-6">{renderFormSectionViewInvoice()}</div>

        {/* Form Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevSectionInvoice}
            className={`px-4 py-2 rounded-md border ${
              currentInvoiceFormSection === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-blue-600 border-blue-600 hover:bg-blue-50"
            }`}
            disabled={currentInvoiceFormSection === 0}
          >
            Previous
          </button>

          {currentInvoiceFormSection < formSections.length - 1 ? (
            <button
              onClick={handleNextSectionInvoice}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                handleViewToEditInvoice();
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
    <div>
      <div className="min-h-screen bg-gray-100 p-4 space-y-4 overflow-auto text-black">
        <div className="flex justify-end"></div>
        {/* Truck & Driver Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white rounded shadow p-4 w-full md:w-[50%] flex items-center gap-4">
            <Truck className="w-8 h-8" />
            <div>
              <p className="font-semibold">{trip.truck.truckNo}</p>
              <p
                onClick={handleExpenseClick}
                className="text-sm text-blue-600 cursor-pointer"
              >
                View Truck &rarr;
              </p>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4 w-full md:w-[50%] flex items-center gap-4">
            <User2 className="w-6 h-6" />
            <div onClick={handleTransactionClick} className="cursor-pointer">
              <p className="text-sm text-gray-500">Driver Name</p>
              <p className="font-semibold">{trip.driver.name}</p>
            </div>
          </div>
          <div className="pt-1 gap-4">
            <button
              className="w-full border border-blue-600 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              onClick={() => onBack()}
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Side */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded shadow p-4 space-y-4">
              {/* Trip Info */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="col-span-1 bg-gray-50 p-4 rounded">
                  <p className="text-gray-500">Party Name</p>
                  <p className="text-blue-600 font-semibold">
                    {trip.party.partyName}
                  </p>
                  <p className="text-gray-500 mt-2">Party Balance</p>
                  <p className="text-green-600 font-semibold">
                    ₹ {trip.party.openingBalance}
                  </p>
                </div>
                <div className="col-span-1 bg-gray-50 p-4 rounded">
                  <p className="text-gray-500">From</p>
                  <p>{trip.origin} - 15 Apr 2025</p>
                  <p className="text-gray-500 mt-2">To</p>
                  <p>{trip.destination} - 18 Apr 2025</p>
                </div>
                <div className="col-span-1 bg-gray-50 p-4 rounded">
                  <p className="text-gray-500">Start KMs Reading</p>
                  <p className="font-semibold">{trip.startKmsReading} KM</p>
                  <p className="text-gray-500 mt-2">End KMs Reading</p>
                  <p className="font-semibold">
                    {updatedTrip.endKmsReading == ""
                      ? "-----"
                      : updatedTrip.endKmsReading}
                  </p>
                </div>
              </div>

              {/* Progress Bar with Connectors */}
              <div className="flex justify-between items-start pt-6 relative">
                {progressSteps.map((step, idx) => {
                  const isCompleted = idx < progressBarNumber;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center w-full text-center relative"
                    >
                      <div
                        className="z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          backgroundColor: isCompleted ? "#16a34a" : "#fff",
                          borderColor: isCompleted ? "#16a34a" : "#d1d5db",
                        }}
                      />
                      <p className="text-sm font-semibold mt-2">{step.label}</p>
                      <div className="h-4">
                        {step.date && (
                          <p className="text-xs text-gray-500">{step.date}</p>
                        )}
                      </div>
                      {idx < 4 && (
                        <div
                          className="absolute top-2 left-1/2 h-1"
                          style={{
                            width: "100%",
                            backgroundColor:
                              idx < progressBarNumber - 1
                                ? "#16a34a"
                                : "#d1d5db",
                            zIndex: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                {progressBarNumber < 5 && (
                  <button
                    className={`w-1/2 border px-4 py-2 rounded transition ${
                      progressBarNumber >= 5
                        ? "border-gray-400 text-gray-400 cursor-not-allowed"
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }`}
                    onClick={handleProgressBarUpdate}
                  >
                    {progressButtonText}
                  </button>
                )}
                <button
                  className={`${
                    progressBarNumber > 4 ? "w-full" : "w-1/2"
                  } border border-blue-600 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition`}
                >
                  View Bill
                </button>
              </div>

              {/* Freight Info */}
              {/* Freight Info */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="font-bold text-lg">Freight Amount</p>
                  <div className="text-right font-bold text-blue-600 text-lg">
                    ₹ {trip.partyFreightAmount}{" "}
                    <span className="ml-2 cursor-pointer">✎</span>
                  </div>
                </div>

                <div className="gap-4 text-sm">
                  {/* Advances Section */}
                  <div className="my-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">(-) Advance</p>
                      <p className="font-semibold">
                        ₹ {advances.reduce((sum, a) => sum + a.amount, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50">
                      {advances.map((advance, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 bg-gray-50 my-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            handleItemClick(advance, "advance", index)
                          }
                        >
                          <div>
                            <span className="text-gray-600">
                              {advance.date}
                            </span>
                            <span className="ml-2">{advance.paymentMode}</span>
                          </div>
                          <div className="flex items-center">
                            <span>₹ {advance.amount}</span>
                            <span className="ml-2">›</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAdvanceModal(true)}
                      className="text-blue-600 block mt-1 hover:underline"
                    >
                      Add Advance
                    </button>
                  </div>

                  {/* Charges Section */}
                  <div className="my-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">(+) Charges</p>
                      <p className="font-semibold">
                        ₹ {charges.reduce((sum, c) => sum + c.amount, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50">
                      {charges.map((charge, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 bg-gray-50 my-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            handleItemClick(charge, "charge", index)
                          }
                        >
                          <div>
                            <span className="text-gray-600">{charge.date}</span>
                            <span className="ml-2">{charge.chargeType}</span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`mr-1 ${
                                charge.addToBill
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {charge.addToBill ? "(+)" : "(-)"}
                            </span>
                            <span>₹ {charge.amount}</span>
                            <span className="ml-2">›</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowChargeModal(true)}
                      className="text-blue-600 block mt-1 hover:underline"
                    >
                      Add Charge
                    </button>
                  </div>

                  {/* Payments Section */}
                  <div className="my-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">(-) Payments</p>
                      <p className="font-semibold">
                        ₹ {payments.reduce((sum, p) => sum + p.amount, 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50">
                      {payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 px-3 bg-gray-50 my-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() =>
                            handleItemClick(payment, "payment", index)
                          }
                        >
                          <div>
                            <span className="text-gray-600">
                              {payment.date}
                            </span>
                            <span className="ml-2">{payment.paymentMode}</span>
                          </div>
                          <div className="flex items-center">
                            <span>₹ {payment.amount}</span>
                            <span className="ml-2">›</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="text-blue-600 block mt-1 hover:underline"
                    >
                      Add Payment
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="font-bold">Pending Party Balance</div>
                    <div className="font-bold text-lg">
                      ₹ {calculateBalance()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-4">
            {/* Trip Profit */}
            <div className="bg-white rounded shadow p-4 space-y-2 min-h-[50%]">
              <div className="flex justify-between items-center">
                <p className="font-bold">Trip Profit</p>
                <button
                  onClick={openTripExpenseModal}
                  className="border border-blue-700 text-blue-700 text-sm px-3 py-1 rounded hover:bg-blue-700 hover:text-white transition"
                >
                  + Add Expense
                </button>
              </div>
              <hr className="my-2" />
              <div className="text-sm">
                <p className="font-bold my-4">
                  (+) Revenue{" "}
                  <span className="float-right text-blue-700">₹ {revenue}</span>
                </p>
                <p className="text-gray-500 my-3">
                  {trip.party.partyName}{" "}
                  <span className="float-right">
                    ₹ {trip.partyFreightAmount}
                  </span>
                </p>
                <hr className="my-2" />

                <p className="font-bold my-4">
                  (-) Expense{" "}
                  <span className="float-right text-blue-700">
                    ₹ {totalExpenses}
                  </span>
                </p>

                {/* Individual Expenses */}
                {tripExpensesList.map((expense, index) => (
                  <p
                    key={index}
                    className="text-gray-500 my-3 cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => handleTripExpenseClick(expense, index)}
                  >
                    {expense.expenseType}{" "}
                    <span className="float-right">
                      ₹ {expense.expenseAmount}
                    </span>
                  </p>
                ))}

                <hr className="my-2" />

                <p
                  className={`font-bold my-4 ${
                    profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Profit ₹ {profit}
                </p>
              </div>
            </div>

            {/* Document Section */}
            <div className="bg-white rounded shadow p-4 space-y-4">
              <div className="flex items-center justify-between border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="text-green-600" />
                  <span>Routes</span>
                </div>
                {/* Calculate total units and check if less than trip.noOfUnits */}
                {(() => {
                  const totalUnits = routesList.reduce((sum, route) => {
                    // Convert units to number and handle empty strings or non-numeric values
                    const routeUnits = parseInt(route.units) || 0;
                    return sum + routeUnits;
                  }, 0);

                  const isIncomplete = totalUnits != trip.noOfUnits;

                  return (
                    <button
                      onClick={viewRoutesToggle}
                      className={`px-4 py-1 rounded transition text-sm ${
                        isIncomplete
                          ? "border border-red-600 text-white bg-red-600 hover:bg-red-700"
                          : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {isIncomplete
                        ? `View Routes (${totalUnits}/${trip.noOfUnits})`
                        : "View Routes"}
                    </button>
                  );
                })()}
              </div>
              <div className="flex items-center justify-between border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="text-green-600" />
                  <span>Online Bilty/LR</span>
                </div>
                <button
                  onClick={AddLRToggle}
                  className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition text-sm"
                >
                  View LRs
                </button>
              </div>
              <div className="flex items-center justify-between border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="text-green-600" />
                  <span>Invoices</span>
                </div>
                <button
                  onClick={AddInvoiceToggle}
                  className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition text-sm"
                >
                  View Invoices
                </button>
              </div>
              <div className="flex items-center justify-between border p-2 rounded">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="text-blue-600" />
                  <span>POD Challan</span>
                </div>
                <div className="flex space-x-2">
                  <button className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition text-sm">
                    View POD
                  </button>
                  <button className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition text-sm">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Advance</h2>
              <button
                onClick={() => {
                  setShowAdvanceModal(false);
                  setAdvanceForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Advance
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Advance Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter a Amount"
                  value={advanceForm.amount}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "Cheque", "UPI"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={advanceForm.paymentMode === mode}
                      onChange={(e) =>
                        setAdvanceForm({
                          ...advanceForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Bank Transfer", "Fuel", "Others"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={advanceForm.paymentMode === mode}
                      onChange={(e) =>
                        setAdvanceForm({
                          ...advanceForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={advanceForm.date}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={advanceForm.receivedByDriver}
                  onChange={(e) =>
                    setAdvanceForm({
                      ...advanceForm,
                      receivedByDriver: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Received By Driver</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={advanceForm.notes}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAdvanceModal(false);
                  setAdvanceForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleAddAdvance}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Charge Modal */}
      {showChargeModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Charges</h2>
              <button
                onClick={() => {
                  setShowChargeModal(false);
                  setChargeForm({
                    addToBill: true,
                    chargeType: "",
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Charge
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="chargeType"
                    checked={chargeForm.addToBill}
                    onChange={() =>
                      setChargeForm({ ...chargeForm, addToBill: true })
                    }
                    className="text-blue-600"
                  />
                  <span className="text-sm">Add to Bill</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="chargeType"
                    checked={!chargeForm.addToBill}
                    onChange={() =>
                      setChargeForm({ ...chargeForm, addToBill: false })
                    }
                    className="text-blue-600"
                  />
                  <span className="text-sm">Reduce from Bill</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Type" : "Deduction Type"} *
                </label>
                <select
                  value={chargeForm.chargeType}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, chargeType: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">
                    {chargeForm.addToBill
                      ? "Select a Charge Type"
                      : "Select a Deduction Type"}
                  </option>
                  {chargeForm.addToBill ? (
                    <>
                      <option value="Detention/Halting Charges">
                        Detention/Halting Charges
                      </option>
                      <option value="Union Charges">Union Charges</option>
                      <option value="Loading Charges">Loading Charges</option>
                      <option value="Unloading Charges">
                        Unloading Charges
                      </option>
                      <option value="Weight Charges">Weight Charges</option>
                      <option value="Other Charges">Other Charges</option>
                    </>
                  ) : (
                    <>
                      <option value="Late Fees">Late Fees</option>
                      <option value="Brokerage">Brokerage</option>
                      <option value="Material Loss">Material Loss</option>
                      <option value="Material Damage">Material Damage</option>
                      <option value="TDS">TDS</option>
                      <option value="Mamul">Mamul</option>
                      <option value="Others">Others</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Amount" : "Deduction Amount"}{" "}
                  *
                </label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={chargeForm.amount}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Date" : "Deduction Date"} *
                </label>
                <input
                  type="date"
                  value={chargeForm.date}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={chargeForm.notes}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowChargeModal(false);
                  setChargeForm({
                    addToBill: true,
                    chargeType: "",
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleAddCharge}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Payment
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter a Amount"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "Cheque", "UPI"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentForm.paymentMode === mode}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Bank Transfer", "Fuel", "Others"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentForm.paymentMode === mode}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={paymentForm.receivedByDriver}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      receivedByDriver: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Received By Driver</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleAddPayment}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditAdvanceModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Advances</h2>
              <button
                onClick={() => {
                  setShowEditAdvanceModal(false);
                  setAdvanceForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Advance
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Advance Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter a Amount"
                  value={advanceForm.amount}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "Cheque", "UPI"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={advanceForm.paymentMode === mode}
                      onChange={(e) =>
                        setAdvanceForm({
                          ...advanceForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Bank Transfer", "Fuel", "Others"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={advanceForm.paymentMode === mode}
                      onChange={(e) =>
                        setAdvanceForm({
                          ...advanceForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={advanceForm.date}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={advanceForm.receivedByDriver}
                  onChange={(e) =>
                    setAdvanceForm({
                      ...advanceForm,
                      receivedByDriver: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Received By Driver</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={advanceForm.notes}
                  onChange={(e) =>
                    setAdvanceForm({ ...advanceForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAdvanceModal(false);
                  setAdvanceForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleEditAdvance}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditChargeModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Charges</h2>
              <button
                onClick={() => {
                  setShowEditChargeModal(false);
                  setChargeForm({
                    addToBill: true,
                    chargeType: "",
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Charge
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="chargeType"
                    checked={chargeForm.addToBill}
                    onChange={() =>
                      setChargeForm({ ...chargeForm, addToBill: true })
                    }
                    className="text-blue-600"
                  />
                  <span className="text-sm">Add to Bill</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="chargeType"
                    checked={!chargeForm.addToBill}
                    onChange={() =>
                      setChargeForm({ ...chargeForm, addToBill: false })
                    }
                    className="text-blue-600"
                  />
                  <span className="text-sm">Reduce from Bill</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Type" : "Deduction Type"} *
                </label>
                <select
                  value={chargeForm.chargeType}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, chargeType: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">
                    {chargeForm.addToBill
                      ? "Select a Charge Type"
                      : "Select a Deduction Type"}
                  </option>
                  {chargeForm.addToBill ? (
                    <>
                      <option value="Detention/Halting Charges">
                        Detention/Halting Charges
                      </option>
                      <option value="Union Charges">Union Charges</option>
                      <option value="Loading Charges">Loading Charges</option>
                      <option value="Unloading Charges">
                        Unloading Charges
                      </option>
                      <option value="Weight Charges">Weight Charges</option>
                      <option value="Other Charges">Other Charges</option>
                    </>
                  ) : (
                    <>
                      <option value="Late Fees">Late Fees</option>
                      <option value="Brokerage">Brokerage</option>
                      <option value="Material Loss">Material Loss</option>
                      <option value="Material Damage">Material Damage</option>
                      <option value="TDS">TDS</option>
                      <option value="Mamul">Mamul</option>
                      <option value="Others">Others</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Amount" : "Deduction Amount"}{" "}
                  *
                </label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={chargeForm.amount}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {chargeForm.addToBill ? "Charge Date" : "Deduction Date"} *
                </label>
                <input
                  type="date"
                  value={chargeForm.date}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={chargeForm.notes}
                  onChange={(e) =>
                    setChargeForm({ ...chargeForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEditChargeModal(false);
                  setChargeForm({
                    addToBill: true,
                    chargeType: "",
                    amount: "",
                    date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleEditCharge}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showEditPaymentModal && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Payment</h2>
              <button
                onClick={() => {
                  setShowEditPaymentModal(false);
                  setPaymentForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 inline-block">
                Party Payment
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  placeholder="Enter a Amount"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Cash", "Cheque", "UPI"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentForm.paymentMode === mode}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["Bank Transfer", "Fuel", "Others"].map((mode) => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentForm.paymentMode === mode}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentMode: e.target.value,
                        })
                      }
                      className="text-blue-600"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, date: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={paymentForm.receivedByDriver}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      receivedByDriver: e.target.checked,
                    })
                  }
                />
                <span className="text-sm">Received By Driver</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  placeholder="Enter Notes"
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, notes: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 h-20"
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEditPaymentModal(false);
                  setPaymentForm({
                    amount: "",
                    paymentMode: "Cash",
                    date: new Date().toISOString().split("T")[0],
                    receivedByDriver: false,
                    notes: "",
                  });
                }}
                className="flex-1 border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleEditPayment}
                className="flex-1 bg-primary text-white rounded-md py-2 px-4 hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Item Details */}
      {showSidebar && selectedItem && (
        <div className="fixed text-black inset-0 bg-black bg-opacity-50 flex justify-end z-30">
          <div className="bg-white w-96 h-full overflow-y-auto flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Party{" "}
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}{" "}
                  Details
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditBillClick}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>✎</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span>🗑</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              {selectedType === "advance" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-medium">{selectedItem.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedType.charAt(0).toUpperCase() +
                          selectedType.slice(1)}{" "}
                        Amount
                      </p>
                      <p className="font-medium">₹ {selectedItem.amount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-medium">{selectedItem.paymentMode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-medium">—</p>
                    </div>
                  </div>

                  {selectedItem.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium">{selectedItem.notes}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedType === "charge" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Charge Date</p>
                      <p className="font-medium">{selectedItem.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedType.charAt(0).toUpperCase() +
                          selectedType.slice(1)}{" "}
                        Amount
                      </p>
                      <p className="font-medium">₹ {selectedItem.amount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Charge Type</p>
                      <p className="font-medium">{selectedItem.chargeType}</p>
                    </div>
                    {selectedItem.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="font-medium">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {selectedType === "payment" && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-medium">{selectedItem.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {selectedType.charAt(0).toUpperCase() +
                          selectedType.slice(1)}{" "}
                        Amount
                      </p>
                      <p className="font-medium">₹ {selectedItem.amount}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-medium">{selectedItem.paymentMode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference Number</p>
                      <p className="font-medium">—</p>
                    </div>
                  </div>

                  {selectedItem.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium">{selectedItem.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowSidebar(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg py-3 px-4 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>✕</span>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteTripExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setShowDeleteTripExpenseModal(false)}
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
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {selectedExpense?.expenseType}
                  {" - "}
                  {selectedExpense.expenseAmount}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteTripExpenseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTripExpense}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditTripExpenseModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            {/* Modal container */}
            <div className="overflow-y-auto flex-grow text-black bg-white shadow-xl rounded-lg w-full max-w-md mx-4 flex flex-col transform transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Expense
                </h2>
                <button
                  onClick={closeEditTripExpenseModal}
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

              <div className="flex-grow overflow-auto p-6">
                <form onSubmit={handleEditTripExpense}>
                  {/* Expense Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="expenseType"
                        value={tripExpenseDetails.expenseType}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                        required
                      >
                        <option value="" disabled>
                          Expense Type
                        </option>
                        <option value="Brokerage">Brokerage</option>
                        <option value="Detention Charges">
                          Detention Charges
                        </option>
                        <option value="Driver Bhatta">Driver Bhatta</option>
                        <option value="Driver Payment">Driver Payment</option>
                        <option value="Fuel Expense">Fuel Expense</option>
                        <option value="Loading Charges">Loading Charges</option>
                        <option value="Other">Other</option>
                        <option value="Police Expense">Police Expense</option>
                        <option value="RTO Expense">RTO Expense</option>
                        <option value="Repair Expense">Repair Expense</option>
                        <option value="Toll Expense">Toll Expense</option>
                        <option value="Union Charges">Union Charges</option>
                        <option value="Unloading Charges">
                          Unloading Charges
                        </option>
                        <option value="Weight Charges">Weight Charges</option>
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

                  {/* Expense Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="expenseAmount"
                        placeholder="Enter a Amount"
                        value={tripExpenseDetails.expenseAmount}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Expense Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={tripExpenseDetails.expenseDate}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Cash", "Credit", "Paid By Driver", "Online"].map(
                        (mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => handlePaymentModeSelect(mode)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              tripExpenseDetails.paymentMode === mode
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {mode}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Add to Party Bill Checkbox */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="addToPartyBill"
                      name="addToPartyBill"
                      checked={tripExpenseDetails.addToPartyBill}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="addToPartyBill"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Add To Party Bill
                    </label>
                  </div>

                  {/* Select Trip - Only shown if addToPartyBill is checked */}
                  {tripExpenseDetails.addToPartyBill && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Select a Trip <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="selectedTrip"
                            value={trip.party.partyName}
                            onChange={handleTripExpenseChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                            required={tripExpenseDetails.addToPartyBill}
                            readOnly
                          ></input>
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Amount to be added to Party Bill{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="text"
                            name="partyBillAmount"
                            placeholder="Amount"
                            value={tripExpenseDetails.partyBillAmount}
                            onChange={handleTripExpenseChange}
                            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            required={tripExpenseDetails.addToPartyBill}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Notes
                    </label>
                    <div className="relative">
                      <textarea
                        name="notes"
                        placeholder="Enter Notes"
                        value={tripExpenseDetails.notes}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-h-[80px]"
                      />
                      <div className="absolute top-2 left-2 text-gray-500">
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
                            d="M4 6h16M4 12h16M4 18h7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Buttons */}
              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  onClick={closeEditTripExpenseModal}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleEditTripExpense}
                  className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isExpenseSidebarOpen && selectedExpense && (
        <div className="text-black fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black bg-opacity-50"
            onClick={() => {
              setIsExpenseSidebarOpen(false);
              setSelectedExpense(null);
              setSelectedExpenseIndex(-1);
            }}
          ></div>

          {/* Sidebar */}
          <div className="w-96 bg-white shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Expense Details</h3>
              <div className="flex gap-2">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    openEditTripExpenseModal();
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    openDeleteTripExpenseModal();
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsExpenseSidebarOpen(false);
                    setSelectedExpense(null);
                    setSelectedExpenseIndex(-1);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-50 rounded"
                >
                  <svg
                    className="w-5 h-5"
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
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Expense Date</label>
                  <div className="font-medium">
                    {selectedExpense.expenseDate}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Expense Amount
                  </label>
                  <div className="font-medium">
                    ₹ {selectedExpense.expenseAmount}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Payment Mode</label>
                  <div className="font-medium">
                    {selectedExpense.paymentMode}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">
                    Reference Number
                  </label>
                  <div className="font-medium">
                    {selectedExpense.referenceNumber || "--"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Expense Type</label>
                <div className="font-medium">{selectedExpense.expenseType}</div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Notes</label>
                <div className="font-medium">
                  {selectedExpense.notes || "--"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <button
                onClick={() => setIsExpenseSidebarOpen(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isRouteListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pr-10">
              <h1 className="text-2xl font-semibold text-gray-800">Routes</h1>
              <button
                onClick={() => handleAddRouteClick()}
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
              >
                <span className="mr-1">+</span> Add Route
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsRouteListModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
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

            {/* Modal Content */}
            <div className="bg-white rounded-md p-6">
              {/* Search Input */}
              {/* <div className="mb-6 flex flex-wrap justify-end items-center">
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
                  {LRFilters.length > 0 && (
                    <button
                      onClick={() => setLRFilters([])}
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
                    value={recordsPerPageLR}
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
              </div> */}

              {/* Drivers Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      {/* <th
                        className="px-6 py-3 text-left cursor-pointer"
                        //onClick={() => requestSort("lrNumber")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            LR Number
                          </span>
                          {getSortDirectionIcon("lrNumber")}
                        </div>
                      </th> */}
                      {/* <th
                        className="px-6 py-3 text-left cursor-pointer"
                        //onClick={() => requestSort("lrDate")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            LR Date
                          </span>
                          {getSortDirectionIcon("lrDate")}
                        </div>
                      </th> */}
                      <th
                        className="px-6 py-3 text-left cursor-pointer"
                        //onClick={() => requestSort("consigner.name")}
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
                        //onClick={() => requestSort("consignee.name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Consignee Name
                          </span>
                          {getSortDirectionIcon("consignee.name")}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer"
                        //onClick={() => requestSort("consignee.name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            No.of Units
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
                    {routesList.map((route, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base font-medium text-gray-900">
                            {LR.lrNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">
                            {LR.lrDate}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">
                            {
                              consigners.find((c) => c.id == route.consigner)
                                .name
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">
                            {
                              consignees.find((c) => c.id == route.consignee)
                                .name
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">
                            {route.units}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {route.invoiceNumber ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClickInvoice(
                                    invoiceList.find(
                                      (LR) => LR.id === route.invoiceNumber
                                    )
                                  );
                                }}
                                className="border border-indigo-600 text-indigo-600 px-4 py-1 rounded hover:bg-indigo-600 hover:text-white transition text-sm"
                              >
                                View Invoice
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewRoute(route);
                                  setRouteIndex(index);
                                  setSelectedConsigner(route.consigner);
                                  setSelectedConsignee(route.consignee);
                                  setFormDataInvoice({
                                    invoiceDate: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                    invoiceNumber: nextInvoiceNumber,
                                    consigner_id: route.consigner,
                                    consignee_id: route.consignee,
                                    materialCategory: "",
                                    weight: "",
                                    unit: "Tonnes",
                                    numberOfPackages: route.units,
                                    freightPaidBy: "Consigner",
                                    gstPercentage: "",
                                    trip_id: trip.id,
                                  });
                                  handleAddInvoiceClick(route);
                                }}
                                className="border border-blue-600 text-blue-600 px-4 py-1 rounded hover:bg-blue-600 hover:text-white transition text-sm"
                              >
                                Create Invoice
                              </button>
                            )}

                            {route.lrNumber ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(
                                    LRList.find(
                                      (LR) => LR.id === route.lrNumber
                                    )
                                  );
                                }}
                                className="border border-indigo-600 text-indigo-600 px-4 py-1 rounded hover:bg-indigo-600 hover:text-white transition text-sm"
                              >
                                View LR
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewRoute(route);
                                  setRouteIndex(index);
                                  setSelectedConsigner(route.consigner);
                                  setSelectedConsignee(route.consignee);
                                  setFormData({
                                    lrDate: new Date()
                                      .toISOString()
                                      .split("T")[0],
                                    lrNumber: nextLrNumber,
                                    consigner_id: route.consigner,
                                    consignee_id: route.consignee,
                                    materialCategory: "",
                                    weight: "",
                                    unit: "Tonnes",
                                    numberOfPackages: route.units,
                                    freightPaidBy: "Consigner",
                                    gstPercentage: "",
                                    trip_id: trip.id,
                                  });
                                  handleAddLRClick();
                                }}
                                className="border border-green-600 text-green-600 px-4 py-1 rounded hover:bg-green-600 hover:text-white transition text-sm"
                              >
                                Create LR
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditRouteClick(route, index);
                              }}
                              disabled={route.lrNumber != ""}
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
                                handleDeleteRouteClick(route, index);
                              }}
                              disabled={route.lrNumber != ""}
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
                {routesList.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-700 text-base">
                      No Routes found. Try a different search term or add a new
                      route.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {/* {routesList.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstRecord + 1} to{" "}
                    {Math.min(indexOfLastRecord, routesList.length)} of{" "}
                    {routesList.length} entries
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
                          index < array.length - 1 &&
                          array[index + 1] !== page + 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
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
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
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
              )} */}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsLRListModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
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
        </div>
      )}

      {isLRListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pr-10">
              <h1 className="text-2xl font-semibold text-gray-800">LR</h1>
              {/* <button
                onClick={handleAddLRClick}
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
              >
                <span className="mr-1">+</span> Add LR
              </button> */}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsLRListModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
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

            {/* Modal Content */}
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
                  {LRFilters.length > 0 && (
                    <button
                      onClick={() => setLRFilters([])}
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
                    value={recordsPerPageLR}
                    onChange={handleRecordsPerPageLRChange}
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
                            {/* New Print Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintClick(LR.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Print LR"
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
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                            </button>

                            {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printLR(LR.id); // Change this line to use printLR instead of handlePrintClick
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Print LR"
                            >
                              Hi
                            </button> */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(LR);
                              }}
                              className="text-primary hover:text-blue-700 transition-colors"
                              title="View LR"
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
                              title="Edit LR"
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
                              title="Delete LR"
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
                    {Math.min(indexOfLastRecord, LRList.length)} of{" "}
                    {LRList.length} entries
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
                          index < array.length - 1 &&
                          array[index + 1] !== page + 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
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
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
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

      {isInvoiceListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pr-10">
              <h1 className="text-2xl font-semibold text-gray-800">Invoices</h1>
              {/* <button
                onClick={handleAddLRClick}
                className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
              >
                <span className="mr-1">+</span> Add LR
              </button> */}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsInvoiceListModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
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

            {/* Modal Content */}
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
                    placeholder="Search Invoices"
                    value={searchTermInvoice}
                    onChange={handleSearchInvoice}
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                  />
                  {invoiceFilters.length > 0 && (
                    <button
                      onClick={() => setInvoiceFilters([])}
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
                    value={recordsPerPageInvoice}
                    onChange={handleRecordsPerPageInvoiceChange}
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
                        onClick={() => requestSortInvoice("invoiceNumber")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Invoice Number
                          </span>
                          {getSortDirectionIconInvoice("invoiceNumber")}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer"
                        onClick={() => requestSortInvoice("invoiceDate")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Invoice Date
                          </span>
                          {getSortDirectionIconInvoice("invoiceDate")}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer"
                        onClick={() => requestSortInvoice("consigner.name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Consigner Name
                          </span>
                          {getSortDirectionIconInvoice("consigner.name")}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left cursor-pointer"
                        onClick={() => requestSortInvoice("consignee.name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Consignee Name
                          </span>
                          {getSortDirectionIconInvoice("consignee.name")}
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
                    {invoiceList.map((LR) => (
                      <tr
                        key={LR.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base font-medium text-gray-900">
                            {LR.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-base text-gray-900">
                            {LR.invoiceDate}
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
                            {/* New Print Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePrintClickInvoice(LR.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Print LR"
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
                                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                printLR(LR.id); // Change this line to use printLR instead of handlePrintClick
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Print LR"
                            >
                              {/* SVG icon */}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClickInvoice(LR);
                              }}
                              className="text-primary hover:text-blue-700 transition-colors"
                              title="View LR"
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
                                handleEditClickInvoice(LR);
                              }}
                              className="text-primary hover:text-blue-700 transition-colors"
                              title="Edit LR"
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
                                handleDeleteClickInvoice(LR);
                              }}
                              className="text-danger hover:text-red-600 transition-colors"
                              title="Delete LR"
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
                {invoiceList.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-700 text-base">
                      No Invoices found. Try a different search term or add a
                      new Invoice.
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {invoiceList.length > 0 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstRecordInvoice + 1} to{" "}
                    {Math.min(indexOfLastRecordInvoice, invoiceList.length)} of{" "}
                    {invoiceList.length} entries
                  </div>

                  <nav className="flex items-center">
                    <button
                      onClick={prevPageClickInvoice}
                      disabled={currentPageInvoice === 1}
                      className={`px-3 py-1 rounded-md mx-1 ${
                        currentPageInvoice === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPagesInvoice }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPagesInvoice ||
                          (page >= currentPageInvoice - 1 &&
                            page <= currentPageInvoice + 1)
                      )
                      .map((page, index, array) => {
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== page - 1;
                        const showEllipsisAfter =
                          index < array.length - 1 &&
                          array[index + 1] !== page + 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
                            )}

                            <button
                              onClick={() => paginateInvoice(page)}
                              className={`px-3 py-1 rounded-md mx-1 ${
                                currentPageInvoice === page
                                  ? "bg-primary text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>

                            {showEllipsisAfter && (
                              <span className="px-3 py-1 text-gray-500">
                                ...
                              </span>
                            )}
                          </div>
                        );
                      })}

                    <button
                      onClick={nextPageClickInvoice}
                      disabled={currentPageInvoice === totalPagesInvoice}
                      className={`px-3 py-1 rounded-md mx-1 ${
                        currentPageInvoice === totalPagesInvoice
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
        </div>
      )}

      {isAddInvoiceModalOpen && AddInvoiceFormModal()}

      {isEditInvoiceModalOpen && EditInvoiceFormModal()}

      {isViewInvoiceModalOpen && ViewInvoiceFormModal()}

      {isDeleteInvoiceConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => setIsDeleteInvoiceConfirmOpen(false)}
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
                Are you sure you want to delete Invoice{" "}
                <span className="font-semibold">
                  {currentInvoice?.invoiceNumber}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteInvoiceConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInvoice}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransactionsModal && (
        <div className="fixed inset-y-0 right-0 z-50 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex justify-between items-center border-b p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Transactions for {trip.driver.name} - {trip.driver.phone_number}
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
              <span className="text-sm text-gray-600 mr-2">Total Amount:</span>
              <span
                className={`text-lg font-bold flex ${
                  totalTransactionAmount >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  // stroke-width="2"
                  // stroke-linecap="round"
                  // stroke-linejoin="round"
                  // class="icon icon-tabler icons-tabler-outline icon-tabler-currency-rupee mt-1"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                  <path d="M7 9l11 0" />
                </svg>
                {Math.abs(totalTransactionAmount).toFixed(2)}
              </span>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                totalTransactionAmount >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {totalTransactionAmount >= 0 ? "Net Credit" : "Net Debit"}
            </span>
            <button
              onClick={openAddTransactionModal}
              className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
            >
              + Add Transaction
            </button>
          </div>

          <div className="flex-grow overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AMOUNT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REASON
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionsList.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50"
                    onClick={() => openEditTransactionModal(transaction)}
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
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
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
                    <td className="px-4 py-3 text-black">{transaction.date}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditTransactionModal(transaction)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransactionClick(transaction);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {transactionsList.length === 0 && (
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
      )}
      {showAddTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-[400px] p-6 shadow-xl">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Transaction
              </h3>
              <button
                onClick={closeAddTransactionModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddTransaction}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleTransactionInputChange}
                  placeholder="Enter amount"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="amountType"
                  value={newTransaction.amountType}
                  onChange={handleTransactionInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Reason
                </label>
                <input
                  type="text"
                  name="reason"
                  value={newTransaction.reason}
                  onChange={handleTransactionInputChange}
                  placeholder="Enter reason"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleTransactionInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAddTransactionModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#243b6c] text-white rounded-md hover:bg-blue-700"
                >
                  Add Transaction
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
                <span className="font-semibold">{trip.driver?.name}</span>? This
                action cannot be undone.
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
      {showTripExpenseModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center">
            {/* Modal container */}
            <div className="overflow-y-auto flex-grow text-black bg-white shadow-xl rounded-lg w-full max-w-md mx-4 flex flex-col transform transition-all duration-300 ease-in-out">
              <div className="flex justify-between items-center border-b p-6 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add Expense
                </h2>
                <button
                  onClick={closeTripExpenseModal}
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

              <div className="flex-grow overflow-auto p-6">
                <form onSubmit={handleTripExpenseSubmit}>
                  {/* Expense Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="expenseType"
                        value={tripExpenseDetails.expenseType}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                        required
                      >
                        <option value="" disabled>
                          Expense Type
                        </option>
                        <option value="Brokerage">Brokerage</option>
                        <option value="Detention Charges">
                          Detention Charges
                        </option>
                        <option value="Driver Bhatta">Driver Bhatta</option>
                        <option value="Driver Payment">Driver Payment</option>
                        <option value="Fuel Expense">Fuel Expense</option>
                        <option value="Loading Charges">Loading Charges</option>
                        <option value="Other">Other</option>
                        <option value="Police Expense">Police Expense</option>
                        <option value="RTO Expense">RTO Expense</option>
                        <option value="Repair Expense">Repair Expense</option>
                        <option value="Toll Expense">Toll Expense</option>
                        <option value="Union Charges">Union Charges</option>
                        <option value="Unloading Charges">
                          Unloading Charges
                        </option>
                        <option value="Weight Charges">Weight Charges</option>
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

                  {/* Expense Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        ₹
                      </span>
                      <input
                        type="text"
                        name="expenseAmount"
                        placeholder="Enter a Amount"
                        value={tripExpenseDetails.expenseAmount}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Expense Date */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Expense Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expenseDate"
                        value={tripExpenseDetails.expenseDate}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Payment Mode <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Cash", "Credit", "Paid By Driver", "Online"].map(
                        (mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => handlePaymentModeSelect(mode)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              tripExpenseDetails.paymentMode === mode
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {mode}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Add to Party Bill Checkbox */}
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="addToPartyBill"
                      name="addToPartyBill"
                      checked={tripExpenseDetails.addToPartyBill}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="addToPartyBill"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Add To Party Bill
                    </label>
                  </div>

                  {/* Select Trip - Only shown if addToPartyBill is checked */}
                  {tripExpenseDetails.addToPartyBill && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Select a Trip <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            name="selectedTrip"
                            value={trip.party.partyName}
                            onChange={handleTripExpenseChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                            required={tripExpenseDetails.addToPartyBill}
                            readOnly
                          ></input>
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Amount to be added to Party Bill{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            ₹
                          </span>
                          <input
                            type="text"
                            name="partyBillAmount"
                            placeholder="Amount"
                            value={tripExpenseDetails.partyBillAmount}
                            onChange={handleTripExpenseChange}
                            className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            required={tripExpenseDetails.addToPartyBill}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Notes
                    </label>
                    <div className="relative">
                      <textarea
                        name="notes"
                        placeholder="Enter Notes"
                        value={tripExpenseDetails.notes}
                        onChange={handleTripExpenseChange}
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary min-h-[80px]"
                      />
                      <div className="absolute top-2 left-2 text-gray-500">
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
                            d="M4 6h16M4 12h16M4 18h7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer Buttons */}
              <div className="border-t p-4 flex justify-end space-x-3">
                <button
                  onClick={closeTripExpenseModal}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleTripExpenseSubmit}
                  className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showExpensesModal && (
        <div className="fixed inset-y-0 right-0 z-30 w-[90%] max-w-[900px] bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out translate-x-0">
          <div className="flex justify-between items-center border-b p-6 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Expenses for {trip.truck.truckNo} - {trip.truck.truckType}
            </h2>
            <button
              onClick={closeExpensesModal}
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
              <span className="text-sm text-gray-600 mr-2">Total Amount:</span>
              <span
                className={`text-lg font-bold flex ${
                  totalExpenseAmount >= 0 ? "text-green-700" : "text-red-700"
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
                {Math.abs(totalExpenseAmount).toFixed(2)}
              </span>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                totalExpenseAmount >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {totalExpenseAmount >= 0 ? "Net Credit" : "Net Debit"}
            </span>
            <div>
              <button
                onClick={openAddExpenseModal}
                className="px-4 py-2 text-sm text-white bg-[#243b6c] rounded-md hover:bg-blue-700"
              >
                + Add Expense
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
                {expensesList.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50"
                    onClick={() => openEditExpenseModal(expense)}
                  >
                    <td className="px-4 py-3 text-black">
                      {expense.expenseDate}
                    </td>
                    <td className="px-4 py-3 text-black">
                      {expense.expenseType}
                    </td>
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
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M18 5h-11h3a4 4 0 0 1 0 8h-3l6 6" />
                        <path d="M7 9l11 0" />
                      </svg>
                      <span
                        className="inline-block px-2 py-1 rounded-full font-medium
                                bg-red-100 text-red-800"
                      >
                        {expense.amountPaid}
                      </span>
                    </td>
                    <td className="px-4 py-3">Null</td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditExpenseModal(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExpenseClick(expense);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {expensesList.length === 0 && (
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

      {showAddExpensesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-medium text-black">Add Expenses</h2>
              <button
                onClick={closeAddExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex justify-center space-x-8">
              <div
                onClick={() => openExpenseModal("fuel")}
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
                onClick={() => openExpenseModal("maintenance")}
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
                onClick={() => openExpenseModal("driver")}
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
                onClick={closeExpenseModal}
                className="text-black hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Amount*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    placeholder="Enter Amount"
                    value={newExpense.amountPaid}
                    onChange={handleExpenseInputChange}
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="flex mb-4 gap-4">
                <div className="flex-1">
                  <label className="block text-black mb-1">Fuel Quantity</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fuelQuantity"
                      placeholder="Fuel Quantity"
                      value={newExpense.fuelQuantity}
                      onChange={handleExpenseInputChange}
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
                        newExpense.fuelQuantity > 0
                          ? newExpense.amountPaid / newExpense.fuelQuantity
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
                    value={newExpense.currentKmReading}
                    onChange={handleExpenseInputChange}
                    placeholder="Current KM Reading"
                    className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">
                    KMs
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={newExpense.expenseDate}
                    onChange={handleExpenseInputChange}
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
                <label className="block text-black mb-1">Payment Mode*</label>
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
                        newExpense.paymentMode = option;
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
                onClick={closeExpenseModal}
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
                onClick={closeExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Type*</label>
                <select
                  name="expenseType"
                  value={newExpense.expenseType}
                  onChange={handleExpenseInputChange}
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
                <label className="block text-black mb-1">Amount Paid*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    value={newExpense.amountPaid}
                    onChange={handleExpenseInputChange}
                    placeholder="Amount Paid"
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={newExpense.expenseDate}
                    onChange={handleExpenseInputChange}
                    className="w-full border rounded-md p-2 text-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Payment Mode*</label>
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
                        newExpense.paymentMode = option;
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
                    onChange={handleExpenseInputChange}
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
                onClick={closeExpenseModal}
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
                onClick={closeExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Type*</label>
                <select
                  name="expenseType"
                  value={newExpense.expenseType}
                  onChange={handleExpenseInputChange}
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
                <label className="block text-black mb-1">Amount Paid*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    value={newExpense.amountPaid}
                    onChange={handleExpenseInputChange}
                    placeholder="Amount Paid"
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={newExpense.expenseDate}
                    onChange={handleExpenseInputChange}
                    className="w-full border rounded-md p-2 text-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Payment Mode*</label>
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
                        newExpense.paymentMode = option;
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
                    value={newExpense.notes}
                    onChange={handleExpenseInputChange}
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
                onClick={closeExpenseModal}
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
                onClick={closeEditExpenseModal}
                className="text-black hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Amount*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    placeholder="Enter Amount"
                    value={editingExpense.amountPaid}
                    onChange={handleEditExpenseInputChange}
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="flex mb-4 gap-4">
                <div className="flex-1">
                  <label className="block text-black mb-1">Fuel Quantity</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="fuelQuantity"
                      placeholder="Fuel Quantity"
                      value={editingExpense.fuelQuantity}
                      onChange={handleEditExpenseInputChange}
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
                        editingExpense.fuelQuantity > 0
                          ? editingExpense.amountPaid /
                            editingExpense.fuelQuantity
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
                    value={editingExpense.currentKmReading}
                    onChange={handleEditExpenseInputChange}
                    placeholder="Current KM Reading"
                    className="w-full border rounded-md p-2 pl-3 pr-12 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">
                    KMs
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={editingExpense.expenseDate}
                    onChange={handleEditExpenseInputChange}
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
                <label className="block text-black mb-1">Payment Mode*</label>
                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option}
                      className={`px-4 py-2 rounded-md text-sm ${
                        editingExpense.paymentMode === option
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      name="paymentMode"
                      onClick={() => {
                        setEditingExpense({
                          ...editingExpense,
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
                onClick={closeEditExpenseModal}
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
                onClick={closeEditExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Type*</label>
                <select
                  name="expenseType"
                  value={editingExpense.expenseType}
                  onChange={handleEditExpenseInputChange}
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
                <label className="block text-black mb-1">Amount Paid*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    value={editingExpense.amountPaid}
                    onChange={handleEditExpenseInputChange}
                    placeholder="Amount Paid"
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={editingExpense.expenseDate}
                    onChange={handleEditExpenseInputChange}
                    className="w-full border rounded-md p-2 text-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Payment Mode*</label>
                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option}
                      className={`px-4 py-2 rounded-md text-sm ${
                        editingExpense.paymentMode === option
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      name="paymentMode"
                      onClick={() => {
                        setEditingExpense({
                          ...editingExpense,
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
                    value={editingExpense.currentKmReading}
                    onChange={handleEditExpenseInputChange}
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
                onClick={closeEditExpenseModal}
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
                onClick={closeEditExpenseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-black mb-1">Expense Type*</label>
                <select
                  name="expenseType"
                  value={editingExpense.expenseType}
                  onChange={handleEditExpenseInputChange}
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
                <label className="block text-black mb-1">Amount Paid*</label>
                <div className="relative">
                  <input
                    type="text"
                    name="amountPaid"
                    value={editingExpense.amountPaid}
                    onChange={handleEditExpenseInputChange}
                    placeholder="Amount Paid"
                    className="w-full border rounded-md p-2 pl-3 pr-8 text-black"
                  />
                  <span className="absolute right-3 top-2.5 text-black">₹</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Expense Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    name="expenseDate"
                    value={editingExpense.expenseDate}
                    onChange={handleEditExpenseInputChange}
                    className="w-full border rounded-md p-2 text-black"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-black mb-1">Payment Mode*</label>
                <div className="flex flex-wrap gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option}
                      className={`px-4 py-2 rounded-md text-sm ${
                        editingExpense.paymentMode === option
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      name="paymentMode"
                      onClick={() => {
                        setEditingExpense({
                          ...editingExpense,
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
                    value={editingExpense.notes}
                    onChange={handleEditExpenseInputChange}
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
                onClick={closeEditExpenseModal}
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
                <span className="font-semibold">{trip.truck.truckNo}</span>?
                This action cannot be undone.
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

      {/* Mark Delivered Popup - Integrated directly into this component */}
      {tripCompletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Mark Delivered</h2>
              <button
                onClick={() => setTripCompletePopup(false)}
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

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Trip End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="tripEndDate"
                      onChange={handleProgressBarInputChange}
                      value={updatedTrip.tripEndDate}
                      className="w-full border rounded-md p-2 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    End KMs
                  </label>
                  <input
                    type="text"
                    value={updatedTrip.endKmsReading}
                    onChange={handleProgressBarInputChange}
                    name="endKmsReading"
                    className="border rounded py-2 px-3 w-full"
                    placeholder="KMs"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setTripCompletePopup(false)}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={submitTripEnd}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-gray-800"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark POD Received Popup */}
      {showPODReceivedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Mark POD Received</h2>
              <button
                onClick={() => setShowPODReceivedPopup(false)}
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

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    POD Received On *
                  </label>
                  <div className="relative">
                    <input
                      value={updatedTrip.PODReceivedDate}
                      onChange={handleProgressBarInputChange}
                      type="date"
                      name="PODReceivedDate"
                      className="w-full border rounded-md p-2 text-black"
                    />
                  </div>
                </div>

                <div>
                  <button className="flex items-center gap-2 text-blue-600 px-4 py-2 border border-blue-600 rounded">
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
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Add Image
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowPODReceivedPopup(false)}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={submitTripEnd}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-gray-800"
              >
                Mark POD Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark POD Submitted Popup */}
      {showPODSubmittedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Mark POD Submitted</h2>
              <button
                onClick={() => setShowPODSubmittedPopup(false)}
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

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    POD Submitted On *
                  </label>
                  <div className="relative">
                    <input
                      value={updatedTrip.PODSubmittedDate}
                      onChange={handleProgressBarInputChange}
                      type="date"
                      name="PODSubmittedDate"
                      className="w-full border rounded-md p-2 text-black"
                    />
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Payment Reminder After</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      value={reminderDays}
                      onChange={(e) => setReminderDays(e.target.value)}
                      className="border rounded py-1 px-2"
                    >
                      <option value="7 days">7 days</option>
                      <option value="14 days">14 days</option>
                      <option value="30 days">30 days</option>
                    </select>
                    
                    <div className="relative inline-block w-10 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="toggle"
                        checked={enablePaymentReminder}
                        onChange={() => setEnablePaymentReminder(!enablePaymentReminder)} 
                        className="opacity-0 absolute h-0 w-0"
                      />
                      <label 
                        htmlFor="toggle" 
                        className={`block overflow-hidden h-6 rounded-full cursor-pointer ${enablePaymentReminder ? 'bg-blue-600' : 'bg-gray-300'}`}
                        style={{ width: '40px', transition: 'background-color 0.3s' }}
                      >
                        <span 
                          className={`block h-5 w-5 ml-0.5 mt-0.5 rounded-full bg-white transform ${enablePaymentReminder ? 'translate-x-4' : ''}`}
                          style={{ transition: 'transform 0.3s' }}
                        ></span>
                      </label>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowPODSubmittedPopup(false)}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={submitTripEnd}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-gray-800"
              >
                Mark POD Submitted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Party Balance Popup */}
      {showSettleBalancePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-medium">Settle Party Balance</h2>
              <button
                onClick={() => setShowSettleBalancePopup(false)}
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

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Settle Amount *
                  </label>
                  <input
                    type="text"
                    value={trip.partyFreightAmount}
                    readOnly
                    className="border rounded py-2 px-3 w-full"
                    placeholder="Amount"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "Cash",
                      "Cheque",
                      "UPI",
                      "Bank Transfer",
                      "Fuel",
                      "Others",
                    ].map((mode) => (
                      <div key={mode} className="flex items-center">
                        <input
                          type="radio"
                          id={mode}
                          checked={settlementMode === mode}
                          onChange={() => setSettlementMode(mode)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={mode}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {mode}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Settlement Date *
                  </label>
                  <div className="relative">
                    <input
                      value={updatedTrip.settlementDate}
                      onChange={handleProgressBarInputChange}
                      type="date"
                      name="settlementDate"
                      className="w-full border rounded-md p-2 text-black"
                    />
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Received By Driver</label>
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="driver-toggle"
                      checked={updatedTrip.receivedByDriver}
                      onChange={() => setReceivedByDriver(!receivedByDriver)}
                      className="opacity-0 absolute h-0 w-0"
                    />
                    <label 
                      htmlFor="driver-toggle" 
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${receivedByDriver ? 'bg-blue-600' : 'bg-gray-300'}`}
                      style={{ width: '40px', transition: 'background-color 0.3s' }}
                    >
                      <span 
                        className={`block h-5 w-5 ml-0.5 mt-0.5 rounded-full bg-white transform ${receivedByDriver ? 'translate-x-4' : ''}`}
                        style={{ transition: 'transform 0.3s' }}
                      ></span>
                    </label>
                  </div>
                </div> */}

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Notes
                  </label>
                  <div className="border rounded overflow-hidden">
                    <div className="border-b px-3 py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16m-7 6h7"
                        />
                      </svg>
                    </div>
                    <textarea
                      value={updatedTrip.settlementNotes}
                      name="settlementNotes"
                      onChange={handleProgressBarInputChange}
                      className="w-full px-3 py-2 focus:outline-none resize-none"
                      placeholder="Enter Notes"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button
                onClick={() => setShowSettleBalancePopup(false)}
                className="px-4 py-2 border rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={submitTripEnd}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-gray-800"
              >
                Settle Party Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddRouteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Route
              </h2>
              <button
                onClick={() => {
                  setIsAddRouteModalOpen(false);
                  setNewRoute({
                    consigner: "",
                    consignee: "",
                    units: "",
                    lrNumber: "",
                    invoiceNumber: "",
                  });
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
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consigner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <select
                      value={newRoute.consigner}
                      name="consigner"
                      onChange={handleNewRouteChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">-- Select a consigner --</option>
                      {consigners.map((consigner) => (
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
                      value={newRoute.consignee}
                      name="consignee"
                      onChange={handleNewRouteChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">-- Select a consignee --</option>
                      {consignees.map((consignee) => (
                        <option key={consignee.id} value={consignee.id}>
                          {consignee.name} (GST: {consignee.gstNumber})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddConsigneePopup(true);
                        console.log(showAddConsigneePopup);
                      }}
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
                    Units <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoute.units}
                    name="units"
                    onChange={handleNewRouteChange}
                    placeholder="Enter number of units"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddRouteModalOpen(false);
                    setNewRoute({
                      consigner: "",
                      consignee: "",
                      units: "",
                      lrNumber: "",
                      invoiceNumber: "",
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddRoute()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditRouteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Route
              </h2>
              <button
                onClick={() => {
                  setIsEditRouteModalOpen(false);
                  setNewRoute({
                    consigner: "",
                    consignee: "",
                    units: "",
                    lrNumber: "",
                    invoiceNumber: "",
                  });
                  setRouteIndex(-1);
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
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consigner <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <select
                      value={newRoute.consigner}
                      name="consigner"
                      onChange={handleNewRouteChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">-- Select a consigner --</option>
                      {consigners.map((consigner) => (
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
                      value={newRoute.consignee}
                      name="consignee"
                      onChange={handleNewRouteChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                    >
                      <option value="">-- Select a consignee --</option>
                      {consignees.map((consignee) => (
                        <option key={consignee.id} value={consignee.id}>
                          {consignee.name} (GST: {consignee.gstNumber})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddConsigneePopup(true);
                        console.log(showAddConsigneePopup);
                      }}
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
                    Units <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoute.units}
                    name="units"
                    onChange={handleNewRouteChange}
                    placeholder="Enter number of units"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditRouteModalOpen(false);
                    setNewRoute({
                      consigner: "",
                      consignee: "",
                      units: "",
                      lrNumber: "",
                      invoiceNumber: "",
                    });
                    setRouteIndex(-1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleEditRoute()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
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

      {isDeleteRouteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <button
                onClick={() => {
                  setIsDeleteRouteConfirmOpen(false);
                  setNewRoute({
                    consigner: "",
                    consignee: "",
                    units: "",
                    lrNumber: "",
                    invoiceNumber: "",
                  });
                  setRouteIndex(-1);
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
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete route for{" "}
                <span className="font-semibold">
                  {consigners.find((c) => c.id == newRoute.consigner).name}
                  {" : "}
                  {consigners.find((c) => c.id == newRoute.consigner).gstNumber}
                  {" - "}
                  {consignees.find((c) => c.id == newRoute.consignee).name}
                  {" : "}
                  {consignees.find((c) => c.id == newRoute.consignee).gstNumber}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsDeleteRouteConfirmOpen(false);
                  setNewRoute({
                    consigner: "",
                    consignee: "",
                    units: "",
                    lrNumber: "",
                    invoiceNumber: "",
                  });
                  setRouteIndex(-1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoute}
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
