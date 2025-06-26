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
import LorryReceipt from "./LorryReceipt";

const ITEMS_PER_PAGE = 1;

export default function Invoice() {
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
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentLR, setCurrentLR] = useState("");
  const [showAddConsignerPopup, setShowAddConsignerPopup] = useState(false);
  const [showAddConsigneePopup, setShowAddConsigneePopup] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [LRList, setLRList] = useState([]);
  const [lorryReceiptList, setLorryReceiptList] = useState([]);
  const [materialList, setMaterialList] = useState([]);

  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(0);

  //Invoice print Popup
  const [showInvoicePdfPopup, setShowInvoicePdfPopup] = useState(false);
  const [currentInvoicePdfUrl, setCurrentInvoicePdfUrl] = useState("");

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

  const handlePrintClickInvoice = async (invoiceId) => {
    // Open the PDF in a new window/tab
    // const url = process.env.NEXT_PUBLIC_API_URL;
    // window.open(`${url}/invoices/pdf/${invoiceId}/`, "_blank");

    const url = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${url}/invoices/pdf/${invoiceId}/`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      setCurrentInvoicePdfUrl(blobUrl);
      setShowInvoicePdfPopup(true);
    } catch (error) {
      console.error("Error fetching Invoice PDF:", error);
    }
  };

  const handleDownloadInvoicePdf = async () => {
    if (!currentInvoicePdfUrl) return;

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = currentInvoicePdfUrl;
      link.download = `Invoice_${currentLR.invoiceNumber || "document"}.pdf`; // Use LR ID in filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };
  const closeInvoicePdfPopup = () => {
    if (currentInvoicePdfUrl.startsWith("blob:")) {
      URL.revokeObjectURL(currentInvoicePdfUrl);
    }
    setShowInvoicePdfPopup(false);
    setCurrentInvoicePdfUrl("");
  };

  const handleRowClick = (LR) => {
    setCurrentLR(LR);
    const route = trips.find((trip) => trip.id == LR.trip.id).routes[
      LR.routeIndex
    ];
    setFormData({
      trip_id: LR.trip.id,
      invoiceDate: LR.invoiceDate,
      invoiceNumber: LR.invoiceNumber,
      materialCategory: LR.materialCategory,
      numberOfPackages: LR.numberOfPackages,
      unit: LR.unit,
      weight: LR.weight,
      freightPaidBy: LR.freightPaidBy,
      gstPercentage: LR.gstPercentage,
      consignee_id: LR.consignee.id,
      consigner_id: LR.consigner.id,
      goodsInvoice: route.goodsInvoice || "",
      goodsValue: route.goodsValue || "",
    });
    getConsigners();
    getConsignees();
    setSelectedConsignee(LR.consignee.id);
    setSelectedConsigner(LR.consigner.id);
    setSelectedTrip(LR.trip.id);
    setSelectedRoute(LR.routeIndex);
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
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState("1");

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
    options = [],
    className,
    required,
    placeholder = "Select an option",
    displayKey = null, // Key to display from object (e.g., 'locationName', 'name')
    valueKey = "id", // Key to use as value (default: 'id')
    allowAdd = false, // Whether to show "Add new" option
    onAddNew = null, // Function to call when adding new item
    addNewText = "Add new", // Text to show for add new option
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Helper function to get display text from option
    const getDisplayText = (option) => {
      if (typeof option === "string") return option;
      return displayKey ? option[displayKey] : option.toString();
    };

    // Helper function to get value from option
    const getValue = (option) => {
      if (typeof option === "string") return option;
      return option[valueKey];
    };

    // Find selected option object
    const selectedOption = options.find((option) => getValue(option) === value);
    const selectedDisplayText = selectedOption
      ? getDisplayText(selectedOption)
      : "";

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      getDisplayText(option).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if search term exactly matches any existing option
    const exactMatch = filteredOptions.some(
      (option) =>
        getDisplayText(option).toLowerCase() === searchTerm.toLowerCase()
    );

    // Show "Add new" option if allowAdd is true, searchTerm is not empty, and no exact match
    const showAddNew =
      allowAdd && searchTerm.trim() !== "" && !exactMatch && onAddNew;

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setIsFocused(false);
          // Reset search term if no valid selection was made
          if (!value || !selectedOption) {
            setSearchTerm("");
          }
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [value, selectedOption]);

    // Handle input focus
    const handleFocus = () => {
      setIsFocused(true);
      setIsOpen(true);
      setSearchTerm("");
    };

    // Handle input change (typing)
    const handleInputChange = (e) => {
      const inputValue = e.target.value;
      setSearchTerm(inputValue);
      setIsOpen(true);

      // Clear the selected value when typing
      if (value && inputValue !== selectedDisplayText) {
        onChange({ target: { name, value: "" } });
      }
    };

    // Handle selection of an option
    const handleSelect = (option) => {
      const optionValue = getValue(option);
      onChange({ target: { name, value: optionValue } });
      setSearchTerm("");
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    };

    // Handle add new item
    const handleAddNew = async () => {
      if (onAddNew && searchTerm.trim()) {
        try {
          // Call the provided add new function with search term
          await onAddNew(searchTerm.trim());
          setSearchTerm("");
          setIsOpen(false);
          setIsFocused(false);
          inputRef.current?.blur();
        } catch (error) {
          console.error("Error adding new item:", error);
          // You might want to show an error message to the user here
        }
      }
    };

    // Handle input blur
    const handleBlur = () => {
      // Small delay to allow for option selection
      setTimeout(() => {
        if (!dropdownRef.current?.contains(document.activeElement)) {
          setIsFocused(false);
          setIsOpen(false);
          // Reset search term if no valid selection
          if (!value || !selectedOption) {
            setSearchTerm("");
          }
        }
      }, 150);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    // Display value: show selected value or search term when focused
    const displayValue = isFocused ? searchTerm : selectedDisplayText || "";
    const showPlaceholder = !isFocused && !value;

    return (
      <div className="relative" ref={dropdownRef}>
        {/* Main input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={showPlaceholder ? placeholder : ""}
            className={`${className} pr-10`}
            autoComplete="off"
            required={required}
          />

          {/* Dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
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
        </div>

        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option, index) => {
                  const optionValue = getValue(option);
                  const displayText = getDisplayText(option);
                  return (
                    <div
                      key={`${optionValue}-${index}`}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-black border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                        value === optionValue
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : ""
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSelect(option);
                      }}
                    >
                      {displayText}
                    </div>
                  );
                })}
                {showAddNew && (
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-green-50 text-green-700 border-t border-gray-200 transition-colors duration-150 flex items-center"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleAddNew();
                    }}
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {addNewText} "{searchTerm}"
                  </div>
                )}
              </>
            ) : (
              <>
                {showAddNew ? (
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-green-50 text-green-700 transition-colors duration-150 flex items-center"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      handleAddNew();
                    }}
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {addNewText} "{searchTerm}"
                  </div>
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No results found
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Form data state
  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    invoiceNumber: nextInvoiceNumber,
    consigner_id: "",
    consignee_id: "",
    goodsInvoice: "",
    goodsValue: "",
    materialCategory: "",
    weight: "",
    unit: "Kg",
    numberOfPackages: "",
    freightPaidBy: "Consigner",
    gstPercentage: "",
  });

  const resetAddLR = () => {
    setFormData({
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: nextInvoiceNumber,
      consigner_id: "",
      consignee_id: "",
      goodsInvoice: "",
      goodsValue: "",
      materialCategory: "",
      weight: "",
      unit: "Kg",
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

  const getLorryReceipts = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.LR.listAll, {});
      setLorryReceiptList(response.data);
    } catch (error) {
      console.log(error);

      //notifyError("Error fetching LRs");
    }
  };

  const getLR = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.invoices.listAll, {
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      setLRList(response.data);
      setTotalPages(response.total_pages);
      setPrevPage(extractNextPage(response.previous));
      setNextPage(extractNextPage(response.next));
      generateNextInvoiceNumber(response.data);
    } catch (error) {
      console.log(error);

      //notifyError("Error fetching LRs");
    }
  };

  const getMaterials = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.materials.list);
      setMaterialList(response.data);
      console.log(response.data);
    } catch (error) {
      notifyError("Error fetching drivers");
    }
  };

  const addMaterial = async (materialName) => {
    try {
      const response = await api.post(
        API_ENDPOINTS.materials.create,
        JSON.stringify(
          { materialName },
          {
            headers: {
              "Content-Type": "application/json", // Explicitly set header
            },
          }
        )
      );
      setFormData((prevFormData) => ({
        ...prevFormData,
        materialCategory: materialName,
      }));
      getMaterials();
      // You might want to update your locations list here
      // setLocationOptions(prev => [...prev, newLocation]);
      console.log("New material added:", materialName);
    } catch (error) {
      console.error("Error adding material:", error);
      throw error;
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
    getTrips();
    getLorryReceipts();
    getMaterials();
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

  // Filter drivers based on search term
  const filteredDrivers = columnFilteredDrivers.filter(
    (supplier) =>
      supplier.lrNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.consigner.name?.includes(
        searchTerm.toLowerCase() ||
          supplier.consignee.name?.includes(searchTerm.toLowerCase())
      )
  );

  // Get sorted and filtered drivers
  const outDrivers = getSortedData(filteredDrivers);

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = outDrivers;

  // Change page
  const paginate = async (page) => {
    const pageUrl = `${API_ENDPOINTS.invoices.listAll}?page=${page}&page_size=${recordsPerPage}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchTerm,
        page_size: recordsPerPage,
        filters: JSON.stringify(driverFilters),
        sorting: JSON.stringify(sortConfig),
      });
      if (driverFilters.length === 0) {
        setLRList(response.data);
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
    const route = trips.find((trip) => trip.id == LR.trip.id).routes[
      LR.routeIndex
    ];
    console.log(LR);

    setFormData({
      trip_id: LR.trip.id,
      invoiceDate: LR.invoiceDate,
      invoiceNumber: LR.invoiceNumber,
      materialCategory: LR.materialCategory,
      numberOfPackages: LR.numberOfPackages,
      unit: LR.unit,
      weight: LR.weight,
      freightPaidBy: LR.freightPaidBy,
      gstPercentage: LR.gstPercentage,
      consignee_id: LR.consignee.id,
      consigner_id: LR.consigner.id,
      goodsInvoice: route.goodsInvoice || "",
      goodsValue: route.goodsValue || "",
    });
    setSelectedConsignee(LR.consignee.id);
    setSelectedConsigner(LR.consigner.id);
    setSelectedTrip(LR.trip.id);
    setSelectedRoute(LR.routeIndex);
    console.log(formData);
    console.log(currentLR);
    getConsigners();
    getConsignees();
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
    formData.routeIndex = selectedRoute;
    console.log(formData);
    submitLR();
  };

  const handleUpdateLR = () => {
    formData.consignee_id = selectedConsignee;
    formData.consigner_id = selectedConsigner;
    formData.trip_id = selectedTrip;
    formData.routeIndex = selectedRoute;
    console.log(formData);
    updateLR();
  };

  const submitLR = async () => {
    try {
      console.log(formData);

      const response = await api.post(API_ENDPOINTS.invoices.create, formData, {
        headers: {
          "Content-Type": "application/json", // Explicitly set header
        },
      });
      const tripToUpdate = trips.find((c) => c.id == selectedTrip);
      if (selectedRoute && selectedRoute != "") {
        tripToUpdate.routes[selectedRoute].invoiceNumber = response.data.id;
      } else {
        if (
          tripToUpdate.partyBillingType == "Per Kg" ||
          tripToUpdate.partyBillingType == "Per Tonne"
        ) {
          const newRoute = {
            consigner: selectedConsigner,
            consignee: selectedConsignee,
            units: formData.weight,
            lrNumber: "",
            invoiceNumber: response.data.id,
          };
          tripToUpdate.routes = [...(tripToUpdate.routes || []), newRoute];
        } else {
          const newRoute = {
            consigner: selectedConsigner,
            consignee: selectedConsignee,
            units: formData.numberOfPackages,
            lrNumber: "",
            invoiceNumber: response.data.id,
          };
          tripToUpdate.routes = [...(tripToUpdate.routes || []), newRoute];
        }
      }
      await api.put(API_ENDPOINTS.trips.update(selectedTrip), tripToUpdate);
      setIsAddLRModalOpen(false);
      resetAddLR();
      setSelectedConsigner("");
      setSelectedConsignee("");
      getLR();
      getTrips();
      notifySuccess("Invoice Created Successfully");
    } catch (error) {
      notifyError("Error creating Invoice");
    }
    // Reset form
    // console.log(formData);
  };

  const updateLR = async () => {
    try {
      const response = await api.put(
        API_ENDPOINTS.invoices.update(currentLR.id),
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
      notifySuccess("Invoice Updated Successfully");
      getLR();
    } catch (error) {
      notifyError("Error updating Invoice");
    }
  };

  const findRouteIndexByLR = () => {
    for (let tripIndex = 0; tripIndex < trips.length; tripIndex++) {
      const trip = trips[tripIndex];
      // Make sure the trip has a routes array
      if (trip && trip.routes && Array.isArray(trip.routes)) {
        const routeIndex = trip.routes.findIndex(
          (route) => route && route.invoiceNumber === currentLR.id
        );
        console.log(trip.routes);
        console.log(routeIndex);
        console.log(currentLR.id);

        if (routeIndex !== -1) {
          return {
            tripIndex,
            routes: trip.routes,
            routeIndex,
            trip,
          };
        }
      }
    }
    return -1;
  };

  const handleDeleteLR = async () => {
    try {
      const result = findRouteIndexByLR();
      const { tripIndex, routes, routeIndex, trip } = result;
      console.log(routes);
      const updatedRoutes = [...routes];
      updatedRoutes[routeIndex].invoiceNumber = "";
      const tripToUpdate = { ...trip, routes: updatedRoutes };
      await api.delete(API_ENDPOINTS.invoices.delete(currentLR.id));
      notifyInfo("LR deleted successfully");
      await api.put(API_ENDPOINTS.trips.update(trip.id), tripToUpdate);
      notifyInfo("Trip updated successfully");
      getLR();
      getTrips();
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

  const handleRouteChange = (e) => {
    if (
      e.target.value <
      trips.find((trip) => trip.id == selectedTrip).routes.length
    ) {
      resetAddLR();
      const route = trips.find((trip) => trip.id == selectedTrip).routes[
        e.target.value
      ];
      setSelectedRoute(e.target.value);
      setSelectedConsigner(route.consigner);
      setSelectedConsignee(route.consignee);
      setFormData((prevFormData) => ({
        ...prevFormData,
        weight: "",
        unit: "Kg",
        numberOfPackages: "",
      }));
      if (
        trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
        "Per Kg"
      ) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          weight: route.units,
          unit: "Kg",
        }));
      } else if (
        trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
        "Per Tonne"
      ) {
        console.log(route.units);
        setFormData((prevFormData) => ({
          ...prevFormData,
          weight: route.units,
          unit: "Tonnes",
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          numberOfPackages: route.units,
        }));
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        goodsInvoice: route.goodsInvoice,
        goodsValue: route.goodsValue,
      }));
      if (route.lrNumber != "") {
        const newLR = lorryReceiptList.find((c) => c.id == route.lrNumber);
        setFormData((prevFormData) => ({
          ...prevFormData,
          materialCategory: newLR.materialCategory,
          weight: newLR.weight,
          unit: newLR.unit,
          freightPaidBy: newLR.freightPaidBy,
          gstPercentage: newLR.gstPercentage,
        }));
      }
    } else {
      const ind = trips.find((trip) => trip.id == selectedTrip).routes.length;
      console.log(ind);
      setSelectedRoute(String(ind));
      setSelectedConsigner("");
      setSelectedConsignee("");
      resetAddLR();
      // setFormData((prevFormData) => ({
      //   ...prevFormData,
      //   numberOfPackages: "",
      //   weight: "",
      //   goodsInvoice: "",
      //   goodsValue: "",
      // }));
    }
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

  const handleAddLRClick = () => {
    getConsigners();
    getConsignees();
    setFormData((prevFormData) => ({
      ...prevFormData,
      invoiceNumber: nextInvoiceNumber,
    }));
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
    "Goods Details",
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
          onChange={(e) => {
            setSelectedTrip(e.target.value);
            setSelectedRoute("");
            setSelectedConsigner("");
            setSelectedConsignee("");
          }}
        >
          <option value="">-- Select a trip --</option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              Party Name: {trip.party.partyName}, {trip.origin} &rarr;
              {trip.destination}, Vehicle No: {trip.truck.truckNo}
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

          {/* Route Selection Dropdown */}
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Select Route</div>
            <select
              disabled={isEditLRModalOpen == true}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              value={selectedRoute || ""}
              onChange={(e) => {
                handleRouteChange(e);
              }}
            >
              <option value={null}>Choose a route...</option>
              <option
                value={
                  trips.find((trip) => trip.id == selectedTrip).routes.length
                }
              >
                New Route
              </option>
              {trips
                .find((trip) => trip.id == selectedTrip)
                .routes?.map((route, index) => (
                  <option
                    key={index}
                    value={index}
                    disabled={route.invoiceNumber !== ""}
                    className={
                      route.invoiceNumber !== ""
                        ? "text-gray-400 bg-gray-100"
                        : ""
                    }
                  >
                    {consigners.find((c) => c.id == route.consigner).name} →{" "}
                    {consignees.find((c) => c.id == route.consignee).name}
                    {route.units && ` (${route.units} units)`}
                    {route.invoiceNumber &&
                      route.invoiceNumber !== "" &&
                      " - Invoice Generated"}
                  </option>
                ))}
            </select>
          </div>

          {/* Display selected route details */}
          {selectedRoute !== null &&
            selectedRoute !== "" &&
            trips.find((trip) => trip.id == selectedTrip).routes?.[
              selectedRoute
            ] && (
              <div className="mt-4 p-3 bg-white rounded-md border">
                <div className="text-sm font-medium mb-2">
                  Selected Route Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Consigner:</span>{" "}
                    {consigners.find((c) => c.id == selectedConsigner).name}
                  </div>
                  <div>
                    <span className="text-gray-500">Consignee:</span>{" "}
                    {consignees.find((c) => c.id == selectedConsignee).name}
                  </div>
                  <div>
                    <span className="text-gray-500">Units:</span>{" "}
                    {
                      trips.find((trip) => trip.id == selectedTrip).routes[
                        selectedRoute
                      ].units
                    }
                  </div>
                  {trips.find((trip) => trip.id == selectedTrip).routes[
                    selectedRoute
                  ].lrNumber && (
                    <div>
                      <span className="text-gray-500">LR Number:</span>{" "}
                      {
                        trips.find((trip) => trip.id == selectedTrip).routes[
                          selectedRoute
                        ].lrNumber
                      }
                    </div>
                  )}
                  {trips.find((trip) => trip.id == selectedTrip).routes[
                    selectedRoute
                  ].goodsInvoice && (
                    <div>
                      <span className="text-gray-500">Goods Invoice No.:</span>{" "}
                      {
                        trips.find((trip) => trip.id == selectedTrip).routes[
                          selectedRoute
                        ].goodsInvoice
                      }
                    </div>
                  )}
                  {trips.find((trip) => trip.id == selectedTrip).routes[
                    selectedRoute
                  ].goodsValue && (
                    <div>
                      <span className="text-gray-500">Goods Value:</span>{" "}
                      {
                        trips.find((trip) => trip.id == selectedTrip).routes[
                          selectedRoute
                        ].goodsValue
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
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
          Invoice Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
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
          value={formData.invoiceNumber}
          onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
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
            disabled={
              isEditLRModalOpen == true ||
              selectedRoute !=
                trips.find((trip) => trip.id == selectedTrip).routes.length
            }
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
            disabled={
              isEditLRModalOpen == true ||
              selectedRoute !=
                trips.find((trip) => trip.id == selectedTrip).routes.length
            }
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

  const renderGoodsSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Goods Invoice
          </label>
          <input
            type="text"
            placeholder="Enter the Goods Invoice No."
            disabled={
              isEditLRModalOpen == true ||
              selectedRoute !=
                trips.find((trip) => trip.id == selectedTrip).routes.length
            }
            value={formData.goodsInvoice}
            onChange={(e) => handleInputChange("goodsInvoice", e.target.value)}
            className={`w-full border border-gray-300 text-black rounded px-3 py-2`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Goods Value
          </label>
          <input
            type="text"
            placeholder="Enter the value of goods"
            disabled={
              isEditLRModalOpen == true ||
              selectedRoute !=
                trips.find((trip) => trip.id == selectedTrip).routes.length
            }
            value={formData.goodsValue}
            onChange={(e) => handleInputChange("goodsValue", e.target.value)}
            className={`w-full border border-gray-300 text-black rounded px-3 py-2`}
          />
        </div>
      </div>
    </div>
  );

  const renderLoadDetailsSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-black">
          Material Category*
        </label>
        {/* <div className="relative">
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
        </div> */}
        <SelectWithSearch
          name="materialCategory"
          value={formData.materialCategory}
          onChange={(e) =>
            handleInputChange("materialCategory", e.target.value)
          }
          options={materialList}
          displayKey="materialName"
          valueKey="materialName"
          allowAdd={true}
          onAddNew={addMaterial}
          addNewText="Add new material"
          className={`w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none`}
          placeholder="Select Material..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Weight
          </label>
          <input
            type="text"
            placeholder="Eg: 5"
            disabled={
              trips.find((trip) => trip.id == selectedTrip).partyBillingType !==
                "Per Kg" &&
              trips.find((trip) => trip.id == selectedTrip).partyBillingType !==
                "Per Tonne"
            }
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            className={`${
              trips.find((trip) => trip.id == selectedTrip).partyBillingType !==
                "Per Kg" &&
              trips.find((trip) => trip.id == selectedTrip).partyBillingType !==
                "Per Tonne"
                ? "disabled"
                : ""
            } w-full border border-gray-300 text-black rounded px-3 py-2`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Unit
          </label>
          <div className="relative">
            <select
              value={formData.unit}
              disabled={
                trips.find((trip) => trip.id == selectedTrip)
                  .partyBillingType !== "Per Kg" &&
                trips.find((trip) => trip.id == selectedTrip)
                  .partyBillingType !== "Per Tonne"
              }
              onChange={(e) => handleInputChange("unit", e.target.value)}
              className={`${
                trips.find((trip) => trip.id == selectedTrip)
                  .partyBillingType !== "Per Kg" &&
                trips.find((trip) => trip.id == selectedTrip)
                  .partyBillingType !== "Per Tonne"
                  ? "disabled"
                  : ""
              } w-full border border-gray-300 text-black rounded px-3 py-2 appearance-none`}
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
          disabled={
            trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
              "Per Kg" ||
            trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
              "Per Tonne"
          }
          onChange={(e) =>
            handleInputChange("numberOfPackages", e.target.value)
          }
          className={`${
            trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
              "Per Kg" ||
            trips.find((trip) => trip.id == selectedTrip).partyBillingType ===
              "Per Tonne"
              ? "disabled"
              : ""
          } w-full border border-gray-300 text-black rounded px-3 py-2`}
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
        return renderGoodsSection();
      case 4:
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
          Invoice Date
        </label>
        <div className="relative">
          <span className="text-black">{formData.invoiceDate}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm text-black font-medium mb-1">
          Invoice Number
        </label>
        <span className="text-black">{formData.invoiceNumber}</span>
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

  const renderGoodsSectionView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Goods Invoice
          </label>
          <span className="text-black">{formData.goodsInvoice || "-"}</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Goods Value
          </label>
          <span className="text-black">{formData.goodsValue || "-"}</span>
        </div>
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
          <span className="text-black">{formData.weight || "-"}</span>
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
        <span className="text-black">{formData.numberOfPackages || "-"}</span>
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
        return renderGoodsSectionView();
      case 4:
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
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-lg relative flex flex-col">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Add New Invoice
          </h2>
          <button
            onClick={() => {
              resetAddLR();
              setSelectedConsigner("");
              setSelectedConsignee("");
              setSelectedTrip("");
              setSelectedRoute("");
              setFormData((prevFormData) => ({
                ...prevFormData,
                numberOfPackages: "",
              }));
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
        <div className="p-6  overflow-y-auto flex-grow">
          {renderFormSection()}
        </div>

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
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Invoice</h2>
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
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg relative">
        {/* Form Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Invoice Details
          </h2>
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
          <h1 className="text-2xl font-semibold text-gray-800">Invoice</h1>
          <button
            onClick={handleAddLRClick}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
          >
            <span className="mr-1">+</span> Add Invoice
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
                placeholder="Search Invoices"
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
                    onClick={() => requestSort("invoiceNumber")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Invoice Number
                      </span>
                      {getSortDirectionIcon("invoiceNumber")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("invoiceDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Invoice Date
                      </span>
                      {getSortDirectionIcon("invoiceDate")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    //onClick={() => requestSort("consigner.name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Customer Name
                      </span>
                      {getSortDirectionIcon("consigner.name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("trip.truck.truckNo")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Truck No
                      </span>
                      {getSortDirectionIcon("trip.truck.truckNo")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer"
                    onClick={() => requestSort("trip.origin")}
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Route
                      </span>
                      {getSortDirectionIcon("trip.origin")}
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
                        {LR.freightPaidBy === "Consigner"
                          ? LR.consigner.name
                          : LR.freightPaidBy === "Consignee"
                          ? LR.consignee.name
                          : "-"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {LR.trip.truck.truckNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-base text-gray-900">
                        {LR.trip.origin}&rarr;{LR.trip.destination}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintClickInvoice(LR.id);
                            setCurrentLR(LR);
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
                  No Invoices found. Try a different search term or add a new
                  invoice.
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
                Are you sure you want to delete Invoice{" "}
                <span className="font-semibold">
                  {currentLR?.invoiceNumber}
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
                onClick={handleDeleteLR}
                className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoicePdfPopup && (
        <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">PDF Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadInvoicePdf}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 mx-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => closeInvoicePdfPopup()}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="h-[70vh] overflow-auto">
              <embed
                src={`${currentInvoicePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                width="100%"
                height="100%"
                type="application/pdf"
                title="PDF Preview"
              />
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
