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

export default function Customers() {
  const [activeTab, setActiveTab] = useState("consigners");
  const [consigners, setConsigners] = useState([]);
  const [searchConsignerTerm, setSearchConsignerTerm] = useState("");
  const [consignerFilters, setConsignerFilters] = useState([]);
  const [columnFilteredConsigners, setColumnFilteredConsigners] = useState([]);
  const [sortedAndFilteredConsigners, setSortedAndFilteredConsigners] =
    useState([]);
  const [isAddConsignerModalOpen, setIsAddConsignerModalOpen] = useState(false);
  const [isEditConsignerModalOpen, setIsEditConsignerModalOpen] =
    useState(false);
  const [isDeleteConsignerConfirmOpen, setIsDeleteConsignerConfirmOpen] =
    useState(false);
  const [currentConsigner, setCurrentConsigner] = useState(null);
  const [totalPagesConsigner, setTotalPagesConsigner] = useState(0);

  const [isViewConsignerModalOpen, setIsViewConsignerModalOpen] =
    useState(false);

  const [sortConfigConsigner, setSortConfigConsigner] = useState({
    key: "",
    direction: "",
  });

  // Pagination state
  const [currentPageConsigner, setCurrentPageConsigner] = useState(1);
  const [recordsPerPageConsigner, setRecordsPerPageConsigner] = useState(10);
  const [nextPageConsigner, setNextPageConsigner] = useState(null);
  const [prevPageConsigner, setPrevPageConsigner] = useState(null);

  const [newConsigner, setNewConsigner] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const resetNewConsignerForm = () => {
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

  //Consignees
  const [consignees, setConsignees] = useState([]);
  const [searchConsigneeTerm, setSearchConsigneeTerm] = useState("");
  const [consigneeFilters, setConsigneeFilters] = useState([]);
  const [columnFilteredConsignees, setColumnFilteredConsignees] = useState([]);
  const [sortedAndFilteredConsignees, setSortedAndFilteredConsignees] =
    useState([]);
  const [isAddConsigneeModalOpen, setIsAddConsigneeModalOpen] = useState(false);
  const [isEditConsigneeModalOpen, setIsEditConsigneeModalOpen] =
    useState(false);
  const [isDeleteConsigneeConfirmOpen, setIsDeleteConsigneeConfirmOpen] =
    useState(false);
  const [currentConsignee, setCurrentConsignee] = useState(null);
  const [totalPagesConsignee, setTotalPagesConsignee] = useState(0);

  const [isViewConsigneeModalOpen, setIsViewConsigneeModalOpen] =
    useState(false);

  const [sortConfigConsignee, setSortConfigConsignee] = useState({
    key: "",
    direction: "",
  });

  // Pagination state
  const [currentPageConsignee, setCurrentPageConsignee] = useState(1);
  const [recordsPerPageConsignee, setRecordsPerPageConsignee] = useState(10);
  const [nextPageConsignee, setNextPageConsignee] = useState(null);
  const [prevPageConsignee, setPrevPageConsignee] = useState(null);

  const [newConsignee, setNewConsignee] = useState({
    gstNumber: "",
    name: "",
    addressLine1: "",
    addressLine2: "",
    state: "Maharashtra",
    pincode: "",
    mobileNumber: "",
  });

  const resetNewConsigneeForm = () => {
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

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        // Close all modals
        setIsAddConsignerModalOpen(false);
        setIsEditConsignerModalOpen(false);
        setIsViewConsignerModalOpen(false);
        setIsDeleteConsignerConfirmOpen(false);
        // Reset states if needed
        resetNewConsignerForm();
        setCurrentConsigner(null);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleEscapeKey);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [
    setIsAddConsignerModalOpen,
    setIsEditConsignerModalOpen,
    setIsViewConsignerModalOpen,
    setIsDeleteConsignerConfirmOpen,
    setNewConsigner,
    setCurrentConsigner,
  ]);

  useEffect(() => {
    getConsigners();
  }, []);

  const getSortedData = (data) => {
    return data;
  };

  const handleRowClickConsigner = (consigner) => {
    setCurrentConsigner(consigner);
    setIsViewConsignerModalOpen(true);
  };

  const getConsigners = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.consigners.list, {
        page: currentPageConsigner,
        search: searchConsignerTerm,
        page_size: recordsPerPageConsigner, // Use dynamic value instead of ITEMS_PER_PAGE
      });
      setConsigners(response.data);
      setSortedAndFilteredConsigners(response.data);
      setColumnFilteredConsigners(response.data);
      setTotalPagesConsigner(response.total_pages);
      setPrevPageConsigner(extractNextPage(response.previous));
      setNextPageConsigner(extractNextPage(response.next));
      console.log(response.total_pages);
    } catch (error) {
      notifyError("Error fetching consigners");
    }
  };

  const handleInputConsignerChange = (e) => {
    const { name, value } = e.target;
    setNewConsigner((prev) => ({ ...prev, [name]: value }));
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
    resetNewConsignerForm();
  };
  const handleEditConsigner = async () => {
    // Validate form
    if (!newConsigner.name || !newConsigner.gstNumber) {
      alert("Please fill in required fields");
      return;
    }
    try {
      const response = await api.put(
        API_ENDPOINTS.consigners.update(currentConsigner.id),
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
    setIsEditConsignerModalOpen(false);

    resetNewConsignerForm();
  };

  const handleDeleteConsigner = async () => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.consigners.delete(currentConsigner.id)
      );
      getConsigners();
    } catch (error) {
      notifyError("Error deleting consigner");
    }
    setIsDeleteConsignerConfirmOpen(false);
    setCurrentConsigner(null);
  };

  const getSortedAndFilteredConsigners = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.consigners.list, {
        page: currentPageConsigner,
        search: searchConsignerTerm,
        page_size: recordsPerPageConsigner,
        filters: JSON.stringify(consignerFilters),
        sorting: JSON.stringify(sortConfigConsigner),
      });
      if (consignerFilters.length === 0) {
        setSortedAndFilteredConsigners(response.data);
      }
      setPrevPageConsigner(extractNextPage(response.previous));
      setNextPageConsigner(extractNextPage(response.next));
      setColumnFilteredConsigners(response.data);
      setTotalPagesConsigner(response.total_pages);
    } catch (error) {
      console.log(error);
    }
  };

  // Sort function for table columns
  const requestSortConsigner = (key) => {
    let direction = "ascending";
    if (
      sortConfigConsigner.key === key &&
      sortConfigConsigner.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfigConsigner({ key, direction });
  };

  useEffect(() => {
    getSortedAndFilteredConsigners();
  }, [recordsPerPageConsigner]);
  useEffect(() => {
    getSortedAndFilteredConsigners();
  }, [sortConfigConsigner]);
  useEffect(() => {
    getSortedAndFilteredConsigners();
  }, [searchConsignerTerm]);
  useEffect(() => {
    getSortedAndFilteredConsigners();
  }, [consignerFilters]); // ✅ API call will trigger when consignerFilters changes

  // Filter consigners based on search term
  const filteredConsigners = columnFilteredConsigners.filter(
    (consigner) =>
      consigner.name
        .toLowerCase()
        .includes(searchConsignerTerm.toLowerCase()) ||
      consigner.mobileNumber?.includes(searchConsignerTerm.toLowerCase())
  );

  // Get sorted and filtered consigners
  const outConsigners = getSortedData(filteredConsigners);

  // Calculate pagination
  const indexOfLastRecordConsigner =
    currentPageConsigner * recordsPerPageConsigner;
  const indexOfFirstRecordConsigner =
    indexOfLastRecordConsigner - recordsPerPageConsigner;
  const currentRecordsConsigner = outConsigners;

  // Change page
  const paginateConsigners = async (page) => {
    const pageUrl = `${API_ENDPOINTS.consigners.list}?page=${page}&page_size=${recordsPerPageConsigner}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchConsignerTerm,
        page_size: recordsPerPageConsigner,
        filters: JSON.stringify(consignerFilters),
        sorting: JSON.stringify(sortConfigConsigner),
      });
      if (consignerFilters.length === 0) {
        setSortedAndFilteredConsigners(response.data);
      }
      setColumnFilteredConsigners(response.data);
      setNextPageConsigner(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsigner(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsigner(response.total_pages);
      setCurrentPageConsigner(page);
      console.log(currentPageConsigner);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  // Previous page
  const prevPageClickConsigner = async () => {
    try {
      const response = await api.get(prevPageConsigner, {
        page: currentPageConsigner - 1,
        search: searchConsignerTerm,
        page_size: recordsPerPageConsigner,
        filters: JSON.stringify(consignerFilters),
        sorting: JSON.stringify(sortConfigConsigner),
      });
      if (consignerFilters.length === 0) {
        setSortedAndFilteredConsigners(response.data);
      }
      setColumnFilteredConsigners(response.data);
      setNextPageConsigner(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsigner(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsigner(response.total_pages);
      setCurrentPageConsigner((prev) => prev - 1);
    } catch (error) {
      console.log(error);
    }
  };
  // Next page
  const nextPageClickConsigners = async () => {
    console.log(currentPageConsigner);

    try {
      const response = await api.get(nextPageConsigner, {
        search: searchConsignerTerm,
        page: currentPageConsigner + 1,
        page_size: recordsPerPageConsigner,
        filters: JSON.stringify(consignerFilters),
        sorting: JSON.stringify(sortConfigConsigner),
      });
      if (consignerFilters.length === 0) {
        setSortedAndFilteredConsigners(response.data);
      }
      setColumnFilteredConsigners(response.data);
      setNextPageConsigner(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsigner(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsigner(response.total_pages);
      setCurrentPageConsigner((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
    console.log(nextPageConsigner);
  };

  // Handle driver search
  const handleConsignerSearch = (e) => {
    setSearchConsignerTerm(e.target.value);
    setCurrentPageConsigner(1); // Reset to first page when searching
  };

  // Open "Add Driver" modal
  const handleAddConsignerClick = () => {
    resetNewConsignerForm();
    setIsAddConsignerModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClickConsigner = (consigner) => {
    setCurrentConsigner(consigner);
    setNewConsigner({
      gstNumber: consigner.gstNumber,
      name: consigner.name,
      addressLine1: consigner.addressLine1,
      addressLine2: consigner.addressLine2 || "",
      state: consigner.state,
      pincode: consigner.pincode,
      mobileNumber: consigner.mobileNumber,
    });
    setIsEditConsignerModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClickConsigner = (consigner) => {
    setCurrentConsigner(consigner);
    setIsDeleteConsignerConfirmOpen(true);
  };

  const toggleEditConsignerMode = () => {
    // If in view mode, close the view modal and open the edit modal instead
    setIsViewConsignerModalOpen(false); // Close view modal

    // Open edit modal with current driver data
    setNewConsigner({
      name: currentConsigner.name,
      gstNumber: currentConsigner.gstNumber,
      addressLine1: currentConsigner.addressLine1,
      addressLine2: currentConsigner.addressLine2,
      state: currentConsigner.state,
      pincode: currentConsigner.pincode,
      mobileNumber: currentConsigner.mobileNumber,
    });
    setIsViewConsignerModalOpen(false);
    // Open the regular edit modal
    setIsEditConsignerModalOpen(true);
  };
  // Handle records per page change
  const handleRecordsPerPageChangeConsigner = (e) => {
    setRecordsPerPageConsigner(Number(e.target.value));
    setCurrentPageConsigner(1); // Reset to first page when changing records per page
  };

  // Get sort direction icon
  const getSortDirectionIconConsigner = (columnName) => {
    if (sortConfigConsigner.key !== columnName) {
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

    return sortConfigConsigner.direction === "ascending" ? (
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

  //Consignees

  const handleRowClickConsignee = (consignee) => {
    setCurrentConsignee(consignee);
    setIsViewConsigneeModalOpen(true);
  };

  const getConsignees = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.consignees.list, {
        page: currentPageConsignee,
        search: searchConsigneeTerm,
        page_size: recordsPerPageConsignee, // Use dynamic value instead of ITEMS_PER_PAGE
      });
      setConsignees(response.data);
      setSortedAndFilteredConsignees(response.data);
      setColumnFilteredConsignees(response.data);
      setTotalPagesConsignee(response.total_pages);
      setPrevPageConsignee(extractNextPage(response.previous));
      setNextPageConsignee(extractNextPage(response.next));
      console.log(response.total_pages);
    } catch (error) {
      notifyError("Error fetching consigners");
    }
  };

  const handleInputConsigneeChange = (e) => {
    const { name, value } = e.target;
    setNewConsignee((prev) => ({ ...prev, [name]: value }));
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
    setIsAddConsigneeModalOpen(false);

    // Reset form
    resetNewConsigneeForm();
  };
  const handleEditConsignee = async () => {
    // Validate form
    if (!newConsignee.name || !newConsignee.gstNumber) {
      alert("Please fill in required fields");
      return;
    }
    try {
      const response = await api.put(
        API_ENDPOINTS.consignees.update(currentConsignee.id),
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
    setIsEditConsigneeModalOpen(false);

    resetNewConsigneeForm();
  };

  const handleDeleteConsignee = async () => {
    try {
      const response = await api.delete(
        API_ENDPOINTS.consignees.delete(currentConsignee.id)
      );
      getConsignees();
    } catch (error) {
      notifyError("Error deleting consignee");
    }
    setIsDeleteConsigneeConfirmOpen(false);
    setCurrentConsignee(null);
  };

  const getSortedAndFilteredConsignees = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.consignees.list, {
        page: currentPageConsignee,
        search: searchConsigneeTerm,
        page_size: recordsPerPageConsignee,
        filters: JSON.stringify(consigneeFilters),
        sorting: JSON.stringify(sortConfigConsignee),
      });
      if (consigneeFilters.length === 0) {
        setSortedAndFilteredConsignees(response.data);
      }
      setPrevPageConsignee(extractNextPage(response.previous));
      setNextPageConsignee(extractNextPage(response.next));
      setColumnFilteredConsignees(response.data);
      setTotalPagesConsignee(response.total_pages);
    } catch (error) {
      console.log(error);
    }
  };

  // Sort function for table columns
  const requestSortConsignee = (key) => {
    let direction = "ascending";
    if (
      sortConfigConsignee.key === key &&
      sortConfigConsignee.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfigConsignee({ key, direction });
  };

  useEffect(() => {
    getSortedAndFilteredConsignees();
  }, [recordsPerPageConsignee]);
  useEffect(() => {
    getSortedAndFilteredConsignees();
  }, [sortConfigConsignee]);
  useEffect(() => {
    getSortedAndFilteredConsignees();
  }, [searchConsigneeTerm]);
  useEffect(() => {
    getSortedAndFilteredConsignees();
  }, [consigneeFilters]); // ✅ API call will trigger when consignerFilters changes

  // Filter consigners based on search term
  const filteredConsignees = columnFilteredConsignees.filter(
    (consignee) =>
      consignee.name
        .toLowerCase()
        .includes(searchConsigneeTerm.toLowerCase()) ||
      consignee.mobileNumber?.includes(searchConsigneeTerm.toLowerCase())
  );

  // Get sorted and filtered consigners
  const outConsignees = getSortedData(filteredConsignees);

  // Calculate pagination
  const indexOfLastRecordConsignee =
    currentPageConsignee * recordsPerPageConsignee;
  const indexOfFirstRecordConsignee =
    indexOfLastRecordConsignee - recordsPerPageConsignee;
  const currentRecordsConsignee = outConsignees;

  // Change page
  const paginateConsignees = async (page) => {
    const pageUrl = `${API_ENDPOINTS.consignees.list}?page=${page}&page_size=${recordsPerPageConsignee}`;
    try {
      const response = await api.get(pageUrl, {
        search: searchConsigneeTerm,
        page_size: recordsPerPageConsignee,
        filters: JSON.stringify(consigneeFilters),
        sorting: JSON.stringify(sortConfigConsignee),
      });
      if (consigneeFilters.length === 0) {
        setSortedAndFilteredConsignees(response.data);
      }
      setColumnFilteredConsignees(response.data);
      setNextPageConsignee(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsignee(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsignee(response.total_pages);
      setCurrentPageConsignee(page);
      console.log(currentPageConsignee);
      // Extract current page from URL
    } catch (error) {
      console.log(error);
    }
  };

  // Previous page
  const prevPageClickConsignee = async () => {
    try {
      const response = await api.get(prevPageConsignee, {
        page: currentPageConsignee - 1,
        search: searchConsigneeTerm,
        page_size: recordsPerPageConsignee,
        filters: JSON.stringify(consigneeFilters),
        sorting: JSON.stringify(sortConfigConsignee),
      });
      if (consigneeFilters.length === 0) {
        setSortedAndFilteredConsignees(response.data);
      }
      setColumnFilteredConsignees(response.data);
      setNextPageConsignee(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsignee(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsignee(response.total_pages);
      setCurrentPageConsignee((prev) => prev - 1);
    } catch (error) {
      console.log(error);
    }
  };
  // Next page
  const nextPageClickConsignees = async () => {
    console.log(currentPageConsignee);

    try {
      const response = await api.get(nextPageConsignee, {
        search: searchConsigneeTerm,
        page: currentPageConsignee + 1,
        page_size: recordsPerPageConsignee,
        filters: JSON.stringify(consigneeFilters),
        sorting: JSON.stringify(sortConfigConsignee),
      });
      if (consigneeFilters.length === 0) {
        setSortedAndFilteredConsignees(response.data);
      }
      setColumnFilteredConsignees(response.data);
      setNextPageConsignee(extractNextPage(response.next)); // Store next page URL
      setPrevPageConsignee(extractNextPage(response.previous)); // Store previous page URL
      setTotalPagesConsignee(response.total_pages);
      setCurrentPageConsignee((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    }
    console.log(nextPageConsignee);
  };

  // Handle driver search
  const handleConsigneeSearch = (e) => {
    setSearchConsigneeTerm(e.target.value);
    setCurrentPageConsignee(1); // Reset to first page when searching
  };

  // Open "Add Driver" modal
  const handleAddConsigneeClick = () => {
    resetNewConsigneeForm();
    setIsAddConsigneeModalOpen(true);
  };

  // Open "Edit Driver" modal
  const handleEditClickConsignee = (consignee) => {
    setCurrentConsignee(consignee);
    setNewConsignee({
      gstNumber: consignee.gstNumber,
      name: consignee.name,
      addressLine1: consignee.addressLine1,
      addressLine2: consignee.addressLine2 || "",
      state: consignee.state,
      pincode: consignee.pincode,
      mobileNumber: consignee.mobileNumber,
    });
    setIsEditConsigneeModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClickConsignee = (consignee) => {
    setCurrentConsignee(consignee);
    setIsDeleteConsigneeConfirmOpen(true);
  };

  const toggleEditConsigneeMode = () => {
    // If in view mode, close the view modal and open the edit modal instead
    setIsViewConsigneeModalOpen(false); // Close view modal

    // Open edit modal with current driver data
    setNewConsignee({
      name: currentConsignee.name,
      gstNumber: currentConsignee.gstNumber,
      addressLine1: currentConsignee.addressLine1,
      addressLine2: currentConsignee.addressLine2,
      state: currentConsignee.state,
      pincode: currentConsignee.pincode,
      mobileNumber: currentConsignee.mobileNumber,
    });
    setIsViewConsigneeModalOpen(false);
    // Open the regular edit modal
    setIsEditConsigneeModalOpen(true);
  };
  // Handle records per page change
  const handleRecordsPerPageChangeConsignee = (e) => {
    setRecordsPerPageConsignee(Number(e.target.value));
    setCurrentPageConsignee(1); // Reset to first page when changing records per page
  };

  // Get sort direction icon
  const getSortDirectionIconConsignee = (columnName) => {
    if (sortConfigConsignee.key !== columnName) {
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

    return sortConfigConsignee.direction === "ascending" ? (
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
    <div className="p-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("consigners")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "consigners"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Consigners
          </button>
          <button
            onClick={() => setActiveTab("consignees")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "consignees"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Consignees
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "consigners" && (
          <div>
            <div className="flex-1 flex flex-col">
              {/* Main Content Area */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Consigners
                  </h1>
                  <button
                    onClick={handleAddConsignerClick}
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
                  >
                    <span className="mr-1">+</span> Add Consigner
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
                        placeholder="Search Consigners"
                        value={searchConsignerTerm}
                        onChange={handleConsignerSearch}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                      />
                      {consignerFilters.length > 0 && (
                        <button
                          onClick={() => setConsignerFilters([])}
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
                        value={recordsPerPageConsigner}
                        onChange={handleRecordsPerPageChangeConsigner}
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
                            onClick={() => requestSortConsigner("name")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Name
                              </span>
                              {getSortDirectionIconConsigner("name")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsigner("gstNumber")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                GST Number
                              </span>
                              {getSortDirectionIconConsigner("gstNumber")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsigner("addressLine1")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Address
                              </span>
                              {getSortDirectionIconConsigner("addressLine1")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsigner("state")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                State
                              </span>
                              {getSortDirectionIconConsigner("state")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsigner("mobileNumber")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Mobile Number
                              </span>
                              {getSortDirectionIconConsigner("mobileNumber")}
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
                        {currentRecordsConsigner.map((consigner) => (
                          <tr
                            key={consigner.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base font-medium text-gray-900">
                                {consigner.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consigner.gstNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consigner.addressLine1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consigner.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consigner.mobileNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    handleRowClickConsigner(consigner);
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
                                    handleEditClickConsigner(consigner);
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
                                    handleDeleteClick(consigner);
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
                    {sortedAndFilteredConsigners.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-700 text-base">
                          No consigner found. Try a different search term or add
                          a new consigner.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Pagination */}
                  {outConsigners.length > 0 && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstRecordConsigner + 1} to{" "}
                        {Math.min(
                          indexOfLastRecordConsigner,
                          outConsigners.length
                        )}{" "}
                        of {outConsigners.length} entries
                      </div>

                      <nav className="flex items-center">
                        <button
                          onClick={prevPageClickConsigner}
                          disabled={currentPageConsigner === 1}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPageConsigner === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: totalPagesConsigner },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            // Show first page, last page, and pages around current page
                            return (
                              page === 1 ||
                              page === totalPagesConsigner ||
                              (page >= currentPageConsigner - 1 &&
                                page <= currentPageConsigner + 1)
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there are gaps
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
                                  onClick={() => paginateConsigners(page)}
                                  className={`px-3 py-1 rounded-md mx-1 ${
                                    currentPageConsigner === page
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
                          onClick={nextPageClickConsigners}
                          disabled={
                            currentPageConsigner === totalPagesConsigner
                          }
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPageConsigner === totalPagesConsigner
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
              {isAddConsignerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Add New Consigner</h2>
                      <button
                        onClick={() => {
                          setIsAddConsignerModalOpen(false);
                          resetNewConsignerForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1 font-medium">
                          GST Number
                        </label>
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
                          <label className="block mb-1 font-medium">
                            State
                          </label>
                          {/* <select
                    name="state"
                    value={newConsigner.state}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                    size="1"
                  >
                    {/* <option value="">Select a state</option>
                    {statesList.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select> */}
                          <SelectWithSearch
                            name="state"
                            value={newConsigner.state}
                            onChange={handleInputConsignerChange}
                            options={statesList}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                            placeholder="Select a state"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium">
                            Pincode
                          </label>
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
                          onClick={() => {
                            setIsAddConsignerModalOpen(false);
                            resetNewConsignerForm();
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

              {/* Edit Driver Modal */}
              {isEditConsignerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Add New Consigner</h2>
                      <button
                        onClick={() => {
                          setIsEditConsignerModalOpen(false);
                          resetNewConsignerForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1 font-medium">
                          GST Number
                        </label>
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
                          <label className="block mb-1 font-medium">
                            State
                          </label>
                          {/* <select
                    name="state"
                    value={newConsigner.state}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                    size="1"
                  >
                    {/* <option value="">Select a state</option>
                    {statesList.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select> */}
                          <SelectWithSearch
                            name="state"
                            value={newConsigner.state}
                            onChange={handleInputConsignerChange}
                            options={statesList}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                            placeholder="Select a state"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium">
                            Pincode
                          </label>
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
                          onClick={() => {
                            setIsEditConsignerModalOpen(false);
                            resetNewConsignerForm();
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditConsigner}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                          Save Consigner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Driver Modal */}
              {isViewConsignerModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Consigner Details
                      </h2>
                      <button
                        onClick={() => setIsViewConsignerModalOpen(false)}
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
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {/* Left column */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Consigner Name
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsigner?.name}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            GST Number
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsigner?.gstNumber}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Address
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsigner?.addressLine1}{" "}
                            {currentConsigner?.addressLine2}
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
                              {currentConsigner.mobileNumber}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            State
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsigner?.state}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Consigner Name
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsigner?.pincode}
                          </p>
                        </div>
                      </div>
                      {/* <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentConsigner?.license_number}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Expiry Date
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentConsigner?.license_expiry_date &&
                        new Date(
                          currentConsigner.license_expiry_date
                        ).toLocaleDateString()}
                    </p>
                  </div>
                  {/* <div>
                    <h3 className="text-sm font-medium text-gray-500">Photo</h3>
                    <FilePreview
                      fileUrl={currentConsigner?.photo}
                      fileName={`${currentConsigner?.name || "Driver"}'s Photo`}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Documents
                    </h3>
                    <FilePreview
                      fileUrl={currentConsigner?.documents}
                      fileName={`${
                        currentConsigner?.name || "Driver"
                      }'s Documents`}
                      className="mt-1"
                    />
                  </div>
                </div> */}
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsViewConsignerModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={toggleEditConsignerMode}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {isDeleteConsignerConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Confirm Delete
                      </h2>
                      <button
                        onClick={() => setIsDeleteConsignerConfirmOpen(false)}
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
                        Are you sure you want to delete consigner{" "}
                        <span className="font-semibold">
                          {currentConsigner?.name}
                          {" - "}
                          {currentConsigner?.gstNumber}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsDeleteConsignerConfirmOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteConsigner}
                        className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "consignees" && (
          <div>
            <div className="flex-1 flex flex-col">
              {/* Main Content Area */}
              <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Consignees
                  </h1>
                  <button
                    onClick={handleAddConsigneeClick}
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors hover:bg-opacity-90"
                  >
                    <span className="mr-1">+</span> Add Consignee
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
                        placeholder="Search Consignees"
                        value={searchConsigneeTerm}
                        onChange={handleConsigneeSearch}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-black"
                      />
                      {consigneeFilters.length > 0 && (
                        <button
                          onClick={() => setConsigneeFilters([])}
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
                        value={recordsPerPageConsignee}
                        onChange={handleRecordsPerPageChangeConsignee}
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
                            onClick={() => requestSortConsignee("name")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Name
                              </span>
                              {getSortDirectionIconConsignee("name")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsignee("gstNumber")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                GST Number
                              </span>
                              {getSortDirectionIconConsignee("gstNumber")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsignee("addressLine1")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Address
                              </span>
                              {getSortDirectionIconConsignee("addressLine1")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsignee("state")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                State
                              </span>
                              {getSortDirectionIconConsignee("state")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left cursor-pointer"
                            onClick={() => requestSortConsignee("mobileNumber")}
                          >
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Mobile Number
                              </span>
                              {getSortDirectionIconConsignee("mobileNumber")}
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
                        {currentRecordsConsignee.map((consignee) => (
                          <tr
                            key={consignee.id}
                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base font-medium text-gray-900">
                                {consignee.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consignee.gstNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consignee.addressLine1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consignee.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-base text-gray-900">
                                {consignee.mobileNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    handleRowClickConsignee(consignee);
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
                                    handleEditClickConsignee(consignee);
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
                                    handleDeleteClickConsignee(consignee);
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
                    {sortedAndFilteredConsignees.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-700 text-base">
                          No consignee found. Try a different search term or add
                          a new consignee.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Pagination */}
                  {outConsignees.length > 0 && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <div className="text-sm text-gray-600">
                        Showing {indexOfFirstRecordConsignee + 1} to{" "}
                        {Math.min(
                          indexOfLastRecordConsignee,
                          outConsignees.length
                        )}{" "}
                        of {outConsignees.length} entries
                      </div>

                      <nav className="flex items-center">
                        <button
                          onClick={prevPageClickConsignee}
                          disabled={currentPageConsignee === 1}
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPageConsignee === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: totalPagesConsignee },
                          (_, i) => i + 1
                        )
                          .filter((page) => {
                            // Show first page, last page, and pages around current page
                            return (
                              page === 1 ||
                              page === totalPagesConsignee ||
                              (page >= currentPageConsignee - 1 &&
                                page <= currentPageConsignee + 1)
                            );
                          })
                          .map((page, index, array) => {
                            // Add ellipsis if there are gaps
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
                                  onClick={() => paginateConsignees(page)}
                                  className={`px-3 py-1 rounded-md mx-1 ${
                                    currentPageConsignee === page
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
                          onClick={nextPageClickConsignees}
                          disabled={
                            currentPageConsignee === totalPagesConsignee
                          }
                          className={`px-3 py-1 rounded-md mx-1 ${
                            currentPageConsignee === totalPagesConsignee
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
              {isAddConsigneeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Add New Consignee</h2>
                      <button
                        onClick={() => {
                          setIsAddConsigneeModalOpen(false);
                          resetNewConsigneeForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1 font-medium">
                          GST Number
                        </label>
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
                          <label className="block mb-1 font-medium">
                            State
                          </label>
                          {/* <select
                    name="state"
                    value={newConsigner.state}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                    size="1"
                  >
                    {/* <option value="">Select a state</option>
                    {statesList.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select> */}
                          <SelectWithSearch
                            name="state"
                            value={newConsignee.state}
                            onChange={handleInputConsigneeChange}
                            options={statesList}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                            placeholder="Select a state"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium">
                            Pincode
                          </label>
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
                          onClick={() => {
                            setIsAddConsigneeModalOpen(false);
                            resetNewConsigneeForm();
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

              {/* Edit Driver Modal */}
              {isEditConsigneeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Add New Consignee</h2>
                      <button
                        onClick={() => {
                          setIsEditConsigneeModalOpen(false);
                          resetNewConsigneeForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1 font-medium">
                          GST Number
                        </label>
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
                          <label className="block mb-1 font-medium">
                            State
                          </label>
                          {/* <select
                    name="state"
                    value={newConsigner.state}
                    onChange={handleInputConsignerChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                    size="1"
                  >
                    {/* <option value="">Select a state</option>
                    {statesList.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select> */}
                          <SelectWithSearch
                            name="state"
                            value={newConsignee.state}
                            onChange={handleInputConsigneeChange}
                            options={statesList}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-black"
                            placeholder="Select a state"
                          />
                        </div>

                        <div>
                          <label className="block mb-1 font-medium">
                            Pincode
                          </label>
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
                          onClick={() => {
                            setIsEditConsigneeModalOpen(false);
                            resetNewConsigneeForm();
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditConsignee}
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
              {isViewConsigneeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Consignee Details
                      </h2>
                      <button
                        onClick={() => setIsViewConsigneeModalOpen(false)}
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
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {/* Left column */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Consignee Name
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsignee?.name}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            GST Number
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsignee?.gstNumber}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Address
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsignee?.addressLine1}{" "}
                            {currentConsignee?.addressLine2}
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
                              {currentConsignee.mobileNumber}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            State
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsignee?.state}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Consigner Name
                          </h3>
                          <p className="text-base font-medium text-gray-900">
                            {currentConsignee?.pincode}
                          </p>
                        </div>
                      </div>
                      {/* <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Number
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentConsigner?.license_number}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      License Expiry Date
                    </h3>
                    <p className="text-base text-gray-900">
                      {currentConsigner?.license_expiry_date &&
                        new Date(
                          currentConsigner.license_expiry_date
                        ).toLocaleDateString()}
                    </p>
                  </div>
                  {/* <div>
                    <h3 className="text-sm font-medium text-gray-500">Photo</h3>
                    <FilePreview
                      fileUrl={currentConsigner?.photo}
                      fileName={`${currentConsigner?.name || "Driver"}'s Photo`}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Documents
                    </h3>
                    <FilePreview
                      fileUrl={currentConsigner?.documents}
                      fileName={`${
                        currentConsigner?.name || "Driver"
                      }'s Documents`}
                      className="mt-1"
                    />
                  </div>
                </div> */}
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsViewConsigneeModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={toggleEditConsigneeMode}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {isDeleteConsigneeConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Confirm Delete
                      </h2>
                      <button
                        onClick={() => setIsDeleteConsigneeConfirmOpen(false)}
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
                        Are you sure you want to delete consignee{" "}
                        <span className="font-semibold">
                          {currentConsignee?.name}
                          {" - "}
                          {currentConsignee?.gstNumber}
                        </span>
                        ? This action cannot be undone.
                      </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsDeleteConsigneeConfirmOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteConsignee}
                        className="px-4 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
